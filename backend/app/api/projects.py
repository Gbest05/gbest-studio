import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.database import get_db
from app.models.models import Project, User
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummary
from app.api.auth import get_optional_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

def check_project_access(project: Project, user: Optional[User]):
    """Enforce that users can only access their own projects."""
    if project.user_id is not None:
        if not user or user.id != project.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You do not have permission to access this project."
            )

@router.get("", response_model=list[ProjectSummary])
def list_projects(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    """
    List projects for the authenticated user.
    If user is authenticated, automatically claims any unassigned guest projects and returns user projects.
    """
    if user:
        unassigned = db.scalars(
            select(Project).where(Project.user_id == None)
        ).all()
        if unassigned:
            for p in unassigned:
                p.user_id = user.id
            db.commit()

        result = db.scalars(
            select(Project)
            .where(Project.user_id == user.id)
            .order_by(desc(Project.updated_at))
        ).all()
    else:
        # Guests only see unassigned/guest projects
        result = db.scalars(
            select(Project)
            .where(Project.user_id == None)
            .order_by(desc(Project.updated_at))
        ).all()
    return result

@router.post("", response_model=ProjectResponse)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    """Create project belonging to the currently authenticated user."""
    project = Project(
        user_id=user.id if user else None,
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
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # If project was previously unassigned and user is authenticated, claim ownership
    if project.user_id is None and user is not None:
        project.user_id = user.id
        db.commit()
        db.refresh(project)

    check_project_access(project, user)
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # If project was previously unassigned and user is now logged in, claim ownership
    if project.user_id is None and user is not None:
        project.user_id = user.id
        db.commit()
        db.refresh(project)

    check_project_access(project, user)

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
def duplicate_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    check_project_access(project, user)

    duplicated = Project(
        user_id=user.id if user else project.user_id,
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
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    check_project_access(project, user)

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully", "id": project_id}
