import { create } from './zustand';
import {
  AspectRatio,
  VideoClip,
  CaptionSegment,
  CaptionStyle,
  TextOverlay,
  StickerOverlay,
  ImageOverlay,
  Transition,
  AudioTrack,
  VideoFilters,
} from '../types/editor';

const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  preset: 'yellow_highlight',
  font_family: 'Inter',
  font_size: 28,
  font_weight: 'bold',
  color: '#FFFFFF',
  highlight_color: '#FFD21F',
  background_color: 'transparent',
  shadow: true,
  border: false,
  border_color: '#000000',
  position_y: 80,
  alignment: 'center',
  animation: 'pop',
  word_by_word: true,
};

export const DEFAULT_FILTERS: VideoFilters = {
  brightness: 0,
  contrast: 1,
  saturation: 1,
  temperature: 0,
  tint: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  blur: 0,
  sharpen: 0,
  vignette: false,
  letterbox: false,
  preset: 'none',
};

interface HistorySnapshot {
  clips: VideoClip[];
  captions: CaptionSegment[];
  textOverlays: TextOverlay[];
  stickerOverlays: StickerOverlay[];
  imageOverlays: ImageOverlay[];
  transition: Transition;
  audioTracks: AudioTrack[];
  filters: VideoFilters;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  aspectRatio: AspectRatio;
}

export const getInitialTheme = (): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem('gbest_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
};

export const applyThemeToDOM = (theme: 'dark' | 'light') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  }
};

// Apply initial theme immediately to DOM
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme());
}

interface EditorState {
  // Project Info
  projectId: string;
  projectName: string;
  isSaving: boolean;
  lastSaved: Date | null;
  setProjectId: (id: string) => void;
  setProjectName: (name: string) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (time: Date) => void;

  // Playback
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;

  // Aspect Ratio & Layout
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;

  // Active Tool Panel
  activeTool: 'media' | 'captions' | 'text' | 'stickers' | 'effects' | 'adjustments' | 'transitions' | 'audio' | 'canvas' | 'export' | null;
  setActiveTool: (tool: 'media' | 'captions' | 'text' | 'stickers' | 'effects' | 'adjustments' | 'transitions' | 'audio' | 'canvas' | 'export' | null) => void;

  // Selection
  selectedClipId: string | null;
  selectedCaptionId: string | null;
  selectedTextId: string | null;
  selectedStickerId: string | null;
  selectedImageId: string | null;
  selectedAudioId: string | null;
  setSelectedClipId: (id: string | null) => void;
  setSelectedCaptionId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  setSelectedStickerId: (id: string | null) => void;
  setSelectedImageId: (id: string | null) => void;
  setSelectedAudioId: (id: string | null) => void;

  // Cover Image
  coverImage: string | null;
  setCoverImage: (url: string | null) => void;

  // View & Layout Toggles
  isTimelineFloating: boolean;
  setIsTimelineFloating: (floating: boolean) => void;
  isTrackSideCollapsed: boolean;
  setIsTrackSideCollapsed: (collapsed: boolean) => void;
  isCompactTracks: boolean;
  setIsCompactTracks: (compact: boolean) => void;
  isRightBarCollapsed: boolean;
  setIsRightBarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  videoVolume: number;
  setVideoVolume: (volume: number) => void;

  // User Auth
  currentUser: { id: string; name: string; email: string; avatar?: string } | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setCurrentUser: (user: { id: string; name: string; email: string; avatar?: string } | null) => void;
  logout: () => void;

  // Theme & Header Customization
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  headerBgColor: string;
  setHeaderBgColor: (color: string) => void;
  headerBgImage: string | null;
  setHeaderBgImage: (image: string | null) => void;
  headerBgOpacity: number;
  setHeaderBgOpacity: (opacity: number) => void;

  // Timeline Zoom & Scrolling
  timelineZoom: number;
  setTimelineZoom: (zoom: number) => void;

  // Video Clips
  clips: VideoClip[];
  addClip: (clip: VideoClip) => void;
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void;
  splitClipAtPlayhead: () => void;
  removeClip: (id: string) => void;

