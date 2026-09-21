from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models.models import Video, Project
from app.schemas.schemas import VideoResponse
from app.services.storage_service import storage_service
from app.services.ffmpeg_service import ffmpeg_service

router = APIRouter(prefix="/videos", tags=["videos"])

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"}
ALLOWED_EXTENSIONS = VIDEO_EXTENSIONS | IMAGE_EXTENSIONS

@router.post("/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: Session = Depends(get_db)
):
    # Validate extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: '{ext}'. Supported formats: MP4, MOV, WebM, PNG, JPG, WebP, SVG, GIF."
        )

    is_image = ext in IMAGE_EXTENSIONS
    prefix = "image" if is_image else "video"

    # Save to disk
    uid, file_path, original_name = await storage_service.save_upload_file(
        file=file,
        target_folder=settings.UPLOAD_DIR,
        prefix=prefix
    )

    if is_image:
        metadata = ffmpeg_service.get_video_metadata(file_path)
        thumb_url = f"/api/media/uploads/{file_path.name}"
        thumb_path = file_path
        video_url = f"/api/media/uploads/{file_path.name}"
        duration = 5.0
    else:
        # Extract metadata using FFprobe / FFmpeg
        metadata = ffmpeg_service.get_video_metadata(file_path)

        # If codec is not H.264 (e.g. HEVC/H.265 from iPhone/Android, ProRes, VP9), transcode for web browser playback
        if metadata.codec and metadata.codec.lower() not in ("h264", "avc1", "avc"):
            temp_transcode = file_path.with_name(f"trans_{file_path.name}")
            success = ffmpeg_service.transcode_to_h264(file_path, temp_transcode)
            if success and temp_transcode.exists():
                temp_transcode.replace(file_path)
                metadata = ffmpeg_service.get_video_metadata(file_path)

        # Generate thumbnail
        thumb_name = f"thumb_{uid}.jpg"
        thumb_path = settings.THUMBNAIL_DIR / thumb_name
        thumbnail_success = ffmpeg_service.generate_thumbnail(
            video_path=file_path,
            output_path=thumb_path,
            timestamp=min(1.0, max(0.1, metadata.duration / 4.0 if metadata.duration else 1.0))
        )
        thumb_url = f"/api/media/thumbnails/{thumb_name}" if thumbnail_success and thumb_path.exists() else None
        video_url = f"/api/media/uploads/{file_path.name}"
        duration = metadata.duration

    video = Video(
        id=uid,
        project_id=project_id,
        filename=file_path.name,
        original_filename=original_name,
        path=str(file_path.resolve()),
        thumbnail_path=str(thumb_path.resolve()) if thumb_url else None,
        duration=duration or metadata.duration or 5.0,
        width=metadata.width or 1080,
        height=metadata.height or 1080,
        fps=metadata.fps or 30,
        file_size_bytes=metadata.file_size_bytes,
        mime_type=file.content_type or ("image/png" if is_image else "video/mp4")
    )
    db.add(video)

    # If project_id is provided and project doesn't have thumbnail, update it
    if project_id:
        proj = db.scalar(select(Project).where(Project.id == project_id))
        if proj and thumb_url and not proj.thumbnail_url:
            proj.thumbnail_url = thumb_url

    db.commit()
    db.refresh(video)

    return VideoResponse(
        id=video.id,
        project_id=video.project_id,
        filename=video.filename,
        original_filename=video.original_filename,
        duration=video.duration,
        width=video.width,
        height=video.height,
        fps=video.fps,
        file_size_bytes=video.file_size_bytes,
        thumbnail_url=thumb_url,
        video_url=video_url,
        created_at=video.created_at
    )

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = db.scalar(select(Video).where(Video.id == video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    thumb_url = f"/api/media/thumbnails/{Path(video.thumbnail_path).name}" if video.thumbnail_path else None
    video_url = f"/api/media/uploads/{video.filename}"

    return VideoResponse(
        id=video.id,
        project_id=video.project_id,
        filename=video.filename,
        original_filename=video.original_filename,
        duration=video.duration,
        width=video.width,
        height=video.height,
        fps=video.fps,
        file_size_bytes=video.file_size_bytes,
        thumbnail_url=thumb_url,
        video_url=video_url,
        created_at=video.created_at
    )

@router.delete("/{video_id}")
def delete_video(video_id: str, db: Session = Depends(get_db)):
    video = db.scalar(select(Video).where(Video.id == video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Clean files
    if video.path:
        storage_service.delete_file(video.path)
    if video.thumbnail_path:
        storage_service.delete_file(video.thumbnail_path)

    db.delete(video)
    db.commit()
    return {"message": "Video deleted successfully", "id": video_id}
