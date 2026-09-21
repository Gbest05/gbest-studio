import os
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy import select
from app.config import settings
from app.database import SessionLocal
from app.models.models import ExportJob, Project, Video
from app.services.ffmpeg_service import ffmpeg_service

ASPECT_RESOLUTIONS = {
    "16:9": {"1080p": (1920, 1080), "720p": (1280, 720)},
    "9:16": {"1080p": (1080, 1920), "720p": (720, 1280)},
    "1:1": {"1080p": (1080, 1080), "720p": (720, 720)},
    "4:5": {"1080p": (1080, 1350), "720p": (720, 900)},
}

class ExportService:
    def run_export_job(self, job_id: str, export_request_data: Dict[str, Any]):
        """Processes the export job in the background."""
        with SessionLocal() as db:
            job = db.scalar(select(ExportJob).where(ExportJob.id == job_id))
            if not job:
                return

            try:
                # 1. Update status to processing (10%)
                job.status = "processing"
                job.progress = 10
                job.message = "Initializing export engine..."
                db.commit()
                time.sleep(0.5)

                # Fetch project & video
                project = db.scalar(select(Project).where(Project.id == job.project_id))
                if not project:
                    raise RuntimeError("Associated project not found")

                # Parse project data or export request timeline state
                timeline_state = export_request_data.get("timeline_state")
                if not timeline_state and project.project_data:
                    try:
                        timeline_state = json.loads(project.project_data)
                    except Exception:
                        timeline_state = {}
                if not timeline_state:
                    timeline_state = {}

                # Locate primary video
                input_video_path = None
                videos = db.scalars(select(Video).where(Video.project_id == project.id)).all()
                if videos:
                    input_video_path = Path(videos[0].path)

                # Or check timeline_state for active video clip path
                clips = timeline_state.get("clips", [])
                if clips and clips[0].get("path"):
                    input_video_path = Path(clips[0]["path"])

                if not input_video_path or not input_video_path.exists():
                    raise RuntimeError("No input video file found for this project")

                # Determine target width and height
                aspect = job.aspect_ratio or "16:9"
                res_key = "1080p" if "1080" in str(job.resolution) else "720p"
                target_w, target_h = ASPECT_RESOLUTIONS.get(aspect, {}).get(res_key, (1920, 1080))
                
                if aspect == "custom" and export_request_data.get("custom_width") and export_request_data.get("custom_height"):
                    target_w = int(export_request_data["custom_width"])
                    target_h = int(export_request_data["custom_height"])

                # 2. Update progress: (30%) Reading timeline configuration
                job.progress = 30
                job.message = "Configuring aspect ratio and trimming..."
                db.commit()
                time.sleep(0.5)

                # Trim settings
                trim_start = None
                trim_end = None
                if clips and len(clips) > 0:
                    trim_start = float(clips[0].get("trim_start", 0.0))
                    trim_end = float(clips[0].get("trim_end", 0.0)) if clips[0].get("trim_end") else None

                # Filters & effects
                job.progress = 50
                job.message = "Applying visual filters and color grading..."
                db.commit()
                time.sleep(0.5)

                filters = timeline_state.get("filters", {})
                rotate = int(timeline_state.get("rotate", 0))
                flip_h = bool(timeline_state.get("flip_h", False))
                flip_v = bool(timeline_state.get("flip_v", False))
                crop = timeline_state.get("crop")

                # Captions
                captions = timeline_state.get("captions", [])
                if not captions:
                    from app.models.models import Caption
                    caps = db.scalars(select(Caption).where(Caption.project_id == project.id).order_by(Caption.start_time)).all()
                    captions = [
                        {
                            "id": c.id,
                            "start": c.start_time,
                            "end": c.end_time,
                            "text": c.text,
                            "style": c.style
                        }
                        for c in caps
                    ]

                # 3. Update progress: (70%) Burning captions & styling
                job.progress = 70
                job.message = "Rendering captions and subtitles..."
                db.commit()
                time.sleep(0.5)

                # Secondary audio
                audio_tracks = timeline_state.get("audio_tracks", [])
                sec_audio_path = None
                sec_audio_vol = 0.5
                orig_audio_vol = float(timeline_state.get("video_volume", 1.0))
                if audio_tracks and audio_tracks[0].get("path") and os.path.exists(audio_tracks[0]["path"]):
                    sec_audio_path = audio_tracks[0]["path"]
                    sec_audio_vol = float(audio_tracks[0].get("volume", 0.5))

                # Output file destination
                out_filename = f"export_{job.id}.mp4"
                output_path = settings.EXPORT_DIR / out_filename

                # 4. Update progress: (85%) Encoding video H.264
                job.progress = 85
                job.message = "Encoding H.264 video and finalizing MP4..."
                db.commit()

                # Call FFmpeg export engine
                success = ffmpeg_service.export_final_video(
                    input_video_path=input_video_path,
                    output_path=output_path,
                    target_w=target_w,
                    target_h=target_h,
                    fps=job.fps or 30,
                    quality=job.quality or "high",
                    trim_start=trim_start,
                    trim_end=trim_end,
                    filters=filters,
                    crop=crop,
                    rotate=rotate,
                    flip_h=flip_h,
                    flip_v=flip_v,
                    captions=captions,
                    secondary_audio_path=sec_audio_path,
                    secondary_audio_volume=sec_audio_vol,
                    original_audio_volume=orig_audio_vol
                )

                if not success or not output_path.exists():
                    raise RuntimeError("FFmpeg export pipeline failed to generate MP4 file")

                # 5. Mark completed (100%)
                job.status = "completed"
                job.progress = 100
                job.message = "Export complete!"
                job.output_path = str(output_path.resolve())
                job.file_size_bytes = output_path.stat().st_size
                db.commit()

            except Exception as e:
                job.status = "failed"
                job.progress = 0
                job.message = "Export failed"
                job.error = str(e)
                db.commit()

export_service = ExportService()
