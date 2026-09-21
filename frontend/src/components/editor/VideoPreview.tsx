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
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

interface VideoPreviewProps {
  onTriggerUpload: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ onTriggerUpload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInFullscreen, setShowControlsInFullscreen] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

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
    filters,
    rotate,
    flipH,
    flipV,
    captions,
    globalCaptionStyle,
    textOverlays,
    stickerOverlays,
    imageOverlays,
    audioTracks,
    selectedStickerId,
    selectedImageId,
    setSelectedCaptionId,
    setSelectedStickerId,
    setSelectedImageId,
  } = useEditorStore();

  const primaryClip = clips[0];
  const effectiveVideoVolume = isMuted ? 0 : (videoVolume ?? volume);

  // Sync play/pause with store for video and all audio tracks
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => setIsPlaying(false));
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
  }, [isPlaying]);

  // Sync playback rate & volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.volume = effectiveVideoVolume;
      videoRef.current.muted = isMuted;
    }

    // Sync audio tracks playbackRate and volume
    audioTracks.forEach((track) => {
      const audioEl = audioRefs.current[track.id];
      if (!audioEl) return;
      audioEl.playbackRate = playbackRate;
      audioEl.volume = track.is_muted ? 0 : track.volume;
      audioEl.muted = track.is_muted;
    });
  }, [playbackRate, effectiveVideoVolume, isMuted, audioTracks]);

  // Sync seek position when currentTime changes externally
  useEffect(() => {
    if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.25) {
        videoRef.current.currentTime = currentTime;
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
  }, [currentTime, audioTracks]);

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
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (!duration || duration <= 0) {
      setDuration(videoRef.current.duration);
    }
    // Auto-detect portrait videos and adapt frame
    if (videoRef.current.videoHeight > videoRef.current.videoWidth && aspectRatio === '16:9') {
      setAspectRatio('9:16');
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
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

    // Temperature & Tint adjustment via sepia and hue-rotate
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

    // Preset LUTs
    switch (filters.preset) {
      case 'grayscale':
        parts.push('grayscale(1)');
        break;
      case 'sepia':
        parts.push('sepia(0.8)');
        break;
      case 'warm':
        parts.push('sepia(0.25) saturate(1.3)');
        break;
      case 'cool':
        parts.push('hue-rotate(25deg) saturate(1.1)');
        break;
      case 'vintage':
        parts.push('sepia(0.4) contrast(1.15) brightness(0.95)');
        break;
      case 'cinematic':
        parts.push('contrast(1.2) saturate(1.15)');
        break;
      case 'teal_orange':
        parts.push('contrast(1.2) saturate(1.3) hue-rotate(15deg)');
        break;
      case 'cyberpunk':
        parts.push('contrast(1.3) saturate(1.8) hue-rotate(280deg)');
        break;
      case 'golden_hour':
        parts.push('sepia(0.35) saturate(1.4) brightness(1.05)');
        break;
      case 'moody':
        parts.push('contrast(1.25) saturate(0.8) brightness(0.9)');
        break;
      case 'retro_90s':
        parts.push('sepia(0.25) saturate(1.15) contrast(0.95)');
        break;
      default:
        break;
    }

    return parts.join(' ');
  };

  // Aspect ratio container classes
  const aspectClass = isFullscreen
    ? 'w-full h-full max-h-screen max-w-screen'
    : {
        '16:9': 'aspect-video max-w-full max-h-[85vh]',
        '9:16': 'aspect-[9/16] h-full max-h-[75vh]',
        '1:1': 'aspect-square max-w-full max-h-[75vh]',
        '4:5': 'aspect-[4/5] max-w-full max-h-[75vh]',
        'custom': 'aspect-video max-w-full max-h-[85vh]',
      }[aspectRatio] || 'aspect-video max-w-full max-h-[85vh]';

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
      className={`relative w-full h-full flex items-center justify-center p-3 sm:p-6 bg-[#0D0D0D] overflow-hidden select-none ${
        isFullscreen ? '!p-0 !bg-black' : ''
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

      {/* Aspect Ratio & Fullscreen Quick Controls */}
      {primaryClip && (
        <>
          {/* Top Left: Aspect Ratio */}
          {!isFullscreen && (
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-[#181818]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#333333] shadow-lg text-xs">
              <span className="text-[#888888]">Ratio:</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="bg-transparent text-[#FFD21F] font-semibold outline-none cursor-pointer"
              >
                <option value="16:9" className="bg-[#1C1C1C] text-white">16:9 (Landscape)</option>
                <option value="9:16" className="bg-[#1C1C1C] text-white">9:16 (TikTok / Reels)</option>
                <option value="1:1" className="bg-[#1C1C1C] text-white">1:1 (Square)</option>
                <option value="4:5" className="bg-[#1C1C1C] text-white">4:5 (Portrait)</option>
              </select>
            </div>
          )}

          {/* Top Right: Full Screen Toggle Button */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
            {playbackRate !== 1 && (
              <div className="bg-[#FFD21F]/15 text-[#FFD21F] border border-[#FFD21F]/30 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                {playbackRate}x
              </div>
            )}
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center space-x-1.5 bg-[#181818]/90 hover:bg-[#252525] text-white px-2.5 py-1 rounded-lg border border-[#333333] hover:border-[#FFD21F] shadow-lg text-xs font-semibold transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'View Full Screen Video'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {primaryClip ? (
        <div
          className={`relative ${aspectClass} bg-black ${
            isFullscreen ? 'rounded-none' : 'rounded-lg'
          } overflow-hidden shadow-2xl border border-[#242424] flex items-center justify-center`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedStickerId(null);
              setSelectedImageId(null);
            }
          }}
        >
          {/* Main Video Element */}
          <video
            ref={videoRef}
            key={primaryClip.url}
            src={primaryClip.url}
            preload="auto"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="w-full h-full object-contain pointer-events-none transition-transform duration-100"
            style={{
              filter: getFilterStyle(),
              transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
            }}
          />

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

          {/* Image Overlays */}
          {activeImageOverlays.map((img) => {
            const isSelected = selectedImageId === img.id;

            return (
              <div
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageId(img.id);
                  setSelectedStickerId(null);
                }}
                className={`absolute cursor-pointer transition-transform ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-2 ring-offset-black' : 'hover:ring-1 hover:ring-[#FFD21F]/60'
                }`}
                style={{
                  left: `${img.x}%`,
                  top: `${img.y}%`,
                  transform: `translate(-50%, -50%) rotate(${img.rotation}deg) scale(${img.scale})`,
                  opacity: img.opacity,
                  mixBlendMode: img.blend_mode,
                  boxShadow: img.shadow ? '0 10px 25px rgba(0,0,0,0.7)' : 'none',
                  borderRadius: `${img.border_radius}px`,
                  zIndex: 15,
                }}
              >
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

          {/* Sticker Overlays */}
          {activeStickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;
            const animClass = getStickerAnimClass(sticker.animation);

            return (
              <div
                key={sticker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStickerId(sticker.id);
                  setSelectedImageId(null);
                }}
                className={`absolute cursor-pointer p-1 rounded-lg transition-transform ${
                  isSelected ? 'ring-2 ring-[#FFD21F] ring-offset-1 ring-offset-black' : 'hover:ring-1 hover:ring-[#FFD21F]/50'
                }`}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                  opacity: sticker.opacity,
                  zIndex: 16,
                }}
              >
                <div className={`${animClass} select-none flex items-center justify-center`}>
                  {sticker.type === 'emoji' ? (
                    <span className="text-4xl leading-none filter drop-shadow-lg">{sticker.content}</span>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-lg bg-[#FFD21F] text-black">
                      {sticker.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Subtitle / Caption Overlay */}
          {activeCaption && (
            <div
              onClick={() => setSelectedCaptionId(activeCaption.id)}
              className="absolute w-full px-6 flex justify-center pointer-events-auto cursor-pointer z-20"
              style={{
                top: `${activeCaption.style?.position_y ?? globalCaptionStyle.position_y}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <div
                className={`max-w-[90%] px-4 py-2 rounded transition-all text-center leading-relaxed ${
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
                  fontSize: `${Math.max(16, (activeCaption.style?.font_size || globalCaptionStyle.font_size) * 0.8)}px`,
                  fontWeight: activeCaption.style?.font_weight || globalCaptionStyle.font_weight,
                  color: activeCaption.style?.color || globalCaptionStyle.color,
                  backgroundColor:
                    activeCaption.style?.background_color ||
                    (globalCaptionStyle.preset === 'creator' ? 'rgba(0, 0, 0, 0.75)' : 'transparent'),
                  textShadow:
                    globalCaptionStyle.shadow
                      ? '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)'
                      : 'none',
                }}
              >
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
          )}

          {/* Active Custom Text Overlays */}
          {activeTextOverlays.map((text) => (
            <div
              key={text.id}
              className="absolute pointer-events-none select-none font-bold z-20"
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
          ))}

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
  );
};
