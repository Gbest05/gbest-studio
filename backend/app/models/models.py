import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    avatar_url = Column(String(500), nullable=True)
    provider = Column(String(50), default="email")
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False, default="Untitled Project")
    description = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    aspect_ratio = Column(String(20), default="16:9")
    project_data = Column(Text, nullable=True)  # Complete JSON editor state (clips, tracks, text, audio, filters)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    videos = relationship("Video", back_populates="project", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="project", cascade="all, delete-orphan")
    export_jobs = relationship("ExportJob", back_populates="project", cascade="all, delete-orphan")

class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    thumbnail_path = Column(String(500), nullable=True)
    duration = Column(Float, default=0.0)
    width = Column(Integer, default=1920)
    height = Column(Integer, default=1080)
    fps = Column(Float, default=30.0)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(100), default="video/mp4")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="videos")
    captions = relationship("Caption", back_populates="video", cascade="all, delete-orphan")

class Caption(Base):
    __tablename__ = "captions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    video_id = Column(String(36), ForeignKey("videos.id"), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    words_data = Column(Text, nullable=True)  # JSON with word-level timestamps [{word, start, end}]
    style = Column(Text, nullable=True)       # JSON styling attributes
    created_at = Column(DateTime, default=datetime.utcnow)

    video = relationship("Video", back_populates="captions")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    type = Column(String(50), nullable=False)  # audio, image, overlay, font
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    duration = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="assets")

class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    progress = Column(Integer, default=0)           # 0 to 100
    message = Column(String(255), default="Initializing...")
    resolution = Column(String(50), default="1080p") # 720p, 1080p
    aspect_ratio = Column(String(20), default="16:9")
    format = Column(String(20), default="mp4")
    quality = Column(String(20), default="high")     # standard, high, max
    fps = Column(Integer, default=30)
    output_path = Column(String(500), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="export_jobs")

class SiteSetting(Base):
    __tablename__ = "site_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
