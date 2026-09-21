import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.database import get_db
from app.models.models import Project
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummary

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=list[ProjectSummary])
def list_projects(db: Session = Depends(get_db)):
    result = db.scalars(select(Project).order_by(desc(Project.updated_at))).all()
    return result

@router.post("", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=payload.name or "Untitled Project",
        description=payload.description,
        aspect_ratio=payload.aspect_ratio or "16:9",
        project_data=payload.project_data or "{}"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description
    if payload.aspect_ratio is not None:
        project.aspect_ratio = payload.aspect_ratio
    if payload.thumbnail_url is not None:
        project.thumbnail_url = payload.thumbnail_url
    if payload.project_data is not None:
        project.project_data = payload.project_data

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project

@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
def duplicate_project(project_id: str, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    duplicated = Project(
        name=f"{project.name} (Copy)",
        description=project.description,
        aspect_ratio=project.aspect_ratio,
        thumbnail_url=project.thumbnail_url,
        project_data=project.project_data
    )
    db.add(duplicated)
    db.commit()
    db.refresh(duplicated)
    return duplicated

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully", "id": project_id}
