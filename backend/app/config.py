import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"

# Resolve persistent database file location:
# Placing database inside STORAGE_DIR ensures that attaching a persistent volume
# (e.g. /app/backend/storage on Render or Railway) automatically preserves the database across restarts and re-deployments.
def _resolve_database_file() -> Path:
    storage_db = STORAGE_DIR / "gbest_studio.db"
    base_db = BASE_DIR / "gbest_studio.db"
    if storage_db.exists():
        return storage_db
    if base_db.exists():
        try:
            STORAGE_DIR.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copy2(base_db, storage_db)
            return storage_db
        except Exception:
            return base_db
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    return storage_db

_DB_PATH = _resolve_database_file()

class Settings(BaseSettings):
    APP_NAME: str = "GBEST STUDIO"
    APP_ENV: str = "development"
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_DB_PATH.as_posix()}"
    SYNC_DATABASE_URL: str = f"sqlite:///{_DB_PATH.as_posix()}"
    
    # Admin Credentials (allows setting or resetting admin credentials via Render Environment Variables)
    ADMIN_EMAIL: str = "princegbest555@gmail.com"
    ADMIN_PASSWORD: str = ""
    
    # Storage settings
    STORAGE_DIR: Path = STORAGE_DIR
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    PROJECT_DIR: Path = STORAGE_DIR / "projects"
    AUDIO_DIR: Path = STORAGE_DIR / "audio"
    THUMBNAIL_DIR: Path = STORAGE_DIR / "thumbnails"
    EXPORT_DIR: Path = STORAGE_DIR / "exports"
    TEMP_DIR: Path = STORAGE_DIR / "temp"
    
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
