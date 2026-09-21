# GBEST STUDIO - Multi-Stage Container Dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + FFmpeg Runtime
FROM python:3.12-slim AS runtime

# Install system dependencies including FFmpeg and FFprobe
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source
COPY backend/ ./backend/

# Copy built frontend assets to static directory for production serving
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose backend port
EXPOSE 8000

ENV APP_ENV=production
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
