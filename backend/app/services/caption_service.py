import os
import re
import wave
import uuid
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.config import settings
from app.services.ffmpeg_service import ffmpeg_service


class CaptionService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY

    async def generate_captions(
        self,
        video_path: Path | str,
        language: str = "en"
    ) -> List[Dict[str, Any]]:
        """
        Main entry point: extracts audio to 16kHz mono WAV and executes real speech-to-text.
        Strictly returns genuine spoken words. Zero fake or template captions.
        """
        v_path = Path(video_path).resolve()
        if not v_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        # 1. Extract audio to pristine 16kHz mono WAV
        temp_wav = settings.TEMP_DIR / f"audio_{uuid.uuid4().hex[:8]}.wav"
        try:
            extracted = ffmpeg_service.extract_audio_wav(v_path, temp_wav)
            if not extracted or not temp_wav.exists() or temp_wav.stat().st_size < 1000:
                # Video has no audio or empty audio track -> return empty list (no fake captions)
                return []

            # 2. Try OpenAI Whisper API if key is configured
            if self.openai_key:
                try:
                    segments = await self._transcribe_with_openai(temp_wav, language)
                    if segments:
                        return segments
                except Exception as e:
                    print(f"OpenAI transcription notice: {e}")

            # 3. Robust SpeechRecognition with Google Web Speech API (Free, Instant, No Model Download)
            try:
                stt_segments = await asyncio.wait_for(
                    asyncio.to_thread(self._transcribe_with_speech_recognition, temp_wav, language),
                    timeout=35.0
                )
                if stt_segments:
                    return stt_segments
            except Exception as e:
                print(f"SpeechRecognition notice ({type(e).__name__}): {e}")

            # 4. Try local faster_whisper or whisper only if already available (with 4s timeout)
            try:
                whisper_segs = await asyncio.wait_for(
                    self._transcribe_with_local_whisper(temp_wav, language),
                    timeout=4.0
                )
                if whisper_segs:
                    return whisper_segs
            except Exception:
                pass

            # Return empty list if no speech was detected. Zero fake subtitles.
            return []

        finally:
            if temp_wav.exists():
                try:
                    temp_wav.unlink(missing_ok=True)
                except Exception:
                    pass

    async def _transcribe_with_openai(self, wav_path: Path, language: str = "en") -> List[Dict[str, Any]]:
        import httpx
        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.openai_key}"}

        with open(wav_path, "rb") as f:
            files = {"file": ("audio.wav", f, "audio/wav")}
            data = {
                "model": "whisper-1",
                "response_format": "verbose_json",
                "timestamp_granularities": ["segment", "word"],
                "language": language[:2] if language else "en"
            }
            async with httpx.AsyncClient(timeout=90.0) as client:
                res = await client.post(url, headers=headers, files=files, data=data)
                if res.status_code == 200:
                    result = res.json()
                    segments = []
                    for seg in result.get("segments", []):
                        raw_text = seg.get("text", "").strip()
                        if not raw_text:
                            continue
                        words = [
                            {
                                "word": w.get("word", "").strip(),
                                "start": round(w.get("start", 0), 2),
                                "end": round(w.get("end", 0), 2)
                            }
                            for w in result.get("words", [])
                            if seg.get("start", 0) <= w.get("start", 0) <= seg.get("end", 0)
                        ]
                        segments.append({
                            "id": f"cap_{uuid.uuid4().hex[:8]}",
                            "start": round(seg.get("start", 0.0), 2),
                            "end": round(seg.get("end", 0.0), 2),
                            "text": raw_text,
                            "words": words,
                            "style": {"preset": "yellow_highlight"}
                        })
                    return segments
        return []

    async def _transcribe_with_local_whisper(self, wav_path: Path, language: str = "en") -> List[Dict[str, Any]]:
        """Try local faster_whisper or openai-whisper if present in environment."""
        try:
            if not hasattr(self, "_whisper_model") or self._whisper_model is None:
                from faster_whisper import WhisperModel
                self._whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

            segs, _ = self._whisper_model.transcribe(
                str(wav_path),
                word_timestamps=True,
                language=language[:2] if language else "en"
            )
            segments = []
            for seg in segs:
                raw_text = (seg.text or "").strip()
                if not raw_text:
                    continue
                words = []
                if hasattr(seg, "words") and seg.words:
                    for w in seg.words:
                        words.append({
                            "word": str(w.word).strip(),
                            "start": float(round(float(w.start), 2)),
                            "end": float(round(float(w.end), 2))
                        })
                segments.append({
                    "id": f"cap_{uuid.uuid4().hex[:8]}",
                    "start": float(round(float(seg.start), 2)),
                    "end": float(round(float(seg.end), 2)),
                    "text": str(raw_text),
                    "words": words,
                    "style": {"preset": "yellow_highlight"}
                })
            return segments
        except ImportError:
            pass

        try:
            import whisper
            model = whisper.load_model("base")
            result = model.transcribe(str(wav_path), word_timestamps=True, language=language[:2] if language else "en")
            segments = []
            for seg in result.get("segments", []):
                raw_text = seg.get("text", "").strip()
                if not raw_text:
                    continue
                words = [
                    {"word": w.get("word", "").strip(), "start": round(w.get("start", 0.0), 2), "end": round(w.get("end", 0.0), 2)}
                    for w in seg.get("words", [])
                ]
                segments.append({
                    "id": f"cap_{uuid.uuid4().hex[:8]}",
                    "start": round(seg.get("start", 0.0), 2),
                    "end": round(seg.get("end", 0.0), 2),
                    "text": raw_text,
                    "words": words,
                    "style": {"preset": "yellow_highlight"}
                })
            return segments
        except ImportError:
            pass

        return []

    def _transcribe_with_speech_recognition(self, wav_path: Path, language: str = "en") -> List[Dict[str, Any]]:
        """
        Transcribes audio using Google Speech Recognition.
        Optimized for high accuracy: whole-file transcription for short clips (<= 60s),
        and acoustic windowing for longer videos.
        """
        try:
            import speech_recognition as sr
        except ImportError:
            return []

        # 1. Determine audio duration using Python standard library wave
        duration = 0.0
        try:
            with wave.open(str(wav_path), "rb") as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                if rate > 0:
                    duration = round(frames / float(rate), 2)
        except Exception as e:
            print(f"Error inspecting wave duration: {e}")
            return []

        if duration < 0.4:
            return []

        # Map language code (e.g. 'en' -> 'en-US')
        lang_map = {
            "en": "en-US",
            "es": "es-ES",
            "fr": "fr-FR",
            "de": "de-DE",
            "it": "it-IT",
            "pt": "pt-BR",
            "zh": "zh-CN",
            "ja": "ja-JP",
            "ar": "ar-SA"
        }
        lang_code = lang_map.get(language[:2].lower(), "en-US")

        def split_into_caption_segments(text: str, total_start: float, total_end: float) -> List[Dict[str, Any]]:
            raw_words = [w.strip() for w in text.split(" ") if w.strip()]
            if not raw_words:
                return []

            # Group into chunks of 4-6 words
            chunk_size = 5
            word_groups = [raw_words[i:i + chunk_size] for i in range(0, len(raw_words), chunk_size)]
            num_groups = len(word_groups)
            group_duration = (total_end - total_start) / max(1, num_groups)

            segments = []
            for g_idx, group in enumerate(word_groups):
                seg_start = round(total_start + (g_idx * group_duration), 2)
                seg_end = round(min(total_end, seg_start + group_duration), 2)
                seg_dur = max(0.3, seg_end - seg_start)

                weights = [max(1, len(re.sub(r'[^a-zA-Z0-9]', '', w))) for w in group]
                total_weight = sum(weights)
                word_objs = []
                cur_t = seg_start

                for w_idx, (w, weight) in enumerate(zip(group, weights)):
                    w_span = round(seg_dur * (weight / total_weight), 2)
                    w_start = round(cur_t, 2)
                    w_end = round(min(seg_end, w_start + max(0.12, w_span)), 2)
                    if w_idx == len(group) - 1:
                        w_end = seg_end
                    word_objs.append({
                        "word": w,
                        "start": w_start,
                        "end": max(round(w_start + 0.1, 2), w_end)
                    })
                    cur_t = w_end

                segments.append({
                    "id": f"cap_{uuid.uuid4().hex[:8]}",
                    "start": seg_start,
                    "end": seg_end,
                    "text": " ".join(group),
                    "words": word_objs,
                    "style": {"preset": "yellow_highlight"}
                })
            return segments

        # 1. For clips <= 60s, transcribe the whole audio file directly for maximum accuracy & flow
        if duration <= 60.0:
            r = sr.Recognizer()
            r.energy_threshold = 150
            r.dynamic_energy_threshold = True
            try:
                with sr.AudioFile(str(wav_path)) as source:
                    r.adjust_for_ambient_noise(source, duration=min(0.4, duration / 3))
                    audio_data = r.record(source)

                full_text = ""
                try:
                    full_text = r.recognize_google(audio_data, language=lang_code).strip()
                except Exception:
                    if lang_code != "en-US":
                        try:
                            full_text = r.recognize_google(audio_data, language="en-US").strip()
                        except Exception:
                            full_text = ""

                if full_text:
                    segs = split_into_caption_segments(full_text, 0.0, duration)
                    if segs:
                        return segs
            except Exception as e:
                print(f"Whole audio transcription notice: {e}")

        # 2. Windowed transcription for longer audio or fallback
        chunk_length = 10.0
        step = 9.0
        tasks = []
        cur = 0.0
        while cur < duration:
            dur = min(chunk_length, duration - cur)
            tasks.append((cur, dur))
            cur += step

        def transcribe_window(offset_dur):
            offset, dur = offset_dur
            r = sr.Recognizer()
            r.energy_threshold = 150
            r.dynamic_energy_threshold = True

            try:
                with sr.AudioFile(str(wav_path)) as source:
                    r.adjust_for_ambient_noise(source, duration=min(0.3, dur / 3))
                    audio_data = r.record(source, offset=offset, duration=dur)

                text = ""
                try:
                    text = r.recognize_google(audio_data, language=lang_code).strip()
                except Exception:
                    if lang_code != "en-US":
                        try:
                            text = r.recognize_google(audio_data, language="en-US").strip()
                        except Exception:
                            text = ""

                if not text:
                    return None

                seg_start = round(offset, 2)
                seg_end = round(min(duration, offset + dur), 2)
                return split_into_caption_segments(text, seg_start, seg_end)
            except Exception:
                return None

        results = []
        max_workers = min(4, len(tasks))
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_task = {executor.submit(transcribe_window, t): t for t in tasks}
            for future in as_completed(future_to_task):
                segs = future.result()
                if segs:
                    results.extend(segs)

        results.sort(key=lambda s: s["start"])

        # Deduplicate overlapping phrases
        cleaned_segments = []
        seen_texts = set()
        for s in results:
            clean_txt = s["text"].lower().strip()
            if clean_txt in seen_texts:
                continue
            seen_texts.add(clean_txt)
            cleaned_segments.append(s)

        return cleaned_segments


caption_service = CaptionService()
