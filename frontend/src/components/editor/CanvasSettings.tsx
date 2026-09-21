import React from 'react';
import { Smartphone, Monitor, Square, SmartphoneCharging } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { AspectRatio } from '../../types/editor';

const RATIO_PRESETS: { id: AspectRatio; name: string; desc: string; icon: any }[] = [
  {
    id: '9:16',
    name: 'TikTok / Reels / Shorts',
    desc: '9:16 • 1080 × 1920 (Vertical)',
    icon: Smartphone,
  },
  {
    id: '16:9',
    name: 'YouTube / Landscape',
    desc: '16:9 • 1920 × 1080 (Horizontal)',
    icon: Monitor,
  },
  {
    id: '1:1',
    name: 'Instagram Square',
    desc: '1:1 • 1080 × 1080 (Square)',
    icon: Square,
  },
  {
    id: '4:5',
    name: 'Instagram Portrait',
    desc: '4:5 • 1080 × 1350 (Social Feed)',
    icon: SmartphoneCharging,
  },
];

export const CanvasSettings: React.FC = () => {
  const { aspectRatio, setAspectRatio } = useEditorStore();

  return (
    <div className="p-4 space-y-5 text-sm overflow-y-auto">
      <div>
        <h3 className="font-semibold text-white text-base">Canvas & Format</h3>
        <p className="text-xs text-[#A0A0A0]">Select aspect ratio format for your target platform.</p>
      </div>

      <div className="space-y-2.5">
        {RATIO_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = aspectRatio === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => setAspectRatio(preset.id)}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center space-x-3.5 transition-all ${
                isSelected
                  ? 'bg-[#1F1F1F] border-[#FFD21F] shadow-md shadow-amber-500/10 ring-1 ring-[#FFD21F]'
                  : 'bg-[#161616] border-[#2A2A2A] hover:border-[#383838]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#FFD21F] text-black' : 'bg-[#242424] text-[#A0A0A0]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">{preset.name}</div>
                <div className="text-[11px] text-[#888888]">{preset.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
