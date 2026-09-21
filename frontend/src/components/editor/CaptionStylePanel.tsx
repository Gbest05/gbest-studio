import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Sparkles, Check } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { CaptionPreset, CaptionAnimation } from '../../types/editor';

interface PresetOption {
  id: CaptionPreset;
  name: string;
  previewClass: string;
}

const PRESETS: PresetOption[] = [
  { id: 'yellow_highlight', name: 'Yellow Highlight', previewClass: 'text-white' },
  { id: 'classic', name: 'Classic', previewClass: 'text-white shadow' },
  { id: 'bold', name: 'Bold Impact', previewClass: 'font-extrabold text-white' },
  { id: 'creator', name: 'Creator Dark', previewClass: 'bg-black/80 px-2 py-0.5 rounded text-white' },
  { id: 'social', name: 'Social Pop', previewClass: 'font-black tracking-wide text-white uppercase' },
  { id: 'minimal', name: 'Minimal', previewClass: 'text-xs text-[#E0E0E0]' },
  { id: 'cinematic', name: 'Cinematic', previewClass: 'tracking-widest uppercase text-xs text-[#F0F0F0]' },
];

const FONTS = ['Inter', 'Poppins', 'Impact', 'Arial', 'Montserrat', 'Roboto'];

const ANIMATIONS: { id: CaptionAnimation; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'pop', name: 'Pop' },
  { id: 'bounce', name: 'Bounce' },
  { id: 'slide_up', name: 'Slide Up' },
  { id: 'word_pop', name: 'Word Pop' },
];

const COLOR_PALETTE = ['#FFFFFF', '#FFD21F', '#FF8A00', '#F7F7F5', '#00F0FF', '#FF0055'];

