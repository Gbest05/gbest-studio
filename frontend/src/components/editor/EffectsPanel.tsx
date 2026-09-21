import React from 'react';
import { RotateCw, FlipHorizontal, FlipVertical, Sliders, Wand2, Sun, Contrast, Eye } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { FilterPreset } from '../../types/editor';

const FILTER_PRESETS: { id: FilterPreset; name: string; desc: string }[] = [
  { id: 'none', name: 'Normal', desc: 'No color filter' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Rich contrast & teal look' },
  { id: 'warm', name: 'Warm Sun', desc: 'Golden hour amber hues' },
  { id: 'cool', name: 'Cool Nordic', desc: 'Crisp blue atmospheric tint' },
  { id: 'vintage', name: 'Vintage Film', desc: 'Retro muted analog vibe' },
  { id: 'grayscale', name: 'B&W Monochrome', desc: 'Timeless grayscale' },
  { id: 'sepia', name: 'Sepia Classic', desc: 'Antique historic tone' },
];

export const EffectsPanel: React.FC = () => {
  const {
    filters,
    setFilters,
    rotate,
    setRotate,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
  } = useEditorStore();

  return (
    <div className="p-4 space-y-5 text-sm overflow-y-auto">
      <div>
        <h3 className="font-semibold text-white text-base">Video Effects & Filters</h3>
        <p className="text-xs text-[#A0A0A0]">Adjust color grade, exposure, blur, and orientation.</p>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Transform & Orientation
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setRotate(rotate + 90)}
            className="p-2.5 bg-[#181818] hover:bg-[#222222] border border-[#2D2D2D] rounded-lg flex flex-col items-center justify-center space-y-1 text-xs text-[#A0A0A0] hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4 text-[#FFD21F]" />
            <span>Rotate 90°</span>
          </button>

          <button
            onClick={() => setFlipH(!flipH)}
            className={`p-2.5 border rounded-lg flex flex-col items-center justify-center space-y-1 text-xs transition-colors ${
              flipH
                ? 'bg-[#222222] border-[#FFD21F] text-[#FFD21F]'
                : 'bg-[#181818] border-[#2D2D2D] text-[#A0A0A0] hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Flip H</span>
          </button>

          <button
            onClick={() => setFlipV(!flipV)}
            className={`p-2.5 border rounded-lg flex flex-col items-center justify-center space-y-1 text-xs transition-colors ${
              flipV
                ? 'bg-[#222222] border-[#FFD21F] text-[#FFD21F]'
                : 'bg-[#181818] border-[#2D2D2D] text-[#A0A0A0] hover:text-white'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span>Flip V</span>
          </button>
        </div>
      </div>

      {/* Color Filter Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888] flex items-center space-x-1.5">
          <Wand2 className="w-3.5 h-3.5 text-[#FFD21F]" />
          <span>Color Presets</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_PRESETS.map((p) => {
            const isActive = filters.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setFilters({ preset: p.id })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-[#1F1F1F] border-[#FFD21F] ring-1 ring-[#FFD21F]'
                    : 'bg-[#161616] border-[#2B2B2B] hover:border-[#383838]'
                }`}
              >
                <div className="text-xs font-medium text-white">{p.name}</div>
                <div className="text-[10px] text-[#777777] truncate">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Sliders */}
      <div className="space-y-4 pt-2 border-t border-[#242424]">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888] flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#FFD21F]" />
          <span>Fine Adjustments</span>
        </label>

        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#888888]">
            <span className="flex items-center space-x-1">
              <Sun className="w-3 h-3" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-white">{filters.brightness}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={filters.brightness}
            onChange={(e) => setFilters({ brightness: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F]"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#888888]">
            <span className="flex items-center space-x-1">
              <Contrast className="w-3 h-3" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-white">{filters.contrast.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={filters.contrast}
            onChange={(e) => setFilters({ contrast: parseFloat(e.target.value) })}
            className="w-full accent-[#FFD21F]"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#888888]">
            <span>Saturation</span>
            <span className="font-mono text-white">{filters.saturation.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={filters.saturation}
            onChange={(e) => setFilters({ saturation: parseFloat(e.target.value) })}
            className="w-full accent-[#FFD21F]"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#888888]">
            <span>Blur</span>
            <span className="font-mono text-white">{filters.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            value={filters.blur}
            onChange={(e) => setFilters({ blur: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F]"
          />
        </div>

        {/* Vignette Toggle */}
        <div className="p-3 bg-[#181818] border border-[#2B2B2B] rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#A0A0A0]" />
            <span className="text-xs text-white">Vignette Dark Edges</span>
          </div>
          <input
            type="checkbox"
            checked={filters.vignette}
            onChange={(e) => setFilters({ vignette: e.target.checked })}
            className="w-4 h-4 accent-[#FFD21F] rounded"
          />
        </div>
      </div>
    </div>
  );
};