  // Captions
  captions: CaptionSegment[];
  globalCaptionStyle: CaptionStyle;
  setCaptions: (captions: CaptionSegment[]) => void;
  addCaption: (caption: CaptionSegment) => void;
  updateCaption: (id: string, updates: Partial<CaptionSegment>) => void;
  removeCaption: (id: string) => void;
  splitCaption: (id: string, splitTime: number) => void;
  setGlobalCaptionStyle: (style: Partial<CaptionStyle>) => void;

  // Text Overlays
  textOverlays: TextOverlay[];
  addTextOverlay: (text: TextOverlay) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;

  // Stickers
  stickerOverlays: StickerOverlay[];
  addSticker: (sticker: StickerOverlay) => void;
  updateSticker: (id: string, updates: Partial<StickerOverlay>) => void;
  removeSticker: (id: string) => void;

  // Images
  imageOverlays: ImageOverlay[];
  addImageOverlay: (image: ImageOverlay) => void;
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
  removeImageOverlay: (id: string) => void;

  // Transitions
  transition: Transition;
  setTransition: (t: Transition) => void;

  // Audio Tracks
  audioTracks: AudioTrack[];
  addAudioTrack: (track: AudioTrack) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  removeAudioTrack: (id: string) => void;

  // Filters & Transforms
  filters: VideoFilters;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  setFilters: (filters: Partial<VideoFilters>) => void;
  resetFilters: () => void;
  setRotate: (deg: number) => void;
  setFlipH: (flip: boolean) => void;
  setFlipV: (flip: boolean) => void;

  // Undo / Redo
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Bulk Load
  loadProjectData: (data: any) => void;
  getExportableState: () => any;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: '',
  projectName: 'Untitled Project',
  isSaving: false,
  lastSaved: null,
  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (time) => set({ lastSaved: time }),

  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (muted) => set({ isMuted: muted }),

  aspectRatio: '16:9',
  setAspectRatio: (ratio) => {
    get().saveSnapshot();
    set({ aspectRatio: ratio });
  },

  activeTool: 'media',
  setActiveTool: (tool) => set({ activeTool: tool }),

  selectedClipId: null,
  selectedCaptionId: null,
  selectedTextId: null,
  selectedStickerId: null,
  selectedImageId: null,
  selectedAudioId: null,
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setSelectedCaptionId: (id) => set({ selectedCaptionId: id }),
  setSelectedTextId: (id) => set({ selectedTextId: id }),
  setSelectedStickerId: (id) => set({ selectedStickerId: id }),
  setSelectedImageId: (id) => set({ selectedImageId: id }),
  setSelectedAudioId: (id) => set({ selectedAudioId: id }),

  coverImage: null,
  setCoverImage: (url) => set({ coverImage: url }),

  isTimelineFloating: false,
  setIsTimelineFloating: (floating) => set({ isTimelineFloating: floating }),
  isTrackSideCollapsed: false,
  setIsTrackSideCollapsed: (collapsed) => set({ isTrackSideCollapsed: collapsed }),
  isCompactTracks: false,
  setIsCompactTracks: (compact) => set({ isCompactTracks: compact }),
  isRightBarCollapsed: false,
  setIsRightBarCollapsed: (collapsed) => set({ isRightBarCollapsed: collapsed }),
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  videoVolume: 1,
  setVideoVolume: (vol) => set({ videoVolume: vol }),

