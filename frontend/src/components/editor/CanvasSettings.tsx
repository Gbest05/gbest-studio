import React from 'react';
import {
  Smartphone,
  Monitor,
  Square,
  SmartphoneCharging,
  Tv,
  Film,
  Sparkles,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { AspectRatio, CanvasBackground } from '../../types/editor';

const RATIO_PRESETS: { id: AspectRatio; name: string; desc: string; icon: any }[] = [
  {
    id: '9:16',
    name: 'TikTok / Reels / Shorts',
    desc: '9:16 • 1080 × 1920 (Vertical Video)',
    icon: Smartphone,
  },
  {
    id: '16:9',
    name: 'YouTube / Widescreen',
    desc: '16:9 • 1920 × 1080 (Horizontal HD)',
    icon: Monitor,
  },
  {
    id: '1:1',
    name: 'Instagram Square',
    desc: '1:1 • 1080 × 1080 (Square Feed)',
    icon: Square,
  },
  {
    id: '4:5',
    name: 'Instagram Portrait',
    desc: '4:5 • 1080 × 1350 (Social Feed)',
    icon: SmartphoneCharging,
  },
  {
    id: '21:9',
    name: 'Cinematic Ultrawide',
    desc: '21:9 • 2560 × 1080 (Movie Anamorphic)',
    icon: Film,
  },
  {
    id: '4:3',
    name: 'Standard TV / Retro',
    desc: '4:3 • 1440 × 1080 (Classic / iPad)',
    icon: Tv,
  },
  {
    id: '2:3',
    name: 'Pinterest Pin / Story',
    desc: '2:3 • 1080 × 1620 (Vertical Pin)',
    icon: Smartphone,
  },
  {
    id: '3:4',
    name: 'Social Vertical Feed',
    desc: '3:4 • 1080 × 1440 (Facebook / Reels)',
    icon: SmartphoneCharging,
  },
];

const CANVAS_BG_OPTIONS: { id: CanvasBackground; name: string; preview: string }[] = [
  { id: 'black', name: 'Pitch Black', preview: 'bg-black border-zinc-700' },
  { id: 'dark', name: 'Studio Dark', preview: 'bg-[#181818] border-zinc-700' },
  { id: 'blur', name: 'Blurred Video', preview: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' },
  { id: 'white', name: 'Studio White', preview: 'bg-white text-black border-zinc-300' },
  { id: 'amber_gradient', name: 'Amber Glow', preview: 'bg-gradient-to-tr from-[#1E1200] via-[#332000] to-[#FFD21F]/20' },
  { id: 'cyber_gradient', name: 'Cyber Glow', preview: 'bg-gradient-to-tr from-[#02131F] via-[#04263D] to-[#00F0FF]/25' },
];

export const CanvasSettings: React.FC = () => {
  const {
    aspectRatio,
    setAspectRatio,
    canvasBackground,
    setCanvasBackground,
    previewZoom,
    setPreviewZoom,
  } = useEditorStore();

  return (
    <div className="p-4 space-y-6 text-sm overflow-y-auto select-none custom-scrollbar">
      <div>
        <h3 className="font-semibold text-white text-base">Canvas & Format</h3>
        <p className="text-xs text-[#A0A0A0]">Select aspect ratio format, backgrounds, and screen sizing.</p>
      </div>

      {/* Screen Zoom & Sizing Quick Bar */}
      <div className="space-y-2 p-3 bg-[#181818] border border-[#282828] rounded-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center space-x-1.5">
            <Maximize className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>Screen Sizing</span>
          </span>
          <span className="font-mono text-[#FFD21F] font-bold">
            {previewZoom === 1.0 ? 'Fit (100%)' : `${Math.round(previewZoom * 100)}%`}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 pt-1">
          <button
            onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.25))}
            className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-gray-300 hover:text-white transition-colors"
            title="Reduce Screen Size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 grid grid-cols-4 gap-1">
            {[0.5, 0.75, 1.0, 1.25].map((z) => (
              <button
                key={z}
                onClick={() => setPreviewZoom(z)}
                className={`py-1 text-[11px] rounded font-medium transition-all ${
                  Math.abs(previewZoom - z) < 0.05
                    ? 'bg-[#FFD21F] text-black font-bold'
                    : 'bg-[#222222] text-gray-400 hover:text-white hover:bg-[#282828]'
                }`}
              >
                {z === 1.0 ? 'Fit' : `${Math.round(z * 100)}%`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPreviewZoom(Math.min(2.0, previewZoom + 0.25))}
            className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-gray-300 hover:text-white transition-colors"
            title="Increase Screen Size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888] block">
          Aspect Ratio ({RATIO_PRESETS.length} Platforms)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {RATIO_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = aspectRatio === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => setAspectRatio(preset.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  isSelected
                    ? 'bg-[#1F1F1F] border-[#FFD21F] shadow-md shadow-amber-500/10 ring-1 ring-[#FFD21F]'
                    : 'bg-[#161616] border-[#2A2A2A] hover:border-[#383838]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#FFD21F] text-black' : 'bg-[#242424] text-[#A0A0A0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{preset.name}</div>
                  <div className="text-[10px] text-[#888888] truncate">{preset.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Background Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888] flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-[#FFD21F]" />
          <span>Canvas Background</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_BG_OPTIONS.map((bg) => {
            const isSelected = canvasBackground === bg.id;

            return (
              <button
                key={bg.id}
                onClick={() => setCanvasBackground(bg.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  isSelected
                    ? 'bg-[#222222] border-[#FFD21F] ring-1 ring-[#FFD21F]'
                    : 'bg-[#161616] border-[#2A2A2A] hover:border-[#383838]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border ${bg.preview}`} />
                <span className="text-xs font-medium text-white truncate">{bg.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
