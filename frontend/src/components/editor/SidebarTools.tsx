import React from 'react';
import {
  Film,
  Type,
  Sparkles,
  Music,
  Wand2,
  Ratio,
  Smile,
  Sliders,
  ArrowLeftRight,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Tooltip } from '../common/Tooltip';
import { MediaPanel } from './MediaPanel';
import { CaptionPanel } from './CaptionPanel';
import { CaptionStylePanel } from './CaptionStylePanel';
import { TextPanel } from './TextPanel';
import { StickersPanel } from './StickersPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { TransitionsPanel } from './TransitionsPanel';
import { AudioPanel } from './AudioPanel';
import { EffectsPanel } from './EffectsPanel';
import { CanvasSettings } from './CanvasSettings';

export const SidebarTools: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();
  const [showStyleSubPanel, setShowStyleSubPanel] = React.useState(false);

  const navItems = [
    { id: 'media', label: 'Media', icon: Film },
    { id: 'captions', label: 'Captions', icon: Type },
    { id: 'text', label: 'Text', icon: Sparkles },
    { id: 'stickers', label: 'Stickers', icon: Smile },
    { id: 'adjustments', label: 'Adjust', icon: Sliders },
    { id: 'transitions', label: 'Transition', icon: ArrowLeftRight },
    { id: 'effects', label: 'Effects', icon: Wand2 },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'canvas', label: 'Canvas', icon: Ratio },
  ] as const;

  return (
    <div className="flex h-full w-full select-none">
      {/* Icon Navigation Bar */}
      <div className="w-14 sm:w-16 flex-shrink-0 bg-[#111111] border-r border-[#242424] flex flex-col items-center py-2.5 space-y-1.5 z-10 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;

          return (
            <Tooltip key={item.id} content={item.label} position="right">
              <button
                onClick={() => {
                  setShowStyleSubPanel(false);
                  setActiveTool(item.id);
                }}
                className={`w-11 sm:w-12 h-11 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${
                  isActive
                    ? 'bg-[#1F1F1F] text-[#FFD21F] border border-[#FFD21F]/30 shadow-md shadow-amber-500/5'
                    : 'text-[#888888] hover:text-white hover:bg-[#181818]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[1.8]" />
                <span className="text-[8.5px] font-medium tracking-tight">{item.label}</span>
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Expanded Active Tool Panel (Dynamically flexes to fit screen width without clipping) */}
      <div className="flex-1 min-w-0 w-72 sm:w-80 bg-[#161616] border-r border-[#242424] flex flex-col h-full overflow-hidden">
        {showStyleSubPanel ? (
          <CaptionStylePanel />
        ) : activeTool === 'media' ? (
          <MediaPanel />
        ) : activeTool === 'captions' ? (
          <CaptionPanel onOpenStyle={() => setShowStyleSubPanel(true)} />
        ) : activeTool === 'text' ? (
          <TextPanel />
        ) : activeTool === 'stickers' ? (
          <StickersPanel />
        ) : activeTool === 'adjustments' ? (
          <AdjustmentsPanel />
        ) : activeTool === 'transitions' ? (
          <TransitionsPanel />
        ) : activeTool === 'effects' ? (
          <EffectsPanel />
        ) : activeTool === 'audio' ? (
          <AudioPanel />
        ) : activeTool === 'canvas' ? (
          <CanvasSettings />
        ) : null}
      </div>
    </div>
  );
};
