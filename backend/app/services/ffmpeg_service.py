import os
import json
import subprocess
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.config import settings
from app.schemas.schemas import VideoMetadata

class FFmpegService:
    def __init__(self):
        self._ffmpeg_bin = self._find_binary("ffmpeg", settings.FFMPEG_PATH)
        self._ffprobe_bin = self._find_binary("ffprobe", settings.FFPROBE_PATH)

    def _find_binary(self, name: str, configured_path: str) -> str:
        # 1. Check imageio_ffmpeg for ffmpeg binary
        if name == "ffmpeg":
            try:
                import imageio_ffmpeg
                img_bin = imageio_ffmpeg.get_ffmpeg_exe()
                if img_bin and os.path.exists(img_bin):
                    return str(img_bin)
            except Exception:
                pass

        # 2. Check configured path
        if configured_path and shutil.which(configured_path):
            return configured_path

        # 3. Check PATH
        if shutil.which(name):
            return name

        # 4. Check standard Windows paths (excluding CapCut stub)
        candidates = [
            Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages",
            Path("C:/Program Files/ffmpeg/bin"),
            Path("C:/ffmpeg/bin"),
            Path(os.environ.get("USERPROFILE", "")) / "scoop" / "apps" / "ffmpeg" / "current" / "bin",
            Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "ffmpeg" / "bin"
        ]
        for base in candidates:
            if base.exists():
                for p in base.glob(f"**/{name}.exe"):
                    if p.is_file():
                        return str(p.resolve())
        return name

    def refresh_binaries(self):
        self._ffmpeg_bin = self._find_binary("ffmpeg", settings.FFMPEG_PATH)
        self._ffprobe_bin = self._find_binary("ffprobe", settings.FFPROBE_PATH)

    def run_cmd(self, args: List[str], timeout: int = 300) -> subprocess.CompletedProcess:
        try:
            result = subprocess.run(
                args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False,
                timeout=timeout
            )
            return result
        except subprocess.TimeoutExpired as e:
            raise RuntimeError(f"FFmpeg command timed out after {timeout} seconds")
        except Exception as e:
            raise RuntimeError(f"Failed to execute FFmpeg command: {str(e)}")

    def get_video_metadata(self, video_path: Path | str) -> VideoMetadata:
        self.refresh_binaries()
        path = str(Path(video_path).resolve())
        file_size = os.path.getsize(path) if os.path.exists(path) else 0

        # Try ffprobe if available
        if shutil.which(self._ffprobe_bin) or os.path.isabs(self._ffprobe_bin):
            args = [
                self._ffprobe_bin,
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                path
            ]
            res = self.run_cmd(args, timeout=30)
            if res.returncode == 0:
                try:
                    data = json.loads(res.stdout)
                    format_info = data.get("format", {})
                    duration = float(format_info.get("duration", 0.0))
                    f_size = int(format_info.get("size", file_size))

                    video_stream = None
                    audio_stream = None
                    for s in data.get("streams", []):
                        if s.get("codec_type") == "video" and not video_stream:
                            video_stream = s
                        elif s.get("codec_type") == "audio" and not audio_stream:
                            audio_stream = s

                    width = 1920
                    height = 1080
                    fps = 30.0
                    codec = "h264"

                    if video_stream:
                        width = int(video_stream.get("width", 1920))
                        height = int(video_stream.get("height", 1080))
                        codec = video_stream.get("codec_name", "h264")
                        r_frame_rate = video_stream.get("r_frame_rate", "30/1")
                        if "/" in r_frame_rate:
                            num, den = r_frame_rate.split("/")
                            fps = round(float(num) / float(den), 2) if float(den) > 0 else 30.0
                        else:
                            fps = float(r_frame_rate or 30.0)

                    return VideoMetadata(
                        duration=duration,
                        width=width,
                        height=height,
                        fps=fps,
                        file_size_bytes=f_size,
                        codec=codec,
                        audio_codec=audio_stream.get("codec_name") if audio_stream else None,
                        has_audio=audio_stream is not None
                    )
                except Exception:
                    pass

        # Robust Fallback: Inspect using ffmpeg -i
        import re
        args = [self._ffmpeg_bin, "-i", path]
        res = self.run_cmd(args, timeout=30)
        output = (res.stderr or "") + (res.stdout or "")

        duration = 10.0
        width = 1920
        height = 1080
        fps = 30.0
        has_audio = "Audio:" in output

        # Parse Duration: 00:01:23.45
        dur_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
        if dur_match:
            hours, mins, secs = dur_match.groups()
            duration = int(hours) * 3600 + int(mins) * 60 + float(secs)

        # Parse Resolution: 1920x1080
        res_match = re.search(r",\s*(\d{3,5})x(\d{3,5})", output)
        if res_match:
            width = int(res_match.group(1))
            height = int(res_match.group(2))

        # Parse FPS: 30 fps or 29.97 fps
        fps_match = re.search(r"(\d+(?:\.\d+)?)\s*fps", output)
        if fps_match:
            fps = float(fps_match.group(1))

        # Parse Codec: Video: hevc, Video: h264, Video: vp9, etc.
        codec = "h264"
        codec_match = re.search(r"Video:\s*([a-zA-Z0-9_-]+)", output)
        if codec_match:
            codec = codec_match.group(1).lower()

        return VideoMetadata(
            duration=duration,
            width=width,
            height=height,
            fps=fps,
            file_size_bytes=file_size,
            codec=codec,
            audio_codec="aac" if has_audio else None,
            has_audio=has_audio
        )

    def generate_thumbnail(self, video_path: Path | str, output_path: Path | str, timestamp: float = 1.0) -> bool:
        self.refresh_binaries()
        args = [
            self._ffmpeg_bin,
            "-y",
            "-ss", str(timestamp),
            "-i", str(Path(video_path).resolve()),
            "-vframes", "1",
            "-q:v", "2",
            str(Path(output_path).resolve())
        ]
        res = self.run_cmd(args, timeout=20)
        return res.returncode == 0 and os.path.exists(output_path)

    def extract_audio_wav(self, video_path: Path | str, output_wav_path: Path | str) -> bool:
        self.refresh_binaries()
        args = [
            self._ffmpeg_bin,
            "-y",
            "-i", str(Path(video_path).resolve()),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(Path(output_wav_path).resolve())
        ]
        res = self.run_cmd(args, timeout=60)
        return res.returncode == 0 and os.path.exists(output_wav_path)

    def extract_audio_mp3(self, video_path: Path | str, output_mp3_path: Path | str) -> bool:
        """Extracts high quality MP3 audio track from video."""
        self.refresh_binaries()
        args = [
            self._ffmpeg_bin,
            "-y",
            "-i", str(Path(video_path).resolve()),
            "-vn",
            "-acodec", "libmp3lame",
            "-b:a", "192k",
            str(Path(output_mp3_path).resolve())
        ]
        res = self.run_cmd(args, timeout=120)
        return res.returncode == 0 and os.path.exists(output_mp3_path)

    def transcode_to_h264(self, input_path: Path | str, output_path: Path | str) -> bool:
        """Transcodes non-H.264 video (e.g. HEVC/H.265, ProRes) to universal web-compatible H.264 MP4."""
        self.refresh_binaries()
        in_p = Path(input_path).resolve()
        out_p = Path(output_path).resolve()
        args = [
            self._ffmpeg_bin, "-y",
            "-i", str(in_p),
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            str(out_p)
        ]
        res = self.run_cmd(args, timeout=300)
        return res.returncode == 0 and out_p.exists()

    def build_video_filter_string(
        self,
        target_w: int,
        target_h: int,
        filters: Optional[Dict[str, Any]] = None,
        crop: Optional[Dict[str, Any]] = None,
        rotate: int = 0,
        flip_h: bool = False,
        flip_v: bool = False
    ) -> str:
        vf_parts = []

        # 1. Rotation and flips
        if rotate == 90:
            vf_parts.append("transpose=1")
        elif rotate == 180:
            vf_parts.append("transpose=2,transpose=2")
        elif rotate == 270:
            vf_parts.append("transpose=2")
        
        if flip_h:
            vf_parts.append("hflip")
        if flip_v:
            vf_parts.append("vflip")

        # 2. Crop
        if crop and crop.get("w") and crop.get("h"):
            cw = int(crop["w"])
            ch = int(crop["h"])
            cx = int(crop.get("x", 0))
            cy = int(crop.get("y", 0))
            vf_parts.append(f"crop={cw}:{ch}:{cx}:{cy}")

        # 3. Scale and fit into target aspect ratio (letterboxing / pillarboxing)
        # Pad to target_w:target_h maintaining source aspect ratio
        scale_filter = (
            f"scale=w={target_w}:h={target_h}:force_original_aspect_ratio=decrease,"
            f"pad={target_w}:{target_h}:(ow-iw)/2:(oh-ih)/2:color=black"
        )
        vf_parts.append(scale_filter)

        # 4. Color adjustments and effects
        if filters:
            brightness = float(filters.get("brightness", 0.0))  # -1.0 to 1.0 (default 0)
            contrast = float(filters.get("contrast", 1.0))      # 0.0 to 2.0 (default 1)
            saturation = float(filters.get("saturation", 1.0))  # 0.0 to 3.0 (default 1)
            
            # Map brightness (-100..100) to ffmpeg eq brightness (-1.0..1.0)
            b_val = max(-1.0, min(1.0, brightness / 100.0 if abs(brightness) > 1.0 else brightness))
            c_val = max(0.1, min(3.0, contrast if contrast > 0.05 else 1.0))
            s_val = max(0.0, min(3.0, saturation if saturation >= 0 else 1.0))

            # Color adjustments and exposure
            if b_val != 0.0 or c_val != 1.0 or s_val != 1.0:
                vf_parts.append(f"eq=brightness={b_val:.2f}:contrast={c_val:.2f}:saturation={s_val:.2f}")

            # Color Temperature & Tint
            temperature = float(filters.get("temperature", 0.0)) / 100.0  # -1.0 to 1.0
            tint = float(filters.get("tint", 0.0)) / 100.0                # -1.0 to 1.0
            if temperature != 0.0 or tint != 0.0:
                r_gain = max(0.2, min(2.0, 1.0 + temperature * 0.3))
                g_gain = max(0.2, min(2.0, 1.0 + tint * 0.2))
                b_gain = max(0.2, min(2.0, 1.0 - temperature * 0.3))
                vf_parts.append(f"colorchannelmixer={r_gain:.2f}:0:0:0:0:{g_gain:.2f}:0:0:0:0:{b_gain:.2f}:0")

            # Sharpening
            if float(filters.get("sharpen", 0)) > 0:
                sharp_amt = min(2.0, float(filters["sharpen"]) / 50.0)
                vf_parts.append(f"unsharp=5:5:{sharp_amt:.2f}:5:5:0.0")

            # Creative Presets / Effects
            preset = filters.get("preset", "none").lower()
            if preset == "grayscale" or preset == "bw" or filters.get("grayscale"):
                vf_parts.append("hue=s=0")
            elif preset == "sepia":
                vf_parts.append("colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131")
            elif preset == "warm":
                vf_parts.append("colorchannelmixer=1.1:0:0:0:0:1.0:0:0:0:0:0.85:0")
            elif preset == "cool":
                vf_parts.append("colorchannelmixer=0.9:0:0:0:0:1.0:0:0:0:0:1.15:0")
            elif preset == "vintage":
                vf_parts.append("curves=vintage")
            elif preset == "cinematic":
                vf_parts.append("eq=contrast=1.15:saturation=1.1,colorchannelmixer=1.0:0:0:0:0:1.05:0:0:0:0:1.1:0")
            elif preset == "teal_orange":
                vf_parts.append("colorchannelmixer=1.15:0:0:0:0:1.0:0:0:0:0:1.25:0,eq=contrast=1.1")
            elif preset == "cyberpunk":
                vf_parts.append("colorchannelmixer=1.2:0:0:0:0:0.85:0:0:0:0:1.3:0,eq=contrast=1.2")
            elif preset == "golden_hour":
                vf_parts.append("colorchannelmixer=1.2:0:0:0:0:1.05:0:0:0:0:0.8:0,eq=saturation=1.25")
            elif preset == "moody":
                vf_parts.append("eq=contrast=1.25:saturation=0.85:brightness=-0.04")
            elif preset == "retro_90s":
                vf_parts.append("curves=vintage,colorchannelmixer=1.05:0:0:0:0:1.0:0:0:0:0:0.9:0")

            # Blur
            if float(filters.get("blur", 0)) > 0:
                blur_val = max(1, min(20, int(filters["blur"])))
                vf_parts.append(f"boxblur={blur_val}:{blur_val}")

            # Vignette
            if filters.get("vignette"):
                vf_parts.append("vignette=PI/4")

            # Letterbox cinematic bars
            if filters.get("letterbox"):
                vf_parts.append("drawbox=x=0:y=0:w=iw:h=ih*0.1:color=black:t=fill,drawbox=x=0:y=ih*0.9:w=iw:h=ih*0.1:color=black:t=fill")

        return ",".join(vf_parts)

    def generate_ass_subtitle_file(
        self,
        captions: List[Dict[str, Any]],
        ass_path: Path | str,
        target_w: int,
        target_h: int
    ) -> bool:
        """Generates an Advanced SubStation Alpha (.ass) file with custom styling and yellow highlight support."""
        ass_path = Path(ass_path)
        
        # ASS Header
        header = f"""[Script Info]
Title: GBEST Studio Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: {target_w}
PlayResY: {target_h}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,60,1
Style: Highlight,Arial,54,&H001FD2FF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,40,40,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        def format_time(seconds: float) -> str:
            h = int(seconds // 3600)
            m = int((seconds % 3600) // 60)
            s = int(seconds % 60)
            cs = int(round((seconds - int(seconds)) * 100))
            return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

        events = []
        for cap in captions:
            start_sec = float(cap.get("start", cap.get("start_time", 0.0)))
            end_sec = float(cap.get("end", cap.get("end_time", start_sec + 2.0)))
            text = cap.get("text", "").replace("\n", " ").strip()
            if not text:
                continue

            start_str = format_time(start_sec)
            end_str = format_time(end_sec)

            # Check if style has yellow highlight keyword or preset
            style = cap.get("style", {})
            if isinstance(style, str):
                try:
                    style = json.loads(style)
                except Exception:
                    style = {}
            
            preset = style.get("preset", "classic")
            if preset == "yellow_highlight":
                # Highlight last or key word in yellow (&H001FD2FF in BGR hex format for ASS)
                words = text.split(" ")
                if len(words) > 1:
                    formatted_text = " ".join(words[:-1]) + r" {\c&H001FD2FF&}" + words[-1] + r"{\c&H00FFFFFF&}"
                else:
                    formatted_text = r"{\c&H001FD2FF&}" + text + r"{\c&H00FFFFFF&}"
            elif preset == "bold":
                formatted_text = r"{\b1}" + text + r"{\b0}"
            else:
                formatted_text = text

            events.append(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{formatted_text}")

        content = header + "\n".join(events) + "\n"
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(content)
        return True

    def generate_srt_file(self, captions: List[Dict[str, Any]], srt_path: Path | str) -> bool:
        def format_srt_time(seconds: float) -> str:
            h = int(seconds // 3600)
            m = int((seconds % 3600) // 60)
            s = int(seconds % 60)
            ms = int(round((seconds - int(seconds)) * 1000))
            return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

        lines = []
        for i, cap in enumerate(captions, 1):
            start_sec = float(cap.get("start", cap.get("start_time", 0.0)))
            end_sec = float(cap.get("end", cap.get("end_time", start_sec + 2.0)))
            text = cap.get("text", "").strip()
            if not text:
                continue
            lines.append(f"{i}\n{format_srt_time(start_sec)} --> {format_srt_time(end_sec)}\n{text}\n")

        with open(srt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        return True

    def export_final_video(
        self,
        input_video_path: Path | str,
        output_path: Path | str,
        target_w: int,
        target_h: int,
        fps: int = 30,
        quality: str = "high",
        trim_start: Optional[float] = None,
        trim_end: Optional[float] = None,
        filters: Optional[Dict[str, Any]] = None,
        crop: Optional[Dict[str, Any]] = None,
        rotate: int = 0,
        flip_h: bool = False,
        flip_v: bool = False,
        captions: Optional[List[Dict[str, Any]]] = None,
        secondary_audio_path: Optional[Path | str] = None,
        secondary_audio_volume: float = 0.5,
        original_audio_volume: float = 1.0,
        progress_callback = None
    ) -> bool:
        self.refresh_binaries()
        in_p = Path(input_video_path).resolve()
        out_p = Path(output_path).resolve()

        # Quality settings mapping to CRF
        crf_map = {"standard": "26", "high": "21", "max": "18"}
        crf = crf_map.get(quality.lower(), "21")

        args = [self._ffmpeg_bin, "-y"]

        # Trimming
        if trim_start is not None and trim_start > 0:
            args.extend(["-ss", f"{trim_start:.3f}"])
        if trim_end is not None and trim_end > (trim_start or 0):
            duration = trim_end - (trim_start or 0)
            args.extend(["-t", f"{duration:.3f}"])

        # Inputs
        args.extend(["-i", str(in_p)])

        has_secondary_audio = secondary_audio_path and os.path.exists(secondary_audio_path)
        if has_secondary_audio:
            args.extend(["-i", str(Path(secondary_audio_path).resolve())])

        # Filter construction
        vf_string = self.build_video_filter_string(
            target_w=target_w,
            target_h=target_h,
            filters=filters,
            crop=crop,
            rotate=rotate,
            flip_h=flip_h,
            flip_v=flip_v
        )

        # Handle Subtitles: Burn with filter if supported, otherwise embed stream
        temp_sub = None
        test_filters = self.run_cmd([self._ffmpeg_bin, "-filters"])
        filters_str = (test_filters.stdout or "") + (test_filters.stderr or "")
        has_ass_filter = " ass " in filters_str

        if captions and len(captions) > 0:
            if has_ass_filter:
                temp_sub = settings.TEMP_DIR / f"sub_{os.urandom(4).hex()}.ass"
                self.generate_ass_subtitle_file(captions, temp_sub, target_w, target_h)
                escaped_ass = str(temp_sub.resolve()).replace("\\", "/").replace(":", "\\:")
                if vf_string:
                    vf_string += f",ass='{escaped_ass}'"
                else:
                    vf_string = f"ass='{escaped_ass}'"
            else:
                temp_sub = settings.TEMP_DIR / f"sub_{os.urandom(4).hex()}.srt"
                self.generate_srt_file(captions, temp_sub)
                args.extend(["-i", str(temp_sub.resolve()), "-c:s", "mov_text"])

        if vf_string:
            args.extend(["-vf", vf_string])

        # Audio mixing
        if has_secondary_audio:
            filter_complex_audio = (
                f"[0:a]volume={original_audio_volume:.2f}[a0];"
                f"[1:a]volume={secondary_audio_volume:.2f}[a1];"
                f"[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]"
            )
            args.extend(["-filter_complex", filter_complex_audio, "-map", "0:v", "-map", "[aout]"])
        else:
            args.extend(["-c:a", "aac", "-b:a", "192k"])

        # Video encoding settings with multi-platform fallback
        test_enc = self.run_cmd([self._ffmpeg_bin, "-encoders"])
        encoders_str = (test_enc.stdout or "") + (test_enc.stderr or "")
        if "libx264" in encoders_str:
            args.extend(["-c:v", "libx264", "-preset", "fast", "-crf", crf])
        elif "h264_mf" in encoders_str:
            b_rate = "4000k" if quality == "standard" else "8000k" if quality == "high" else "14000k"
            args.extend(["-c:v", "h264_mf", "-b:v", b_rate])
        elif "mpeg4" in encoders_str:
            args.extend(["-c:v", "mpeg4", "-q:v", "2"])
        else:
            args.extend(["-c:v", "h264"])

        args.extend([
            "-r", str(fps),
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(out_p)
        ])

        try:
            res = self.run_cmd(args, timeout=600)
            if res.returncode != 0:
                raise RuntimeError(f"FFmpeg render error (exit {res.returncode}): {res.stderr[:300]}")
            return os.path.exists(out_p)
        finally:
            if temp_sub and temp_sub.exists():
                temp_sub.unlink(missing_ok=True)

    # Alias for export_final_video
    export_video = export_final_video

ffmpeg_service = FFmpegService()
