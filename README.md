# GBEST STUDIO

**GBEST Studio** is a lightweight, professional, AI-powered web video editing application built for modern creators who want to edit, caption, style, and export high-impact videos at lightning speed.

---

## 🎨 Visual Identity & Brand Colors

The design adheres strictly to the creative-tech dark color system:

* **Primary Dark Background**: `#111111`
* **Secondary Dark Panels**: `#1B1B1B`
* **Card & Inspector Panels**: `#242424`
* **Signature Brand Yellow**: `#FFD21F` (Used for primary CTA buttons, active timeline playhead, caption keyword highlights, and progress bars)
* **Accent Orange**: `#FF8A00` (Used for warnings, secondary audio tracks, and highlights)
* **Light Typography**: `#FFFFFF` / `#A0A0A0`

---

## 🚀 Key Features

* **Multi-Format Video Presets**: Instant switching between 9:16 (TikTok, Reels, Shorts), 16:9 (YouTube Standard), 1:1 (Instagram Post), 4:5 (Instagram Portrait), and custom aspect ratios.
* **Automatic AI Captions**: Extensible speech-to-text pipeline (Whisper local models, OpenAI Whisper API, and intelligent acoustic speech segmenter fallback) generating timestamped words.
* **Caption Styling & Animations**: Presets like *Yellow Highlight*, *Creator Dark*, *Bold Impact*, *Social Pop*, and *Cinematic*. Word-by-word dynamic highlights, font size, custom colors, animations (*Pop*, *Bounce*, *Slide Up*, *Word Pop*).
* **Multi-Track Editing Timeline**: Multi-track layout for Video, Captions, and Audio with trimming handles, playhead scrubbing, split-at-playhead (Scissors), zoom slider, and undo/redo history.
* **Video Transformations & Filters**: Real-time Brightness, Contrast, Saturation, Blur, Vignette, Grayscale, Sepia, Warm, Cool, Vintage, Cinematic grades, 90° rotation, and horizontal/vertical flips.
* **Audio Mixing**: Adjust original video audio, upload background music/sound effects (MP3, WAV, AAC, M4A), with volume control and mute toggling.
* **Custom Text Overlays**: Add lower thirds, bold headlines, callouts, and social media CTAs.
* **Export Engine**: Server-side FFmpeg rendering pipeline delivering 720p HD and 1080p Full HD MP4 videos with burned-in styled subtitles, color filters, and mixed audio. Live background job progress polling (0% → 100%) and instant direct download.
* **Dedicated Mobile Layout**: Full mobile responsiveness across iPhone SE, XR, 12, 13, 14, 15, 16, Android, and tablets with bottom navigation toolbar and animated bottom sheets (min 44px touch targets, safe area insets).
* **PWA Support**: Installable Progressive Web App with manifest and service worker.

---

## 🛠️ Technology Stack

### Frontend
* **React 18** with **TypeScript** & **Vite**
* **Tailwind CSS** with custom GBEST palette
* **Lucide React** icon library
* **Zustand** state management with history snapshot undo/redo
* **HTML5 Video API** with responsive canvas letterboxing

### Backend
* **Python 3.11+ / 3.12**
* **FastAPI** & **Uvicorn**
* **SQLAlchemy 2.0** ORM with **SQLite** (Async engine via `aiosqlite`)
* **Pydantic v2** data validation schemas
* **Multipart** streaming upload handling

### Media Processing & AI
* **FFmpeg & FFprobe**: Video conversion, stream probing, thumbnail generation, trimming, scaling, color filter graphs, audio mixing, ASS subtitle burning, and H.264 MP4 encoding.
* **Speech-to-Text Pipeline**: Pluggable Whisper STT adapter with word-level timestamps.

---

## 📂 Project Architecture

```
studio/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Header, Tooltip, Modals
│   │   │   └── editor/       # VideoPreview, Timeline, MediaPanel, CaptionPanel,
│   │   │                     # CaptionStylePanel, TextPanel, AudioPanel, EffectsPanel,
│   │   │                     # CanvasSettings, PropertiesInspector, ExportModal, MobileToolbar
│   │   ├── pages/            # LandingPage, DashboardPage, EditorPage
│   │   ├── services/         # API client & export job poller
│   │   ├── store/            # useEditorStore (Zustand)
│   │   └── types/            # TypeScript interfaces
│   ├── public/               # manifest.json, sw.js, favicon.svg
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/              # /api/videos, /api/captions, /api/export, /api/projects, /api/audio
│   │   ├── models/           # SQLAlchemy models: Project, Video, Caption, Asset, ExportJob
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # ffmpeg_service.py, caption_service.py, export_service.py, storage_service.py
│   │   ├── config.py         # App configuration & path management
│   │   ├── database.py       # Async SQLite database setup
│   │   └── main.py           # FastAPI entrypoint, CORS, static routes
│   ├── storage/              # uploads/, thumbnails/, audio/, exports/, temp/
│   ├── requirements.txt
│   └── .env.example
│
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** v18+ or v20+
* **Python** 3.11+ or 3.12+ (managed easily via `uv` or standard Python)
* **FFmpeg & FFprobe**

#### FFmpeg Setup (Windows)
1. Install via Windows Package Manager:
   ```powershell
   winget install -e --id Gyan.FFmpeg
   ```
2. Or download from [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) and add the `bin` folder to your system `PATH`.
3. Verify installation:
   ```powershell
   ffmpeg -version
   ffprobe -version
   ```

---

### Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Using uv (recommended - ultra-fast)
   uv venv venv --python 3.12
   venv\Scripts\activate

   # Or using standard python
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   copy .env.example .env
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   * Swagger Documentation is available at: `http://localhost:8000/docs`
   * Health Check: `http://localhost:8000/api/health`

---

### Frontend Setup

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm.cmd install
   # or
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm.cmd run dev
   # or
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 🐳 Docker Setup

Run the entire application in a single containerized environment:

```bash
docker compose up --build
```

Access GBEST Studio at `http://localhost:8000`.

---

## 🧪 Testing

Run backend automated tests:

```bash
cd backend
venv\Scripts\pytest
```

Run frontend build verification:

```bash
cd frontend
npm.cmd run build
```

---

## 🚢 Production Deployment Architecture

* **Frontend**: Deploy static assets from `frontend/dist` to **Vercel**, **Netlify**, or **Cloudflare Pages**. Set API proxy to point to the backend URL.
* **Backend**: Deploy container to **Render**, **Railway**, **Fly.io**, or an **Ubuntu VPS** with FFmpeg installed.
* **Database**: Easily migrate from SQLite to **PostgreSQL** by updating `DATABASE_URL` in `.env` (e.g., `postgresql+asyncpg://user:password@host/dbname`).
* **Object Storage**: The modular `storage_service.py` is architected to switch from local disk storage to **AWS S3** or **Cloudflare R2** via boto3.
