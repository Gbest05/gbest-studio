import json
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.models import SiteSetting, User
from app.api.auth import get_current_admin_user
from app.services.storage_service import storage_service

router = APIRouter(prefix="/site-config", tags=["site-config"])

DEFAULT_SITE_CONFIG: Dict[str, Any] = {
    # Branding & Identity
    "brand_name": "GBEST",
    "brand_tagline": "STUDIO",
    "brand_logo_url": "",
    "primary_color": "#FFD21F",
    "accent_color": "#3B82F6",
    "background_color": "#111111",

    # Hero Section & Stage Media
    "hero_badge": "AI-Powered Video Creation Platform",
    "hero_title": "Create Viral Videos in Seconds",
    "hero_subtitle": "GBEST Studio gives creators, influencers, and brands the ultimate AI toolkit: precise speech captions, auto-silence cutter, dynamic canvas styling, and instant high-res export.",
    "hero_cta_text": "Launch Studio Editor",
    "hero_cta_sub": "Free forever · No credit card required",
    "hero_media_url": "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
    "hero_media_type": "video",
    "hero_background_media_url": "",
    "hero_background_media_type": "none",

    # 3D Multi-Platform Showcase Frames Videos
    "frame_9_16_video_url": "",
    "frame_16_9_video_url": "",
    "frame_1_1_video_url": "",

    # Features Section
    "features_title": "Professional Studio Tools. Zero Learning Curve.",
    "features_subtitle": "Everything you need to produce broadcast-ready social videos right in your browser.",

    # Bottom CTA Banner
    "cta_banner_title": "Ready to Produce Viral Content?",
    "cta_banner_subtitle": "Join creators worldwide creating captivating reels, shorts, and TikToks with GBEST Studio.",
    "cta_button_text": "Open Studio Editor Now",

    # Footer
    "footer_copyright": "© 2026 GBEST Studio. All rights reserved.",

    # Studio Editor Defaults
    "studio_banner_text": "GBEST STUDIO",
    "studio_accent_color": "#FFD21F",
    "studio_watermark_enabled": False,
    "studio_watermark_text": "GBEST Studio"
}


def _get_merged_config(db: Session) -> Dict[str, Any]:
    """Retrieve all site settings from database and overlay atop defaults."""
    cfg = dict(DEFAULT_SITE_CONFIG)
    rows = db.scalars(select(SiteSetting)).all()
    for row in rows:
        try:
            val = json.loads(row.value)
        except Exception:
            val = row.value
        cfg[row.key] = val
    return cfg


@router.get("")
def get_site_config(db: Session = Depends(get_db)):
    """Retrieve current site configuration (public endpoint)."""
    config = _get_merged_config(db)
    return {
        "status": "success",
        "config": config
    }


class UpdateSiteConfigRequest(BaseModel):
    settings: Dict[str, Any]


@router.put("")
def update_site_config(
    payload: UpdateSiteConfigRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update website configuration parameters. Requires admin authorization.
    """
    for key, val in payload.settings.items():
        val_str = json.dumps(val) if not isinstance(val, str) else val
        setting = db.scalar(select(SiteSetting).where(SiteSetting.key == key))
        if setting:
            setting.value = val_str
        else:
            setting = SiteSetting(key=key, value=val_str)
            db.add(setting)

    db.commit()
    updated_config = _get_merged_config(db)
    return {
        "status": "success",
        "message": "Site settings successfully updated.",
        "config": updated_config
    }


@router.post("/upload")
async def upload_site_asset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Upload media (logo, hero video, hero image) for site branding.
    Requires admin privileges.
    """
    ext = Path(file.filename or "").suffix.lower()
    allowed_exts = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp4", ".webm", ".mov"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported media format '{ext}'. Allowed: {', '.join(sorted(allowed_exts))}"
        )

    uid, file_path, _ = await storage_service.save_upload_file(
        file=file,
        target_folder=settings.UPLOAD_DIR,
        prefix="brand"
    )

    media_url = f"/api/media/uploads/{file_path.name}"
    is_video = ext in {".mp4", ".webm", ".mov"}

    return {
        "status": "success",
        "url": media_url,
        "filename": file_path.name,
        "media_type": "video" if is_video else "image"
    }
