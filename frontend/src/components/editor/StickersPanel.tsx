import React, { useState } from 'react';
import {
  Flame,
  Award,
  Radio,
  Shapes,
  Palette,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { ShapeType } from '../../types/editor';

const SHAPE_DEFINITIONS: { id: string; label: string; type: ShapeType }[] = [
  { id: 'rectangle', label: 'Rectangle', type: 'rectangle' },
  { id: 'rounded_rect', label: 'Rounded Box', type: 'rounded_rect' },
  { id: 'circle', label: 'Circle', type: 'circle' },
  { id: 'pill', label: 'Pill / Bar', type: 'pill' },
  { id: 'arrow_right', label: 'Arrow Right', type: 'arrow_right' },
  { id: 'arrow_left', label: 'Arrow Left', type: 'arrow_left' },
  { id: 'arrow_up', label: 'Arrow Up', type: 'arrow_up' },
  { id: 'arrow_down', label: 'Arrow Down', type: 'arrow_down' },
  { id: 'star', label: 'Star', type: 'star' },
  { id: 'heart', label: 'Heart', type: 'heart' },
  { id: 'speech_bubble', label: 'Speech Bubble', type: 'speech_bubble' },
];

const SHAPE_COLORS = ['#FFD21F', '#FFFFFF', '#FF3366', '#00F0FF', '#10B981', '#8B5CF6', '#F97316', '#111111'];
const BORDER_COLORS = ['#000000', '#FFFFFF', '#FFD21F', '#CBD5E1', '#E11D48'];

const EMOJI_CATEGORIES = {
  trending: [
    '🔥', '⭐', '💯', '🚀', '❤️', '😂', '👏', '🎉',
    '⚡', '🔔', '🎯', '💬', '🎬', '💥', '👑', '👍',
    '🤩', '🥳', '🌟', '🏆', '💎', '💣', '✨', '🎈'
  ],
  social: [
    { label: 'SUBSCRIBE', bg: '#FF0000', color: '#FFFFFF', icon: '▶' },
    { label: 'FOLLOW', bg: '#FFD21F', color: '#000000', icon: '+' },
    { label: 'LIKE', bg: '#FF3366', color: '#FFFFFF', icon: '♥' },
    { label: 'SHARE', bg: '#1DA1F2', color: '#FFFFFF', icon: '↗' },
    { label: 'BELL ON', bg: '#FFD21F', color: '#000000', icon: '🔔' },
    { label: 'LIVE 🔴', bg: '#FF1744', color: '#FFFFFF', icon: '•' },
    { label: 'VERIFIED ✓', bg: '#FFD21F', color: '#000000', icon: '✓' },
    { label: 'SWIPE UP ↑', bg: '#833AB4', color: '#FFFFFF', icon: '↑' },
  ],
  callouts: [
    { text: 'NEW!', color: '#FFD21F', bg: '#242424' },
    { text: 'HOT!', color: '#FF5722', bg: '#242424' },
    { text: 'SALE', color: '#E91E63', bg: '#242424' },
    { text: '50% OFF', color: '#4CAF50', bg: '#242424' },
    { text: 'DON\'T MISS', color: '#FF9800', bg: '#242424' },
    { text: 'WATCH TILL END', color: '#00E676', bg: '#242424' },
  ],
};

const renderShapePreview = (type: ShapeType, fill: string, stroke: string) => {
  switch (type) {
    case 'rectangle':
      return (
        <svg width="44" height="26" viewBox="0 0 100 60" className="filter drop-shadow-xs">
          <rect x="3" y="3" width="94" height="54" rx="4" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'rounded_rect':
      return (
        <svg width="44" height="26" viewBox="0 0 100 60" className="filter drop-shadow-xs">
          <rect x="3" y="3" width="94" height="54" rx="18" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'circle':
      return (
        <svg width="32" height="32" viewBox="0 0 80 80" className="filter drop-shadow-xs">
          <circle cx="40" cy="40" r="35" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'pill':
      return (
        <svg width="46" height="22" viewBox="0 0 120 44" className="filter drop-shadow-xs">
          <rect x="3" y="3" width="114" height="38" rx="19" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'arrow_right':
      return (
        <svg width="40" height="26" viewBox="0 0 90 60" className="filter drop-shadow-xs">
          <polygon points="10,20 50,20 50,8 85,30 50,52 50,40 10,40" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'arrow_left':
      return (
        <svg width="40" height="26" viewBox="0 0 90 60" className="filter drop-shadow-xs">
          <polygon points="80,20 40,20 40,8 5,30 40,52 40,40 80,40" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'arrow_up':
      return (
        <svg width="26" height="40" viewBox="0 0 60 90" className="filter drop-shadow-xs">
          <polygon points="20,80 20,40 8,40 30,5 52,40 40,40 40,80" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'arrow_down':
      return (
        <svg width="26" height="40" viewBox="0 0 60 90" className="filter drop-shadow-xs">
          <polygon points="20,10 20,50 8,50 30,85 52,50 40,50 40,10" fill={fill} stroke={stroke} strokeWidth="5" />
        </svg>
      );
    case 'star':
      return (
        <svg width="32" height="32" viewBox="0 0 80 80" className="filter drop-shadow-xs">
          <polygon points="40,6 50,28 75,30 56,47 62,72 40,58 18,72 24,47 5,30 30,28" fill={fill} stroke={stroke} strokeWidth="4" />
        </svg>
      );
    case 'heart':
      return (
        <svg width="32" height="32" viewBox="0 0 80 80" className="filter drop-shadow-xs">
          <path d="M40,68 C40,68 12,46 12,25 C12,14 20,8 30,12 C36,15 40,22 40,22 C40,22 44,15 50,12 C60,8 68,14 68,25 C68,46 40,68 40,68 Z" fill={fill} stroke={stroke} strokeWidth="4" />
        </svg>
      );
    case 'speech_bubble':
      return (
        <svg width="40" height="28" viewBox="0 0 100 70" className="filter drop-shadow-xs">
          <path d="M10,12 Q10,4 20,4 L80,4 Q90,4 90,12 L90,42 Q90,50 80,50 L35,50 L15,66 L22,50 L20,50 Q10,50 10,42 Z" fill={fill} stroke={stroke} strokeWidth="4" />
        </svg>
      );
    default:
      return null;
  }
};

export const StickersPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shapes' | 'trending' | 'social' | 'callouts'>('shapes');
  const [selectedAnimation, setSelectedAnimation] = useState<'none' | 'bounce' | 'pulse' | 'spin' | 'float' | 'pop'>('pop');
  const [selectedShapeColor, setSelectedShapeColor] = useState('#FFD21F');
  const [selectedBorderColor, setSelectedBorderColor] = useState('#000000');

  const { currentTime, duration, addSticker, setSelectedStickerId, theme } = useEditorStore();
  const isLight = theme === 'light';

  const handleAddShape = (shapeType: ShapeType) => {
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.min(duration || 10, start + 3.0);

    const newShape = {
      id: `shape_${Date.now()}`,
      type: 'shape' as const,
      content: shapeType,
      shape_type: shapeType,
      shape_color: selectedShapeColor,
      shape_border_color: selectedBorderColor,
      shape_border_width: 3,
      start_time: start,
      end_time: end,
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      animation: selectedAnimation,
    };

    addSticker(newShape);
    setSelectedStickerId(newShape.id);
  };

  const handleAddEmojiSticker = (emoji: string) => {
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.min(duration || 10, start + 3.0);

    const newSticker = {
      id: `sticker_${Date.now()}`,
      type: 'emoji' as const,
      content: emoji,
      start_time: start,
      end_time: end,
      x: 50,
      y: 45,
      scale: 1.5,
      rotation: 0,
      opacity: 1,
      animation: selectedAnimation,
    };

    addSticker(newSticker);
    setSelectedStickerId(newSticker.id);
  };

  const handleAddBadgeSticker = (badge: { label?: string; text?: string; bg?: string; color?: string }) => {
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.min(duration || 10, start + 3.0);
    const content = badge.label || badge.text || 'BADGE';

    const newSticker = {
      id: `sticker_${Date.now()}`,
      type: 'badge' as const,
      content: content,
      start_time: start,
      end_time: end,
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      animation: selectedAnimation,
    };

    addSticker(newSticker);
    setSelectedStickerId(newSticker.id);
  };

  return (
    <div className="p-4 space-y-4 text-sm h-full flex flex-col select-none">
      <div>
        <h3 className={`font-semibold text-base mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
          Shapes & Stickers
        </h3>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-[#A0A0A0]'}`}>
          Add vector shapes, animated emojis, and social callouts to your video.
        </p>
      </div>

      {/* Category Tabs */}
      <div className={`flex p-1 rounded-lg border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1A1A1A] border-[#2B2B2B]'
      }`}>
        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'shapes'
              ? 'bg-[#FFD21F] text-black shadow-xs font-bold'
              : isLight ? 'text-slate-600 hover:text-black hover:bg-white/80' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>Shapes</span>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'trending'
              ? 'bg-[#FFD21F] text-black shadow-xs font-bold'
              : isLight ? 'text-slate-600 hover:text-black hover:bg-white/80' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Emojis</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'social'
              ? 'bg-[#FFD21F] text-black shadow-xs font-bold'
              : isLight ? 'text-slate-600 hover:text-black hover:bg-white/80' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Social</span>
        </button>
        <button
          onClick={() => setActiveTab('callouts')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'callouts'
              ? 'bg-[#FFD21F] text-black shadow-xs font-bold'
              : isLight ? 'text-slate-600 hover:text-black hover:bg-white/80' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Badges</span>
        </button>
      </div>

      {/* Animation Selector */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1B1B1B] border border-[#2B2B2B] rounded-lg">
        <span className="text-xs text-[#A0A0A0] font-medium">Entrance Animation:</span>
        <select
          value={selectedAnimation}
          onChange={(e) => setSelectedAnimation(e.target.value as any)}
          className="bg-[#242424] text-xs text-[#FFD21F] border border-[#383838] rounded px-2 py-1 outline-none font-semibold cursor-pointer"
        >
          <option value="none">None</option>
          <option value="pop">Pop</option>
          <option value="bounce">Bounce</option>
          <option value="pulse">Pulse</option>
          <option value="spin">Spin</option>
          <option value="float">Float</option>
        </select>
      </div>

      {/* Shapes Color Picker (Visible in Shapes Tab) */}
      {activeTab === 'shapes' && (
        <div className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 flex items-center space-x-1">
              <Palette className="w-3 h-3 text-[#FFD21F]" />
              <span>Shape Fill Color:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {SHAPE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedShapeColor(c)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    selectedShapeColor === c ? 'border-[#FFD21F] scale-125 ring-2 ring-[#FFD21F]/40' : 'border-black/40 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#222222]">
            <span className="text-[11px] font-semibold text-gray-400">Outline Border:</span>
            <div className="flex items-center space-x-1.5">
              {BORDER_COLORS.map((bc) => (
                <button
                  key={bc}
                  type="button"
                  onClick={() => setSelectedBorderColor(bc)}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    selectedBorderColor === bc ? 'border-[#FFD21F] scale-125 ring-2 ring-[#FFD21F]/40' : 'border-black/40 hover:scale-110'
                  }`}
                  style={{ backgroundColor: bc }}
                  title={bc}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'shapes' && (
          <div className="grid grid-cols-3 gap-2">
            {SHAPE_DEFINITIONS.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape(shape.type)}
                className={`h-20 rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all hover:scale-105 active:scale-95 shadow-xs group ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#FFD21F]'
                    : 'bg-[#1B1B1B] hover:bg-[#252525] border-[#2B2B2B] hover:border-[#FFD21F]'
                }`}
              >
                <div className="w-12 h-10 flex items-center justify-center">
                  {renderShapePreview(shape.type, selectedShapeColor, selectedBorderColor)}
                </div>
                <span className={`text-[10px] font-medium truncate w-full text-center mt-1 transition-colors ${
                  isLight ? 'text-slate-600 group-hover:text-black font-semibold' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {shape.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="grid grid-cols-4 gap-2.5">
            {EMOJI_CATEGORIES.trending.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => handleAddEmojiSticker(emoji)}
                className="h-14 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] hover:border-[#FFD21F] hover:bg-[#252525] flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 shadow-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-2 gap-2.5">
            {EMOJI_CATEGORIES.social.map((badge, idx) => (
              <button
                key={idx}
                onClick={() => handleAddBadgeSticker(badge)}
                className="p-3 rounded-xl bg-[#1B1B1B] border border-[#333333] hover:border-[#FFD21F] hover:bg-[#252525] flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'callouts' && (
          <div className="grid grid-cols-2 gap-2.5">
            {EMOJI_CATEGORIES.callouts.map((callout, idx) => (
              <button
                key={idx}
                onClick={() => handleAddBadgeSticker(callout)}
                className="p-3 rounded-xl bg-[#1B1B1B] border border-[#333333] hover:border-[#FFD21F] flex items-center justify-center font-extrabold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{ color: callout.color }}
              >
                {callout.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