  currentUser: (() => {
    try {
      const saved = localStorage.getItem('gbest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setCurrentUser: (user) => {
    try {
      if (user) localStorage.setItem('gbest_user', JSON.stringify(user));
      else localStorage.removeItem('gbest_user');
    } catch {}
    set({ currentUser: user });
  },
  logout: () => {
    try {
      localStorage.removeItem('gbest_user');
    } catch {}
    set({ currentUser: null });
  },

  theme: getInitialTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem('gbest_theme', theme);
    } catch {}
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  headerBgColor: (() => {
    try {
      return localStorage.getItem('gbest_header_bgcolor') || '#141414';
    } catch {
      return '#141414';
    }
  })(),
  setHeaderBgColor: (color) => {
    try {
      localStorage.setItem('gbest_header_bgcolor', color);
    } catch {}
    set({ headerBgColor: color });
  },

  headerBgImage: (() => {
    try {
      const saved = localStorage.getItem('gbest_header_bgimage');
      if (saved === 'none') return null;
      return saved || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80';
    }
  })(),
  setHeaderBgImage: (url) => {
    try {
      if (url === null) {
        localStorage.setItem('gbest_header_bgimage', 'none');
      } else {
        localStorage.setItem('gbest_header_bgimage', url);
      }
    } catch {}
    set({ headerBgImage: url });
  },

  headerBgOpacity: (() => {
    try {
      const saved = localStorage.getItem('gbest_header_opacity');
      return saved ? Number(saved) : 0.88;
    } catch {
      return 0.88;
    }
  })(),
  setHeaderBgOpacity: (opacity) => {
    try {
      localStorage.setItem('gbest_header_opacity', String(opacity));
    } catch {}
    set({ headerBgOpacity: opacity });
  },

  timelineZoom: 1,
  setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(0.02, Math.min(5, zoom)) }),

