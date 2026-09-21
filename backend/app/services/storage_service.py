import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

class StorageService:
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        # Keep only basename and clean unsafe characters
        base = os.path.basename(filename)
        clean = "".join(c for c in base if c.isalnum() or c in (".", "-", "_")).strip()
        return clean or "unnamed_file"

    @staticmethod
    def generate_storage_name(original_filename: str, prefix: str = "media") -> tuple[str, str]:
        ext = os.path.splitext(original_filename)[1].lower()
        if not ext:
            ext = ".mp4"
        uid = uuid.uuid4().hex[:12]
        stored_filename = f"{prefix}_{uid}{ext}"
        return uid, stored_filename

    @classmethod
    async def save_upload_file(cls, file: UploadFile, target_folder: Path, prefix: str = "media") -> tuple[str, Path, str]:
        sanitized_name = cls.sanitize_filename(file.filename or "uploaded_video.mp4")
        uid, stored_filename = cls.generate_storage_name(sanitized_name, prefix=prefix)
        
        target_path = (target_folder / stored_filename).resolve()
        
        # Prevent path traversal
        if not str(target_path).startswith(str(target_folder.resolve())):
            raise HTTPException(status_code=400, detail="Invalid file destination path")

        # Stream copy to disk
        try:
            with open(target_path, "wb") as buffer:
                while chunk := await file.read(1024 * 1024): # 1MB chunks
                    buffer.write(chunk)
        except Exception as e:
            if target_path.exists():
                target_path.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Failed to write uploaded file: {str(e)}")

        return uid, target_path, sanitized_name

    @classmethod
    def get_public_url(cls, file_path: Path, category: str = "uploads") -> str:
        filename = file_path.name
        return f"/api/media/{category}/{filename}"

    @classmethod
    def delete_file(cls, file_path: str | Path):
        path = Path(file_path).resolve()
        if path.exists() and path.is_file():
            # Only allow deleting inside storage dir
            if str(path).startswith(str(settings.STORAGE_DIR.resolve())):
                path.unlink(missing_ok=True)

storage_service = StorageService()
