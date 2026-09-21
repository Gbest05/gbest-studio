import React, { useState } from 'react';
import { Sparkles, Trash2, Plus, Clock, Split, GitMerge, Palette, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface CaptionPanelProps {
  onOpenStyle: () => void;
}

export const CaptionPanel: React.FC<CaptionPanelProps> = ({ onOpenStyle }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    clips,
    projectId,
    captions,
    setCaptions,
    updateCaption,
    removeCaption,
    addCaption,
    splitCaption,
    selectedCaptionId,
    setSelectedCaptionId,
    setCurrentTime,
    duration,
  } = useEditorStore();

  const primaryClip = clips[0];

  const handleGenerateCaptions = async () => {
    if (!primaryClip) {
      setErrorMessage('Please upload a video first before generating captions.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const steps = [
      'Extracting audio...',
      'Analyzing speech patterns...',
      'Generating AI transcript...',
      'Synchronizing timestamps...',
      'Finalizing captions...',
    ];

    let stepIdx = 0;
    setStatusMessage(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setStatusMessage(steps[stepIdx]);
      }
    }, 900);

    try {
      const res = await api.generateCaptions(primaryClip.video_id, projectId);
      clearInterval(interval);
      if (res.segments && res.segments.length > 0) {
        setCaptions(res.segments);
        setStatusMessage(null);
      } else {
        throw new Error('No caption segments generated');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Caption generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setStatusMessage(null);
    }
  };

  const handleMergeNext = (index: number) => {
    if (index >= captions.length - 1) return;
    const current = captions[index];
    const next = captions[index + 1];

    const merged = {
      ...current,
      end: next.end,
      text: `${current.text} ${next.text}`,
      words: [...(current.words || []), ...(next.words || [])],
    };

    const updated = [...captions];
    updated.splice(index, 2, merged);
    setCaptions(updated);
  };

  const handleAddNewSegment = () => {
    const lastCap = captions[captions.length - 1];
    const start = lastCap ? lastCap.end + 0.2 : 0.5;
    const end = Math.min(duration || 10, start + 2.5);

    const newSegment = {
      id: `cap_${Date.now()}`,
      start: Math.round(start * 100) / 100,
      end: Math.round(end * 100) / 100,
      text: 'New Caption Text',
      words: [
        { word: 'New', start: start, end: start + 0.6 },
        { word: 'Caption', start: start + 0.7, end: start + 1.4 },
        { word: 'Text', start: start + 1.5, end: end },
      ],
      style: { preset: 'yellow_highlight' as const },
    };
    addCaption(newSegment);
  };

  return (
    <div className="p-4 space-y-4 text-sm h-full flex flex-col">
      {/* Header & Style shortcut */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-base">AI Captions</h3>
          <p className="text-xs text-[#A0A0A0]">Generate & edit accurate speech subtitles.</p>
        </div>
        <button
          onClick={onOpenStyle}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2F2F2F] border border-[#383838] text-xs text-[#FFD21F] font-medium transition-colors"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>
      </div>

      {/* AI Generate Button */}
      <button
        onClick={handleGenerateCaptions}
        disabled={isGenerating || !primaryClip}
        className="w-full py-2.5 px-4 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
        <span>{isGenerating ? statusMessage || 'Processing...' : 'Generate AI Captions'}</span>
      </button>

      {/* Status Progress */}
      {isGenerating && (
        <div className="p-3 bg-[#1B1B1B] border border-[#FFD21F]/40 rounded-lg text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-5 h-5 border-2 border-[#FFD21F] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs text-[#FFD21F] font-medium animate-pulse">{statusMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-2 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <div className="flex items-center justify-between text-xs text-[#777777] uppercase tracking-wider font-semibold">
          <span>Segments ({captions.length})</span>
          <button
            onClick={handleAddNewSegment}
            className="flex items-center space-x-1 text-[#FFD21F] hover:underline normal-case"
          >
            <Plus className="w-3 h-3" />
            <span>Add Block</span>
          </button>
        </div>

        {captions.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#666666]">
            No captions yet. Click "Generate AI Captions" to transcribe your video automatically.
          </div>
        ) : (
          captions.map((cap, idx) => {
            const isSelected = selectedCaptionId === cap.id;

            return (
              <div
                key={cap.id}
                onClick={() => {
                  setSelectedCaptionId(cap.id);
                  setCurrentTime(cap.start);
                }}
                className={`p-3 rounded-lg border transition-all space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#212121] border-[#FFD21F] shadow-md shadow-amber-500/10'
                    : 'bg-[#181818] border-[#2A2A2A] hover:border-[#383838]'
                }`}
              >
                {/* Time Range & Action Buttons */}
                <div className="flex items-center justify-between text-xs text-[#888888]">
                  <div className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3 h-3 text-[#A0A0A0]" />
                    <input
                      type="number"
                      step="0.1"
                      value={cap.start}
                      onChange={(e) => updateCaption(cap.id, { start: parseFloat(e.target.value) || 0 })}
                      className="w-12 bg-[#141414] border border-[#333333] rounded px-1 py-0.5 text-[11px] text-white text-center focus:border-[#FFD21F] outline-none"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      step="0.1"
                      value={cap.end}
                      onChange={(e) => updateCaption(cap.id, { end: parseFloat(e.target.value) || 0 })}
                      className="w-12 bg-[#141414] border border-[#333333] rounded px-1 py-0.5 text-[11px] text-white text-center focus:border-[#FFD21F] outline-none"
                    />
                    <span>s</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      title="Split caption"
                      onClick={(e) => {
                        e.stopPropagation();
                        splitCaption(cap.id, cap.start + (cap.end - cap.start) / 2);
                      }}
                      className="p-1 rounded text-[#888888] hover:text-[#FFD21F] hover:bg-[#2B2B2B]"
                    >
                      <Split className="w-3 h-3" />
                    </button>

                    {idx < captions.length - 1 && (
                      <button
                        title="Merge with next caption"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMergeNext(idx);
                        }}
                        className="p-1 rounded text-[#888888] hover:text-[#FFD21F] hover:bg-[#2B2B2B]"
                      >
                        <GitMerge className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      title="Delete caption"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCaption(cap.id);
                      }}
                      className="p-1 rounded text-[#888888] hover:text-red-400 hover:bg-[#2B2B2B]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Editable Text Area */}
                <textarea
                  rows={2}
                  value={cap.text}
                  onChange={(e) => updateCaption(cap.id, { text: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-[#131313] border border-[#2D2D2D] focus:border-[#FFD21F] rounded p-2 text-xs text-white resize-none outline-none leading-relaxed"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
