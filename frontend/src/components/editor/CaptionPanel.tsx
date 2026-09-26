import React, { useState } from 'react';
import { Sparkles, Trash2, Plus, Clock, Split, GitMerge, Palette, AlertCircle, Video } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface CaptionPanelProps {
  onOpenStyle: () => void;
}

export const CaptionPanel: React.FC<CaptionPanelProps> = ({ onOpenStyle }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

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
    selectedClipId,
    setSelectedClipId,
    setCurrentTime,
    duration,
  } = useEditorStore();

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  const handleGenerateCaptions = async () => {
    if (!selectedClip) {
      setErrorMessage('Please upload and select a video first before generating captions.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setInfoNotice(null);

    const steps = [
      'Extracting audio from selected video...',
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
      const res = await api.generateCaptions(selectedClip.video_id, projectId);
      clearInterval(interval);
      if (res.segments && res.segments.length > 0) {
        // Offset timestamps to align with selectedClip's timeline start_time
        const offsetSec = selectedClip.start_time || 0;
        const adjustedSegments = res.segments.map((seg: any) => ({
          ...seg,
          start: Math.round((seg.start + offsetSec) * 100) / 100,
          end: Math.round((seg.end + offsetSec) * 100) / 100,
          words: (seg.words || []).map((w: any) => ({
            ...w,
            start: Math.round((w.start + offsetSec) * 100) / 100,
            end: Math.round((w.end + offsetSec) * 100) / 100,
          })),
        }));

        // Replace captions specifically for selectedClip's time range, preserving other clips' captions
        const clipStart = selectedClip.start_time || 0;
        const clipEnd = clipStart + ((selectedClip.trim_end || selectedClip.duration) - (selectedClip.trim_start || 0));
        const otherCaptions = captions.filter((c) => c.end <= clipStart || c.start >= clipEnd);
        const finalCaptions = [...otherCaptions, ...adjustedSegments].sort((a, b) => a.start - b.start);

        setCaptions(finalCaptions);
        setStatusMessage(null);
        setInfoNotice(`Transcribed ${res.segments.length} captions for "${selectedClip.filename}"!`);
      } else {
        setInfoNotice(`No spoken words detected in "${selectedClip.filename}".`);
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
    <div className="p-4 space-y-4 text-sm min-h-full flex flex-col pb-28 sm:pb-32">
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

      {/* Target Video Selector (Transcribe only selected video) */}
      {clips.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#2B2B2B] rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#A0A0A0]">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#FFD21F]">
              Selected Video
            </span>
            <span>{clips.length > 1 ? `${clips.length} videos on timeline` : '1 video'}</span>
          </div>

          {clips.length === 1 ? (
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#222222] border border-[#333333] text-xs text-white">
              <Video className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
              <span className="truncate flex-1 font-medium">{selectedClip.filename}</span>
              <span className="text-[10px] font-mono text-[#A0A0A0]">
                {((selectedClip.trim_end || selectedClip.duration) - (selectedClip.trim_start || 0)).toFixed(1)}s
              </span>
            </div>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
              {clips.map((clip) => {
                const isTarget = selectedClip?.id === clip.id;
                const dur = ((clip.trim_end || clip.duration) - (clip.trim_start || 0)).toFixed(1);
                return (
                  <button
                    key={clip.id}
                    onClick={() => setSelectedClipId(clip.id)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between border transition-all text-xs ${
                      isTarget
                        ? 'bg-[#FFD21F]/15 border-[#FFD21F] text-white font-medium ring-1 ring-[#FFD21F]/40'
                        : 'bg-[#222222] border-[#2E2E2E] text-gray-300 hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 min-w-0 mr-2">
                      <Video className={`w-3.5 h-3.5 flex-shrink-0 ${isTarget ? 'text-[#FFD21F]' : 'text-gray-400'}`} />
                      <span className="truncate">{clip.filename}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {isTarget && (
                        <span className="text-[8px] bg-[#FFD21F] text-black px-1 rounded font-bold font-mono">
                          SELECTED
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#A0A0A0]">
                        {dur}s
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Generate Button */}
      <button
        onClick={handleGenerateCaptions}
        disabled={isGenerating || !selectedClip}
        className="w-full py-2.5 px-4 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
        <span>
          {isGenerating
            ? statusMessage || 'Processing...'
            : selectedClip
            ? `Transcribe Selected Video (${selectedClip.filename.slice(0, 16)}${selectedClip.filename.length > 16 ? '...' : ''})`
            : 'Generate AI Captions'}
        </span>
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

      {infoNotice && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-xl space-y-2.5 text-xs text-amber-200 animate-fade-in shadow-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-[#FFD21F] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoNotice}</span>
          </div>
          <button
            onClick={handleAddNewSegment}
            className="w-full py-2 px-3 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Manual Subtitle</span>
          </button>
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
