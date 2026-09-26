export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9' | '4:3' | '2:3' | '3:4' | 'custom';

export type CanvasBackground = 'black' | 'dark' | 'blur' | 'white' | 'amber_gradient' | 'cyber_gradient';

export interface VideoClip {
  id: string;
  video_id: string;
  url: string;
  filename: string;
  duration: number;
  start_time?: number; // Timeline position start in seconds
  trim_start: number;
  trim_end: number;
  width: number;
  height: number;
  fps: number;
  transition?: Transition;
  filters?: VideoFilters;
}

export const AVAILABLE_FONTS = [
  'Inter',
  'Poppins',
  'Impact',
  'Bebas Neue',
  'Oswald',
  'Anton',
  'Montserrat',
  'Roboto',
  'Cinzel',
  'Playfair Display',
  'Space Grotesk',
  'Permanent Marker',
  'Lobster',
  'Righteous',
  'Caveat',
  'Pacifico',
  'Arial',
] as const;

export type FontFamily = typeof AVAILABLE_FONTS[number] | string;

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export type CaptionPreset = 'classic' | 'bold' | 'yellow_highlight' | 'creator' | 'minimal' | 'social' | 'cinematic';
export type CaptionAnimation = 'none' | 'fade' | 'pop' | 'bounce' | 'slide_up' | 'typewriter' | 'word_pop';

export interface CaptionStyle {
  preset: CaptionPreset;
  font_family: string;
  font_size: number;
  font_weight: string;
  color: string;
  highlight_color: string;
  background_color: string;
  shadow: boolean;
  border: boolean;
  border_color: string;
  position_x?: number; // 0 - 100 percentage across screen (default 50)
  position_y: number; // 0 - 100 percentage from top
  alignment: 'left' | 'center' | 'right';
  animation: CaptionAnimation;
  word_by_word: boolean;
}

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words?: WordTimestamp[];
  style?: Partial<CaptionStyle>;
}

export interface TextOverlay {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
  x: number; // percentage
  y: number; // percentage
  font_family: string;
  font_size: number;
  font_weight: string;
  color: string;
  background_color: string;
  shadow: boolean;
  rotation: number;
  opacity: number;
  preset?: 'title' | 'subtitle' | 'lower_third' | 'callout' | 'cta';
}

export interface AudioTrack {
  id: string;
  filename: string;
  url: string;
  duration: number;
  start_offset: number; // when on timeline
  volume: number;       // 0 - 1
  is_muted: boolean;
  fade_in: number;
  fade_out: number;
}

export type ShapeType =
  | 'rectangle'
  | 'rounded_rect'
  | 'circle'
  | 'arrow_right'
  | 'arrow_left'
  | 'arrow_up'
  | 'arrow_down'
  | 'star'
  | 'heart'
  | 'speech_bubble'
  | 'pill';

export interface StickerOverlay {
  id: string;
  type: 'emoji' | 'badge' | 'image' | 'shape';
  content: string;
  start_time: number;
  end_time: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number; // 0.2 - 3.0
  rotation: number; // -180 to 180
  opacity: number; // 0 - 1
  animation: 'none' | 'bounce' | 'pulse' | 'spin' | 'float' | 'pop';
  shape_type?: ShapeType;
  shape_color?: string;
  shape_border_color?: string;
  shape_border_width?: number;
}

export interface ImageOverlay {
  id: string;
  url: string;
  filename: string;
  start_time: number;
  end_time: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number; // 0.2 - 3.0
  rotation: number; // -180 to 180
  opacity: number; // 0 - 1
  border_radius: number; // px
  border_color: string;
  border_width: number;
  shadow: boolean;
  blend_mode: 'normal' | 'multiply' | 'screen' | 'overlay';
  animation: 'none' | 'fade' | 'pop' | 'slide_in' | 'zoom_in';
}

export interface VideoOverlay {
  id: string;
  video_id?: string;
  url: string;
  filename: string;
  start_time: number;
  end_time: number;
  x: number; // percentage 0 - 100 (center)
  y: number; // percentage 0 - 100 (center)
  scale: number; // 0.15 - 3.0
  rotation: number; // -180 to 180
  opacity: number; // 0 - 1
  volume: number; // 0 - 1
  is_muted: boolean;
  border_radius: number; // px
  border_color: string;
  border_width: number;
  shadow: boolean;
  blend_mode?: 'normal' | 'screen' | 'multiply' | 'lighten' | 'overlay' | 'difference';
  chroma_key_enabled?: boolean;
  chroma_key_color?: string; // hex, default '#00FF00'
  chroma_key_tolerance?: number; // 0 - 100, default 35
  chroma_key_smoothness?: number; // 0 - 100, default 10
  playback_rate?: number; // 0.25 - 3.0
  flip_h?: boolean;
  flip_v?: boolean;
}

export interface Transition {
  type: 'none' | 'crossfade' | 'fade_black' | 'wipe_left' | 'wipe_right' | 'zoom_in' | 'zoom_out' | 'flash';
  duration: number; // seconds
}

export type FilterPreset =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'warm'
  | 'cool'
  | 'vintage'
  | 'cinematic'
  | 'teal_orange'
  | 'cyberpunk'
  | 'golden_hour'
  | 'moody'
  | 'retro_90s';

export interface VideoFilters {
  brightness: number; // -100 to 100
  contrast: number;   // 0.2 to 2.0
  saturation: number; // 0 to 2.5
  temperature: number;// -100 to 100
  tint: number;       // -100 to 100
  exposure: number;   // -100 to 100
  highlights: number; // -100 to 100
  shadows: number;    // -100 to 100
  blur: number;       // 0 to 20
  sharpen: number;    // 0 to 100
  vignette: boolean;
  letterbox: boolean;
  preset: FilterPreset;
}

export interface ProjectState {
  id: string;
  name: string;
  aspect_ratio: AspectRatio;
  custom_width?: number;
  custom_height?: number;
  clips: VideoClip[];
  captions: CaptionSegment[];
  globalCaptionStyle: CaptionStyle;
  text_overlays: TextOverlay[];
  sticker_overlays?: StickerOverlay[];
  image_overlays?: ImageOverlay[];
  video_overlays?: VideoOverlay[];
  transition?: Transition;
  audio_tracks: AudioTrack[];
  filters: VideoFilters;
  rotate: number; // 0, 90, 180, 270
  flip_h: boolean;
  flip_v: boolean;
  video_position?: { x: number; y: number };
  video_scale?: number;
  video_volume: number;
  is_video_muted: boolean;
  active_tool: 'media' | 'captions' | 'text' | 'stickers' | 'effects' | 'adjustments' | 'transitions' | 'audio' | 'canvas' | 'export' | null;
}
