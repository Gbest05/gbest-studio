from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.models import ExportJob, Project
from app.schemas.schemas import ExportRequest, ExportStatusResponse
from app.services.export_service import export_service

router = APIRouter(prefix="/export", tags=["export"])

@router.post("", response_model=ExportStatusResponse)
def create_export_job(
    payload: ExportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Verify project exists
    project = db.scalar(select(Project).where(Project.id == payload.project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    job = ExportJob(
        project_id=payload.project_id,
        status="pending",
        progress=0,
        message="Queued for rendering...",
        resolution=payload.resolution or "1080p",
        aspect_ratio=payload.aspect_ratio or "16:9",
        format=payload.format or "mp4",
        quality=payload.quality or "high",
        fps=payload.fps or 30
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch export background task
    background_tasks.add_task(
        export_service.run_export_job,
        job.id,
        payload.model_dump()
    )

    return ExportStatusResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
        resolution=job.resolution,
        aspect_ratio=job.aspect_ratio,
        download_url=None,
        error=None,
        file_size_bytes=None,
        created_at=job.created_at,
        updated_at=job.updated_at
    )

@router.get("/{job_id}/status", response_model=ExportStatusResponse)
def get_export_status(job_id: str, db: Session = Depends(get_db)):
    job = db.scalar(select(ExportJob).where(ExportJob.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")

    download_url = f"/api/export/{job.id}/download" if job.status == "completed" and job.output_path else None

    return ExportStatusResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
        resolution=job.resolution,
        aspect_ratio=job.aspect_ratio,
        download_url=download_url,
        error=job.error,
        file_size_bytes=job.file_size_bytes,
        created_at=job.created_at,
        updated_at=job.updated_at
    )

@router.get("/{job_id}/download")
def download_exported_video(job_id: str, db: Session = Depends(get_db)):
    job = db.scalar(select(ExportJob).where(ExportJob.id == job_id))
    if not job or not job.output_path:
        raise HTTPException(status_code=404, detail="Exported video not found")

    file_path = Path(job.output_path).resolve()
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Export file missing on server")

    filename = f"GBEST_Studio_{job.resolution}_{job.id[:8]}.mp4"
    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
