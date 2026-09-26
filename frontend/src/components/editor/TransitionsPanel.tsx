import React, { useState } from 'react';
import { ArrowLeftRight, Clock, Sparkles, Zap, Eye, MoveHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Transition } from '../../types/editor';

interface TransitionOption {
  type: Transition['type'];
  label: string;
  description: string;
  icon: React.ElementType;
}

const TRANSITIONS: TransitionOption[] = [
  {
    type: 'none',
    label: 'None',
    description: 'Straight cut between clips',
    icon: ArrowLeftRight,
  },
  {
    type: 'crossfade',
    label: 'Crossfade',
    description: 'Smooth dissolve blend',
    icon: Sparkles,
  },
  {
    type: 'fade_black',
    label: 'Fade to Black',
    description: 'Cinematic dip to darkness',
    icon: Eye,
  },
  {
    type: 'wipe_left',
    label: 'Wipe Left',
    description: 'Horizontal push transition',
    icon: MoveHorizontal,
  },
  {
    type: 'wipe_right',
    label: 'Wipe Right',
    description: 'Reverse horizontal sweep',
    icon: MoveHorizontal,
  },
  {
    type: 'zoom_in',
    label: 'Zoom In',
    description: 'Dynamic forward punch zoom',
    icon: ZoomIn,
  },
  {
    type: 'zoom_out',
    label: 'Zoom Out',
    description: 'Expansive pull-back effect',
    icon: ZoomOut,
  },
  {
    type: 'flash',
    label: 'White Flash',
    description: 'High-energy hype flash cut',
    icon: Zap,
  },
];

export const TransitionsPanel: React.FC = () => {
  const {
    clips,
    selectedClipId,
    setSelectedClipId,
    transition,
    setTransition,
    updateClipTransition,
    setCurrentTime,
    setIsPlaying,
  } = useEditorStore();

  const [targetMode, setTargetMode] = useState<'all' | 'last' | 'selected'>('last');

  const activeClip =
    targetMode === 'selected'
      ? clips.find((c) => c.id === selectedClipId) || clips[clips.length - 1]
      : targetMode === 'last'
      ? clips[clips.length - 1]
      : null;

  const currentType = (activeClip?.transition?.type) || transition?.type || 'none';
  const currentDuration = (activeClip?.transition?.duration) ?? transition?.duration ?? 0.5;

  const handleSelectTransition = (type: Transition['type']) => {
    const newTrans: Transition = {
      type,
      duration: currentDuration,
    };

    if (activeClip && (targetMode === 'selected' || targetMode === 'last')) {
      updateClipTransition(activeClip.id, newTrans);
      if (type !== 'none') {
        const previewTime = Math.max(0, (activeClip.start_time ?? 0) - 0.2);
        setCurrentTime(previewTime);
        setIsPlaying(true);
      }
    } else {
      setTransition(newTrans);
      clips.forEach((c) => updateClipTransition(c.id, newTrans));
      if (type !== 'none' && clips.length > 1) {
        const previewTime = Math.max(0, (clips[1].start_time ?? 0) - 0.2);
        setCurrentTime(previewTime);
        setIsPlaying(true);
      }
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseFloat(e.target.value);
    const newTrans: Transition = {
      type: currentType,
      duration,
    };

    if (activeClip && (targetMode === 'selected' || targetMode === 'last')) {
      updateClipTransition(activeClip.id, newTrans);
    } else {
      setTransition(newTrans);
      clips.forEach((c) => updateClipTransition(c.id, newTrans));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161616] select-none">
      {/* Header */}
      <div className="h-12 border-b border-[#242424] px-4 flex items-center justify-between bg-[#141414]">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#FFD21F]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Transitions</span>
        </div>
        {currentType !== 'none' && (
          <span className="text-[10px] font-semibold bg-[#FFD21F]/15 text-[#FFD21F] px-2 py-0.5 rounded border border-[#FFD21F]/30">
            {TRANSITIONS.find((t) => t.type === currentType)?.label} Active
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Clip Section Target Selector */}
        {clips.length > 1 && (
          <div className="p-3 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Apply Transition To:</span>
              <span className="text-[10px] text-[#FFD21F] font-mono font-bold">
                {clips.length} Sections
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => setTargetMode('last')}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  targetMode === 'last'
                    ? 'bg-[#FFD21F] text-black font-bold shadow'
                    : 'bg-[#242424] text-gray-300 hover:text-white'
                }`}
              >
                Last Section
              </button>
              <button
                onClick={() => {
                  setTargetMode('selected');
                  if (!selectedClipId && clips.length > 0) {
                    setSelectedClipId(clips[clips.length - 1].id);
                  }
                }}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  targetMode === 'selected'
                    ? 'bg-[#FFD21F] text-black font-bold shadow'
                    : 'bg-[#242424] text-gray-300 hover:text-white'
                }`}
              >
                Selected
              </button>
              <button
                onClick={() => setTargetMode('all')}
                className={`py-1.5 px-2 rounded-lg font-medium text-center transition-all ${
                  targetMode === 'all'
                    ? 'bg-[#FFD21F] text-black font-bold shadow'
                    : 'bg-[#242424] text-gray-300 hover:text-white'
                }`}
              >
                All Clips
              </button>
            </div>

            {targetMode === 'selected' && (
              <div className="pt-1">
                <select
                  value={selectedClipId || clips[0]?.id}
                  onChange={(e) => setSelectedClipId(e.target.value)}
                  className="w-full bg-[#242424] text-xs text-white border border-[#383838] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FFD21F]"
                >
                  {clips.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      Section {idx + 1}: {c.filename} ({(c.trim_start || 0).toFixed(1)}s - {(c.trim_end || c.duration).toFixed(1)}s)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        {/* Transition Duration Control */}
        {currentType !== 'none' && (
          <div className="p-3 bg-[#1B1B1B] border border-[#2A2A2A] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-gray-300">
                <Clock className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span className="font-medium">Transition Duration</span>
              </div>
              <span className="font-mono text-[#FFD21F] font-bold">{currentDuration.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={currentDuration}
              onChange={handleDurationChange}
              className="w-full accent-[#FFD21F] cursor-pointer bg-[#2A2A2A] h-1.5 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0.2s (Snappy)</span>
              <span>1.0s (Normal)</span>
              <span>2.0s (Slow)</span>
            </div>
          </div>
        )}

        {/* Transition Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Available Presets</span>
          <div className="grid grid-cols-2 gap-2.5">
            {TRANSITIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentType === opt.type;

              return (
                <button
                  key={opt.type}
                  onClick={() => handleSelectTransition(opt.type)}
                  className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-[#222222] border-[#FFD21F] shadow-lg shadow-amber-500/10'
                      : 'bg-[#1A1A1A] border-[#2A2A2A] hover:bg-[#202020] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#FFD21F] text-black' : 'bg-[#262626] text-gray-300 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#FFD21F] ring-4 ring-[#FFD21F]/20" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold block ${
                      isSelected ? 'text-[#FFD21F]' : 'text-gray-200 group-hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pro Tips Box */}
        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-left space-y-1">
          <div className="text-[11px] font-bold text-gray-300 flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#FFD21F]" />
            <span>Smooth Scene Flow</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Transitions seamlessly connect your clips and apply in real-time on canvas playback and final exports.
          </p>
        </div>
      </div>
    </div>
  );
};
