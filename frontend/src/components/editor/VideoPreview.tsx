import React, { useRef, useEffect, useState } from 'react';
import {
  Upload,
  Film,
  Smile,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  Move,
  Type,
  Layers,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { StickerOverlay, ShapeType, TextOverlay, VideoOverlay } from '../../types/editor';

interface VideoPreviewProps {
  onTriggerUpload: () => void;
}

const isImageMedia = (clip?: { filename?: string; url?: string } | null) => {
  if (!clip) return false;
  const name = (clip.filename || '').toLowerCase();
  const url = (clip.url || '').toLowerCase();
  return (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.svg') ||
    name.endsWith('.gif') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.webp') ||
    url.includes('.svg') ||
    url.includes('.gif')
  );
};

const renderShapeSVG = (sticker: StickerOverlay) => {
  const shapeType = sticker.shape_type || (sticker.content as ShapeType);
  const fill = sticker.shape_color || '#FFD21F';
  const stroke = sticker.shape_border_color || '#000000';
  const strokeWidth = sticker.shape_border_width || 3;

  switch (shapeType) {
    case 'rectangle':
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" className="filter drop-shadow-md">
          <rect x="2" y="2" width="96" height="56" rx="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'rounded_rect':
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" className="filter drop-shadow-md">
          <rect x="2" y="2" width="96" height="56" rx="16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'circle':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" className="filter drop-shadow-md">
          <circle cx="40" cy="40" r="36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'arrow_right':
      return (
        <svg width="90" height="60" viewBox="0 0 90 60" className="filter drop-shadow-md">
          <polygon points="10,20 50,20 50,8 85,30 50,52 50,40 10,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'arrow_left':
      return (
        <svg width="90" height="60" viewBox="0 0 90 60" className="filter drop-shadow-md">
          <polygon points="80,20 40,20 40,8 5,30 40,52 40,40 80,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'arrow_up':
      return (
        <svg width="60" height="90" viewBox="0 0 60 90" className="filter drop-shadow-md">
          <polygon points="20,80 20,40 8,40 30,5 52,40 40,40 40,80" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'arrow_down':
      return (
        <svg width="60" height="90" viewBox="0 0 60 90" className="filter drop-shadow-md">
          <polygon points="20,10 20,50 8,50 30,85 52,50 40,50 40,10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'star':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" className="filter drop-shadow-md">
          <polygon points="40,6 50,28 75,30 56,47 62,72 40,58 18,72 24,47 5,30 30,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'heart':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" className="filter drop-shadow-md">
          <path d="M40,68 C40,68 12,46 12,25 C12,14 20,8 30,12 C36,15 40,22 40,22 C40,22 44,15 50,12 C60,8 68,14 68,25 C68,46 40,68 40,68 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'speech_bubble':
      return (
        <svg width="100" height="70" viewBox="0 0 100 70" className="filter drop-shadow-md">
          <path d="M10,12 Q10,4 20,4 L80,4 Q90,4 90,12 L90,42 Q90,50 80,50 L35,50 L15,66 L22,50 L20,50 Q10,50 10,42 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
    case 'pill':
    default:
      return (
        <svg width="120" height="44" viewBox="0 0 120 44" className="filter drop-shadow-md">
          <rect x="2" y="2" width="116" height="40" rx="20" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
  }
};

const ChromaKeyOverlayPlayer: React.FC<{
  overlay: VideoOverlay;
  isPlaying: boolean;
  playbackRate: number;
  onRef?: (el: HTMLVideoElement | null) => void;
}> = ({ overlay, isPlaying, playbackRate, onRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (onRef) onRef(videoRef.current);
    return () => {
      if (onRef) onRef(null);
    };
  }, [overlay.id, onRef]);

  // Real-time Chroma Key processing on canvas
  useEffect(() => {
    if (!overlay.chroma_key_enabled) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const hex = overlay.chroma_key_color || '#00FF00';
    const cleanHex = hex.replace('#', '');
    const rKey = parseInt(cleanHex.substring(0, 2) || '0', 16);
    const gKey = parseInt(cleanHex.substring(2, 4) || '255', 16);
    const bKey = parseInt(cleanHex.substring(4, 6) || '0', 16);

    const tolerance = ((overlay.chroma_key_tolerance ?? 35) / 100) * 441;
    const smoothness = ((overlay.chroma_key_smoothness ?? 10) / 100) * 150;

    let isRunning = true;

    const renderChromaFrame = () => {
      if (!isRunning || !video || !canvas || !ctx) return;

      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];

          const dist = Math.sqrt(
            (r - rKey) * (r - rKey) +
            (g - gKey) * (g - gKey) +
            (b - bKey) * (b - bKey)
          );

          if (dist < tolerance) {
            d[i + 3] = 0;
          } else if (dist < tolerance + smoothness && smoothness > 0) {
            const alphaFactor = (dist - tolerance) / smoothness;
            d[i + 3] = Math.round(d[i + 3] * alphaFactor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(renderChromaFrame);
      }
    };

    renderChromaFrame();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    overlay.chroma_key_enabled,
    overlay.chroma_key_color,
    overlay.chroma_key_tolerance,
    overlay.chroma_key_smoothness,
    isPlaying,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      <video
        ref={videoRef}
        src={overlay.url}
        preload="auto"
        playsInline
        muted={overlay.is_muted}
        className={overlay.chroma_key_enabled ? 'hidden' : 'max-w-[280px] max-h-[200px] object-cover pointer-events-none select-none'}
        style={{
          borderRadius: `${overlay.border_radius}px`,
          mixBlendMode: overlay.blend_mode || 'normal',
          transform: `scaleX(${overlay.flip_h ? -1 : 1}) scaleY(${overlay.flip_v ? -1 : 1})`,
        }}
      />
      {overlay.chroma_key_enabled && (
        <canvas
          ref={canvasRef}
          className="max-w-[280px] max-h-[200px] object-cover pointer-events-none select-none"
          style={{
            borderRadius: `${overlay.border_radius}px`,
            mixBlendMode: overlay.blend_mode || 'normal',
            transform: `scaleX(${overlay.flip_h ? -1 : 1}) scaleY(${overlay.flip_v ? -1 : 1})`,
          }}
        />
      )}
    </div>
  );
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({ onTriggerUpload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const videoOverlayRefs = useRef<Record<string, HTMLVideoElement>>({});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInFullscreen, setShowControlsInFullscreen] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Web Audio API refs for volume boost > 100%
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const ensureGainNode = () => {
    if (!videoRef.current || gainNodeRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(videoRef.current);
      const gain = ctx.createGain();
      source.connect(gain);
      gain.connect(ctx.destination);
      audioContextRef.current = ctx;
      sourceNodeRef.current = source;
      gainNodeRef.current = gain;
    } catch (err) {
      console.warn('Web Audio gain node setup notice:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Interactive drag state for moving captions, texts, stickers/shapes, images, overlay videos, and main video on stage
  const [activeDrag, setActiveDrag] = useState<{
    type: 'caption' | 'text' | 'image' | 'sticker' | 'video' | 'video_overlay';
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const {
    clips,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    playbackRate,
    volume,
    videoVolume,
    isMuted,
    aspectRatio,
    setAspectRatio,
    canvasBackground,
    previewZoom,
    setPreviewZoom,
    filters,
    rotate,
    setRotate,
    flipH,
    flipV,
    videoPosition,
    setVideoPosition,
    videoScale,
    setVideoScale,
    resetVideoTransform,
    captions,
    globalCaptionStyle,
    setGlobalCaptionStyle,
    updateCaption,
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    stickerOverlays,
    updateSticker,
    imageOverlays,
    updateImageOverlay,
    videoOverlays,
    updateVideoOverlay,
    audioTracks,
    selectedStickerId,
    selectedImageId,
    selectedVideoOverlayId,
    selectedTextId,
    selectedCaptionId,
    setSelectedCaptionId,
    setSelectedTextId,
    setSelectedStickerId,
    setSelectedImageId,
    setSelectedVideoOverlayId,
    setActiveTool,
    transition,
    theme,
  } = useEditorStore();

  const isLight = theme === 'light';

  // Dynamic active video clip resolution across all timeline clips
  const activeClipIndex = clips.findIndex((c) => {
    const start = c.start_time ?? 0;
    const dur = (c.trim_end || c.duration) - (c.trim_start || 0);
    return currentTime >= start && currentTime < start + dur;
  });
  const currentClip = activeClipIndex >= 0 ? clips[activeClipIndex] : (clips[0] || null);
  const primaryClip = currentClip;

  const clipStart = currentClip ? (currentClip.start_time ?? 0) : 0;
  const clipTrimStart = currentClip ? (currentClip.trim_start || 0) : 0;
  const clipTrimEnd = currentClip ? (currentClip.trim_end || currentClip.duration) : 10;
  const clipDuration = clipTrimEnd - clipTrimStart;
  const targetLocalTime = Math.max(clipTrimStart, Math.min(clipTrimEnd, (currentTime - clipStart) + clipTrimStart));
  const effectiveVideoVolume = isMuted ? 0 : (videoVolume ?? volume);

  // Active clip entrance transition calculation
  const prevClip = activeClipIndex > 0 ? clips[activeClipIndex - 1] : null;
  const clipTransition = currentClip?.transition || (transition?.type !== 'none' ? transition : null);
  const transDur = clipTransition && clipTransition.type !== 'none' ? (clipTransition.duration || 0.6) : 0;
  const timeInClip = currentTime - clipStart;
  const isTransitionActive = transDur > 0 && timeInClip >= 0 && timeInClip < transDur;
  const transProgress = isTransitionActive ? Math.min(1, Math.max(0, timeInClip / transDur)) : 1;

  // High-frequency playback sync loop for butter-smooth 60fps transitions, playhead movement, and image clip progression
  useEffect(() => {
    let animId: number;
    let lastTime = 0;
    let lastTimestamp = performance.now();
    const isImage = currentClip ? isImageMedia(currentClip) : false;

    const loop = (timestamp: number) => {
      if (!isPlaying) return;

      if (isImage && currentClip) {
        const deltaSec = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        const newTime = currentTime + deltaSec * playbackRate;
        const clipEnd = clipStart + clipDuration;

        if (newTime >= clipEnd - 0.04) {
          if (activeClipIndex >= 0 && activeClipIndex + 1 < clips.length) {
            const nextClip = clips[activeClipIndex + 1];
            const nextStart = nextClip.start_time ?? clipEnd;
            setCurrentTime(nextStart);
          } else {
            setIsPlaying(false);
            setCurrentTime(clipEnd);
          }
        } else {
          setCurrentTime(newTime);
        }
      } else if (videoRef.current && currentClip) {
        lastTimestamp = timestamp;
        if (timestamp - lastTime > 25) {
          lastTime = timestamp;
          const vTime = videoRef.current.currentTime;
          const calculatedTime = clipStart + (vTime - clipTrimStart);
          setCurrentTime(Math.max(clipStart, Math.min(clipStart + clipDuration, calculatedTime)));
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      lastTimestamp = performance.now();
      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentClip?.id, clipStart, clipTrimStart, clipDuration, currentTime, playbackRate, activeClipIndex, clips]);

  // Interactive Dragging on Preview Canvas
  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();

      if (activeDrag.type === 'video') {
        const deltaX = e.clientX - activeDrag.startX;
        const deltaY = e.clientY - activeDrag.startY;
        setVideoPosition({
          x: Math.round(activeDrag.initialX + deltaX),
          y: Math.round(activeDrag.initialY + deltaY),
        });
        return;
      }

      const deltaX = ((e.clientX - activeDrag.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - activeDrag.startY) / rect.height) * 100;

      if (activeDrag.type === 'caption') {
        const newPosX = Math.max(5, Math.min(95, Math.round(activeDrag.initialX + deltaX)));
        const newPosY = Math.max(5, Math.min(95, Math.round(activeDrag.initialY + deltaY)));
        updateCaption(activeDrag.id, {
          style: { position_x: newPosX, position_y: newPosY },
        });
        setGlobalCaptionStyle({ position_x: newPosX, position_y: newPosY });
      } else if (activeDrag.type === 'text') {
        const newX = Math.max(5, Math.min(95, Math.round(activeDrag.initialX + deltaX)));
        const newY = Math.max(5, Math.min(95, Math.round(activeDrag.initialY + deltaY)));
        updateTextOverlay(activeDrag.id, { x: newX, y: newY });
      } else if (activeDrag.type === 'sticker') {
        const newX = Math.max(5, Math.min(95, Math.round(activeDrag.initialX + deltaX)));
        const newY = Math.max(5, Math.min(95, Math.round(activeDrag.initialY + deltaY)));
        updateSticker(activeDrag.id, { x: newX, y: newY });
      } else if (activeDrag.type === 'image') {
        const newX = Math.max(5, Math.min(95, Math.round(activeDrag.initialX + deltaX)));
        const newY = Math.max(5, Math.min(95, Math.round(activeDrag.initialY + deltaY)));
        updateImageOverlay(activeDrag.id, { x: newX, y: newY });
      } else if (activeDrag.type === 'video_overlay') {
        const newX = Math.max(5, Math.min(95, Math.round(activeDrag.initialX + deltaX)));
        const newY = Math.max(5, Math.min(95, Math.round(activeDrag.initialY + deltaY)));
        updateVideoOverlay(activeDrag.id, { x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, setVideoPosition, updateCaption, setGlobalCaptionStyle, updateTextOverlay, updateSticker, updateImageOverlay, updateVideoOverlay]);

  // Sync play/pause with store for video and all audio tracks
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => setIsPlaying(false));
        }
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }

    // Sync all audio tracks
    Object.values(audioRefs.current).forEach((audioEl) => {
      if (!audioEl) return;
      if (isPlaying && audioEl.paused) {
        audioEl.play().catch(() => {});
      } else if (!isPlaying && !audioEl.paused) {
        audioEl.pause();
      }
    });

    // Sync all overlay videos
    Object.values(videoOverlayRefs.current).forEach((vEl) => {
      if (!vEl) return;
      if (isPlaying && vEl.paused) {
        vEl.play().catch(() => {});
      } else if (!isPlaying && !vEl.paused) {
        vEl.pause();
      }
    });
  }, [isPlaying]);

  // Sync playback rate & volume safely without crashing or throwing
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;

      if (effectiveVideoVolume > 1.0) {
        ensureGainNode();
      }

      if (audioContextRef.current && audioContextRef.current.state === 'suspended' && isPlaying) {
        audioContextRef.current.resume().catch(() => {});
      }

      if (gainNodeRef.current) {
        // Safe volume boost above 100% via Web Audio GainNode
        gainNodeRef.current.gain.value = isMuted ? 0 : effectiveVideoVolume;
        videoRef.current.volume = isMuted ? 0 : 1.0;
      } else {
        // Fallback: strictly clamped to [0, 1] to prevent DOMException reload crash
        videoRef.current.volume = isMuted ? 0 : Math.min(1, Math.max(0, effectiveVideoVolume));
      }
      videoRef.current.muted = isMuted;
    }

    // Sync audio tracks playbackRate and volume with strict [0, 1] clamping
    audioTracks.forEach((track) => {
      const audioEl = audioRefs.current[track.id];
      if (!audioEl) return;
      audioEl.playbackRate = playbackRate;
      audioEl.volume = track.is_muted ? 0 : Math.min(1, Math.max(0, track.volume));
      audioEl.muted = track.is_muted;
    });

    // Sync overlay videos playbackRate and volume
    videoOverlays.forEach((ov) => {
      const vEl = videoOverlayRefs.current[ov.id];
      if (!vEl) return;
      vEl.playbackRate = playbackRate;
      vEl.volume = ov.is_muted ? 0 : Math.min(1, Math.max(0, ov.volume));
      vEl.muted = ov.is_muted;
    });
  }, [playbackRate, effectiveVideoVolume, isMuted, audioTracks, videoOverlays, isPlaying]);

  // Sync seek position when currentTime changes externally
  useEffect(() => {
    if (videoRef.current && currentClip) {
      if (Math.abs(videoRef.current.currentTime - targetLocalTime) > 0.25) {
        videoRef.current.currentTime = targetLocalTime;
      }
    }

    // Sync audio tracks seek position
    audioTracks.forEach((track) => {
      const audioEl = audioRefs.current[track.id];
      if (!audioEl) return;
      const targetTime = Math.max(0, currentTime - (track.start_offset || 0));
      if (Math.abs(audioEl.currentTime - targetTime) > 0.25) {
        audioEl.currentTime = targetTime;
      }
    });

    // Sync overlay videos seek position
    videoOverlays.forEach((ov) => {
      const vEl = videoOverlayRefs.current[ov.id];
      if (!vEl) return;
      const targetTime = Math.max(0, currentTime - ov.start_time);
      if (Math.abs(vEl.currentTime - targetTime) > 0.25) {
        vEl.currentTime = targetTime;
      }
    });
  }, [currentTime, targetLocalTime, currentClip?.id, audioTracks, videoOverlays]);

  // When active clip changes, seek to targetLocalTime and ensure playback continues
  useEffect(() => {
    if (!videoRef.current || !currentClip) return;
    videoRef.current.currentTime = targetLocalTime;
    if (isPlaying && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentClip?.id]);

  // Track Fullscreen Change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentClip) return;
    const vTime = videoRef.current.currentTime;

    // Check if reached trim_end of current clip
    if (vTime >= clipTrimEnd - 0.08) {
      if (activeClipIndex >= 0 && activeClipIndex + 1 < clips.length) {
        // Seamlessly step into the next clip in the timeline sequence
        const nextClip = clips[activeClipIndex + 1];
        const nextStart = nextClip.start_time ?? (clipStart + clipDuration);
        setCurrentTime(nextStart);
        return;
      } else {
        // Reached end of final clip on timeline
        setIsPlaying(false);
        setCurrentTime(clipStart + clipDuration);
        return;
      }
    }

    const calculatedTime = clipStart + (vTime - clipTrimStart);
    setCurrentTime(Math.max(clipStart, Math.min(clipStart + clipDuration, calculatedTime)));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current || !currentClip) return;
    videoRef.current.currentTime = targetLocalTime;
    if (isPlaying && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
    if (!duration || duration <= 0) {
      setDuration(currentClip.duration);
    }
    // Auto-detect portrait videos and adapt frame
    if (videoRef.current.videoHeight > videoRef.current.videoWidth && aspectRatio === '16:9') {
      setAspectRatio('9:16');
    }
  };

  const handleEnded = () => {
    if (activeClipIndex >= 0 && activeClipIndex + 1 < clips.length) {
      const nextClip = clips[activeClipIndex + 1];
      const nextStart = nextClip.start_time ?? (clipStart + clipDuration);
      setCurrentTime(nextStart);
    } else {
      setIsPlaying(false);
    }
  };

  // Find active caption segment
  const activeCaption = captions.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  // Find active text overlays
  const activeTextOverlays = textOverlays.filter(
    (t) => currentTime >= t.start_time && currentTime <= t.end_time
  );

  // Find active stickers
  const activeStickers = (stickerOverlays || []).filter(
    (s) => currentTime >= s.start_time && currentTime <= s.end_time
  );

  // Find active image overlays
  const activeImageOverlays = (imageOverlays || []).filter(
    (img) => currentTime >= img.start_time && currentTime <= img.end_time
  );

  // Find active video overlays (Picture-in-Picture)
  const activeVideoOverlays = (videoOverlays || []).filter(
    (v) => currentTime >= v.start_time && currentTime <= v.end_time
  );

  // Compute CSS filter string with Pro Adjustments
  const getFilterStyle = () => {
    const totalBrightness = 1 + (filters.brightness + (filters.exposure || 0) * 0.5) / 100;
    const parts = [
      `brightness(${Math.max(0, totalBrightness)})`,
      `contrast(${filters.contrast})`,
      `saturate(${filters.saturation})`,
    ];

    if (filters.blur > 0) {
      parts.push(`blur(${filters.blur}px)`);
    }

    if (filters.temperature) {
      if (filters.temperature > 0) {
        parts.push(`sepia(${Math.min(0.6, filters.temperature / 150)})`);
      } else {
        parts.push(`hue-rotate(${Math.max(-30, filters.temperature * 0.3)}deg)`);
      }
    }

    if (filters.tint) {
      parts.push(`hue-rotate(${filters.tint * 0.4}deg)`);
    }

    switch (filters.preset) {
      case 'grayscale': parts.push('grayscale(1)'); break;
      case 'sepia': parts.push('sepia(0.8)'); break;
      case 'warm': parts.push('sepia(0.25) saturate(1.3)'); break;
      case 'cool': parts.push('hue-rotate(25deg) saturate(1.1)'); break;
      case 'vintage': parts.push('sepia(0.4) contrast(1.15) brightness(0.95)'); break;
      case 'cinematic': parts.push('contrast(1.2) saturate(1.15)'); break;
      case 'teal_orange': parts.push('contrast(1.2) saturate(1.3) hue-rotate(15deg)'); break;
      case 'cyberpunk': parts.push('contrast(1.3) saturate(1.8) hue-rotate(280deg)'); break;
      case 'golden_hour': parts.push('sepia(0.35) saturate(1.4) brightness(1.05)'); break;
      case 'moody': parts.push('contrast(1.25) saturate(0.8) brightness(0.9)'); break;
      case 'retro_90s': parts.push('sepia(0.25) saturate(1.15) contrast(0.95)'); break;
      default: break;
    }

    return parts.join(' ');
  };

  // Aspect ratio container classes
  const aspectClass = isFullscreen
    ? 'w-full h-full max-h-screen max-w-screen'
    : {
        '16:9': 'aspect-video max-w-full max-h-[80vh]',
        '9:16': 'aspect-[9/16] h-full max-h-[75vh]',
        '1:1': 'aspect-square max-w-full max-h-[75vh]',
        '4:5': 'aspect-[4/5] max-w-full max-h-[75vh]',
        '21:9': 'aspect-[21/9] max-w-full max-h-[75vh]',
        '4:3': 'aspect-[4/3] max-w-full max-h-[78vh]',
        '2:3': 'aspect-[2/3] max-w-full max-h-[75vh]',
        '3:4': 'aspect-[3/4] max-w-full max-h-[75vh]',
        'custom': 'aspect-video max-w-full max-h-[80vh]',
      }[aspectRatio] || 'aspect-video max-w-full max-h-[80vh]';

  const getCanvasBackgroundClass = () => {
    switch (canvasBackground) {
      case 'dark': return 'bg-[#181818]';
      case 'white': return 'bg-white text-black';
      case 'amber_gradient': return 'bg-gradient-to-tr from-[#1E1200] via-[#2A1800] to-[#000000]';
      case 'cyber_gradient': return 'bg-gradient-to-tr from-[#02131F] via-[#041D2E] to-[#000000]';
      case 'black':
      default: return 'bg-black';
    }
  };

  const getStickerAnimClass = (anim: string) => {
    switch (anim) {
      case 'pop': return 'anim-sticker-pop';
      case 'bounce': return 'anim-sticker-bounce';
      case 'pulse': return 'anim-sticker-pulse';
      case 'spin': return 'anim-sticker-spin';
      case 'float': return 'anim-sticker-float';
      default: return '';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={() => {
        if (isFullscreen) {
          setShowControlsInFullscreen(true);
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = setTimeout(() => setShowControlsInFullscreen(false), 3000);
        }
      }}
      className={`relative w-full h-full flex flex-col overflow-hidden select-none video-preview-viewport ${
        isFullscreen ? '!p-0 !bg-black fullscreen-viewport' : isLight ? 'bg-[#F1F5F9]' : 'bg-[#0D0D0D]'
      }`}
    >
      {/* Hidden Audio Elements for Multitrack Playback */}
      {audioTracks.map((track) => (
        <audio
          key={track.id}
          ref={(el) => {
            if (el) audioRefs.current[track.id] = el;
            else delete audioRefs.current[track.id];
          }}
          src={track.url}
          preload="auto"
        />
      ))}

      {/* Dedicated Docked Utility Header Toolbar (Completely Outside Video Canvas) */}
      {clips.length > 0 && !isFullscreen && (
        <div className={`w-full shrink-0 h-10 px-2.5 sm:px-3 border-b flex items-center justify-between z-20 backdrop-blur-md overflow-x-auto no-scrollbar gap-2 transition-colors select-none ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800'
            : 'bg-[#141414]/95 border-[#222222] text-white shadow-sm'
        }`}>
          {/* Left Controls: Ratio, Rotate, Add Text, Video Zoom */}
          <div className="flex items-center space-x-1.5 shrink-0 whitespace-nowrap">
            {/* Compact Aspect Ratio Selector */}
            <div className={`shrink-0 flex items-center space-x-1 px-1.5 py-0.5 rounded border text-xs ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-700'
                : 'bg-[#1E1E1E] border-[#333333] text-gray-200'
            }`}>
              <span className={isLight ? 'text-slate-500 text-[10px]' : 'text-gray-400 text-[10px]'}>Ratio:</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className={`bg-transparent font-semibold outline-none cursor-pointer text-xs ${
                  isLight ? 'text-amber-600' : 'text-[#FFD21F]'
                }`}
              >
                <option value="16:9" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>16:9</option>
                <option value="9:16" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>9:16 (TikTok)</option>
                <option value="1:1" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>1:1 (Square)</option>
                <option value="4:5" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>4:5</option>
                <option value="21:9" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>21:9</option>
                <option value="4:3" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>4:3</option>
                <option value="2:3" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>2:3</option>
                <option value="3:4" className={isLight ? 'bg-white text-black' : 'bg-[#1C1C1C] text-white'}>3:4</option>
              </select>
            </div>

            {/* Quick Rotate Video Button */}
            <button
              onClick={() => setRotate((rotate + 90) % 360)}
              className={`shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-semibold transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-amber-500'
                  : 'bg-[#1E1E1E] hover:bg-[#282828] text-white border-[#333333] hover:border-[#FFD21F]'
              }`}
              title="Rotate Video Clip 90°"
            >
              <RotateCw className={`w-3 h-3 ${isLight ? 'text-amber-500' : 'text-[#FFD21F]'}`} />
              <span className="hidden sm:inline">Rotate</span>
              <span className={`font-mono text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>({rotate}°)</span>
            </button>

            {/* Quick 1-Click Compact Add Text Button */}
            <button
              onClick={() => {
                const newText: TextOverlay = {
                  id: `text_${Date.now()}`,
                  text: 'Double Click to Edit',
                  start_time: Math.round(currentTime * 10) / 10,
                  end_time: Math.round(Math.min(duration || 10, currentTime + 3.5) * 10) / 10,
                  x: 50,
                  y: 50,
                  font_family: 'Inter',
                  font_size: 38,
                  font_weight: '700',
                  color: '#FFFFFF',
                  background_color: 'transparent',
                  shadow: true,
                  rotation: 0,
                  opacity: 1,
                  preset: 'title',
                };
                addTextOverlay(newText);
                setSelectedTextId(newText.id);
                setActiveTool('text');
              }}
              className={`shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-bold transition-all active:scale-95 ${
                isLight
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/10'
                  : 'bg-[#FFD21F] hover:bg-[#E6BC15] text-black border-[#FFD21F] shadow-amber-500/10'
              }`}
              title="Add Custom Text to Video Stage"
            >
              <Type className="w-3 h-3 stroke-[2.5]" />
              <span className="whitespace-nowrap">+ Text</span>
            </button>

            {/* Video Zoom & Fit Controls */}
            <div className={`shrink-0 flex items-center space-x-0.5 px-1.5 py-0.5 rounded border text-xs ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-[#1E1E1E] border-[#333333] text-white'
            }`}>
              <span className={`text-[9px] uppercase font-semibold mr-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Video:</span>
              <button
                onClick={() => setVideoScale(Math.max(0.25, Math.round((videoScale - 0.1) * 100) / 100))}
                className={`p-0.5 transition-colors ${isLight ? 'hover:text-amber-600 text-slate-500' : 'hover:text-[#FFD21F] text-gray-400'}`}
                title="Zoom Out Video (-)"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className={`font-mono font-bold text-[11px] px-0.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`}>
                {Math.round(videoScale * 100)}%
              </span>
              <button
                onClick={() => setVideoScale(Math.min(4.0, Math.round((videoScale + 0.1) * 100) / 100))}
                className={`p-0.5 transition-colors ${isLight ? 'hover:text-amber-600 text-slate-500' : 'hover:text-[#FFD21F] text-gray-400'}`}
                title="Zoom In Video (+)"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={resetVideoTransform}
                className={`ml-1 px-1 py-0.2 rounded text-[9px] font-semibold transition-colors ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-[#2A2A2A] hover:bg-[#353535] text-gray-300'
                }`}
                title="Reset Video Position & Fit (Double click stage)"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Right Controls: Screen Zoom Stepper & Fullscreen Toggle */}
          <div className="flex items-center space-x-1.5 shrink-0 whitespace-nowrap">
            {/* Screen Zoom Stepper */}
            <div className={`shrink-0 flex items-center space-x-0.5 px-1.5 py-0.5 rounded border text-xs ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-[#1E1E1E] border-[#333333] text-white'
            }`}>
              <span className={`text-[9px] uppercase font-semibold mr-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Canvas:</span>
              <button
                onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.25))}
                className={`p-0.5 transition-colors ${isLight ? 'hover:text-amber-600 text-slate-500' : 'hover:text-[#FFD21F] text-gray-400'}`}
                title="Zoom Out Screen (-)"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={() => setPreviewZoom(1.0)}
                className={`font-mono font-bold text-[11px] px-0.5 hover:underline ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`}
                title="Reset to Fit (100%)"
              >
                {previewZoom === 1.0 ? 'Fit' : `${Math.round(previewZoom * 100)}%`}
              </button>
              <button
                onClick={() => setPreviewZoom(Math.min(2.0, previewZoom + 0.25))}
                className={`p-0.5 transition-colors ${isLight ? 'hover:text-amber-600 text-slate-500' : 'hover:text-[#FFD21F] text-gray-400'}`}
                title="Zoom In Screen (+)"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {playbackRate !== 1 && (
              <div className={`border px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-[#FFD21F]/15 text-[#FFD21F] border-[#FFD21F]/30'
              }`}>
                {playbackRate}x
              </div>
            )}

            <button
              onClick={handleToggleFullscreen}
              className={`shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded border text-xs font-semibold transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-amber-500'
                  : 'bg-[#1E1E1E] hover:bg-[#282828] text-white border-[#333333] hover:border-[#FFD21F]'
              }`}
              title="View Full Screen Video"
            >
              <Maximize2 className={`w-3 h-3 ${isLight ? 'text-amber-500' : 'text-[#FFD21F]'}`} />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport Area */}
      <div className={`flex-1 w-full h-full flex items-center justify-center p-1 sm:p-6 overflow-hidden relative ${
        isFullscreen ? '!p-0' : ''
      }`}>

      {primaryClip ? (
        <div
          ref={stageRef}
          className={`relative ${aspectClass} ${getCanvasBackgroundClass()} ${
            isFullscreen ? 'rounded-none' : 'rounded-lg'
          } overflow-hidden shadow-2xl border border-[#242424] flex items-center justify-center transition-all video-stage-canvas`}
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'center center',
            transition: activeDrag ? 'none' : 'transform 0.15s ease-out',
          }}
          onWheel={(e) => {
            e.stopPropagation();
            // Mouse wheel zooms the video itself on hover
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            const nextScale = Math.max(0.25, Math.min(4.0, Math.round((videoScale + delta) * 100) / 100));
            setVideoScale(nextScale);
          }}
          onDoubleClick={(e) => {
            // Double click on canvas to add new text overlay directly at position
            if (!stageRef.current) return;
            const rect = stageRef.current.getBoundingClientRect();
            const clickX = Math.max(10, Math.min(90, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
            const clickY = Math.max(10, Math.min(90, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

            const newText: TextOverlay = {
              id: `text_${Date.now()}`,
              text: 'Double Click to Edit',
              start_time: Math.round(currentTime * 10) / 10,
              end_time: Math.round(Math.min(duration || 10, currentTime + 3.5) * 10) / 10,
              x: clickX,
              y: clickY,
              font_family: 'Inter',
              font_size: 38,
              font_weight: '700',
              color: '#FFFFFF',
              background_color: 'transparent',
              shadow: true,
              rotation: 0,
              opacity: 1,
              preset: 'title',
            };

            addTextOverlay(newText);
            setSelectedTextId(newText.id);
            setActiveTool('text');
          }}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            // Initiate video drag if clicking on stage background, video wrapper or main video element
            if (
              target === e.currentTarget ||
              target === videoRef.current ||
              target.classList.contains('video-draggable-wrapper')
            ) {
              setSelectedStickerId(null);
              setSelectedImageId(null);
              setSelectedVideoOverlayId(null);
              setSelectedTextId(null);
              setSelectedCaptionId(null);
              setActiveDrag({
                type: 'video',
                id: 'video',
                startX: e.clientX,
                startY: e.clientY,
                initialX: videoPosition.x,
                initialY: videoPosition.y,
              });
            }
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedStickerId(null);
              setSelectedImageId(null);
              setSelectedVideoOverlayId(null);
              setSelectedTextId(null);
              setSelectedCaptionId(null);
            }
          }}
        >
          {/* Main Video Element with Canvas Movement & Hover Zoom */}
          <div
            className={`w-full h-full flex items-center justify-center select-none video-draggable-wrapper ${
              activeDrag?.type === 'video' ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              transform: `translate(${videoPosition.x}px, ${videoPosition.y}px) scale(${videoScale})`,
              transformOrigin: 'center center',
              transition: activeDrag?.type === 'video' ? 'none' : 'transform 0.08s ease-out',
            }}
          >
            {/* Outgoing Previous Video Element During Transition Blend (Preloaded) */}
            {prevClip && (
              isImageMedia(prevClip) ? (
                <img
                  src={prevClip.url}
                  alt={prevClip.filename}
                  className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0 transition-opacity duration-150 ${
                    isTransitionActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: getFilterStyle(),
                    transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    opacity: isTransitionActive && clipTransition?.type === 'crossfade' ? (1 - transProgress) : (isTransitionActive ? 1 : 0),
                  }}
                />
              ) : (
                <video
                  src={`${prevClip.url}#t=${Math.max(0, (prevClip.trim_end || prevClip.duration) - 0.05)}`}
                  preload="auto"
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0 transition-opacity duration-150 ${
                    isTransitionActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: getFilterStyle(),
                    transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    opacity: isTransitionActive && clipTransition?.type === 'crossfade' ? (1 - transProgress) : (isTransitionActive ? 1 : 0),
                  }}
                />
              )
            )}

            {isImageMedia(currentClip) ? (
              <img
                key={currentClip?.id || 'main_img'}
                src={currentClip?.url || ''}
                alt={currentClip?.filename || 'clip'}
                className="w-full h-full object-contain pointer-events-auto transition-transform duration-75 select-none relative z-10"
                style={{
                  filter: getFilterStyle(),
                  transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) ${
                    isTransitionActive && !isPlaying && clipTransition?.type === 'zoom_in'
                      ? `scale(${0.65 + transProgress * 0.35})`
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'zoom_out'
                      ? `scale(${1.35 - transProgress * 0.35})`
                      : ''
                  }`,
                  opacity:
                    isTransitionActive && !isPlaying && clipTransition?.type === 'crossfade'
                      ? transProgress
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'fade_black'
                      ? transProgress < 0.5 ? 0 : (transProgress - 0.5) * 2
                      : isTransitionActive && !isPlaying && (clipTransition?.type === 'zoom_in' || clipTransition?.type === 'zoom_out')
                      ? Math.min(1, transProgress * 1.5)
                      : 1,
                  clipPath:
                    isTransitionActive && !isPlaying && clipTransition?.type === 'wipe_left'
                      ? `inset(0 ${(1 - transProgress) * 100}% 0 0)`
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'wipe_right'
                      ? `inset(0 0 0 ${(1 - transProgress) * 100}%)`
                      : undefined,
                  animation:
                    isTransitionActive && isPlaying && clipTransition?.type === 'crossfade'
                      ? `transitionCrossfade ${transDur}s ease-out forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'wipe_left'
                      ? `transitionWipeLeft ${transDur}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'wipe_right'
                      ? `transitionWipeRight ${transDur}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'zoom_in'
                      ? `transitionZoomIn ${transDur}s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'zoom_out'
                      ? `transitionZoomOut ${transDur}s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`
                      : undefined,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                key={currentClip?.id || 'main_video'}
                src={currentClip?.url || ''}
                preload="auto"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="w-full h-full object-contain pointer-events-auto transition-transform duration-75 select-none relative z-10"
                style={{
                  filter: getFilterStyle(),
                  transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) ${
                    isTransitionActive && !isPlaying && clipTransition?.type === 'zoom_in'
                      ? `scale(${0.65 + transProgress * 0.35})`
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'zoom_out'
                      ? `scale(${1.35 - transProgress * 0.35})`
                      : ''
                  }`,
                  opacity:
                    isTransitionActive && !isPlaying && clipTransition?.type === 'crossfade'
                      ? transProgress
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'fade_black'
                      ? transProgress < 0.5 ? 0 : (transProgress - 0.5) * 2
                      : isTransitionActive && !isPlaying && (clipTransition?.type === 'zoom_in' || clipTransition?.type === 'zoom_out')
                      ? Math.min(1, transProgress * 1.5)
                      : 1,
                  clipPath:
                    isTransitionActive && !isPlaying && clipTransition?.type === 'wipe_left'
                      ? `inset(0 ${(1 - transProgress) * 100}% 0 0)`
                      : isTransitionActive && !isPlaying && clipTransition?.type === 'wipe_right'
                      ? `inset(0 0 0 ${(1 - transProgress) * 100}%)`
                      : undefined,
                  animation:
                    isTransitionActive && isPlaying && clipTransition?.type === 'crossfade'
                      ? `transitionCrossfade ${transDur}s ease-out forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'wipe_left'
                      ? `transitionWipeLeft ${transDur}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'wipe_right'
                      ? `transitionWipeRight ${transDur}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'zoom_in'
                      ? `transitionZoomIn ${transDur}s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`
                      : isTransitionActive && isPlaying && clipTransition?.type === 'zoom_out'
                      ? `transitionZoomOut ${transDur}s cubic-bezier(0.2, 0.9, 0.3, 1) forwards`
                      : undefined,
                }}
              />
            )}

            {/* White Flash Transition Overlay */}
            {isTransitionActive && clipTransition?.type === 'flash' && (
              <div
                className="absolute inset-0 bg-white pointer-events-none z-30 transition-none"
                style={{
                  opacity: !isPlaying ? Math.max(0, (1 - transProgress) * 1.5) : undefined,
                  animation: isPlaying ? `transitionFlash ${transDur}s cubic-bezier(0.1, 0.9, 0.2, 1) forwards` : undefined,
                }}
              />
            )}

            {/* Fade to Black Transition Dip Overlay */}
            {isTransitionActive && clipTransition?.type === 'fade_black' && (
              <div
                className="absolute inset-0 bg-black pointer-events-none z-30 transition-none"
                style={{
                  opacity: !isPlaying ? Math.sin((1 - transProgress) * Math.PI) : undefined,
                  animation: isPlaying ? `transitionFadeBlack ${transDur}s ease-in-out forwards` : undefined,
                }}
              />
            )}
          </div>

          {/* Vignette Overlay */}
          {filters.vignette && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85), inset 0 0 40px rgba(0,0,0,0.95)',
              }}
            />
          )}

          {/* Letterbox Bars (Cinematic 2.35:1) */}
          {filters.letterbox && (
            <>
              <div className="absolute top-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black pointer-events-none z-10" />
            </>
          )}

          {/* Image Overlays (Draggable & Rotatable) */}
          {activeImageOverlays.map((img) => {
            const isSelected = selectedImageId === img.id;

            return (
              <div
                key={img.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedImageId(img.id);
                  setSelectedStickerId(null);
                  setSelectedVideoOverlayId(null);
                  setSelectedTextId(null);
                  setSelectedCaptionId(null);
                  setActiveDrag({
                    type: 'image',
                    id: img.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: img.x,
                    initialY: img.y,
                  });
                }}
                className={`absolute select-none transition-transform ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-2 ring-offset-black z-20' : 'hover:ring-1 hover:ring-[#FFD21F]/60 z-15'
                } ${activeDrag?.id === img.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: `${img.x}%`,
                  top: `${img.y}%`,
                  transform: `translate(-50%, -50%) rotate(${img.rotation}deg) scale(${img.scale})`,
                  opacity: img.opacity,
                  mixBlendMode: img.blend_mode,
                  boxShadow: img.shadow ? '0 10px 25px rgba(0,0,0,0.7)' : 'none',
                  borderRadius: `${img.border_radius}px`,
                }}
              >
                {/* On-Canvas Image Rotation Handle */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-black/90 border border-[#FFD21F] rounded-lg px-2 py-0.5 shadow-xl text-[10px] text-white z-30"
                  >
                    <button
                      onClick={() => updateImageOverlay(img.id, { rotation: (img.rotation - 15) % 360 })}
                      className="p-1 hover:text-[#FFD21F] transition-colors"
                      title="Rotate Left 15°"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-[#FFD21F] font-bold px-0.5">{img.rotation}°</span>
                    <button
                      onClick={() => updateImageOverlay(img.id, { rotation: (img.rotation + 15) % 360 })}
                      className="p-1 hover:text-[#FFD21F] transition-colors"
                      title="Rotate Right 15°"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateImageOverlay(img.id, { rotation: 0 })}
                      className="text-[9px] text-gray-400 hover:text-white px-1 ml-0.5 rounded bg-[#202020]"
                      title="Reset Rotation"
                    >
                      0°
                    </button>
                  </div>
                )}

                <img
                  src={img.url}
                  alt={img.filename}
                  draggable={false}
                  className="max-w-[240px] max-h-[240px] object-contain select-none pointer-events-none"
                  style={{
                    borderRadius: `${img.border_radius}px`,
                  }}
                />
              </div>
            );
          })}

          {/* Video Overlays (Picture-in-Picture / Overlaid Videos) */}
          {activeVideoOverlays.map((ov) => {
            const isSelected = selectedVideoOverlayId === ov.id;

            return (
              <div
                key={ov.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedVideoOverlayId(ov.id);
                  setSelectedImageId(null);
                  setSelectedStickerId(null);
                  setSelectedTextId(null);
                  setSelectedCaptionId(null);
                  setActiveDrag({
                    type: 'video_overlay',
                    id: ov.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: ov.x,
                    initialY: ov.y,
                  });
                }}
                className={`absolute select-none transition-transform ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-2 ring-offset-black z-25' : 'hover:ring-1 hover:ring-[#FFD21F]/60 z-18'
                } ${activeDrag?.id === ov.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: `${ov.x}%`,
                  top: `${ov.y}%`,
                  transform: `translate(-50%, -50%) rotate(${ov.rotation}deg) scale(${ov.scale})`,
                  opacity: ov.opacity,
                  boxShadow: ov.shadow ? '0 10px 25px rgba(0,0,0,0.7)' : 'none',
                  borderRadius: `${ov.border_radius}px`,
                }}
              >
                {/* On-Canvas Video Overlay Rotation Handle */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-black/90 border border-[#FFD21F] rounded-lg px-2 py-0.5 shadow-xl text-[10px] text-white z-30 whitespace-nowrap"
                  >
                    <button
                      onClick={() => updateVideoOverlay(ov.id, { rotation: (ov.rotation - 15) % 360 })}
                      className="p-1 hover:text-[#FFD21F] transition-colors"
                      title="Rotate Left 15°"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-[#FFD21F] font-bold px-0.5">{ov.rotation}°</span>
                    <button
                      onClick={() => updateVideoOverlay(ov.id, { rotation: (ov.rotation + 15) % 360 })}
                      className="p-1 hover:text-[#FFD21F] transition-colors"
                      title="Rotate Right 15°"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateVideoOverlay(ov.id, { rotation: 0 })}
                      className="text-[9px] text-gray-400 hover:text-white px-1 ml-0.5 rounded bg-[#202020]"
                      title="Reset Rotation"
                    >
                      0°
                    </button>
                  </div>
                )}

                {/* Chroma Key / Background Removed / Blend Mode Player */}
                <ChromaKeyOverlayPlayer
                  overlay={ov}
                  isPlaying={isPlaying}
                  playbackRate={playbackRate}
                  onRef={(el) => {
                    if (el) videoOverlayRefs.current[ov.id] = el;
                    else delete videoOverlayRefs.current[ov.id];
                  }}
                />

                <div className="absolute bottom-1 left-1.5 px-1 py-0.5 bg-black/75 rounded text-[8px] font-bold text-[#FFD21F] pointer-events-none uppercase tracking-wide">
                  {ov.chroma_key_enabled ? 'CHROMA' : ov.blend_mode && ov.blend_mode !== 'normal' ? ov.blend_mode.toUpperCase() : 'PIP'}
                </div>
              </div>
            );
          })}

          {/* Sticker & Shape Overlays */}
          {activeStickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;
            const animClass = getStickerAnimClass(sticker.animation);

            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedStickerId(sticker.id);
                  setSelectedImageId(null);
                  setSelectedVideoOverlayId(null);
                  setSelectedTextId(null);
                  setSelectedCaptionId(null);
                  setActiveDrag({
                    type: 'sticker',
                    id: sticker.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: sticker.x,
                    initialY: sticker.y,
                  });
                }}
                className={`absolute pointer-events-auto p-1 rounded-lg transition-transform select-none ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-1 ring-offset-black z-25' : 'hover:ring-1 hover:ring-[#FFD21F]/50 z-16'
                } ${activeDrag?.id === sticker.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                  opacity: sticker.opacity,
                }}
              >
                <div className={`${animClass} select-none flex items-center justify-center`}>
                  {sticker.type === 'emoji' ? (
                    <span className="text-4xl leading-none filter drop-shadow-lg">{sticker.content}</span>
                  ) : sticker.type === 'shape' || !!sticker.shape_type || ['rectangle', 'rounded_rect', 'circle', 'pill', 'arrow_right', 'arrow_left', 'arrow_up', 'arrow_down', 'star', 'heart', 'speech_bubble'].includes(sticker.content) ? (
                    renderShapeSVG(sticker)
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-lg bg-[#FFD21F] text-black">
                      {sticker.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Subtitle / Caption Overlay (Freeform 2D Draggable on Canvas) */}
          {activeCaption && (() => {
            const currentPosX = activeCaption.style?.position_x ?? globalCaptionStyle.position_x ?? 50;
            const currentPosY = activeCaption.style?.position_y ?? globalCaptionStyle.position_y ?? 80;

            return (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedCaptionId(activeCaption.id);
                  setSelectedTextId(null);
                  setSelectedStickerId(null);
                  setSelectedImageId(null);
                  setSelectedVideoOverlayId(null);
                  setActiveDrag({
                    type: 'caption',
                    id: activeCaption.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: currentPosX,
                    initialY: currentPosY,
                  });
                }}
                className={`absolute pointer-events-auto z-20 select-none ${
                  activeDrag?.type === 'caption'
                    ? 'cursor-grabbing'
                    : 'cursor-grab hover:ring-1 hover:ring-[#FFD21F]/60'
                } ${selectedCaptionId === activeCaption.id ? 'ring-1 ring-[#FFD21F]/80' : ''}`}
                style={{
                  left: `${currentPosX}%`,
                  top: `${currentPosY}%`,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '90%',
                }}
              >
                <div
                  className={`px-4 py-2 rounded transition-all text-center leading-relaxed relative group ${
                    globalCaptionStyle.animation === 'pop'
                      ? 'anim-pop'
                      : globalCaptionStyle.animation === 'bounce'
                      ? 'anim-bounce'
                      : globalCaptionStyle.animation === 'slide_up'
                      ? 'anim-slide-up'
                      : ''
                  }`}
                  style={{
                    fontFamily: activeCaption.style?.font_family || globalCaptionStyle.font_family,
                    fontSize: `${Math.max(4, (activeCaption.style?.font_size || globalCaptionStyle.font_size) * 0.8)}px`,
                    fontWeight: activeCaption.style?.font_weight || globalCaptionStyle.font_weight,
                    color: activeCaption.style?.color || globalCaptionStyle.color,
                    backgroundColor:
                      activeCaption.style?.background_color ||
                      globalCaptionStyle.background_color ||
                      (isLight ? 'rgba(0, 0, 0, 0.78)' : (globalCaptionStyle.preset === 'creator' ? 'rgba(0, 0, 0, 0.75)' : 'transparent')),
                    borderRadius: (activeCaption.style?.background_color || globalCaptionStyle.background_color || isLight) ? '10px' : '4px',
                    padding: (activeCaption.style?.background_color || globalCaptionStyle.background_color || isLight) ? '4px 12px' : '2px 4px',
                    textShadow:
                      globalCaptionStyle.shadow
                        ? '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)'
                        : 'none',
                  }}
                >
                  {/* Drag Handle Indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-[#FFD21F] flex items-center space-x-1 pointer-events-none whitespace-nowrap shadow">
                    <Move className="w-2.5 h-2.5" />
                    <span>Drag anywhere to position</span>
                  </div>

                  {/* Word-by-Word Animation Highlight */}
                  {globalCaptionStyle.word_by_word && activeCaption.words && activeCaption.words.length > 0 ? (
                    activeCaption.words.map((w, idx) => {
                      const isSpoken = currentTime >= w.start && currentTime <= w.end;
                      return (
                        <span
                          key={idx}
                          className={`mx-1 transition-colors duration-75 ${isSpoken ? 'word-active' : ''}`}
                          style={{
                            color: isSpoken ? (globalCaptionStyle.highlight_color || '#FFD21F') : undefined,
                          }}
                        >
                          {w.word}
                        </span>
                      );
                    })
                  ) : globalCaptionStyle.preset === 'yellow_highlight' ? (
                    (() => {
                      const words = activeCaption.text.split(' ');
                      if (words.length <= 1) {
                        return <span style={{ color: globalCaptionStyle.highlight_color || '#FFD21F' }}>{activeCaption.text}</span>;
                      }
                      const body = words.slice(0, -1).join(' ');
                      const lastWord = words[words.length - 1];
                      return (
                        <span>
                          {body}{' '}
                          <span style={{ color: globalCaptionStyle.highlight_color || '#FFD21F', fontWeight: 800 }}>
                            {lastWord}
                          </span>
                        </span>
                      );
                    })()
                  ) : (
                    <span>{activeCaption.text}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Active Custom Text Overlays (Draggable on Canvas) */}
          {activeTextOverlays.map((text) => {
            const isSelected = selectedTextId === text.id;

            return (
              <div
                key={text.id}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(text.id);
                  setSelectedCaptionId(null);
                  setSelectedStickerId(null);
                  setSelectedImageId(null);
                  setSelectedVideoOverlayId(null);
                  setActiveDrag({
                    type: 'text',
                    id: text.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    initialX: text.x,
                    initialY: text.y,
                  });
                }}
                className={`absolute pointer-events-auto select-none font-bold z-20 transition-all ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-2 ring-offset-black' : 'hover:ring-1 hover:ring-[#FFD21F]/60'
                } ${activeDrag?.id === text.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: `${text.x}%`,
                  top: `${text.y}%`,
                  transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                  fontFamily: text.font_family,
                  fontSize: `${text.font_size}px`,
                  color: text.color,
                  backgroundColor: text.background_color !== 'transparent' ? text.background_color : undefined,
                  opacity: text.opacity,
                  textShadow: text.shadow ? '0 2px 6px rgba(0,0,0,0.8)' : 'none',
                  padding: text.background_color !== 'transparent' ? '4px 12px' : '0',
                  borderRadius: '4px',
                }}
              >
                {text.text}
              </div>
            );
          })}

          {/* Floating Player HUD in Fullscreen Mode */}
          {isFullscreen && showControlsInFullscreen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#161616]/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-[#333333] shadow-2xl flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-[#FFD21F] text-black flex items-center justify-center font-bold"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </button>

              <span className="font-mono text-xs text-white">
                {currentTime.toFixed(1)}s / {(duration || 10).toFixed(1)}s
              </span>

              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-48 accent-[#FFD21F]"
              />

              <button
                onClick={handleToggleFullscreen}
                className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-[#252525]"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-5 h-5 text-[#FFD21F]" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md border border-dashed border-[#333333] hover:border-[#FFD21F]/50 rounded-2xl bg-[#141414] transition-colors group">
          <div className="w-16 h-16 rounded-2xl bg-[#1B1B1B] border border-[#333333] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-[#FFD21F] transition-all">
            <Film className="w-8 h-8 text-[#FFD21F]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Video Loaded</h3>
          <p className="text-sm text-[#A0A0A0] mb-6 leading-relaxed">
            Upload video footage or images to edit, convert video to audio, add stickers, adjust color grades, and export.
          </p>
          <button
            onClick={onTriggerUpload}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-sm transition-transform active:scale-95 shadow-lg shadow-amber-500/10"
          >
            <Upload className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Upload Video or Image</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