  clips: [],
  addClip: (clip) => {
    get().saveSnapshot();
    set((state) => {
      const newClips = [...state.clips, clip];
      const maxDuration = Math.max(state.duration, clip.duration);
      return { clips: newClips, duration: maxDuration, selectedClipId: clip.id };
    });
  },
  updateClipTrim: (id, trimStart, trimEnd) => {
    get().saveSnapshot();
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, trim_start: trimStart, trim_end: trimEnd } : c)),
    }));
  },
  splitClipAtPlayhead: () => {
    const { clips, currentTime } = get();
    const clip = clips.find((c) => currentTime > (c.trim_start || 0) && currentTime < (c.trim_end || c.duration));
    if (!clip) return;

    get().saveSnapshot();
    const splitPoint = currentTime;
    const clip1: VideoClip = {
      ...clip,
      id: `clip_${Date.now()}_1`,
      trim_end: splitPoint,
    };
    const clip2: VideoClip = {
      ...clip,
      id: `clip_${Date.now()}_2`,
      trim_start: splitPoint,
    };

    set((state) => ({
      clips: state.clips.flatMap((c) => (c.id === clip.id ? [clip1, clip2] : [c])),
      selectedClipId: clip2.id,
    }));
  },
  removeClip: (id) => {
    get().saveSnapshot();
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      selectedClipId: null,
    }));
  },

  captions: [],
  globalCaptionStyle: DEFAULT_CAPTION_STYLE,
  setCaptions: (captions) => {
    get().saveSnapshot();
    set({ captions });
  },
  addCaption: (caption) => {
    get().saveSnapshot();
    set((state) => ({
      captions: [...state.captions, caption].sort((a, b) => a.start - b.start),
      selectedCaptionId: caption.id,
    }));
  },
  updateCaption: (id, updates) => {
    get().saveSnapshot();
    set((state) => ({
      captions: state.captions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },
  removeCaption: (id) => {
    get().saveSnapshot();
    set((state) => ({
      captions: state.captions.filter((c) => c.id !== id),
      selectedCaptionId: null,
    }));
  },
  splitCaption: (id, splitTime) => {
    const { captions } = get();
    const target = captions.find((c) => c.id === id);
    if (!target || splitTime <= target.start + 0.2 || splitTime >= target.end - 0.2) return;

    get().saveSnapshot();
    const words = target.text.split(' ');
    const midWord = Math.floor(words.length / 2);
    const text1 = words.slice(0, midWord).join(' ') || target.text;
    const text2 = words.slice(midWord).join(' ') || target.text;

    const cap1: CaptionSegment = {
      ...target,
      id: `cap_${Date.now()}_1`,
      end: splitTime,
      text: text1,
    };
    const cap2: CaptionSegment = {
      ...target,
      id: `cap_${Date.now()}_2`,
      start: splitTime,
      text: text2,
    };

    set((state) => ({
      captions: state.captions.flatMap((c) => (c.id === id ? [cap1, cap2] : [c])).sort((a, b) => a.start - b.start),
      selectedCaptionId: cap2.id,
    }));
  },
  setGlobalCaptionStyle: (styleUpdates) => {
    get().saveSnapshot();
    set((state) => ({
      globalCaptionStyle: { ...state.globalCaptionStyle, ...styleUpdates },
    }));
  },

  textOverlays: [],
  addTextOverlay: (text) => {
    get().saveSnapshot();
    set((state) => ({
      textOverlays: [...state.textOverlays, text],
      selectedTextId: text.id,
    }));
  },
  updateTextOverlay: (id, updates) => {
    get().saveSnapshot();
    set((state) => ({
      textOverlays: state.textOverlays.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },
  removeTextOverlay: (id) => {
    get().saveSnapshot();
    set((state) => ({
      textOverlays: state.textOverlays.filter((t) => t.id !== id),
      selectedTextId: null,
    }));
  },

  // Stickers
  stickerOverlays: [],
  addSticker: (sticker) => {
    get().saveSnapshot();
    set((state) => ({
      stickerOverlays: [...state.stickerOverlays, sticker],
      selectedStickerId: sticker.id,
    }));
  },
  updateSticker: (id, updates) => {
    get().saveSnapshot();
    set((state) => ({
      stickerOverlays: state.stickerOverlays.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },
  removeSticker: (id) => {
    get().saveSnapshot();
    set((state) => ({
      stickerOverlays: state.stickerOverlays.filter((s) => s.id !== id),
      selectedStickerId: null,
    }));
  },

  // Images
  imageOverlays: [],
  addImageOverlay: (image) => {
    get().saveSnapshot();
    set((state) => ({
      imageOverlays: [...state.imageOverlays, image],
      selectedImageId: image.id,
    }));
  },
  updateImageOverlay: (id, updates) => {
    get().saveSnapshot();
    set((state) => ({
      imageOverlays: state.imageOverlays.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    }));
  },
  removeImageOverlay: (id) => {
    get().saveSnapshot();
    set((state) => ({
      imageOverlays: state.imageOverlays.filter((img) => img.id !== id),
      selectedImageId: null,
    }));
  },

  // Transitions
  transition: { type: 'none', duration: 0.5 },
  setTransition: (t) => {
    get().saveSnapshot();
    set({ transition: t });
  },

  audioTracks: [],
  addAudioTrack: (track) => {
    get().saveSnapshot();
    set((state) => ({ audioTracks: [...state.audioTracks, track] }));
  },
  updateAudioTrack: (id, updates) => {
    get().saveSnapshot();
    set((state) => ({
      audioTracks: state.audioTracks.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },
  removeAudioTrack: (id) => {
    get().saveSnapshot();
    set((state) => ({
      audioTracks: state.audioTracks.filter((a) => a.id !== id),
    }));
  },

  filters: DEFAULT_FILTERS,
  rotate: 0,
  flipH: false,
  flipV: false,
  setFilters: (filterUpdates) => {
    get().saveSnapshot();
    set((state) => ({ filters: { ...state.filters, ...filterUpdates } }));
  },
  resetFilters: () => {
    get().saveSnapshot();
    set({ filters: { ...DEFAULT_FILTERS } });
  },
  setRotate: (deg) => {
    get().saveSnapshot();
    set({ rotate: (deg % 360 + 360) % 360 });
  },
  setFlipH: (flip) => {
    get().saveSnapshot();
    set({ flipH: flip });
  },
  setFlipV: (flip) => {
    get().saveSnapshot();
    set({ flipV: flip });
  },

  undoStack: [],
  redoStack: [],
  saveSnapshot: () => {
    const s = get();
    const snapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(s.clips)),
      captions: JSON.parse(JSON.stringify(s.captions)),
      textOverlays: JSON.parse(JSON.stringify(s.textOverlays)),
      stickerOverlays: JSON.parse(JSON.stringify(s.stickerOverlays)),
      imageOverlays: JSON.parse(JSON.stringify(s.imageOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      aspectRatio: s.aspectRatio,
    };
    set((state) => ({
      undoStack: [...state.undoStack.slice(-25), snapshot],
      redoStack: [],
    }));
  },
  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    const s = get();
    const currentSnapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(s.clips)),
      captions: JSON.parse(JSON.stringify(s.captions)),
      textOverlays: JSON.parse(JSON.stringify(s.textOverlays)),
      stickerOverlays: JSON.parse(JSON.stringify(s.stickerOverlays)),
      imageOverlays: JSON.parse(JSON.stringify(s.imageOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      aspectRatio: s.aspectRatio,
    };

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      clips: last.clips,
      captions: last.captions,
      textOverlays: last.textOverlays,
      stickerOverlays: last.stickerOverlays || [],
      imageOverlays: last.imageOverlays || [],
      transition: last.transition || { type: 'none', duration: 0.5 },
      audioTracks: last.audioTracks,
      filters: last.filters,
      rotate: last.rotate,
      flipH: last.flipH,
      flipV: last.flipV,
      aspectRatio: last.aspectRatio,
    });
  },
  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const s = get();
    const currentSnapshot: HistorySnapshot = {
      clips: JSON.parse(JSON.stringify(s.clips)),
      captions: JSON.parse(JSON.stringify(s.captions)),
      textOverlays: JSON.parse(JSON.stringify(s.textOverlays)),
      stickerOverlays: JSON.parse(JSON.stringify(s.stickerOverlays)),
      imageOverlays: JSON.parse(JSON.stringify(s.imageOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      aspectRatio: s.aspectRatio,
    };

    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, currentSnapshot],
      clips: next.clips,
      captions: next.captions,
      textOverlays: next.textOverlays,
      stickerOverlays: next.stickerOverlays || [],
      imageOverlays: next.imageOverlays || [],
      transition: next.transition || { type: 'none', duration: 0.5 },
      audioTracks: next.audioTracks,
      filters: next.filters,
      rotate: next.rotate,
      flipH: next.flipH,
      flipV: next.flipV,
      aspectRatio: next.aspectRatio,
    });
  },

  loadProjectData: (data) => {
    if (!data) return;
    set({
      clips: data.clips || [],
      captions: data.captions || [],
      globalCaptionStyle: data.globalCaptionStyle || DEFAULT_CAPTION_STYLE,
      textOverlays: data.textOverlays || data.text_overlays || [],
      stickerOverlays: data.stickerOverlays || data.sticker_overlays || [],
      imageOverlays: data.imageOverlays || data.image_overlays || [],
      transition: data.transition || { type: 'none', duration: 0.5 },
      audioTracks: data.audioTracks || data.audio_tracks || [],
      filters: { ...DEFAULT_FILTERS, ...(data.filters || {}) },
      rotate: data.rotate || 0,
      flipH: data.flipH || false,
      flipV: data.flipV || false,
      aspectRatio: data.aspectRatio || '16:9',
      duration: data.duration || 0,
      coverImage: data.coverImage || data.cover_image || null,
      videoVolume: data.videoVolume ?? 1,
      ...(data.headerBgColor ? { headerBgColor: data.headerBgColor } : {}),
      ...(data.headerBgImage !== undefined ? { headerBgImage: data.headerBgImage } : {}),
      ...(data.headerBgOpacity !== undefined ? { headerBgOpacity: data.headerBgOpacity } : {}),
    });
  },

  getExportableState: () => {
    const s = get();
    return {
      clips: s.clips,
      captions: s.captions.map((c) => ({
        ...c,
        style: { ...s.globalCaptionStyle, ...(c.style || {}) },
      })),
      text_overlays: s.textOverlays,
      sticker_overlays: s.stickerOverlays,
      image_overlays: s.imageOverlays,
      transition: s.transition,
      audio_tracks: s.audioTracks,
      filters: s.filters,
      rotate: s.rotate,
      flip_h: s.flipH,
      flip_v: s.flipV,
      video_volume: s.isMuted ? 0 : (s.videoVolume ?? s.volume),
      cover_image: s.coverImage,
      headerBgColor: s.headerBgColor,
      headerBgImage: s.headerBgImage,
      headerBgOpacity: s.headerBgOpacity,
    };
  },
}));
