import { create } from './zustand';
import {
  AspectRatio,
  CanvasBackground,
  VideoClip,
  CaptionSegment,
  CaptionStyle,
  TextOverlay,
  StickerOverlay,
  ImageOverlay,
  VideoOverlay,
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
  position_x: 50,
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
  videoOverlays?: VideoOverlay[];
  transition: Transition;
  audioTracks: AudioTrack[];
  filters: VideoFilters;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  videoPosition?: { x: number; y: number };
  videoScale?: number;
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
  canvasBackground: CanvasBackground;
  setCanvasBackground: (bg: CanvasBackground) => void;
  previewZoom: number;
  setPreviewZoom: (zoom: number) => void;

  // Active Tool Panel
  activeTool: 'media' | 'captions' | 'text' | 'stickers' | 'effects' | 'adjustments' | 'transitions' | 'audio' | 'canvas' | 'export' | null;
  setActiveTool: (tool: 'media' | 'captions' | 'text' | 'stickers' | 'effects' | 'adjustments' | 'transitions' | 'audio' | 'canvas' | 'export' | null) => void;

  // Selection & Multi-Select
  selectedClipId: string | null;
  selectedCaptionId: string | null;
  selectedTextId: string | null;
  selectedStickerId: string | null;
  selectedImageId: string | null;
  selectedVideoOverlayId: string | null;
  selectedAudioId: string | null;
  selectedItemIds: string[];
  setSelectedClipId: (id: string | null) => void;
  setSelectedCaptionId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  setSelectedStickerId: (id: string | null) => void;
  setSelectedImageId: (id: string | null) => void;
  setSelectedVideoOverlayId: (id: string | null) => void;
  setSelectedAudioId: (id: string | null) => void;
  setSelectedItemIds: (ids: string[]) => void;
  toggleItemSelection: (id: string, isMulti?: boolean) => void;
  selectAllItems: () => void;
  clearAllSelections: () => void;
  deleteSelectedItems: () => void;
  batchUpdateClips: (clipIds: string[], updates: Partial<VideoClip>) => void;
  batchMoveItems: (itemIds: string[], deltaSec: number) => void;

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

  // User Auth & Profile
  currentUser: { id: string; name: string; email: string; avatar?: string; is_admin?: boolean } | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  isProfileModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setCurrentUser: (user: { id: string; name: string; email: string; avatar?: string; is_admin?: boolean } | null) => void;
  updateCurrentUser: (updates: Partial<{ name: string; avatar?: string; email: string; is_admin?: boolean }>) => void;
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
  updateClip: (id: string, updates: Partial<VideoClip>) => void;
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void;
  updateClipTransition: (id: string, transition: Transition) => void;
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

  // Video Overlays (Picture-in-Picture)
  videoOverlays: VideoOverlay[];
  addVideoOverlay: (overlay: VideoOverlay) => void;
  updateVideoOverlay: (id: string, updates: Partial<VideoOverlay>) => void;
  removeVideoOverlay: (id: string) => void;
  moveClipToOverlay: (clipId: string) => void;
  moveOverlayToMainTrack: (overlayId: string) => void;

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
  videoPosition: { x: number; y: number };
  videoScale: number;
  setFilters: (filters: Partial<VideoFilters>) => void;
  resetFilters: () => void;
  setRotate: (deg: number) => void;
  setFlipH: (flip: boolean) => void;
  setFlipV: (flip: boolean) => void;
  setVideoPosition: (pos: { x: number; y: number }) => void;
  setVideoScale: (scale: number) => void;
  resetVideoTransform: () => void;

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

/**
 * Ripple collision resolution for timeline items in a single track lane.
 * If an item moves over another item in the same lane:
 * - Active item claims its target space [targetStart, targetEnd].
 * - Collided/overlapped items are smoothly displaced forward or backward so they never sleep over each other.
 */
export function resolveNonOverlappingIntervals<
  T extends { id: string; start: number; duration: number }
>(
  items: T[],
  activeId: string,
  targetStart: number,
  origStart: number
): T[] {
  if (items.length <= 1) {
    return items.map((item) =>
      item.id === activeId ? { ...item, start: Math.max(0, Math.round(targetStart * 100) / 100) } : item
    );
  }

  const activeItem = items.find((i) => i.id === activeId);
  if (!activeItem) return items;

  const activeDur = activeItem.duration;
  const clampedTargetStart = Math.max(0, Math.round(targetStart * 100) / 100);
  const activeEnd = Math.round((clampedTargetStart + activeDur) * 100) / 100;
  const isMovingRight = clampedTargetStart >= origStart;

  const others = items.filter((i) => i.id !== activeId);
  const sortedOthers = [...others].sort((a, b) => a.start - b.start);

  const beforeItems: T[] = [];
  const afterItems: T[] = [];

  for (const other of sortedOthers) {
    const otherEnd = other.start + other.duration;
    const overlaps = !(otherEnd <= clampedTargetStart + 0.01 || other.start >= activeEnd - 0.01);

    if (!overlaps) {
      if (other.start < clampedTargetStart) {
        beforeItems.push(other);
      } else {
        afterItems.push(other);
      }
    } else {
      // Collision detected! Determine displacement forward or backward
      const otherMidpoint = other.start + other.duration / 2;
      const activeMidpoint = clampedTargetStart + activeDur / 2;
      const canFitBackward = clampedTargetStart - other.duration >= 0;

      if (!isMovingRight && otherMidpoint < activeMidpoint && canFitBackward) {
        beforeItems.push(other);
      } else if (isMovingRight && otherMidpoint < clampedTargetStart && canFitBackward) {
        beforeItems.push(other);
      } else {
        afterItems.push(other);
      }
    }
  }

  // Pack beforeItems backwards or maintain order starting from 0
  beforeItems.sort((a, b) => a.start - b.start);
  const resolvedBefore: T[] = [];
  let currentEarliest = 0;
  for (let i = 0; i < beforeItems.length; i++) {
    const item = beforeItems[i];
    let start = Math.max(currentEarliest, item.start);
    if (start + item.duration > clampedTargetStart) {
      start = Math.max(currentEarliest, clampedTargetStart - item.duration);
    }
    if (start + item.duration > clampedTargetStart + 0.01) {
      afterItems.unshift(item);
    } else {
      resolvedBefore.push({ ...item, start: Math.round(start * 100) / 100 });
      currentEarliest = Math.round((start + item.duration) * 100) / 100;
    }
  }

  // Pack afterItems forward starting at activeEnd
  afterItems.sort((a, b) => a.start - b.start);
  const resolvedAfter: T[] = [];
  let currentStart = activeEnd;
  for (const item of afterItems) {
    const start = Math.max(currentStart, item.start);
    resolvedAfter.push({ ...item, start: Math.round(start * 100) / 100 });
    currentStart = Math.round((start + item.duration) * 100) / 100;
  }

  const updatedActive = {
    ...activeItem,
    start: clampedTargetStart,
  };

  return [...resolvedBefore, updatedActive, ...resolvedAfter];
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
  canvasBackground: 'black',
  setCanvasBackground: (bg) => {
    get().saveSnapshot();
    set({ canvasBackground: bg });
  },
  previewZoom: 1.0,
  setPreviewZoom: (zoom) => set({ previewZoom: Math.max(0.4, Math.min(2.5, Math.round(zoom * 100) / 100)) }),

  activeTool: 'media',
  setActiveTool: (tool) => set({ activeTool: tool }),

  selectedClipId: null,
  selectedCaptionId: null,
  selectedTextId: null,
  selectedStickerId: null,
  selectedImageId: null,
  selectedVideoOverlayId: null,
  selectedAudioId: null,
  selectedItemIds: [],
  setSelectedClipId: (id) =>
    set({
      selectedClipId: id,
      selectedItemIds: id ? [id] : [],
      selectedCaptionId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    }),
  setSelectedCaptionId: (id) =>
    set({
      selectedCaptionId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    }),
  setSelectedTextId: (id) =>
    set({
      selectedTextId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    }),
  setSelectedStickerId: (id) =>
    set({
      selectedStickerId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedTextId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    }),
  setSelectedImageId: (id) =>
    set({
      selectedImageId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    }),
  setSelectedVideoOverlayId: (id) =>
    set({
      selectedVideoOverlayId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedAudioId: null,
    }),
  setSelectedAudioId: (id) =>
    set({
      selectedAudioId: id,
      selectedItemIds: id ? [id] : [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
    }),
  setSelectedItemIds: (ids) => {
    const clips = get().clips;
    const vOverlays = get().videoOverlays;
    const captions = get().captions;
    const audio = get().audioTracks;
    const images = get().imageOverlays;
    const stickers = get().stickerOverlays;
    const texts = get().textOverlays;

    set({
      selectedItemIds: ids,
      selectedClipId: ids.find((id) => clips.some((c) => c.id === id)) || null,
      selectedVideoOverlayId: ids.find((id) => vOverlays.some((v) => v.id === id)) || null,
      selectedCaptionId: ids.find((id) => captions.some((c) => c.id === id)) || null,
      selectedAudioId: ids.find((id) => audio.some((a) => a.id === id)) || null,
      selectedImageId: ids.find((id) => images.some((i) => i.id === id)) || null,
      selectedStickerId: ids.find((id) => stickers.some((s) => s.id === id)) || null,
      selectedTextId: ids.find((id) => texts.some((t) => t.id === id)) || null,
    });
  },
  toggleItemSelection: (id, isMulti = false) => {
    const current = get().selectedItemIds;
    if (isMulti) {
      const exists = current.includes(id);
      const next = exists ? current.filter((i) => i !== id) : [...current, id];
      get().setSelectedItemIds(next);
    } else {
      get().setSelectedItemIds([id]);
    }
  },
  selectAllItems: () => {
    const all = [
      ...get().clips.map((c) => c.id),
      ...get().videoOverlays.map((v) => v.id),
      ...get().captions.map((c) => c.id),
      ...get().audioTracks.map((a) => a.id),
      ...get().imageOverlays.map((i) => i.id),
      ...get().stickerOverlays.map((s) => s.id),
      ...get().textOverlays.map((t) => t.id),
    ];
    get().setSelectedItemIds(all);
  },
  clearAllSelections: () => {
    set({
      selectedItemIds: [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedTextId: null,
      selectedStickerId: null,
      selectedImageId: null,
      selectedVideoOverlayId: null,
      selectedAudioId: null,
    });
  },
  deleteSelectedItems: () => {
    const ids = get().selectedItemIds;
    if (!ids || ids.length === 0) {
      if (get().selectedClipId) get().removeClip(get().selectedClipId!);
      if (get().selectedCaptionId) get().removeCaption(get().selectedCaptionId!);
      if (get().selectedAudioId) get().removeAudioTrack(get().selectedAudioId!);
      if (get().selectedVideoOverlayId) get().removeVideoOverlay(get().selectedVideoOverlayId!);
      if (get().selectedImageId) get().removeImageOverlay(get().selectedImageId!);
      if (get().selectedStickerId) get().removeSticker(get().selectedStickerId!);
      if (get().selectedTextId) get().removeTextOverlay(get().selectedTextId!);
      return;
    }
    get().saveSnapshot();
    const idSet = new Set(ids);
    set((state) => ({
      clips: state.clips.filter((c) => !idSet.has(c.id)),
      videoOverlays: state.videoOverlays.filter((v) => !idSet.has(v.id)),
      captions: state.captions.filter((c) => !idSet.has(c.id)),
      audioTracks: state.audioTracks.filter((a) => !idSet.has(a.id)),
      imageOverlays: state.imageOverlays.filter((i) => !idSet.has(i.id)),
      stickerOverlays: state.stickerOverlays.filter((s) => !idSet.has(s.id)),
      textOverlays: state.textOverlays.filter((t) => !idSet.has(t.id)),
      selectedItemIds: [],
      selectedClipId: null,
      selectedCaptionId: null,
      selectedAudioId: null,
      selectedVideoOverlayId: null,
      selectedImageId: null,
      selectedStickerId: null,
      selectedTextId: null,
    }));
  },
  batchUpdateClips: (clipIds, updates) => {
    get().saveSnapshot();
    const idSet = new Set(clipIds);
    set((state) => ({
      clips: state.clips.map((c) => (idSet.has(c.id) ? { ...c, ...updates } : c)),
    }));
  },
  batchMoveItems: (itemIds, deltaSec) => {
    get().saveSnapshot();
    const idSet = new Set(itemIds);
    set((state) => ({
      clips: state.clips.map((c) =>
        idSet.has(c.id)
          ? { ...c, start_time: Math.max(0, Math.round(((c.start_time || 0) + deltaSec) * 100) / 100) }
          : c
      ),
      videoOverlays: state.videoOverlays.map((v) =>
        idSet.has(v.id)
          ? {
              ...v,
              start_time: Math.max(0, Math.round((v.start_time + deltaSec) * 100) / 100),
              end_time: Math.max(0.5, Math.round((v.end_time + deltaSec) * 100) / 100),
            }
          : v
      ),
      captions: state.captions.map((c) =>
        idSet.has(c.id)
          ? {
              ...c,
              start: Math.max(0, Math.round((c.start + deltaSec) * 100) / 100),
              end: Math.max(0.2, Math.round((c.end + deltaSec) * 100) / 100),
            }
          : c
      ),
      audioTracks: state.audioTracks.map((a) =>
        idSet.has(a.id)
          ? { ...a, start_offset: Math.max(0, Math.round(((a.start_offset || 0) + deltaSec) * 100) / 100) }
          : a
      ),
      textOverlays: state.textOverlays.map((t) =>
        idSet.has(t.id)
          ? {
              ...t,
              start_time: Math.max(0, Math.round((t.start_time + deltaSec) * 100) / 100),
              end_time: Math.max(0.5, Math.round((t.end_time + deltaSec) * 100) / 100),
            }
          : t
      ),
      imageOverlays: state.imageOverlays.map((i) =>
        idSet.has(i.id)
          ? {
              ...i,
              start_time: Math.max(0, Math.round((i.start_time + deltaSec) * 100) / 100),
              end_time: Math.max(0.5, Math.round((i.end_time + deltaSec) * 100) / 100),
            }
          : i
      ),
      stickerOverlays: state.stickerOverlays.map((s) =>
        idSet.has(s.id)
          ? {
              ...s,
              start_time: Math.max(0, Math.round((s.start_time + deltaSec) * 100) / 100),
              end_time: Math.max(0.5, Math.round((s.end_time + deltaSec) * 100) / 100),
            }
          : s
      ),
    }));
  },

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
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.email?.toLowerCase() === 'princegbest555@gmail.com' || parsed.is_admin)) {
        parsed.is_admin = true;
      }
      return parsed;
    } catch {
      return null;
    }
  })(),
  isAuthModalOpen: false,
  authModalMode: 'login',
  isProfileModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setAuthModalMode: (mode) => set({ authModalMode: mode }),
  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setCurrentUser: (user) => {
    try {
      if (user) {
        if (user.email?.toLowerCase() === 'princegbest555@gmail.com' || user.is_admin) {
          user.is_admin = true;
        }
        localStorage.setItem('gbest_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('gbest_user');
      }
    } catch {}
    set({ currentUser: user });
  },
  updateCurrentUser: (updates) => {
    const current = get().currentUser;
    if (!current) return;
    const updated = { ...current, ...updates };
    if (updated.email?.toLowerCase() === 'princegbest555@gmail.com' || updated.is_admin) {
      updated.is_admin = true;
    }
    try {
      localStorage.setItem('gbest_user', JSON.stringify(updated));
    } catch {}
    set({ currentUser: updated });
  },
  logout: () => {
    try {
      localStorage.removeItem('gbest_user');
      localStorage.removeItem('gbest_token');
    } catch {}
    set({ currentUser: null });
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
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
      let start_time = clip.start_time !== undefined ? clip.start_time : 0;
      if (clip.start_time === undefined && state.clips.length > 0) {
        const lastClip = state.clips[state.clips.length - 1];
        const lastClipDur = (lastClip.trim_end || lastClip.duration) - (lastClip.trim_start || 0);
        start_time = Math.round(((lastClip.start_time || 0) + lastClipDur) * 100) / 100;
      }
      const newClip: VideoClip = {
        ...clip,
        start_time: Math.round(start_time * 100) / 100,
        trim_start: clip.trim_start || 0,
        trim_end: clip.trim_end || clip.duration,
      };

      const newClipDur = Math.max(0.2, (newClip.trim_end || newClip.duration) - (newClip.trim_start || 0));
      const newClipEnd = newClip.start_time! + newClipDur;

      // Ripple displace any clips that overlap with newClip on Track 2
      const adjustedExisting = state.clips.map((c) => {
        const cStart = c.start_time || 0;
        const cDur = Math.max(0.2, (c.trim_end || c.duration) - (c.trim_start || 0));
        const cEnd = cStart + cDur;
        const overlaps = !(cEnd <= newClip.start_time! || cStart >= newClipEnd);
        if (overlaps) {
          return { ...c, start_time: Math.round(newClipEnd * 100) / 100 };
        }
        return c;
      });

      const newClips = [...adjustedExisting, newClip].sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
      const clipTotal = newClips.reduce(
        (acc, c) => Math.max(acc, (c.start_time || 0) + ((c.trim_end || c.duration) - (c.trim_start || 0))),
        0
      );
      const newDuration = Math.max(state.duration, clipTotal, 10);
      return { clips: newClips, duration: newDuration, selectedClipId: newClip.id };
    });
  },
  updateClip: (id, updates) => {
    get().saveSnapshot();
    set((state) => {
      let workingClips = state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c));

      // If start_time was changed, resolve overlapping collisions on Track 2
      if (updates.start_time !== undefined) {
        const targetClip = state.clips.find((c) => c.id === id);
        const origStart = targetClip?.start_time || 0;

        const mapped = workingClips.map((c) => ({
          id: c.id,
          start: c.start_time || 0,
          duration: Math.max(0.2, (c.trim_end || c.duration) - (c.trim_start || 0)),
        }));

        const resolved = resolveNonOverlappingIntervals(mapped, id, updates.start_time, origStart);
        const resolvedMap = new Map(resolved.map((r) => [r.id, r.start]));

        workingClips = workingClips
          .map((c) => ({
            ...c,
            start_time: resolvedMap.has(c.id) ? resolvedMap.get(c.id)! : (c.start_time || 0),
          }))
          .sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
      }

      const clipTotal = workingClips.reduce(
        (acc, c) => Math.max(acc, (c.start_time || 0) + ((c.trim_end || c.duration) - (c.trim_start || 0))),
        0
      );
      const newDuration = Math.max(
        clipTotal,
        ...state.audioTracks.map((a) => (a.start_offset || 0) + (a.duration || 0)),
        ...state.captions.map((c) => c.end || 0),
        10
      );
      return { clips: workingClips, duration: newDuration };
    });
  },
  updateClipTrim: (id, trimStart, trimEnd) => {
    get().saveSnapshot();
    set((state) => {
      let workingClips = state.clips.map((c) => (c.id === id ? { ...c, trim_start: trimStart, trim_end: trimEnd } : c));

      // Check if expanding trimmed clip overlaps adjacent clips on Track 2
      const target = workingClips.find((c) => c.id === id);
      if (target) {
        const targetStart = target.start_time || 0;
        const targetDur = Math.max(0.2, (target.trim_end || target.duration) - (target.trim_start || 0));
        const targetEnd = targetStart + targetDur;

        // Push any clips that start after target and overlap targetEnd forward
        workingClips = workingClips
          .map((c) => {
            if (c.id === id) return c;
            const cStart = c.start_time || 0;
            if (cStart >= targetStart && cStart < targetEnd) {
              return { ...c, start_time: Math.round(targetEnd * 100) / 100 };
            }
            return c;
          })
          .sort((a, b) => (a.start_time || 0) - (b.start_time || 0));
      }

      const clipTotal = workingClips.reduce(
        (acc, c) => Math.max(acc, (c.start_time || 0) + ((c.trim_end || c.duration) - (c.trim_start || 0))),
        0
      );
      const newDuration = Math.max(
        clipTotal,
        ...state.audioTracks.map((a) => (a.start_offset || 0) + (a.duration || 0)),
        ...state.captions.map((c) => c.end || 0),
        10
      );
      return { clips: workingClips, duration: newDuration };
    });
  },
  updateClipTransition: (id, transition) => {
    get().saveSnapshot();
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, transition } : c)),
    }));
  },
  splitClipAtPlayhead: () => {
    const { clips, currentTime } = get();
    const clip = clips.find((c) => {
      const start = c.start_time || 0;
      const dur = (c.trim_end || c.duration) - (c.trim_start || 0);
      return currentTime > start && currentTime < start + dur;
    });
    if (!clip) return;

    get().saveSnapshot();
    const localSplit = (currentTime - (clip.start_time || 0)) + (clip.trim_start || 0);
    const clip1: VideoClip = {
      ...clip,
      id: `clip_${Date.now()}_1`,
      trim_end: localSplit,
    };
    const clip1Dur = localSplit - (clip.trim_start || 0);
    const clip2: VideoClip = {
      ...clip,
      id: `clip_${Date.now()}_2`,
      start_time: Math.round(((clip.start_time || 0) + clip1Dur) * 100) / 100,
      trim_start: localSplit,
      transition: clip.transition || { type: 'crossfade', duration: 0.5 },
    };

    set((state) => ({
      clips: state.clips.flatMap((c) => (c.id === clip.id ? [clip1, clip2] : [c])),
      selectedClipId: clip2.id,
    }));
  },
  removeClip: (id) => {
    get().saveSnapshot();
    set((state) => {
      const newClips = state.clips.filter((c) => c.id !== id);
      const clipTotal = newClips.reduce(
        (acc, c) => Math.max(acc, (c.start_time || 0) + ((c.trim_end || c.duration) - (c.trim_start || 0))),
        0
      );
      const newDuration = Math.max(
        10,
        clipTotal,
        ...state.audioTracks.map((a) => (a.start_offset || 0) + (a.duration || 0)),
        ...state.captions.map((c) => c.end || 0)
      );
      return {
        clips: newClips,
        duration: newDuration,
        selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
      };
    });
  },

  captions: [],
  globalCaptionStyle: DEFAULT_CAPTION_STYLE,
  setCaptions: (captions) => {
    get().saveSnapshot();
    set({ captions });
  },
  addCaption: (caption) => {
    get().saveSnapshot();
    set((state) => {
      const capDur = Math.max(0.2, caption.end - caption.start);
      // Displace existing captions that overlap
      const adjusted = state.captions.map((c) => {
        const overlaps = !(c.end <= caption.start || c.start >= caption.end);
        if (overlaps) {
          const d = Math.max(0.2, c.end - c.start);
          return { ...c, start: Math.round(caption.end * 100) / 100, end: Math.round((caption.end + d) * 100) / 100 };
        }
        return c;
      });
      return {
        captions: [...adjusted, caption].sort((a, b) => a.start - b.start),
        selectedCaptionId: caption.id,
      };
    });
  },
  updateCaption: (id, updates) => {
    get().saveSnapshot();
    set((state) => {
      let working = state.captions.map((c) => (c.id === id ? { ...c, ...updates } : c));
      if (updates.start !== undefined) {
        const targetCap = state.captions.find((c) => c.id === id);
        const origStart = targetCap?.start || 0;

        const mapped = working.map((c) => ({
          id: c.id,
          start: c.start,
          duration: Math.max(0.2, c.end - c.start),
        }));

        const resolved = resolveNonOverlappingIntervals(mapped, id, updates.start, origStart);
        const resolvedMap = new Map(resolved.map((r) => [r.id, r]));

        working = working
          .map((c) => {
            if (resolvedMap.has(c.id)) {
              const res = resolvedMap.get(c.id)!;
              return {
                ...c,
                start: res.start,
                end: Math.round((res.start + res.duration) * 100) / 100,
              };
            }
            return c;
          })
          .sort((a, b) => a.start - b.start);
      }
      return { captions: working };
    });
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

  // Video Overlays (Picture-in-Picture)
  videoOverlays: [],
  addVideoOverlay: (overlay) => {
    get().saveSnapshot();
    set((state) => {
      const ovDur = Math.max(0.2, overlay.end_time - overlay.start_time);
      const adjusted = state.videoOverlays.map((v) => {
        const overlaps = !(v.end_time <= overlay.start_time || v.start_time >= overlay.end_time);
        if (overlaps) {
          const d = Math.max(0.2, v.end_time - v.start_time);
          return {
            ...v,
            start_time: Math.round(overlay.end_time * 100) / 100,
            end_time: Math.round((overlay.end_time + d) * 100) / 100,
          };
        }
        return v;
      });
      return {
        videoOverlays: [...adjusted, overlay].sort((a, b) => a.start_time - b.start_time),
        selectedVideoOverlayId: overlay.id,
      };
    });
  },
  updateVideoOverlay: (id, updates) => {
    set((state) => {
      let working = state.videoOverlays.map((v) => (v.id === id ? { ...v, ...updates } : v));

      if (updates.start_time !== undefined) {
        const targetOv = state.videoOverlays.find((v) => v.id === id);
        const origStart = targetOv?.start_time || 0;

        const mapped = working.map((v) => ({
          id: v.id,
          start: v.start_time,
          duration: Math.max(0.2, v.end_time - v.start_time),
        }));

        const resolved = resolveNonOverlappingIntervals(mapped, id, updates.start_time, origStart);
        const resolvedMap = new Map(resolved.map((r) => [r.id, r]));

        working = working
          .map((v) => {
            if (resolvedMap.has(v.id)) {
              const res = resolvedMap.get(v.id)!;
              return {
                ...v,
                start_time: res.start,
                end_time: Math.round((res.start + res.duration) * 100) / 100,
              };
            }
            return v;
          })
          .sort((a, b) => a.start_time - b.start_time);
      }

      return { videoOverlays: working };
    });
  },
  removeVideoOverlay: (id) => {
    get().saveSnapshot();
    set((state) => ({
      videoOverlays: state.videoOverlays.filter((v) => v.id !== id),
      selectedVideoOverlayId: state.selectedVideoOverlayId === id ? null : state.selectedVideoOverlayId,
    }));
  },
  moveClipToOverlay: (clipId) => {
    get().saveSnapshot();
    const state = get();
    const clip = state.clips.find((c) => c.id === clipId);
    if (!clip) return;

    const clipStart = clip.start_time ?? 0;
    const clipDur = Math.max(0.5, (clip.trim_end || clip.duration) - (clip.trim_start || 0));

    const newOverlay: VideoOverlay = {
      id: `v_ov_${Date.now()}`,
      video_id: clip.video_id,
      url: clip.url,
      filename: clip.filename,
      start_time: Math.round(clipStart * 100) / 100,
      end_time: Math.round((clipStart + clipDur) * 100) / 100,
      x: 50,
      y: 50,
      scale: 0.5,
      rotation: 0,
      opacity: 1,
      volume: 1,
      is_muted: false,
      border_radius: 8,
      border_color: '#FFD21F',
      border_width: 0,
      shadow: true,
      blend_mode: 'normal',
    };

    const remainingClips = state.clips.filter((c) => c.id !== clipId);
    const newOverlays = [...(state.videoOverlays || []), newOverlay];

    set({
      clips: remainingClips,
      videoOverlays: newOverlays,
      selectedClipId: null,
      selectedVideoOverlayId: newOverlay.id,
    });
  },
  moveOverlayToMainTrack: (overlayId) => {
    get().saveSnapshot();
    const state = get();
    const ov = (state.videoOverlays || []).find((o) => o.id === overlayId);
    if (!ov) return;

    const ovStart = ov.start_time ?? 0;
    const ovDur = Math.max(0.5, (ov.end_time || 5) - ovStart);

    const newClip: VideoClip = {
      id: `clip_${Date.now()}`,
      video_id: ov.video_id,
      url: ov.url,
      filename: ov.filename || 'Video Clip',
      duration: ovDur,
      start_time: Math.round(ovStart * 100) / 100,
      trim_start: 0,
      trim_end: ovDur,
      width: 1280,
      height: 720,
      fps: 30,
    };

    const remainingOverlays = (state.videoOverlays || []).filter((o) => o.id !== overlayId);
    const newClips = [...state.clips, newClip].sort((a, b) => (a.start_time || 0) - (b.start_time || 0));

    set({
      clips: newClips,
      videoOverlays: remainingOverlays,
      selectedVideoOverlayId: null,
      selectedClipId: newClip.id,
    });
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
    set((state) => {
      const trackDur = track.duration || 5;
      const start = track.start_offset !== undefined ? track.start_offset : 0;
      const trackEnd = start + trackDur;
      const adjusted = state.audioTracks.map((a) => {
        const aStart = a.start_offset || 0;
        const aDur = a.duration || 5;
        const aEnd = aStart + aDur;
        const overlaps = !(aEnd <= start || aStart >= trackEnd);
        if (overlaps) {
          return { ...a, start_offset: Math.round(trackEnd * 100) / 100 };
        }
        return a;
      });
      return { audioTracks: [...adjusted, track].sort((a, b) => (a.start_offset || 0) - (b.start_offset || 0)) };
    });
  },
  updateAudioTrack: (id, updates) => {
    get().saveSnapshot();
    set((state) => {
      let working = state.audioTracks.map((a) => (a.id === id ? { ...a, ...updates } : a));
      if (updates.start_offset !== undefined) {
        const targetAud = state.audioTracks.find((a) => a.id === id);
        const origStart = targetAud?.start_offset || 0;

        const mapped = working.map((a) => ({
          id: a.id,
          start: a.start_offset || 0,
          duration: Math.max(0.2, a.duration || 5),
        }));

        const resolved = resolveNonOverlappingIntervals(mapped, id, updates.start_offset, origStart);
        const resolvedMap = new Map(resolved.map((r) => [r.id, r]));

        working = working
          .map((a) => {
            if (resolvedMap.has(a.id)) {
              const res = resolvedMap.get(a.id)!;
              return {
                ...a,
                start_offset: res.start,
              };
            }
            return a;
          })
          .sort((a, b) => (a.start_offset || 0) - (b.start_offset || 0));
      }
      return { audioTracks: working };
    });
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
  videoPosition: { x: 0, y: 0 },
  videoScale: 1.0,
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
  setVideoPosition: (pos) => {
    set({ videoPosition: pos });
  },
  setVideoScale: (scale) => {
    set({ videoScale: Math.max(0.25, Math.min(4.0, scale)) });
  },
  resetVideoTransform: () => {
    set({ videoPosition: { x: 0, y: 0 }, videoScale: 1.0 });
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
      videoOverlays: JSON.parse(JSON.stringify(s.videoOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      videoPosition: { ...s.videoPosition },
      videoScale: s.videoScale,
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
      videoOverlays: JSON.parse(JSON.stringify(s.videoOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      videoPosition: { ...s.videoPosition },
      videoScale: s.videoScale,
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
      videoOverlays: last.videoOverlays || [],
      transition: last.transition || { type: 'none', duration: 0.5 },
      audioTracks: last.audioTracks,
      filters: last.filters,
      rotate: last.rotate,
      flipH: last.flipH,
      flipV: last.flipV,
      videoPosition: last.videoPosition || { x: 0, y: 0 },
      videoScale: last.videoScale ?? 1.0,
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
      videoOverlays: JSON.parse(JSON.stringify(s.videoOverlays)),
      transition: { ...s.transition },
      audioTracks: JSON.parse(JSON.stringify(s.audioTracks)),
      filters: { ...s.filters },
      rotate: s.rotate,
      flipH: s.flipH,
      flipV: s.flipV,
      videoPosition: { ...s.videoPosition },
      videoScale: s.videoScale,
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
      videoOverlays: next.videoOverlays || [],
      transition: next.transition || { type: 'none', duration: 0.5 },
      audioTracks: next.audioTracks,
      filters: next.filters,
      rotate: next.rotate,
      flipH: next.flipH,
      flipV: next.flipV,
      videoPosition: next.videoPosition || { x: 0, y: 0 },
      videoScale: next.videoScale ?? 1.0,
      aspectRatio: next.aspectRatio,
    });
  },

  loadProjectData: (data) => {
    if (!data) return;
    const computedDuration = data.duration || Math.max(0, ...(data.clips || []).map((c: any) => c.trim_end || c.duration || 0));
    set({
      clips: data.clips || [],
      captions: data.captions || [],
      globalCaptionStyle: data.globalCaptionStyle || DEFAULT_CAPTION_STYLE,
      textOverlays: data.textOverlays || data.text_overlays || [],
      stickerOverlays: data.stickerOverlays || data.sticker_overlays || [],
      imageOverlays: data.imageOverlays || data.image_overlays || [],
      videoOverlays: data.videoOverlays || data.video_overlays || [],
      transition: data.transition || { type: 'none', duration: 0.5 },
      audioTracks: data.audioTracks || data.audio_tracks || [],
      filters: { ...DEFAULT_FILTERS, ...(data.filters || {}) },
      rotate: data.rotate || 0,
      flipH: data.flipH || false,
      flipV: data.flipV || false,
      videoPosition: data.videoPosition || data.video_position || { x: 0, y: 0 },
      videoScale: data.videoScale ?? data.video_scale ?? 1.0,
      aspectRatio: data.aspectRatio || '16:9',
      canvasBackground: data.canvasBackground || 'black',
      duration: computedDuration,
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
      duration: s.duration,
      aspectRatio: s.aspectRatio,
      canvasBackground: s.canvasBackground,
      globalCaptionStyle: s.globalCaptionStyle,
      clips: s.clips,
      captions: s.captions.map((c) => ({
        ...c,
        style: { ...s.globalCaptionStyle, ...(c.style || {}) },
      })),
      text_overlays: s.textOverlays,
      sticker_overlays: s.stickerOverlays,
      image_overlays: s.imageOverlays,
      video_overlays: s.videoOverlays,
      transition: s.transition,
      audio_tracks: s.audioTracks,
      filters: s.filters,
      rotate: s.rotate,
      flip_h: s.flipH,
      flip_v: s.flipV,
      video_position: s.videoPosition,
      video_scale: s.videoScale,
      video_volume: s.isMuted ? 0 : (s.videoVolume ?? s.volume),
      cover_image: s.coverImage,
      headerBgColor: s.headerBgColor,
      headerBgImage: s.headerBgImage,
      headerBgOpacity: s.headerBgOpacity,
    };
  },
}));
