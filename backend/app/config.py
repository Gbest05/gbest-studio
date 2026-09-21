import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "GBEST STUDIO"
    APP_ENV: str = "development"
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR / 'gbest_studio.db'}"
    SYNC_DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'gbest_studio.db'}"
    
    # Storage settings
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    PROJECT_DIR: Path = BASE_DIR / "storage" / "projects"
    AUDIO_DIR: Path = BASE_DIR / "storage" / "audio"
    THUMBNAIL_DIR: Path = BASE_DIR / "storage" / "thumbnails"
    EXPORT_DIR: Path = BASE_DIR / "storage" / "exports"
    TEMP_DIR: Path = BASE_DIR / "storage" / "temp"
    
    MAX_UPLOAD_SIZE_MB: int = 500
    WHISPER_MODEL: str = "base"
    OPENAI_API_KEY: str = ""
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Google OAuth 2.0 Settings (Keep CLIENT_SECRET server-side only!)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://127.0.0.1:8000/api/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"
    JWT_SECRET_KEY: str = "gbest-studio-jwt-secret-key-change-in-production"

    # FFmpeg paths (auto-detected or overridden)
    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
for folder in [
    settings.STORAGE_DIR,
    settings.UPLOAD_DIR,
    settings.PROJECT_DIR,
    settings.AUDIO_DIR,
    settings.THUMBNAIL_DIR,
    settings.EXPORT_DIR,
    settings.TEMP_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)
