from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.models import Asset
from app.schemas.schemas import AssetResponse
from app.services.storage_service import storage_service
from app.services.ffmpeg_service import ffmpeg_service

router = APIRouter(prefix="/audio", tags=["audio"])

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".aac", ".m4a", ".ogg"}

@router.post("/upload", response_model=AssetResponse)
async def upload_audio(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: '{ext}'. Supported formats: MP3, WAV, AAC, M4A."
        )

    uid, file_path, original_name = await storage_service.save_upload_file(
        file=file,
        target_folder=settings.AUDIO_DIR,
        prefix="audio"
    )

    # Get duration via ffprobe / ffmpeg
    metadata = ffmpeg_service.get_video_metadata(file_path)

    asset = Asset(
        id=uid,
        project_id=project_id,
        type="audio",
        filename=file_path.name,
        original_filename=original_name,
        path=str(file_path.resolve()),
        duration=metadata.duration
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return AssetResponse(
        id=asset.id,
        project_id=asset.project_id,
        type=asset.type,
        filename=asset.filename,
        original_filename=asset.original_filename,
        url=f"/api/media/audio/{asset.filename}",
        duration=asset.duration,
        created_at=asset.created_at
    )

@router.post("/extract-from-video/{video_id}", response_model=AssetResponse)
def extract_audio_from_video(video_id: str, db: Session = Depends(get_db)):
    """Extracts MP3 audio track from an uploaded video file."""
    import uuid
    from sqlalchemy import select
    from app.models.models import Video

    video = db.scalar(select(Video).where(Video.id == video_id))
    if not video or not Path(video.path).exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    uid = uuid.uuid4().hex[:12]
    audio_filename = f"extracted_{uid}.mp3"
    audio_path = settings.AUDIO_DIR / audio_filename

    success = ffmpeg_service.extract_audio_mp3(video.path, audio_path)
    if not success or not audio_path.exists():
        raise HTTPException(status_code=500, detail="Failed to extract audio from video")

    metadata = ffmpeg_service.get_video_metadata(audio_path)
    asset = Asset(
        id=uid,
        project_id=video.project_id,
        type="audio",
        filename=audio_filename,
        original_filename=f"Audio_{video.original_filename.rsplit('.', 1)[0]}.mp3",
        path=str(audio_path.resolve()),
        duration=metadata.duration or video.duration
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return AssetResponse(
        id=asset.id,
        project_id=asset.project_id,
        type=asset.type,
        filename=asset.filename,
        original_filename=asset.original_filename,
        url=f"/api/media/audio/{asset.filename}",
        duration=asset.duration,
        created_at=asset.created_at
    )

