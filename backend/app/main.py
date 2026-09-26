from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_db
from app.api import projects, videos, captions, audio, export, auth, site_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    init_db()
    yield

app = FastAPI(
    title="GBEST STUDIO API",
    description="Backend API for GBEST Studio - Modern AI-powered Web Video Editor",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media mounts for streaming and previews
app.mount("/api/media/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/api/media/thumbnails", StaticFiles(directory=settings.THUMBNAIL_DIR), name="thumbnails")
app.mount("/api/media/audio", StaticFiles(directory=settings.AUDIO_DIR), name="audio")
app.mount("/api/media/exports", StaticFiles(directory=settings.EXPORT_DIR), name="exports")

# API Routers
app.include_router(projects.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(captions.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(site_config.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "version": "1.0.0"
    }

# Production SPA serving: serve built React frontend from /dist
from pathlib import Path
from fastapi.responses import FileResponse

dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not dist_dir.exists() or not (dist_dir / "index.html").exists():
    static_fallback = Path(__file__).resolve().parent.parent / "static"
    if static_fallback.exists() and (static_fallback / "index.html").exists():
        dist_dir = static_fallback

if dist_dir.exists() and (dist_dir / "index.html").exists():
    if (dist_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "api":
            return {"error": "API route not found"}
        target = dist_dir / full_path
        if target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(dist_dir / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