export const CaptionStylePanel: React.FC = () => {
  const { globalCaptionStyle, setGlobalCaptionStyle } = useEditorStore();

  const handleApplyPreset = (preset: CaptionPreset) => {
    switch (preset) {
      case 'yellow_highlight':
        setGlobalCaptionStyle({
          preset,
          color: '#FFFFFF',
          highlight_color: '#FFD21F',
          background_color: 'transparent',
          font_weight: 'bold',
          font_size: 32,
          animation: 'pop',
          word_by_word: true,
        });
        break;
      case 'creator':
        setGlobalCaptionStyle({
          preset,
          color: '#FFFFFF',
          highlight_color: '#FFD21F',
          background_color: 'rgba(0,0,0,0.85)',
          font_weight: '800',
          font_size: 28,
          animation: 'pop',
          word_by_word: true,
        });
        break;
      case 'bold':
        setGlobalCaptionStyle({
          preset,
          color: '#FFFFFF',
          background_color: 'transparent',
          font_weight: '900',
          font_size: 36,
          animation: 'bounce',
          word_by_word: false,
        });
        break;
      case 'social':
        setGlobalCaptionStyle({
          preset,
          color: '#FFFFFF',
          highlight_color: '#FFD21F',
          background_color: 'transparent',
          font_weight: '900',
          font_size: 36,
          animation: 'pop',
          word_by_word: true,
        });
        break;
      case 'minimal':
        setGlobalCaptionStyle({
          preset,
          color: '#E0E0E0',
          background_color: 'transparent',
          font_weight: '400',
          font_size: 22,
          animation: 'none',
          word_by_word: false,
        });
        break;
      case 'cinematic':
        setGlobalCaptionStyle({
          preset,
          color: '#FFFFFF',
          background_color: 'transparent',
          font_weight: '500',
          font_size: 24,
          animation: 'none',
          word_by_word: false,
        });
        break;
      case 'classic':
      default:
        setGlobalCaptionStyle({
          preset: 'classic',
          color: '#FFFFFF',
          background_color: 'transparent',
          font_weight: 'bold',
          font_size: 28,
          animation: 'none',
          word_by_word: false,
        });
    }
  };

  return (
    <div className="p-4 space-y-5 text-sm overflow-y-auto">
      <div>
        <h3 className="font-semibold text-white text-base">Caption Styling</h3>
        <p className="text-xs text-[#A0A0A0]">Customize subtitle presets, fonts, animations, and colors.</p>
      </div>

      {/* Style Presets Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => {
            const isActive = globalCaptionStyle.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  isActive
                    ? 'border-[#FFD21F] bg-[#1F1F1F] shadow-sm shadow-amber-500/10 ring-1 ring-[#FFD21F]'
                    : 'border-[#2D2D2D] bg-[#161616] hover:border-[#3E3E3E]'
                }`}
              >
                <div className="text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
                  <span>{p.name}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#FFD21F]" />}
                </div>
                <div className={`text-[11px] truncate ${p.previewClass}`}>
                  {p.id === 'yellow_highlight' ? (
                    <span>Sample <span className="text-[#FFD21F] font-bold">Text</span></span>
                  ) : (
                    'Sample Text'
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Word-By-Word Mode Toggle */}
      <div className="p-3 rounded-lg bg-[#181818] border border-[#2B2B2B] flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>Word-by-word Highlight</span>
          </p>
          <p className="text-[11px] text-[#888888]">Highlight words dynamically as spoken.</p>
        </div>
        <button
          onClick={() => setGlobalCaptionStyle({ word_by_word: !globalCaptionStyle.word_by_word })}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
            globalCaptionStyle.word_by_word ? 'bg-[#FFD21F]' : 'bg-[#333333]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-black transition-transform ${
              globalCaptionStyle.word_by_word ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Font Family */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Font Family
        </label>
        <select
          value={globalCaptionStyle.font_family}
          onChange={(e) => setGlobalCaptionStyle({ font_family: e.target.value })}
          className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
        >
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#888888]">Font Size</span>
          <span className="font-mono text-white">{globalCaptionStyle.font_size}px</span>
        </div>
        <input
          type="range"
          min="16"
          max="54"
          value={globalCaptionStyle.font_size}
          onChange={(e) => setGlobalCaptionStyle({ font_size: parseInt(e.target.value) })}
          className="w-full accent-[#FFD21F]"
        />
      </div>

      {/* Text Color & Highlight Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
            Text Color
          </label>
          <div className="flex space-x-1.5">
            {COLOR_PALETTE.slice(0, 4).map((c) => (
              <button
                key={c}
                onClick={() => setGlobalCaptionStyle({ color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  globalCaptionStyle.color === c ? 'border-[#FFD21F] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
            Highlight
          </label>
          <div className="flex space-x-1.5">
            {['#FFD21F', '#FF8A00', '#00FFA3', '#00F0FF'].map((c) => (
              <button
                key={c}
                onClick={() => setGlobalCaptionStyle({ highlight_color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  globalCaptionStyle.highlight_color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Caption Animation */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Animation
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {ANIMATIONS.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setGlobalCaptionStyle({ animation: anim.id })}
              className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors ${
                globalCaptionStyle.animation === anim.id
                  ? 'border-[#FFD21F] bg-[#1F1F1F] text-[#FFD21F]'
                  : 'border-[#2B2B2B] bg-[#161616] text-[#A0A0A0] hover:text-white'
              }`}
            >
              {anim.name}
            </button>
          ))}
        </div>
      </div>

      {/* Position Y (Percentage from top) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#888888]">Position Y</span>
          <span className="font-mono text-white">
            {globalCaptionStyle.position_y}% ({globalCaptionStyle.position_y > 65 ? 'Bottom' : globalCaptionStyle.position_y < 35 ? 'Top' : 'Center'})
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="90"
          value={globalCaptionStyle.position_y}
          onChange={(e) => setGlobalCaptionStyle({ position_y: parseInt(e.target.value) })}
          className="w-full accent-[#FFD21F]"
        />
      </div>

      {/* Text Alignment */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Alignment
        </label>
        <div className="flex bg-[#161616] border border-[#2B2B2B] rounded-lg p-0.5">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setGlobalCaptionStyle({ alignment: align })}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-colors ${
                globalCaptionStyle.alignment === align
                  ? 'bg-[#242424] text-[#FFD21F]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {align === 'left' ? (
                <AlignLeft className="w-4 h-4" />
              ) : align === 'center' ? (
                <AlignCenter className="w-4 h-4" />
              ) : (
                <AlignRight className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
