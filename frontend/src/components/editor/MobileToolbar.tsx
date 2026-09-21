import React, { useState } from 'react';
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
  X,
  Palette,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
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

export const MobileToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();
  const [showStyleInSheet, setShowStyleInSheet] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const tools = [
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

  const handleToolClick = (toolId: typeof tools[number]['id']) => {
    setShowStyleInSheet(false);
    if (activeTool === toolId) {
      setActiveTool(null); // toggle close
    } else {
      setActiveTool(toolId);
    }
  };

  const closeBottomSheet = () => {
    setActiveTool(null);
    setShowStyleInSheet(false);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Animated Bottom Sheet / Slide-Over for Dynamic Sidebar Content on Mobile */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={closeBottomSheet} />

          {/* Bottom Sheet Container */}
          <div
            className={`bg-[#141414] border-t border-[#333333] rounded-t-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
              isExpanded ? 'h-[92vh]' : 'h-[65vh] max-h-[82vh]'
            }`}
          >
            {/* Sheet Handle & Header */}
            <div className="p-3 border-b border-[#242424] flex items-center justify-between bg-[#141414] relative">
              <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-12 h-1.5 bg-[#3A3A3A] hover:bg-[#FFD21F] rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2 cursor-pointer transition-colors"
              />

              <div className="pt-2 flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFD21F]">
                  {showStyleInSheet ? 'Caption Style' : activeTool}
                </span>
                {activeTool === 'captions' && !showStyleInSheet && (
                  <button
                    onClick={() => setShowStyleInSheet(true)}
                    className="flex items-center space-x-1 text-[11px] text-[#A0A0A0] hover:text-white bg-[#222222] px-2 py-0.5 rounded border border-[#333333]"
                  >
                    <Palette className="w-3 h-3 text-[#FFD21F]" />
                    <span>Customize Style</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5 pt-1">
                {/* Expand / Minimize height */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center text-[#A0A0A0] hover:text-white"
                  title={isExpanded ? 'Collapse' : 'Expand full'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close */}
                <button
                  onClick={closeBottomSheet}
                  className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center text-[#A0A0A0] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Sheet Content */}
            <div className="flex-1 overflow-y-auto pb-safe">
              {showStyleInSheet ? (
                <CaptionStylePanel />
              ) : activeTool === 'media' ? (
                <MediaPanel />
              ) : activeTool === 'captions' ? (
                <CaptionPanel onOpenStyle={() => setShowStyleInSheet(true)} />
              ) : activeTool === 'text' ? (
                <TextPanel />
              ) : activeTool === 'stickers' ? (
                <StickersPanel />
              ) : activeTool === 'adjustments' ? (
                <AdjustmentsPanel />
              ) : activeTool === 'transitions' ? (
                <TransitionsPanel />
              ) : activeTool === 'audio' ? (
                <AudioPanel />
              ) : activeTool === 'effects' ? (
                <EffectsPanel />
              ) : activeTool === 'canvas' ? (
                <CanvasSettings />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Mobile Navigation Bar (Scrollable for all 9 Tools) */}
      <nav className="h-16 w-full bg-[#111111] border-t border-[#262626] flex items-center px-2 z-30 pb-safe select-none overflow-x-auto no-scrollbar gap-1.5 shadow-2xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`min-w-[54px] h-12 flex flex-col items-center justify-center px-1.5 py-1 rounded-xl transition-all active:scale-95 flex-shrink-0 ${
                isActive
                  ? 'text-[#FFD21F] bg-[#1F1F1F] border border-[#FFD21F]/40'
                  : 'text-[#888888] hover:text-white hover:bg-[#161616]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 stroke-[1.8]" />
              <span className="text-[9px] font-medium tracking-tight whitespace-nowrap">
                {tool.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
