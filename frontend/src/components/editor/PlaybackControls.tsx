import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Gauge,
  Sliders,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Tooltip } from '../common/Tooltip';

export const PlaybackControls: React.FC = () => {
  const {
    currentTime,
    duration,
    isPlaying,
    setCurrentTime,
    setIsPlaying,
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
    videoVolume,
    setVideoVolume,
    isMuted,
    setIsMuted,
    theme,
  } = useEditorStore();

  const isLight = theme === 'light';
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowVolumePopover(false);
      }
    };
    if (showVolumePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVolumePopover]);

  const formatTimecode = (seconds: number, compact: boolean = false) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (compact) {
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    const millis = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const handleStep = (delta: number) => {
    setCurrentTime(Math.max(0, Math.min(duration, currentTime + delta)));
  };

  const handleRestart = () => {
    setCurrentTime(0);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentVol = isMuted ? 0 : (videoVolume ?? volume);

  return (
    <div className={`h-12 border-t border-b px-2 sm:px-4 flex items-center justify-between select-none relative overflow-visible z-20 ${
      isLight ? 'bg-white border-[#E2E8F0] text-slate-800' : 'bg-[#141414] border-[#242424] text-white'
    }`}>
      {/* Left: Timecode and Restart */}
      <div className="flex items-center space-x-1 sm:space-x-2.5 flex-shrink-0">
        <Tooltip content="Restart to beginning">
          <button
            onClick={handleRestart}
            className={`p-1 sm:p-1.5 rounded transition-colors ${
              isLight ? 'text-slate-500 hover:text-black hover:bg-slate-100' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className={`font-mono text-[11px] sm:text-xs flex items-center space-x-1 ${
          isLight ? 'text-slate-500' : 'text-[#A0A0A0]'
        }`}>
          {/* Desktop full timecode */}
          <span className={`hidden md:inline font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatTimecode(currentTime, false)}
          </span>
          {/* Mobile compact timecode */}
          <span className={`md:hidden font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatTimecode(currentTime, true)}
          </span>
          <span>/</span>
          <span className="hidden md:inline">{formatTimecode(duration, false)}</span>
          <span className="md:hidden">{formatTimecode(duration, true)}</span>
        </div>
      </div>

      {/* Center: Play/Pause, Step Back/Forward */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <Tooltip content="Step backward 1s (Arrow Left)">
          <button
            onClick={() => handleStep(-1)}
            className="p-1.5 sm:p-2 rounded text-[#A0A0A0] hover:text-white hover:bg-[#1F1F1F] transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Play/Pause (Space)">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFD21F] hover:bg-[#E6BC15] text-black flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-amber-500/10 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black ml-0.5" />
            )}
          </button>
        </Tooltip>

        <Tooltip content="Step forward 1s (Arrow Right)">
          <button
            onClick={() => handleStep(1)}
            className={`p-1.5 sm:p-2 rounded transition-colors ${
              isLight ? 'text-slate-500 hover:text-black hover:bg-slate-100' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Right: Speed, Volume, Fullscreen */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        {/* Speed Selector */}
        <div className="relative flex items-center">
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className={`text-[10px] sm:text-xs font-mono font-semibold rounded px-1 sm:px-2 py-1 focus:outline-none cursor-pointer transition-colors max-w-[65px] sm:max-w-none truncate border ${
              isLight
                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-amber-500'
                : 'bg-[#1B1B1B] text-white border-[#333333] hover:border-[#FFD21F]'
            }`}
            title="Playback Speed"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
            <option value={3}>3.0x</option>
            <option value={5}>5.0x</option>
            <option value={10}>10x</option>
          </select>
        </div>

        {/* Volume Controls (Responsive: popover on mobile, slider on desktop) */}
        <div className="relative flex items-center" ref={popoverRef}>
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setShowVolumePopover(!showVolumePopover);
              } else {
                setIsMuted(!isMuted);
              }
            }}
            className={`p-1 sm:p-1.5 rounded transition-colors ${
              isLight ? 'text-slate-500 hover:text-black hover:bg-slate-100' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1F1F1F]'
            }`}
            title={isMuted ? 'Unmute' : 'Volume Controls'}
          >
            {isMuted || currentVol === 0 ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF8A00]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Desktop inline slider */}
          <div className="hidden md:flex items-center space-x-1.5">
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={currentVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVideoVolume(val);
                setVolume(val);
                if (isMuted) setIsMuted(false);
              }}
              className="w-14 sm:w-16 h-1 accent-[#FFD21F] cursor-pointer"
              title={`Volume: ${Math.round(currentVol * 100)}%${currentVol > 1.0 ? ' (Boosted)' : ''}`}
            />
            <span
              className={`text-[10px] font-mono min-w-[32px] ${
                currentVol > 1.0
                  ? isLight ? 'text-amber-600 font-bold' : 'text-[#FFD21F] font-bold'
                  : isLight ? 'text-slate-500' : 'text-gray-400'
              }`}
            >
              {Math.round(currentVol * 100)}%
            </span>
          </div>

          {/* Mobile Tap Popover for Volume Slider */}
          {showVolumePopover && (
            <div className={`md:hidden absolute bottom-12 right-0 z-50 border p-3 rounded-xl shadow-2xl flex flex-col items-center space-y-2 w-36 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1A1A1A] border-[#333333] text-white'
            }`}>
              <div className="flex items-center justify-between w-full text-[10px]">
                <span className={isLight ? 'text-slate-600' : 'text-gray-300'}>Volume</span>
                <span className={`font-mono font-bold ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`}>
                  {Math.round(currentVol * 100)}%
                  {currentVol > 1.0 && <span className="text-[8px] ml-0.5 text-amber-500 font-normal">BOOST</span>}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={currentVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVideoVolume(val);
                  setVolume(val);
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full accent-[#FFD21F]"
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-full py-1 text-[10px] rounded transition-colors ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#252525] text-gray-200 hover:text-white'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <Tooltip content="Toggle Fullscreen">
          <button
            onClick={handleToggleFullscreen}
            className={`p-1 sm:p-1.5 rounded transition-colors ${
              isLight ? 'text-slate-500 hover:text-black hover:bg-slate-100' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
