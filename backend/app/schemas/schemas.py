from typing import Optional, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str = Field(default="Untitled Project")
    description: Optional[str] = None
    aspect_ratio: str = Field(default="16:9")
    project_data: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    aspect_ratio: Optional[str] = None
    thumbnail_url: Optional[str] = None
    project_data: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    aspect_ratio: str
    project_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectSummary(BaseModel):
    id: str
    name: str
    thumbnail_url: Optional[str] = None
    aspect_ratio: str
    updated_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# --- Video Schemas ---
class VideoMetadata(BaseModel):
    duration: float
    width: int
    height: int
    fps: float
    file_size_bytes: int
    codec: Optional[str] = None
    audio_codec: Optional[str] = None
    has_audio: bool = True

class VideoResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    filename: str
    original_filename: str
    duration: float
    width: int
    height: int
    fps: float
    file_size_bytes: int
    thumbnail_url: Optional[str] = None
    video_url: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Caption Schemas ---
class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float

class CaptionStyle(BaseModel):
    preset: Optional[str] = "classic" # classic, bold, yellow_highlight, creator, minimal, social, cinematic
    font_family: Optional[str] = "Inter"
    font_size: Optional[int] = 28
    font_weight: Optional[str] = "bold"
    color: Optional[str] = "#FFFFFF"
    highlight_color: Optional[str] = "#FFD21F"
    background_color: Optional[str] = "transparent"
    shadow: Optional[bool] = True
    shadow_color: Optional[str] = "rgba(0,0,0,0.8)"
    border: Optional[bool] = False
    border_color: Optional[str] = "#000000"
    position_y: Optional[int] = 80 # percentage from top (80 = lower third)
    alignment: Optional[str] = "center" # left, center, right
    animation: Optional[str] = "none" # none, fade, pop, bounce, slide_up, typewriter, word_pop
    word_by_word: Optional[bool] = False

class CaptionSegment(BaseModel):
    id: Optional[str] = None
    start: float
    end: float
    text: str
    words: Optional[List[WordTimestamp]] = None
    style: Optional[CaptionStyle] = None

class CaptionGenerateRequest(BaseModel):
    video_id: str
    project_id: Optional[str] = None
    language: Optional[str] = "en"

class CaptionCreate(BaseModel):
    video_id: Optional[str] = None
    project_id: Optional[str] = None
    start_time: float
    end_time: float
    text: str
    words_data: Optional[str] = None
    style: Optional[str] = None

class CaptionUpdate(BaseModel):
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    text: Optional[str] = None
    words_data: Optional[str] = None
    style: Optional[str] = None

class CaptionResponse(BaseModel):
    id: str
    video_id: Optional[str] = None
    project_id: Optional[str] = None
    start_time: float
    end_time: float
    text: str
    words_data: Optional[str] = None
    style: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Export Schemas ---
class ExportRequest(BaseModel):
    project_id: str
    resolution: str = Field(default="1080p")  # 720p, 1080p
    aspect_ratio: str = Field(default="16:9") # 16:9, 9:16, 1:1, 4:5, custom
    custom_width: Optional[int] = None
    custom_height: Optional[int] = None
    format: str = Field(default="mp4")
    quality: str = Field(default="high")     # standard, high, max
    fps: int = Field(default=30)
    # Timeline configuration if exporting directly without saving project first:
    timeline_state: Optional[dict[str, Any]] = None

class ExportStatusResponse(BaseModel):
    id: str
    project_id: str
    status: str       # pending, processing, completed, failed
    progress: int     # 0 - 100
    message: str
    resolution: str
    aspect_ratio: str
    download_url: Optional[str] = None
    error: Optional[str] = None
    file_size_bytes: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Asset Schemas ---
class AssetResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    type: str
    filename: str
    original_filename: str
    url: str
    duration: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
