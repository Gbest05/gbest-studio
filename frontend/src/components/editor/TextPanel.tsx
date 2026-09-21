import React from 'react';
import { Type, Plus, Trash2, Sliders } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { TextOverlay } from '../../types/editor';

const TEXT_PRESETS = [
  {
    name: 'Bold Title',
    text: 'HEADLINE TITLE',
    fontSize: 48,
    weight: '900',
    color: '#FFFFFF',
    bg: 'transparent',
    preset: 'title' as const,
  },
  {
    name: 'Lower Third',
    text: 'GBEST Studio • Content Creator',
    fontSize: 24,
    weight: '600',
    color: '#FFD21F',
    bg: 'rgba(0,0,0,0.8)',
    preset: 'lower_third' as const,
  },
  {
    name: 'Social CTA',
    text: 'Follow for more videos 🔔',
    fontSize: 28,
    weight: '700',
    color: '#FFFFFF',
    bg: '#FF8A00',
    preset: 'cta' as const,
  },
  {
    name: 'Callout',
    text: 'MUST WATCH TIP!',
    fontSize: 32,
    weight: '800',
    color: '#111111',
    bg: '#FFD21F',
    preset: 'callout' as const,
  },
];

export const TextPanel: React.FC = () => {
  const {
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    selectedTextId,
    setSelectedTextId,
    currentTime,
    duration,
  } = useEditorStore();

  const handleAddPreset = (preset: typeof TEXT_PRESETS[0]) => {
    const newText: TextOverlay = {
      id: `text_${Date.now()}`,
      text: preset.text,
      start_time: Math.round(currentTime * 10) / 10,
      end_time: Math.round(Math.min(duration || 10, currentTime + 3.5) * 10) / 10,
      x: 50,
      y: preset.preset === 'lower_third' ? 82 : preset.preset === 'cta' ? 88 : 45,
      font_family: 'Inter',
      font_size: preset.fontSize,
      font_weight: preset.weight,
      color: preset.color,
      background_color: preset.bg,
      shadow: true,
      rotation: 0,
      opacity: 1,
      preset: preset.preset,
    };
    addTextOverlay(newText);
  };

  const selectedOverlay = textOverlays.find((t) => t.id === selectedTextId);

  return (
    <div className="p-4 space-y-5 text-sm overflow-y-auto">
      <div>
        <h3 className="font-semibold text-white text-base">Text Overlays</h3>
        <p className="text-xs text-[#A0A0A0]">Add titles, lower thirds, and call-to-actions.</p>
      </div>

      {/* Presets Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Text Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEXT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAddPreset(p)}
              className="p-3 rounded-lg border border-[#2D2D2D] bg-[#161616] hover:border-[#FFD21F] text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-white mb-1 group-hover:text-[#FFD21F] transition-colors">
                {p.name}
              </div>
              <div className="text-[11px] text-[#A0A0A0] truncate">{p.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Overlay Inspector */}
      {selectedOverlay && (
        <div className="p-3.5 bg-[#181818] border border-[#FFD21F]/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFD21F] flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Text Properties</span>
            </span>
            <button
              onClick={() => removeTextOverlay(selectedOverlay.id)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#888888]">Text Content</label>
            <input
              type="text"
              value={selectedOverlay.text}
              onChange={(e) => updateTextOverlay(selectedOverlay.id, { text: e.target.value })}
              className="w-full bg-[#121212] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#FFD21F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-[#888888]">Font Size ({selectedOverlay.font_size}px)</label>
              <input
                type="range"
                min="16"
                max="72"
                value={selectedOverlay.font_size}
                onChange={(e) => updateTextOverlay(selectedOverlay.id, { font_size: parseInt(e.target.value) })}
                className="w-full accent-[#FFD21F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#888888]">Y Position ({selectedOverlay.y}%)</label>
              <input
                type="range"
                min="5"
                max="95"
                value={selectedOverlay.y}
                onChange={(e) => updateTextOverlay(selectedOverlay.id, { y: parseInt(e.target.value) })}
                className="w-full accent-[#FFD21F]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlays List */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Active Overlays ({textOverlays.length})
        </label>
        {textOverlays.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#666666]">
            No text overlays added. Click any preset above to insert text.
          </div>
        ) : (
          <div className="space-y-2">
            {textOverlays.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTextId(t.id)}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors cursor-pointer ${
                  selectedTextId === t.id
                    ? 'bg-[#222222] border-[#FFD21F]'
                    : 'bg-[#181818] border-[#2A2A2A] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Type className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                  <span className="text-xs text-white truncate font-medium">{t.text}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTextOverlay(t.id);
                  }}
                  className="text-[#666666] hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
