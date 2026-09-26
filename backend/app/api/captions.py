import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.models import Caption, Video
from app.schemas.schemas import (
    CaptionGenerateRequest, CaptionResponse, CaptionCreate, CaptionUpdate
)
from app.services.caption_service import caption_service

router = APIRouter(prefix="/captions", tags=["captions"])

@router.post("/generate")
async def generate_captions(
    payload: CaptionGenerateRequest,
    db: Session = Depends(get_db)
):
    video = db.scalar(select(Video).where(Video.id == payload.video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        segments = await caption_service.generate_captions(
            video_path=video.path,
            language=payload.language or "en"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}")

    # Clear existing captions for this video
    existing = db.scalars(select(Caption).where(Caption.video_id == video.id)).all()
    for c in existing:
        db.delete(c)

    # Store generated captions
    saved_captions = []
    for seg in segments:
        caption_obj = Caption(
            video_id=video.id,
            project_id=video.project_id or payload.project_id,
            start_time=seg["start"],
            end_time=seg["end"],
            text=seg["text"],
            words_data=json.dumps(seg.get("words", [])),
            style=json.dumps(seg.get("style", {"preset": "yellow_highlight"}))
        )
        db.add(caption_obj)
        saved_captions.append(caption_obj)

    db.commit()

    return {
        "success": True,
        "video_id": video.id,
        "segments": segments,
        "count": len(segments),
        "message": "Captions generated successfully." if len(segments) > 0 else "No spoken speech detected in this video file."
    }

@router.get("/{video_id}", response_model=list[CaptionResponse])
def get_captions(video_id: str, db: Session = Depends(get_db)):
    captions = db.scalars(
        select(Caption).where(Caption.video_id == video_id).order_by(Caption.start_time)
    ).all()
    return captions

@router.post("", response_model=CaptionResponse)
def create_caption(payload: CaptionCreate, db: Session = Depends(get_db)):
    caption = Caption(
        video_id=payload.video_id,
        project_id=payload.project_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        text=payload.text,
        words_data=payload.words_data or "[]",
        style=payload.style or "{}"
    )
    db.add(caption)
    db.commit()
    db.refresh(caption)
    return caption

@router.put("/{caption_id}", response_model=CaptionResponse)
def update_caption(
    caption_id: str,
    payload: CaptionUpdate,
    db: Session = Depends(get_db)
):
    caption = db.scalar(select(Caption).where(Caption.id == caption_id))
    if not caption:
        raise HTTPException(status_code=404, detail="Caption not found")

    if payload.start_time is not None:
        caption.start_time = payload.start_time
    if payload.end_time is not None:
        caption.end_time = payload.end_time
    if payload.text is not None:
        caption.text = payload.text
    if payload.words_data is not None:
        caption.words_data = payload.words_data
    if payload.style is not None:
        caption.style = payload.style

    db.commit()
    db.refresh(caption)
    return caption

@router.delete("/{caption_id}")
def delete_caption(caption_id: str, db: Session = Depends(get_db)):
    caption = db.scalar(select(Caption).where(Caption.id == caption_id))
    if not caption:
        raise HTTPException(status_code=404, detail="Caption not found")

    db.delete(caption)
    db.commit()
    return {"message": "Caption deleted successfully", "id": caption_id}
