import React, { useState } from 'react';
import { Smile, Sparkles, Heart, Bell, Flame, Award, Zap, ThumbsUp, Radio } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

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

export const StickersPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'social' | 'callouts'>('trending');
  const [selectedAnimation, setSelectedAnimation] = useState<'none' | 'bounce' | 'pulse' | 'spin' | 'float' | 'pop'>('pop');

  const { currentTime, duration, addSticker, setSelectedStickerId } = useEditorStore();

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
    <div className="p-4 space-y-5 text-sm h-full flex flex-col">
      <div>
        <h3 className="font-semibold text-white text-base mb-1">Stickers & Badges</h3>
        <p className="text-xs text-[#A0A0A0]">Add animated emojis, social prompts, and callouts to your video.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex p-1 bg-[#1A1A1A] rounded-lg border border-[#2B2B2B]">
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'trending' ? 'bg-[#FFD21F] text-black shadow-sm' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Emojis</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'social' ? 'bg-[#FFD21F] text-black shadow-sm' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Social</span>
        </button>
        <button
          onClick={() => setActiveTab('callouts')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'callouts' ? 'bg-[#FFD21F] text-black shadow-sm' : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Callouts</span>
        </button>
      </div>

      {/* Default Animation Selector */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1B1B1B] border border-[#2B2B2B] rounded-lg">
        <span className="text-xs text-[#A0A0A0] font-medium">Entrance Animation:</span>
        <select
          value={selectedAnimation}
          onChange={(e) => setSelectedAnimation(e.target.value as any)}
          className="bg-[#242424] text-xs text-[#FFD21F] border border-[#383838] rounded px-2 py-1 outline-none font-semibold"
        >
          <option value="none">None</option>
          <option value="pop">Pop</option>
          <option value="bounce">Bounce</option>
          <option value="pulse">Pulse</option>
          <option value="spin">Spin</option>
          <option value="float">Float</option>
        </select>
      </div>

      {/* Sticker Grid Content */}
      <div className="flex-1 overflow-y-auto pr-1">
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
                className="p-3 rounded-xl border border-[#333333] hover:border-[#FFD21F] hover:bg-[#252525] flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{ backgroundColor: '#1A1A1A' }}
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
                className="p-3 rounded-xl bg-[#1A1A1A] border border-[#333333] hover:border-[#FFD21F] flex items-center justify-center font-extrabold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
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
