import React from 'react';
import { Sliders, RotateCcw, Sun, Eye, Droplets, Sparkles, Box, Film } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export const AdjustmentsPanel: React.FC = () => {
  const { filters, setFilters, resetFilters } = useEditorStore();

  return (
    <div className="p-4 space-y-5 text-sm h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-base mb-1">Color Adjustments</h3>
          <p className="text-xs text-[#A0A0A0]">Fine-tune exposure, color temperature, and contrast.</p>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] border border-[#383838] text-xs text-[#A0A0A0] hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Exposure */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium flex items-center space-x-1.5">
              <Sun className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>Exposure</span>
            </span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.exposure ?? 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.exposure ?? 0}
            onChange={(e) => setFilters({ exposure: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Brightness</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.brightness}
            onChange={(e) => setFilters({ brightness: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Contrast</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.contrast.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            value={filters.contrast}
            onChange={(e) => setFilters({ contrast: parseFloat(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Saturation</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.saturation.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.05"
            value={filters.saturation}
            onChange={(e) => setFilters({ saturation: parseFloat(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Temperature (Warm / Cool) */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Temperature</span>
            <span className="font-mono text-[#FFD21F] font-semibold">
              {filters.temperature ? (filters.temperature > 0 ? `+${filters.temperature} (Warm)` : `${filters.temperature} (Cool)`) : '0'}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.temperature ?? 0}
            onChange={(e) => setFilters({ temperature: parseInt(e.target.value) })}
            className="w-full accent-[#FF8A00] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Tint */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Tint</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.tint ?? 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.tint ?? 0}
            onChange={(e) => setFilters({ tint: parseInt(e.target.value) })}
            className="w-full accent-[#E91E63] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Sharpen */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Sharpen</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.sharpen ?? 0}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sharpen ?? 0}
            onChange={(e) => setFilters({ sharpen: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-[#2B2B2B]">
          <div className="flex justify-between text-xs">
            <span className="text-[#C0C0C0] font-medium">Blur</span>
            <span className="font-mono text-[#FFD21F] font-semibold">{filters.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={filters.blur}
            onChange={(e) => setFilters({ blur: parseInt(e.target.value) })}
            className="w-full accent-[#FFD21F] h-1.5 bg-[#2A2A2A] rounded-lg cursor-pointer"
          />
        </div>

        {/* Cinematic & Vignette Toggles */}
        <div className="space-y-2 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] cursor-pointer hover:border-[#FFD21F]/40 transition-colors">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#FFD21F]" />
              <span className="text-xs font-semibold text-white">Vignette Shadow</span>
            </div>
            <input
              type="checkbox"
              checked={filters.vignette}
              onChange={(e) => setFilters({ vignette: e.target.checked })}
              className="accent-[#FFD21F] w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] cursor-pointer hover:border-[#FFD21F]/40 transition-colors">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-[#FFD21F]" />
              <span className="text-xs font-semibold text-white">Cinematic Letterbox (2.39:1)</span>
            </div>
            <input
              type="checkbox"
              checked={filters.letterbox ?? false}
              onChange={(e) => setFilters({ letterbox: e.target.checked })}
              className="accent-[#FFD21F] w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
