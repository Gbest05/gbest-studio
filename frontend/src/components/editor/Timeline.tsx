import React, { useRef, useState } from 'react';
import {
  Scissors,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  Type,
  Music,
  Video as VideoIcon,
  Sparkles,
  Smile,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Edit3,
  Film,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Tooltip } from '../common/Tooltip';
import { api } from '../../services/api';
import { CoverModal } from './CoverModal';

export const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [activeTrackRole, setActiveTrackRole] = useState<'video' | 'captions' | 'overlays' | 'audio' | null>(null);
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({});
  const [hiddenTracks, setHiddenTracks] = useState<Record<string, boolean>>({});
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});

  const toggleLock = (track: string) =>
    setLockedTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  const toggleHide = (track: string) =>
    setHiddenTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  const toggleMute = (track: string) =>
    setMutedTracks((prev) => ({ ...prev, [track]: !prev[track] }));

  const {
    projectId,
    duration,
    currentTime,
    setCurrentTime,
    timelineZoom,
    setTimelineZoom,
    clips,
    splitClipAtPlayhead,
    removeClip,
    updateClip,
    selectedClipId,
    setSelectedClipId,
    captions,
    setCaptions,
    selectedCaptionId,
    setSelectedCaptionId,
    removeCaption,
    addCaption,
    updateCaption,
    splitCaption,
    audioTracks,
    selectedAudioId,
    setSelectedAudioId,
    removeAudioTrack,
    updateAudioTrack,
    updateClipTrim,
    setActiveTool,
    stickerOverlays,
    selectedStickerId,
    setSelectedStickerId,
    updateSticker,
    removeSticker,
    imageOverlays,
    selectedImageId,
    setSelectedImageId,
    updateImageOverlay,
    removeImageOverlay,
    videoOverlays,
    selectedVideoOverlayId,
    setSelectedVideoOverlayId,
    updateVideoOverlay,
    removeVideoOverlay,
    textOverlays,
    selectedTextId,
    setSelectedTextId,
    updateTextOverlay,
    removeTextOverlay,
    moveClipToOverlay,
    moveOverlayToMainTrack,
    theme,
    coverImage,
    isTimelineFloating,
    setIsTimelineFloating,
    isCompactTracks,
    setIsCompactTracks,
    isTrackSideCollapsed,
    setIsTrackSideCollapsed,
    selectedItemIds,
    setSelectedItemIds,
    toggleItemSelection,
    selectAllItems,
    clearAllSelections,
    deleteSelectedItems,
    batchMoveItems,
  } = useEditorStore();

  const [activeDragItem, setActiveDragItem] = useState<{
    id: string;
    type: 'clip' | 'overlay' | 'caption' | 'audio' | 'text';
    origStart: number;
    deltaSec: number;
  } | null>(null);

  const isLight = theme === 'light';

  const totalDuration = Math.max(
    duration || 0,
    ...clips.map((c) => (c.start_time || 0) + ((c.trim_end || c.duration || 0) - (c.trim_start || 0))),
    ...audioTracks.map((a) => (a.start_offset || 0) + (a.duration || 0)),
    ...captions.map((c) => c.end || 0),
    ...videoOverlays.map((v) => v.end_time || 0),
    ...textOverlays.map((t) => t.end_time || 0),
    ...stickerOverlays.map((s) => s.end_time || 0),
    ...imageOverlays.map((i) => i.end_time || 0),
    10
  );
  const TRACK_OFFSET = 56;
  const basePixelsPerSecond = 30 * timelineZoom;
  const timelineWidth = Math.max(300, TRACK_OFFSET + (totalDuration * basePixelsPerSecond) + 120);

  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth || 600;
    const availableWidth = Math.max(200, clientWidth - 50);
    const targetZoom = availableWidth / (totalDuration * 30);
    setTimelineZoom(Math.max(0.02, Math.min(3.5, Number(targetZoom.toFixed(4)))));
  };

  const hasAutoZoomed = useRef(false);
  React.useEffect(() => {
    if (!hasAutoZoomed.current && totalDuration > 60 && containerRef.current) {
      hasAutoZoomed.current = true;
      handleFitToScreen();
    }
  }, [totalDuration]);

  // Convert X pixel position in timeline to seconds
  const handleSeekFromEvent = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const targetSeconds = Math.max(0, Math.min(totalDuration, (clickX - TRACK_OFFSET) / basePixelsPerSecond));
    setCurrentTime(targetSeconds);
  };

  const handleMouseDownScrub = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleSeekFromEvent(e);
  };

  const handleMouseMoveScrub = (e: React.MouseEvent) => {
    if (isScrubbing) {
      handleSeekFromEvent(e);
    }
  };

  const handleMouseUpScrub = () => {
    setIsScrubbing(false);
  };

  const handleSplit = () => {
    if (selectedCaptionId) {
      splitCaption(selectedCaptionId, currentTime);
    } else {
      splitClipAtPlayhead();
    }
  };

  const handleDeleteSelected = () => {
    deleteSelectedItems();
  };

  // Keyboard shortcut listener for Delete & Ctrl+A
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllItems();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (
          (selectedItemIds && selectedItemIds.length > 0) ||
          selectedClipId ||
          selectedCaptionId ||
          selectedAudioId ||
          selectedVideoOverlayId ||
          selectedImageId ||
          selectedStickerId ||
          selectedTextId
        ) {
          e.preventDefault();
          deleteSelectedItems();
        }
      } else if (e.key === 'Escape') {
        clearAllSelections();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIds, selectedClipId, selectedCaptionId, selectedAudioId, selectedVideoOverlayId, selectedImageId, selectedStickerId, selectedTextId]);

  // Generic mouse drag helper for adjusting seconds / trimming handles and moving items along tracks
  const handleItemDrag = (
    e: React.MouseEvent,
    onMove: (deltaSec: number, clientX: number, deltaY: number) => void,
    onEnd?: (hasMoved: boolean, deltaY: number, deltaSec: number) => void
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    let didMove = false;
    let lastDeltaSec = 0;

    const moveListener = (moveEvt: MouseEvent) => {
      const deltaPx = moveEvt.clientX - startX;
      const deltaPy = moveEvt.clientY - startY;
      if (Math.abs(deltaPx) > 2 || Math.abs(deltaPy) > 2) didMove = true;
      const deltaSec = deltaPx / basePixelsPerSecond;
      lastDeltaSec = deltaSec;
      onMove(deltaSec, moveEvt.clientX, deltaPy);
    };

    const upListener = (upEvt: MouseEvent) => {
      const deltaPy = upEvt.clientY - startY;
      window.removeEventListener('mousemove', moveListener);
      window.removeEventListener('mouseup', upListener);
      if (onEnd) onEnd(didMove, deltaPy, lastDeltaSec);
    };

    window.addEventListener('mousemove', moveListener);
    window.addEventListener('mouseup', upListener);
  };

  const handleAddNewCaptionAtPlayhead = () => {
    const newCap = {
      id: `cap_${Date.now()}`,
      start: roundTo2(currentTime),
      end: roundTo2(Math.min(totalDuration, currentTime + 2.5)),
      text: 'New Caption',
      words: [
        { word: 'New', start: roundTo2(currentTime), end: roundTo2(currentTime + 1.2) },
        { word: 'Caption', start: roundTo2(currentTime + 1.3), end: roundTo2(currentTime + 2.5) },
      ],
      style: { preset: 'yellow_highlight' as const },
    };
    addCaption(newCap);
    clearAllSelections();
    setSelectedCaptionId(newCap.id);
  };

  const handleAutoGenerateFromTimeline = async () => {
    if (!clips || clips.length === 0) return;
    // User Requirement 4: Transcribe ONLY the selected video clip
    const targetClip = clips.find((c) => c.id === selectedClipId) || clips[0];
    setIsGeneratingCaptions(true);
    try {
      const res = await api.generateCaptions(targetClip.video_id, projectId);
      if (res.segments && res.segments.length > 0) {
        // Offset timestamps to align with targetClip's position on timeline
        const offsetSec = targetClip.start_time || 0;
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

        const clipStart = targetClip.start_time || 0;
        const clipEnd = clipStart + ((targetClip.trim_end || targetClip.duration) - (targetClip.trim_start || 0));
        const otherCaptions = captions.filter((c) => c.end <= clipStart || c.start >= clipEnd);
        const finalCaptions = [...otherCaptions, ...adjustedSegments].sort((a, b) => a.start - b.start);

        setCaptions(finalCaptions);
        setActiveTool('captions');
      }
    } catch (e) {
      console.error('Timeline auto caption error:', e);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const roundTo2 = (num: number) => Math.round(num * 100) / 100;

  const formatRulerTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Time markers for the ruler
  const stepSeconds =
    timelineZoom > 2.0
      ? 1
      : timelineZoom > 1.0
      ? 2
      : timelineZoom > 0.4
      ? 5
      : 10;
  const markers: number[] = [];
  for (let s = 0; s <= totalDuration; s += stepSeconds) {
    markers.push(s);
  }

  const minorTicks: number[] = [];
  if (basePixelsPerSecond >= 8) {
    for (let s = 1; s <= totalDuration; s++) {
      if (s % stepSeconds !== 0) {
        minorTicks.push(s);
      }
    }
  }

  const trackHeightClass = isCompactTracks ? 'h-11' : 'h-14 sm:h-16';
  const itemHeightClass = isCompactTracks ? 'h-9' : 'h-12 sm:h-14';

  const playheadLeft = TRACK_OFFSET + (currentTime * basePixelsPerSecond);
  const hasSelectedItem =
    (selectedItemIds && selectedItemIds.length > 0) ||
    selectedClipId ||
    selectedCaptionId ||
    selectedStickerId ||
    selectedImageId ||
    selectedVideoOverlayId ||
    selectedAudioId ||
    selectedTextId;

  return (
    <>
      {/* Cover Page Modal */}
      <CoverModal isOpen={isCoverModalOpen} onClose={() => setIsCoverModalOpen(false)} />

      <div
        className={`timeline-container border-t flex flex-col select-none ${
          isLight
            ? 'bg-white border-[#E2E8F0]'
            : 'bg-[#111111] border-[#242424]'
        } ${
          isTimelineFloating
            ? `fixed bottom-4 left-4 right-4 z-40 rounded-2xl border shadow-2xl backdrop-blur-md max-h-80 ${isLight ? 'bg-white/95 border-slate-300' : 'bg-[#141414]/95 border-[#333333]'}`
            : 'h-64 sm:h-72 lg:h-72 flex-1 lg:flex-none'
        }`}
      >
        {/* Timeline Controls Bar (Mobile Responsive & Touch-Scrollable) */}
        <div className={`timeline-toolbar h-10 border-b px-2 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 select-none flex-nowrap ${
          isLight ? 'bg-white border-[#E2E8F0] text-slate-800' : 'bg-[#161616] border-[#242424] text-white'
        }`}>
          {/* Left Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            {/* Collapse / Expand Track Side Rail Toggle Button with Arrow */}
            <Tooltip content={isTrackSideCollapsed ? "Expand Track Headers (Come Out)" : "Collapse Track Headers (Enter)"}>
              <button
                onClick={() => setIsTrackSideCollapsed(!isTrackSideCollapsed)}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-all border flex-shrink-0 ${
                  isTrackSideCollapsed
                    ? isLight
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-[#FFD21F]/20 text-[#FFD21F] border-[#FFD21F]/40 shadow-xs'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-[#1F1F1F] hover:bg-[#282828] border-[#333333] text-gray-300 hover:text-white'
                }`}
                title={isTrackSideCollapsed ? "Expand Track Headers (Come out)" : "Collapse Track Headers (Enter in)"}
              >
                {isTrackSideCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#FFD21F]" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5 text-[#FFD21F]" />
                )}
                <span className="hidden sm:inline">{isTrackSideCollapsed ? 'Tracks' : 'Tracks'}</span>
              </button>
            </Tooltip>

            <div className={`h-4 w-[1px] mx-0.5 ${isLight ? 'bg-slate-300' : 'bg-[#333333]'}`} />

            {/* Split */}
            <Tooltip content="Split at playhead (S)">
              <button
                onClick={handleSplit}
                className={`p-1.5 rounded transition-colors border ${
                  isLight
                    ? 'text-slate-600 hover:text-black hover:bg-slate-100 border-transparent hover:border-slate-300'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#242424] border-transparent hover:border-[#333333]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-[#FFD21F]" />
              </button>
            </Tooltip>

            {/* Delete */}
            <Tooltip content="Delete selected item(s) (Delete)">
              <button
                onClick={handleDeleteSelected}
                disabled={!hasSelectedItem}
                className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
                  isLight
                    ? 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                    : 'text-[#A0A0A0] hover:text-red-400 hover:bg-[#242424]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Multi-Select / Select All Toggle */}
            <Tooltip content={selectedItemIds.length > 0 ? "Deselect all (Esc)" : "Select all items (Ctrl+A)"}>
              <button
                onClick={() => {
                  if (selectedItemIds.length > 0) {
                    clearAllSelections();
                  } else {
                    selectAllItems();
                  }
                }}
                className={`p-1.5 rounded transition-colors border flex items-center space-x-1 ${
                  selectedItemIds.length > 1
                    ? isLight
                      ? 'bg-amber-100 text-amber-900 border-amber-400'
                      : 'bg-[#FFD21F]/20 text-[#FFD21F] border-[#FFD21F]/50'
                    : isLight
                    ? 'text-slate-600 hover:text-black hover:bg-slate-100 border-transparent hover:border-slate-300'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#242424] border-transparent hover:border-[#333333]'
                }`}
                title="Select all items across tracks"
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                {selectedItemIds.length > 1 && (
                  <span className="text-[9.5px] font-mono font-bold px-1 rounded bg-amber-500/20">{selectedItemIds.length}</span>
                )}
              </button>
            </Tooltip>

            <div className={`h-4 w-[1px] mx-0.5 sm:mx-1 ${isLight ? 'bg-slate-300' : 'bg-[#333333]'}`} />

            {/* Add Cover Button */}
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded text-xs font-semibold transition-colors flex-shrink-0 border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 hover:border-amber-500'
                  : 'bg-[#1F1F1F] hover:bg-[#282828] border-[#333333] hover:border-[#FFD21F] text-white'
              }`}
              title="Add or edit video cover thumbnail"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>Cover</span>
              {coverImage && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD21F] ring-2 ring-[#FFD21F]/30" />
              )}
            </button>

            {/* Add Caption */}
            <button
              onClick={handleAddNewCaptionAtPlayhead}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-[#1F1F1F] hover:bg-[#282828] border-[#333333] text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>Caption</span>
            </button>

            {/* Auto AI Captions on Selected Video */}
            <button
              onClick={handleAutoGenerateFromTimeline}
              disabled={isGeneratingCaptions || clips.length === 0}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-40 flex-shrink-0 border ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-[#FFD21F]/15 hover:bg-[#FFD21F]/25 border-[#FFD21F]/40 text-[#FFD21F]'
              }`}
              title={selectedClipId ? `Transcribe speech for selected video: "${clips.find(c => c.id === selectedClipId)?.filename || 'Video'}"` : 'Transcribe video speech'}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{isGeneratingCaptions ? 'Transcribing...' : selectedClipId ? 'Transcribe Selected' : 'Transcribe'}</span>
            </button>
          </div>

          {/* Right Actions: Compact View, Float/Detach, Zoom */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
            {/* Decrease Track Height Toggle (- / +) */}
            <Tooltip content={isCompactTracks ? 'Standard Track Height (+)' : 'Compact Slim Tracks (-)'}>
              <button
                onClick={() => setIsCompactTracks(!isCompactTracks)}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-colors border flex-shrink-0 ${
                  isCompactTracks
                    ? isLight
                      ? 'bg-amber-100 text-amber-900 border-amber-400'
                      : 'bg-[#FFD21F]/20 text-[#FFD21F] border-[#FFD21F]/40'
                    : isLight
                    ? 'text-slate-600 hover:text-black bg-slate-100 border-slate-300'
                    : 'text-[#A0A0A0] hover:text-white bg-[#1F1F1F] border-[#333333]'
                }`}
              >
                <span>{isCompactTracks ? '+ Standard' : '- Compact'}</span>
              </button>
            </Tooltip>

            {/* Detach / Float Track Toggle */}
            <Tooltip content={isTimelineFloating ? 'Dock Timeline Back' : 'Detach / Float Timeline'}>
              <button
                onClick={() => setIsTimelineFloating(!isTimelineFloating)}
                className={`p-1.5 rounded transition-colors border flex-shrink-0 ${
                  isTimelineFloating
                    ? 'bg-[#FFD21F] text-black border-[#FFD21F] shadow'
                    : isLight
                    ? 'text-slate-600 hover:text-black bg-slate-100 border-slate-300'
                    : 'text-[#A0A0A0] hover:text-white bg-[#1F1F1F] border-[#333333]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <div className={`h-4 w-[1px] hidden sm:block ${isLight ? 'bg-slate-300' : 'bg-[#333333]'}`} />

            {/* Zoom Controls & Fit to Screen */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
              <Tooltip content="Fit Entire Project in View">
                <button
                  onClick={handleFitToScreen}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors flex-shrink-0 border ${
                    isLight
                      ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                      : 'text-[#FFD21F] bg-[#1F1F1F] hover:bg-[#282828] border-[#3A3A3A] hover:border-[#FFD21F]/50'
                  }`}
                  title="Fit all clips to screen"
                >
                  FIT
                </button>
              </Tooltip>

              <button
                onClick={() => setTimelineZoom(Math.max(0.04, Number((timelineZoom * 0.75).toFixed(3))))}
                className={`p-1 transition-colors ${isLight ? 'text-slate-500 hover:text-black' : 'text-[#A0A0A0] hover:text-white'}`}
                title="Zoom Out (Reduce Track)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0.04"
                max="3.5"
                step="0.02"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
                className="w-12 sm:w-16 accent-[#FFD21F] cursor-pointer"
                title={`Zoom: ${Math.round(timelineZoom * 100)}%`}
              />
              <button
                onClick={() => setTimelineZoom(Math.min(3.5, Number((timelineZoom * 1.3).toFixed(3))))}
                className={`p-1 transition-colors ${isLight ? 'text-slate-500 hover:text-black' : 'text-[#A0A0A0] hover:text-white'}`}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Track Workspace: Left Control Rail + Right Tracks Area */}
        <div className={`timeline-workspace flex-1 flex overflow-hidden relative ${
          isLight ? 'bg-[#F8FAFC]' : 'bg-[#111111]'
        }`}>
          {/* Left Track Headers Rail (Collapsible Control Column with Arrow Controls) */}
          <div className={`timeline-rail flex-shrink-0 border-r flex flex-col select-none z-20 transition-all duration-200 ease-in-out relative group/rail ${
            isTrackSideCollapsed ? 'w-10 sm:w-11' : 'w-40 sm:w-44'
          } ${
            isLight ? 'bg-slate-50 border-[#E2E8F0] text-slate-700' : 'bg-[#141414] border-[#262626] text-gray-300'
          }`}>
            {/* Quick floating arrow tab on rail border */}
            <button
              onClick={() => setIsTrackSideCollapsed(!isTrackSideCollapsed)}
              className={`absolute -right-3 top-7 z-30 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-black shadow-slate-300'
                  : 'bg-[#202020] border-[#383838] text-gray-300 hover:bg-[#2A2A2A] hover:text-white shadow-black'
              }`}
              title={isTrackSideCollapsed ? "Expand Track Headers (Come Out) [Alt+T]" : "Collapse Track Headers (Enter) [Alt+T]"}
            >
              {isTrackSideCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-[#FFD21F] hover:scale-110 transition-transform" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 text-[#FFD21F] hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Top ruler corner spacer with Tracks Title and Arrow Toggle Button */}
            <div className={`h-7 border-b flex items-center transition-all ${
              isTrackSideCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'
            } ${
              isLight ? 'bg-slate-100 border-[#E2E8F0]' : 'bg-[#141414] border-[#262626]'
            }`}>
              {!isTrackSideCollapsed && (
                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Tracks
                </span>
              )}
              <Tooltip content={isTrackSideCollapsed ? "Expand Track Headers (Come Out) [Alt+T]" : "Collapse Track Headers (Enter) [Alt+T]"}>
                <button
                  onClick={() => setIsTrackSideCollapsed(!isTrackSideCollapsed)}
                  className={`p-1 rounded-md transition-all flex items-center justify-center ${
                    isLight
                      ? 'hover:bg-slate-200 text-slate-600 hover:text-black'
                      : 'hover:bg-[#252525] text-gray-400 hover:text-white'
                  }`}
                  title={isTrackSideCollapsed ? "Expand Track Headers (Come Out)" : "Collapse Track Headers (Enter)"}
                >
                  {isTrackSideCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-[#FFD21F] hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-[#FFD21F] hover:scale-110 transition-transform" />
                  )}
                </button>
              </Tooltip>
            </div>

            {/* 1. Rail: Overlay Video Track */}
            {isTrackSideCollapsed ? (
              <div
                className={`${trackHeightClass} border-b flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'border-[#E2E8F0] hover:bg-slate-100' : 'border-[#222222] hover:bg-[#1A1A1A]'
                }`}
                onClick={() => setIsTrackSideCollapsed(false)}
                title="Overlay Track (Text, PIP, Stickers, Images) - Click to expand"
              >
                <div className="relative">
                  <Layers className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  {(lockedTracks['overlay'] || hiddenTracks['overlay'] || mutedTracks['overlay']) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-black" />
                  )}
                </div>
              </div>
            ) : (
              <div className={`${trackHeightClass} border-b px-2.5 flex items-center justify-between ${
                isLight ? 'border-[#E2E8F0]' : 'border-[#222222]'
              }`}>
                <div className="flex items-center space-x-1.5 min-w-0" title="Overlay Track (Text, PIP, Stickers, Images)">
                  <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className={`text-[11px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Overlays</span>
                </div>
                <div className={`flex items-center space-x-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <button
                    onClick={() => toggleLock('overlay')}
                    className={`p-1 rounded transition-colors ${lockedTracks['overlay'] ? (isLight ? 'text-amber-600' : 'text-[#FFD21F]') : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={lockedTracks['overlay'] ? 'Unlock PIP track' : 'Lock PIP track'}
                  >
                    {lockedTracks['overlay'] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleHide('overlay')}
                    className={`p-1 rounded transition-colors ${hiddenTracks['overlay'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={hiddenTracks['overlay'] ? 'Show PIP track' : 'Hide PIP track'}
                  >
                    {hiddenTracks['overlay'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleMute('overlay')}
                    className={`p-1 rounded transition-colors ${mutedTracks['overlay'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={mutedTracks['overlay'] ? 'Unmute PIP track' : 'Mute PIP track'}
                  >
                    {mutedTracks['overlay'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Rail: Main Video Track */}
            {isTrackSideCollapsed ? (
              <div
                className={`${trackHeightClass} border-b flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'border-[#E2E8F0] hover:bg-slate-100' : 'border-[#222222] hover:bg-[#1A1A1A]'
                }`}
                onClick={() => setIsTrackSideCollapsed(false)}
                title="Main Video Track - Click to expand"
              >
                <div className="relative">
                  <Film className={`w-4 h-4 ${isLight ? 'text-teal-600' : 'text-teal-400'}`} />
                  {(lockedTracks['video'] || hiddenTracks['video'] || mutedTracks['video']) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-black" />
                  )}
                </div>
              </div>
            ) : (
              <div className={`${trackHeightClass} border-b px-2.5 flex items-center justify-between ${
                isLight ? 'border-[#E2E8F0]' : 'border-[#222222]'
              }`}>
                <div className="flex items-center space-x-1.5 min-w-0" title="Main Video Track">
                  <Film className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-teal-600' : 'text-teal-400'}`} />
                  <span className={`text-[11px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Video</span>
                </div>
                <div className={`flex items-center space-x-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <button
                    onClick={() => toggleLock('video')}
                    className={`p-1 rounded transition-colors ${lockedTracks['video'] ? (isLight ? 'text-amber-600' : 'text-[#FFD21F]') : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={lockedTracks['video'] ? 'Unlock video track' : 'Lock video track'}
                  >
                    {lockedTracks['video'] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleHide('video')}
                    className={`p-1 rounded transition-colors ${hiddenTracks['video'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={hiddenTracks['video'] ? 'Show video track' : 'Hide video track'}
                  >
                    {hiddenTracks['video'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleMute('video')}
                    className={`p-1 rounded transition-colors ${mutedTracks['video'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={mutedTracks['video'] ? 'Unmute video track' : 'Mute video track'}
                  >
                    {mutedTracks['video'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            )}

            {/* 3. Rail: Captions Track */}
            {isTrackSideCollapsed ? (
              <div
                className={`h-9 sm:h-10 border-b flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'border-[#E2E8F0] hover:bg-slate-100' : 'border-[#222222] hover:bg-[#1A1A1A]'
                }`}
                onClick={() => setIsTrackSideCollapsed(false)}
                title="Captions & Text Track - Click to expand"
              >
                <div className="relative">
                  <Type className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  {(lockedTracks['captions'] || hiddenTracks['captions']) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-black" />
                  )}
                </div>
              </div>
            ) : (
              <div className={`h-9 sm:h-10 border-b px-2.5 flex items-center justify-between ${
                isLight ? 'border-[#E2E8F0]' : 'border-[#222222]'
              }`}>
                <div className="flex items-center space-x-1.5 min-w-0" title="Captions & Text Track">
                  <Type className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span className={`text-[11px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Captions</span>
                </div>
                <div className={`flex items-center space-x-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <button
                    onClick={() => toggleLock('captions')}
                    className={`p-1 rounded transition-colors ${lockedTracks['captions'] ? (isLight ? 'text-amber-600' : 'text-[#FFD21F]') : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={lockedTracks['captions'] ? 'Unlock captions' : 'Lock captions'}
                  >
                    {lockedTracks['captions'] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleHide('captions')}
                    className={`p-1 rounded transition-colors ${hiddenTracks['captions'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={hiddenTracks['captions'] ? 'Show captions' : 'Hide captions'}
                  >
                    {hiddenTracks['captions'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            )}

            {/* 4. Rail: Audio Track */}
            {isTrackSideCollapsed ? (
              <div
                className={`h-10 sm:h-11 flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#1A1A1A]'
                }`}
                onClick={() => setIsTrackSideCollapsed(false)}
                title="Audio & Music Track - Click to expand"
              >
                <div className="relative">
                  <Music className={`w-4 h-4 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
                  {(lockedTracks['audio'] || mutedTracks['audio']) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-black" />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-10 sm:h-11 px-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0" title="Audio & Music Track">
                  <Music className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
                  <span className={`text-[11px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Audio</span>
                </div>
                <div className={`flex items-center space-x-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <button
                    onClick={() => toggleLock('audio')}
                    className={`p-1 rounded transition-colors ${lockedTracks['audio'] ? (isLight ? 'text-amber-600' : 'text-[#FFD21F]') : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={lockedTracks['audio'] ? 'Unlock audio track' : 'Lock audio track'}
                  >
                    {lockedTracks['audio'] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                  <button
                    onClick={() => toggleMute('audio')}
                    className={`p-1 rounded transition-colors ${mutedTracks['audio'] ? 'text-red-500' : (isLight ? 'hover:text-black' : 'hover:text-white')}`}
                    title={mutedTracks['audio'] ? 'Unmute audio track' : 'Mute audio track'}
                  >
                    {mutedTracks['audio'] ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-60 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Tracks Area (Horizontally scrollable only, NO VERTICAL SCROLLBAR) */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDownScrub}
            onMouseMove={handleMouseMoveScrub}
            onMouseUp={handleMouseUpScrub}
            onMouseLeave={handleMouseUpScrub}
            onClick={(e) => {
              if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('track-lane')) {
                clearAllSelections();
                setActiveTrackRole(null);
              }
            }}
            className={`flex-1 overflow-x-auto overflow-y-hidden relative ${
              isLight ? 'bg-[#F8FAFC]' : 'bg-[#111111]'
            }`}
          >
            <div style={{ width: `${timelineWidth}px` }} className="relative h-full select-none">
              {/* Time Ruler */}
              <div className={`timeline-ruler h-7 border-b relative flex items-end ${
                isLight ? 'bg-slate-100 border-[#E2E8F0]' : 'bg-[#161616] border-[#262626]'
              }`}>
                {/* Minor 1-second tick marks */}
                {minorTicks.map((sec) => (
                  <div
                    key={`tick-${sec}`}
                    className={`absolute bottom-0 w-[1px] h-1.5 pointer-events-none select-none ${
                      isLight ? 'bg-slate-300' : 'bg-[#383838]'
                    }`}
                    style={{ left: `${TRACK_OFFSET + sec * basePixelsPerSecond}px` }}
                  />
                ))}

                {/* Major time markers */}
                {markers.map((sec) => (
                  <div
                    key={sec}
                    className={`absolute bottom-0 text-[10px] font-mono border-l pl-1 h-3.5 flex items-start select-none pointer-events-none ${
                      isLight ? 'text-slate-600 border-slate-300' : 'text-[#888888] border-[#444444]'
                    }`}
                    style={{ left: `${TRACK_OFFSET + sec * basePixelsPerSecond}px` }}
                  >
                    {formatRulerTime(sec)}
                  </div>
                ))}
              </div>

              {/* Tracks Container */}
              <div className="flex flex-col">
                {/* 1. Overlay / Picture-in-Picture Track Lane */}
                <div
                  className={`track-lane timeline-lane ${trackHeightClass} border-b relative flex items-center overflow-visible transition-colors ${
                    isLight
                      ? activeTrackRole === 'overlays'
                        ? 'bg-teal-50/50 border-[#E2E8F0]'
                        : 'bg-white border-[#E2E8F0]'
                      : activeTrackRole === 'overlays'
                      ? 'bg-[#151c1a] border-[#202020]'
                      : 'bg-[#141414] border-[#202020]'
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      clearAllSelections();
                      setActiveTrackRole('overlays');
                    }
                  }}
                >
                  {/* Overlay Videos (Picture-in-Picture / Deep Teal Theme with Filmstrip & Waveform) */}
                  {(videoOverlays || []).map((vOverlay) => {
                    const ovDur = Math.max(0.2, vOverlay.end_time - vOverlay.start_time);
                    const isDraggingThis = activeDragItem && activeDragItem.id === vOverlay.id;
                    const isBatchDragging = activeDragItem && selectedItemIds.includes(vOverlay.id) && selectedItemIds.includes(activeDragItem.id);
                    const dragOffsetSec = (isDraggingThis || isBatchDragging) ? activeDragItem!.deltaSec : 0;
                    const effectiveStart = Math.max(0, vOverlay.start_time + dragOffsetSec);
                    const leftPx = TRACK_OFFSET + (effectiveStart * basePixelsPerSecond);
                    const widthPx = Math.max(36, ovDur * basePixelsPerSecond);
                    const isSelected = selectedVideoOverlayId === vOverlay.id || selectedItemIds.includes(vOverlay.id);

                    return (
                      <div
                        key={vOverlay.id}
                        onMouseDown={(e) => {
                          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
                          const isAlreadySelected = selectedItemIds.includes(vOverlay.id);

                          if (isMulti) {
                            toggleItemSelection(vOverlay.id, true);
                          } else if (!isAlreadySelected) {
                            toggleItemSelection(vOverlay.id, false);
                          }

                          const origStart = vOverlay.start_time;
                          const dur = vOverlay.end_time - vOverlay.start_time;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              // Smooth live drag without shifting other media
                              setActiveDragItem({
                                id: vOverlay.id,
                                type: 'overlay',
                                origStart,
                                deltaSec,
                              });
                            },
                            (didMove, deltaY, finalDeltaSec) => {
                              setActiveDragItem(null);
                              if (deltaY > 35) {
                                // Dragged down into Track 2 (Main Video Track)
                                moveOverlayToMainTrack(vOverlay.id);
                                return;
                              }
                              if (didMove) {
                                if (selectedItemIds.length > 1 && selectedItemIds.includes(vOverlay.id)) {
                                  batchMoveItems(selectedItemIds, finalDeltaSec);
                                } else {
                                  const newStart = Math.max(0, origStart + finalDeltaSec);
                                  updateVideoOverlay(vOverlay.id, {
                                    start_time: roundTo2(newStart),
                                    end_time: roundTo2(newStart + dur),
                                  });
                                }
                              } else {
                                if (!isMulti) {
                                  clearAllSelections();
                                  toggleItemSelection(vOverlay.id, false);
                                  setSelectedVideoOverlayId(vOverlay.id);
                                  setCurrentTime(vOverlay.start_time);
                                }
                              }
                            }
                          );
                        }}
                        className={`absolute ${itemHeightClass} rounded-md border transition-all cursor-move flex flex-col overflow-hidden select-none group timeline-clip timeline-track-item keep-white ${
                          isDraggingThis ? 'z-30 shadow-2xl opacity-90 scale-[1.01] ring-2 ring-amber-400' : 'z-10'
                        } ${
                          isSelected
                            ? 'border-teal-300 ring-2 ring-amber-400 shadow-lg shadow-teal-900/60 bg-[#0a3a38]'
                            : 'border-[#0e6e69] bg-[#0a3836] hover:border-teal-400'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Overlay: ${vOverlay.filename || 'Overlay'} [${vOverlay.start_time.toFixed(1)}s - ${vOverlay.end_time.toFixed(1)}s]`}
                      >
                        {/* Top Header Strip with Filename */}
                        <div className="h-4 bg-[#0d5550] px-1.5 flex items-center justify-between text-[9.5px] font-medium text-white truncate pointer-events-auto flex-shrink-0 keep-white">
                          <div className="flex items-center space-x-1 min-w-0 truncate">
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[7px] font-bold flex-shrink-0">✓</span>
                            )}
                            <span className="truncate" style={{ color: '#FFFFFF' }}>{vOverlay.filename || 'Overlay'}</span>
                          </div>
                          <div className="flex items-center space-x-1 ml-1 flex-shrink-0">
                            <span className="text-[8px] font-mono opacity-80" style={{ color: '#FFFFFF' }}>{ovDur.toFixed(1)}s</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveOverlayToMainTrack(vOverlay.id);
                              }}
                              className="pointer-events-auto p-0.5 rounded bg-teal-800 hover:bg-teal-700 text-white flex items-center space-x-0.5 px-1 py-0.2 text-[8px] font-bold shadow-sm transition-colors cursor-pointer"
                              title="Move down to Main Video Track (Track 2)"
                            >
                              <ArrowDown className="w-2.5 h-2.5" />
                              <span style={{ color: '#FFFFFF' }}>To Main</span>
                            </button>
                          </div>
                        </div>

                        {/* Filmstrip Thumbnail Frames */}
                        <div className="flex-1 flex h-full overflow-hidden opacity-85 gap-0.5 pointer-events-none select-none">
                          {Array.from({ length: Math.max(1, Math.min(8, Math.floor(widthPx / 56))) }).map((_, idx) => (
                            <div key={idx} className="h-full flex-1 min-w-[36px] max-w-[80px] bg-[#0c2f2d] border-r border-[#082220]/60 overflow-hidden relative">
                              {vOverlay.url ? (
                                <video
                                  src={`${vOverlay.url}#t=0.1`}
                                  className="w-full h-full object-cover opacity-75"
                                  preload="metadata"
                                  muted
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-3 h-3 text-[#147a74]/40" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Cyan Audio Waveform along the bottom */}
                        <div className="absolute bottom-0 inset-x-0 h-3 pointer-events-none overflow-hidden flex items-end px-1 opacity-90">
                          <svg className="w-full h-2.5" preserveAspectRatio="none" viewBox="0 0 100 20">
                            <path
                              d="M0,15 Q5,5 10,12 T20,8 T30,16 T40,6 T50,14 T60,7 T70,15 T80,5 T90,13 T100,10 L100,20 L0,20 Z"
                              fill="rgba(20, 184, 166, 0.35)"
                            />
                            <path
                              d="M0,15 Q5,5 10,12 T20,8 T30,16 T40,6 T50,14 T60,7 T70,15 T80,5 T90,13 T100,10"
                              fill="none"
                              stroke="#2dd4bf"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origStart = vOverlay.start_time;
                            handleItemDrag(e, (deltaSec) => {
                              const newStart = Math.max(0, Math.min(vOverlay.end_time - 0.2, origStart + deltaSec));
                              updateVideoOverlay(vOverlay.id, { start_time: roundTo2(newStart) });
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2.5 bg-teal-400/80 hover:bg-teal-300 active:bg-white cursor-ew-resize rounded-l z-20 flex items-center justify-center transition-colors"
                          title="Drag left edge to adjust overlay start"
                        >
                          <div className="w-[1px] h-2.5 bg-black/60 rounded-full" />
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origEnd = vOverlay.end_time;
                            handleItemDrag(e, (deltaSec) => {
                              const newEnd = Math.max(vOverlay.start_time + 0.2, origEnd + deltaSec);
                              updateVideoOverlay(vOverlay.id, { end_time: roundTo2(newEnd) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-teal-400/80 hover:bg-teal-300 active:bg-white cursor-ew-resize rounded-r z-20 flex items-center justify-center transition-colors"
                          title="Drag right edge to adjust overlay duration"
                        >
                          <div className="w-[1px] h-2.5 bg-black/60 rounded-full" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Stickers */}
                  {(stickerOverlays || []).map((sticker) => {
                    const stDur = Math.max(0.2, sticker.end_time - sticker.start_time);
                    const leftPx = TRACK_OFFSET + (sticker.start_time * basePixelsPerSecond);
                    const widthPx = Math.max(28, stDur * basePixelsPerSecond);
                    const isSelected = selectedStickerId === sticker.id;

                    return (
                      <div
                        key={sticker.id}
                        onMouseDown={(e) => {
                          const origStart = sticker.start_time;
                          const dur = sticker.end_time - sticker.start_time;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              const newStart = Math.max(0, origStart + deltaSec);
                              updateSticker(sticker.id, {
                                start_time: roundTo2(newStart),
                                end_time: roundTo2(newStart + dur),
                              });
                            },
                            (didMove) => {
                              if (!didMove) {
                                clearAllSelections();
                                setSelectedStickerId(sticker.id);
                                setCurrentTime(sticker.start_time);
                              }
                            }
                          );
                        }}
                        className={`absolute ${itemHeightClass} rounded-lg border transition-all cursor-move flex items-center px-1.5 space-x-1 text-xs truncate overflow-hidden select-none z-10 ${
                          isSelected
                            ? 'bg-purple-400 text-black border-purple-300 font-bold shadow-lg ring-2 ring-white'
                            : 'bg-[#222222] border-[#383838] text-gray-200 hover:border-purple-400/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Sticker (${stDur.toFixed(1)}s)`}
                      >
                        <span className="pointer-events-none flex-shrink-0">{sticker.content ? sticker.content : <Smile className="w-3.5 h-3.5 text-[#FFD21F]" />}</span>
                        <span className="truncate text-[10px] capitalize pointer-events-none">{sticker.type}</span>
                        <div
                          onMouseDown={(e) => {
                            const origEnd = sticker.end_time;
                            handleItemDrag(e, (deltaSec) => {
                              const newEnd = Math.max(sticker.start_time + 0.2, origEnd + deltaSec);
                              updateSticker(sticker.id, { end_time: roundTo2(newEnd) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 bg-purple-400/60 hover:bg-purple-400 cursor-ew-resize rounded-r z-20"
                        />
                      </div>
                    );
                  })}

                  {/* Images */}
                  {(imageOverlays || []).map((img) => {
                    const imgDur = Math.max(0.2, img.end_time - img.start_time);
                    const leftPx = TRACK_OFFSET + (img.start_time * basePixelsPerSecond);
                    const widthPx = Math.max(28, imgDur * basePixelsPerSecond);
                    const isSelected = selectedImageId === img.id;

                    return (
                      <div
                        key={img.id}
                        onMouseDown={(e) => {
                          const origStart = img.start_time;
                          const dur = img.end_time - img.start_time;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              const newStart = Math.max(0, origStart + deltaSec);
                              updateImageOverlay(img.id, {
                                start_time: roundTo2(newStart),
                                end_time: roundTo2(newStart + dur),
                              });
                            },
                            (didMove) => {
                              if (!didMove) {
                                clearAllSelections();
                                setSelectedImageId(img.id);
                                setCurrentTime(img.start_time);
                              }
                            }
                          );
                        }}
                        className={`absolute ${itemHeightClass} rounded-lg border transition-all cursor-move flex items-center px-1.5 space-x-1 text-xs truncate overflow-hidden select-none z-10 ${
                          isSelected
                            ? 'bg-blue-400 text-black border-blue-300 font-bold shadow-lg ring-2 ring-white'
                            : 'bg-[#222222] border-[#383838] text-gray-200 hover:border-blue-400/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Image: ${img.filename}`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0 pointer-events-none" />
                        <span className="truncate text-[10px] pointer-events-none">{img.filename}</span>
                        <div
                          onMouseDown={(e) => {
                            const origEnd = img.end_time;
                            handleItemDrag(e, (deltaSec) => {
                              const newEnd = Math.max(img.start_time + 0.2, origEnd + deltaSec);
                              updateImageOverlay(img.id, { end_time: roundTo2(newEnd) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 bg-blue-400/60 hover:bg-blue-400 cursor-ew-resize rounded-r z-20"
                        />
                      </div>
                    );
                  })}

                  {/* Text Overlays (Draggable, Trimmable, High-Contrast with Type Icon & Text Preview) */}
                  {(textOverlays || []).map((tOverlay) => {
                    const tDur = Math.max(0.2, (tOverlay.end_time || 0) - (tOverlay.start_time || 0));
                    const isDraggingThis = activeDragItem && activeDragItem.id === tOverlay.id;
                    const isBatchDragging = activeDragItem && selectedItemIds.includes(tOverlay.id) && selectedItemIds.includes(activeDragItem.id);
                    const dragOffsetSec = (isDraggingThis || isBatchDragging) ? activeDragItem!.deltaSec : 0;
                    const effectiveStart = Math.max(0, (tOverlay.start_time || 0) + dragOffsetSec);
                    const leftPx = TRACK_OFFSET + (effectiveStart * basePixelsPerSecond);
                    const widthPx = Math.max(36, tDur * basePixelsPerSecond);
                    const isSelected = selectedTextId === tOverlay.id || selectedItemIds.includes(tOverlay.id);

                    return (
                      <div
                        key={tOverlay.id}
                        onMouseDown={(e) => {
                          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
                          const isAlreadySelected = selectedItemIds.includes(tOverlay.id);

                          if (isMulti) {
                            toggleItemSelection(tOverlay.id, true);
                          } else if (!isAlreadySelected) {
                            toggleItemSelection(tOverlay.id, false);
                          }

                          const origStart = tOverlay.start_time || 0;
                          const dur = (tOverlay.end_time || 0) - origStart;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              setActiveDragItem({
                                id: tOverlay.id,
                                type: 'text',
                                origStart,
                                deltaSec,
                              });
                            },
                            (didMove, _deltaY, finalDeltaSec) => {
                              setActiveDragItem(null);
                              if (didMove) {
                                if (selectedItemIds.length > 1 && selectedItemIds.includes(tOverlay.id)) {
                                  batchMoveItems(selectedItemIds, finalDeltaSec);
                                } else {
                                  const newStart = Math.max(0, origStart + finalDeltaSec);
                                  updateTextOverlay(tOverlay.id, {
                                    start_time: roundTo2(newStart),
                                    end_time: roundTo2(newStart + dur),
                                  });
                                }
                              } else {
                                if (!isMulti) {
                                  clearAllSelections();
                                  toggleItemSelection(tOverlay.id, false);
                                  setSelectedTextId(tOverlay.id);
                                  setCurrentTime(tOverlay.start_time || 0);
                                  setActiveTool('text');
                                }
                              }
                            }
                          );
                        }}
                        className={`absolute ${itemHeightClass} rounded-md border transition-all cursor-move flex flex-col justify-center px-2 overflow-hidden select-none group timeline-clip timeline-track-item keep-white ${
                          isDraggingThis ? 'z-30 shadow-2xl opacity-90 scale-[1.01] ring-2 ring-purple-300' : 'z-10'
                        } ${
                          isSelected
                            ? 'border-purple-300 ring-2 ring-amber-400 shadow-lg shadow-purple-950/60 bg-[#4c1d95]'
                            : 'border-[#7c3aed] bg-[#3b0764] hover:border-purple-300'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Text Overlay: "${tOverlay.text || 'Text'}" [${(tOverlay.start_time || 0).toFixed(1)}s - ${(tOverlay.end_time || 0).toFixed(1)}s]`}
                      >
                        <div className="flex items-center space-x-1.5 truncate pointer-events-none">
                          <Type className="w-3.5 h-3.5 text-purple-200 flex-shrink-0" />
                          <span className="truncate text-xs font-semibold" style={{ color: '#FFFFFF' }}>
                            {tOverlay.text || 'Text'}
                          </span>
                          <span className="text-[9px] font-mono opacity-85 flex-shrink-0 px-1 py-0.5 rounded bg-black/40 text-purple-200">
                            {tDur.toFixed(1)}s
                          </span>
                        </div>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origStart = tOverlay.start_time || 0;
                            handleItemDrag(e, (deltaSec) => {
                              const newStart = Math.max(0, Math.min((tOverlay.end_time || 0) - 0.2, origStart + deltaSec));
                              updateTextOverlay(tOverlay.id, { start_time: roundTo2(newStart) });
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2.5 bg-purple-400/80 hover:bg-purple-300 active:bg-white cursor-ew-resize rounded-l z-20 flex items-center justify-center transition-colors"
                          title="Drag left edge to adjust text overlay start"
                        >
                          <div className="w-[1px] h-2.5 bg-black/60 rounded-full" />
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origEnd = tOverlay.end_time || 0;
                            handleItemDrag(e, (deltaSec) => {
                              const newEnd = Math.max((tOverlay.start_time || 0) + 0.2, origEnd + deltaSec);
                              updateTextOverlay(tOverlay.id, { end_time: roundTo2(newEnd) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-purple-400/80 hover:bg-purple-300 active:bg-white cursor-ew-resize rounded-r z-20 flex items-center justify-center transition-colors"
                          title="Drag right edge to adjust text overlay duration"
                        >
                          <div className="w-[1px] h-2.5 bg-black/60 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Main Video Track Lane (with docked Cover button) */}
                <div
                  className={`track-lane timeline-lane ${trackHeightClass} border-b relative flex items-center overflow-visible transition-colors ${
                    isLight
                      ? activeTrackRole === 'video'
                        ? 'bg-teal-50/50 border-[#E2E8F0]'
                        : 'bg-white border-[#E2E8F0]'
                      : activeTrackRole === 'video'
                      ? 'bg-[#131b1a] border-[#202020]'
                      : 'bg-[#141414] border-[#202020]'
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      clearAllSelections();
                      setActiveTrackRole('video');
                    }
                  }}
                >
                  {/* Docked Cover Button (matches media_1790352850056.png) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCoverModalOpen(true);
                    }}
                    className={`absolute left-1 top-1 bottom-1 w-[48px] rounded-md border flex flex-col items-center justify-center cursor-pointer transition-all z-20 shadow-md group ${
                      isLight
                        ? 'border-slate-300 hover:border-[#FFD21F] bg-slate-100 hover:bg-slate-200'
                        : 'border-[#333333] hover:border-[#FFD21F] bg-[#1d1d1d] hover:bg-[#252525]'
                    }`}
                    title="Edit Cover thumbnail"
                  >
                    {coverImage ? (
                      <div className="relative w-full h-full rounded overflow-hidden">
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                          <Edit3 className="w-3 h-3 text-[#FFD21F] mb-0.5" />
                          <span className="text-[8px] font-bold">Cover</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-[#FFD21F] mb-0.5 group-hover:scale-110 transition-transform" />
                        <span className={`text-[9px] font-semibold group-hover:text-white ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Cover</span>
                      </>
                    )}
                  </div>

                  {/* Main Video Clips (Deep Teal Theme with Filmstrip & Cyan Waveform) */}
                  {clips.map((clip) => {
                    const clipStartSec = clip.start_time || 0;
                    const clipLocalStart = clip.trim_start || 0;
                    const clipLocalEnd = clip.trim_end || clip.duration;
                    const clipDur = Math.max(0.2, clipLocalEnd - clipLocalStart);
                    const isDraggingThis = activeDragItem && activeDragItem.id === clip.id;
                    const isBatchDragging = activeDragItem && selectedItemIds.includes(clip.id) && selectedItemIds.includes(activeDragItem.id);
                    const dragOffsetSec = (isDraggingThis || isBatchDragging) ? activeDragItem!.deltaSec : 0;
                    const effectiveStart = Math.max(0, clipStartSec + dragOffsetSec);
                    const leftPx = TRACK_OFFSET + (effectiveStart * basePixelsPerSecond);
                    const widthPx = Math.max(36, clipDur * basePixelsPerSecond);
                    const isSelected = selectedClipId === clip.id || selectedItemIds.includes(clip.id);

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => {
                          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
                          const isAlreadySelected = selectedItemIds.includes(clip.id);

                          if (isMulti) {
                            toggleItemSelection(clip.id, true);
                          } else if (!isAlreadySelected) {
                            toggleItemSelection(clip.id, false);
                          }

                          const origStart = clip.start_time || 0;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              // Smooth live drag without shifting other media
                              setActiveDragItem({
                                id: clip.id,
                                type: 'clip',
                                origStart,
                                deltaSec,
                              });
                            },
                            (didMove, deltaY, finalDeltaSec) => {
                              setActiveDragItem(null);
                              if (deltaY < -35) {
                                // Dragged up into Track 1 (Overlay / PIP track)
                                moveClipToOverlay(clip.id);
                                return;
                              }
                              if (didMove) {
                                if (selectedItemIds.length > 1 && selectedItemIds.includes(clip.id)) {
                                  batchMoveItems(selectedItemIds, finalDeltaSec);
                                } else {
                                  const newStart = Math.max(0, origStart + finalDeltaSec);
                                  updateClip(clip.id, { start_time: roundTo2(newStart) });
                                }
                              } else {
                                if (!isMulti) {
                                  clearAllSelections();
                                  toggleItemSelection(clip.id, false);
                                  setSelectedClipId(clip.id);
                                }
                              }
                            }
                          );
                        }}
                        className={`absolute ${itemHeightClass} rounded-md border transition-all cursor-move flex flex-col overflow-hidden select-none group timeline-clip timeline-track-item keep-white ${
                          isDraggingThis ? 'z-30 shadow-2xl opacity-90 scale-[1.01] ring-2 ring-amber-400' : 'z-10'
                        } ${
                          isSelected
                            ? 'border-teal-300 ring-2 ring-amber-400 shadow-lg shadow-teal-950/60 bg-[#0a3836]'
                            : 'border-[#0d736d] bg-[#0a3836] hover:border-teal-400'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Video: ${clip.filename} [${clipStartSec.toFixed(1)}s - ${(clipStartSec + clipDur).toFixed(1)}s]`}
                      >
                        {/* Top Header Strip with Filename */}
                        <div className="h-4.5 bg-[#0e524e] px-1.5 flex items-center justify-between text-[10px] font-semibold text-white truncate pointer-events-auto flex-shrink-0 keep-white">
                          <div className="flex items-center space-x-1 min-w-0 truncate">
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[7px] font-bold flex-shrink-0">✓</span>
                            )}
                            <span className="truncate" style={{ color: '#FFFFFF' }}>{clip.filename}</span>
                          </div>
                          <div className="flex items-center space-x-1 ml-1 flex-shrink-0">
                            <span className="text-[8.5px] font-mono opacity-80" style={{ color: '#FFFFFF' }}>{clipDur.toFixed(1)}s</span>
                            {clip.transition && clip.transition.type !== 'none' && (
                              <span className="px-1 py-0.2 rounded bg-amber-500/25 border border-[#FFD21F] text-[#FFD21F] text-[8px] font-mono flex items-center space-x-0.5">
                                <Sparkles className="w-2 h-2" />
                                <span className="capitalize">{clip.transition.type}</span>
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveClipToOverlay(clip.id);
                              }}
                              className="pointer-events-auto p-0.5 rounded bg-teal-800 hover:bg-teal-700 text-white flex items-center space-x-0.5 px-1 py-0.2 text-[8px] font-bold shadow-sm transition-colors cursor-pointer"
                              title="Move up to Overlay / PIP Track (Track 1)"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                              <span style={{ color: '#FFFFFF' }}>To PIP</span>
                            </button>
                          </div>
                        </div>

                        {/* Filmstrip Repeating Thumbnail Frames */}
                        <div className="flex-1 flex h-[calc(100%-28px)] overflow-hidden gap-0.5 pointer-events-none select-none">
                          {Array.from({ length: Math.max(1, Math.min(10, Math.floor(widthPx / 56))) }).map((_, idx) => {
                            const isImage = /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(clip.url || '') || /\.(png|jpe?g|webp|svg|gif)$/i.test(clip.filename || '');
                            return (
                              <div key={idx} className="h-full flex-1 min-w-[36px] max-w-[80px] bg-[#0c2f2d] border-r border-[#082220]/60 overflow-hidden relative">
                                {clip.url ? (
                                  isImage ? (
                                    <img
                                      src={clip.url}
                                      alt={clip.filename}
                                      className="w-full h-full object-cover opacity-85"
                                    />
                                  ) : (
                                    <video
                                      src={`${clip.url}#t=${Math.min(clip.duration || 10, clipLocalStart + idx * 2)}`}
                                      className="w-full h-full object-cover opacity-75"
                                      preload="metadata"
                                      muted
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-3 h-3 text-[#147a74]/40" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Cyan Audio Waveform along bottom with subtle peak dots */}
                        <div className="absolute bottom-0 inset-x-0 h-3.5 pointer-events-none overflow-hidden flex items-end px-1 opacity-90">
                          <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 100 20">
                            <path
                              d="M0,15 Q5,5 10,12 T20,8 T30,16 T40,6 T50,14 T60,7 T70,15 T80,5 T90,13 T100,10 L100,20 L0,20 Z"
                              fill="rgba(20, 184, 166, 0.35)"
                            />
                            <path
                              d="M0,15 Q5,5 10,12 T20,8 T30,16 T40,6 T50,14 T60,7 T70,15 T80,5 T90,13 T100,10"
                              fill="none"
                              stroke="#2dd4bf"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origTrimStart = clip.trim_start || 0;
                            const origTrimEnd = clip.trim_end || clip.duration;
                            handleItemDrag(e, (deltaSec) => {
                              const newTrimStart = Math.max(0, Math.min(origTrimEnd - 0.2, origTrimStart + deltaSec));
                              updateClipTrim(clip.id, roundTo2(newTrimStart), origTrimEnd);
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2.5 bg-teal-400/80 hover:bg-teal-300 active:bg-white cursor-ew-resize rounded-l z-20 flex items-center justify-center transition-colors"
                          title="Drag left edge to trim video start"
                        >
                          <div className="w-[1px] h-3 bg-black/70 rounded-full" />
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origTrimStart = clip.trim_start || 0;
                            const origTrimEnd = clip.trim_end || clip.duration;
                            handleItemDrag(e, (deltaSec) => {
                              const newTrimEnd = Math.max(origTrimStart + 0.2, Math.min(clip.duration, origTrimEnd + deltaSec));
                              updateClipTrim(clip.id, origTrimStart, roundTo2(newTrimEnd));
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-teal-400/80 hover:bg-teal-300 active:bg-white cursor-ew-resize rounded-r z-20 flex items-center justify-center transition-colors"
                          title="Drag right edge to trim video end / adjust seconds"
                        >
                          <div className="w-[1px] h-3 bg-black/70 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Captions Track Lane */}
                <div
                  className={`track-lane timeline-lane h-9 sm:h-10 border-b relative flex items-center overflow-visible transition-colors ${
                    isLight
                      ? activeTrackRole === 'captions'
                        ? 'bg-amber-50/50 border-[#E2E8F0]'
                        : 'bg-white border-[#E2E8F0]'
                      : activeTrackRole === 'captions'
                      ? 'bg-[#1c1a14] border-[#202020]'
                      : 'bg-[#141414] border-[#202020]'
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      clearAllSelections();
                      setActiveTrackRole('captions');
                    }
                  }}
                >
                  {captions.map((cap) => {
                    const capDur = Math.max(0.2, cap.end - cap.start);
                    const isDraggingThis = activeDragItem && activeDragItem.id === cap.id;
                    const isBatchDragging = activeDragItem && selectedItemIds.includes(cap.id) && selectedItemIds.includes(activeDragItem.id);
                    const dragOffsetSec = (isDraggingThis || isBatchDragging) ? activeDragItem!.deltaSec : 0;
                    const effectiveStart = Math.max(0, cap.start + dragOffsetSec);
                    const leftPx = TRACK_OFFSET + (effectiveStart * basePixelsPerSecond);
                    const widthPx = Math.max(28, capDur * basePixelsPerSecond);
                    const isSelected = selectedCaptionId === cap.id || selectedItemIds.includes(cap.id);

                    return (
                      <div
                        key={cap.id}
                        onMouseDown={(e) => {
                          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
                          const isAlreadySelected = selectedItemIds.includes(cap.id);

                          if (isMulti) {
                            toggleItemSelection(cap.id, true);
                          } else if (!isAlreadySelected) {
                            toggleItemSelection(cap.id, false);
                          }

                          const origStart = cap.start;
                          const dur = cap.end - cap.start;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              // Smooth live drag without shifting other media
                              setActiveDragItem({
                                id: cap.id,
                                type: 'caption',
                                origStart,
                                deltaSec,
                              });
                            },
                            (didMove, deltaY, finalDeltaSec) => {
                              setActiveDragItem(null);
                              if (didMove) {
                                if (selectedItemIds.length > 1 && selectedItemIds.includes(cap.id)) {
                                  batchMoveItems(selectedItemIds, finalDeltaSec);
                                } else {
                                  const newStart = Math.max(0, origStart + finalDeltaSec);
                                  updateCaption(cap.id, {
                                    start: roundTo2(newStart),
                                    end: roundTo2(newStart + dur),
                                  });
                                }
                              } else {
                                if (!isMulti) {
                                  clearAllSelections();
                                  toggleItemSelection(cap.id, false);
                                  setSelectedCaptionId(cap.id);
                                  setCurrentTime(cap.start);
                                }
                              }
                            }
                          );
                        }}
                        className={`absolute h-7 sm:h-8 rounded border transition-all cursor-move flex items-center px-2 text-xs truncate overflow-hidden font-medium select-none group timeline-track-item ${
                          isDraggingThis ? 'z-30 shadow-2xl opacity-90 scale-[1.01] ring-2 ring-amber-400' : 'z-10'
                        } ${
                          isSelected
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                            : isLight
                            ? 'bg-amber-300/80 text-amber-950 border-amber-400 hover:border-amber-600 shadow-sm'
                            : 'bg-[#252525] text-white border-[#383838] hover:border-[#FFD21F]/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Caption: "${cap.text}" (${capDur.toFixed(1)}s)`}
                      >
                        <Type className={`w-3 h-3 mr-1 flex-shrink-0 pointer-events-none ${
                          isSelected ? 'text-black' : isLight ? 'text-amber-950' : 'text-[#FFD21F]'
                        }`} />
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-950 text-white flex items-center justify-center text-[7px] font-bold mr-1 flex-shrink-0">✓</span>
                        )}
                        <span className={`truncate pointer-events-none text-[11px] px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-black/20 text-black font-bold'
                            : isLight
                            ? 'bg-amber-950/85 text-white shadow-xs font-medium'
                            : 'bg-black/40 text-white'
                        }`}>
                          {cap.text}
                        </span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ml-1 flex-shrink-0 pointer-events-none font-bold ${
                          isSelected ? 'bg-black/40 text-black' : isLight ? 'bg-amber-950/90 text-amber-200' : 'bg-black/50 text-amber-300'
                        }`}>
                          {capDur.toFixed(1)}s
                        </span>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origStart = cap.start;
                            handleItemDrag(e, (deltaSec) => {
                              const newStart = Math.max(0, Math.min(cap.end - 0.2, origStart + deltaSec));
                              updateCaption(cap.id, { start: roundTo2(newStart) });
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400/70 hover:bg-amber-400 cursor-ew-resize rounded-l z-20 flex items-center justify-center transition-colors"
                        />

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origEnd = cap.end;
                            handleItemDrag(e, (deltaSec) => {
                              const newEnd = Math.max(cap.start + 0.2, origEnd + deltaSec);
                              updateCaption(cap.id, { end: roundTo2(newEnd) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 bg-amber-400/70 hover:bg-amber-400 cursor-ew-resize rounded-r z-20 flex items-center justify-center transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 4. Audio Track Lane */}
                <div
                  className={`track-lane timeline-lane h-10 sm:h-11 relative flex items-center overflow-visible transition-colors ${
                    isLight
                      ? activeTrackRole === 'audio'
                        ? 'bg-orange-50/50'
                        : 'bg-white'
                      : activeTrackRole === 'audio'
                      ? 'bg-[#1c1813]'
                      : 'bg-[#141414]'
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      clearAllSelections();
                      setActiveTrackRole('audio');
                    }
                  }}
                >
                  {audioTracks.map((track) => {
                    const isDraggingThis = activeDragItem && activeDragItem.id === track.id;
                    const isBatchDragging = activeDragItem && selectedItemIds.includes(track.id) && selectedItemIds.includes(activeDragItem.id);
                    const dragOffsetSec = (isDraggingThis || isBatchDragging) ? activeDragItem!.deltaSec : 0;
                    const effectiveOffset = Math.max(0, (track.start_offset || 0) + dragOffsetSec);
                    const leftPx = TRACK_OFFSET + (effectiveOffset * basePixelsPerSecond);
                    const trackDur = track.duration || 10;
                    const widthPx = trackDur * basePixelsPerSecond;
                    const isSelected = selectedAudioId === track.id || selectedItemIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onMouseDown={(e) => {
                          const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
                          const isAlreadySelected = selectedItemIds.includes(track.id);

                          if (isMulti) {
                            toggleItemSelection(track.id, true);
                          } else if (!isAlreadySelected) {
                            toggleItemSelection(track.id, false);
                          }

                          const origOffset = track.start_offset || 0;
                          handleItemDrag(
                            e,
                            (deltaSec) => {
                              // Smooth live drag without shifting other media
                              setActiveDragItem({
                                id: track.id,
                                type: 'audio',
                                origStart: origOffset,
                                deltaSec,
                              });
                            },
                            (didMove, deltaY, finalDeltaSec) => {
                              setActiveDragItem(null);
                              if (didMove) {
                                if (selectedItemIds.length > 1 && selectedItemIds.includes(track.id)) {
                                  batchMoveItems(selectedItemIds, finalDeltaSec);
                                } else {
                                  const newOffset = Math.max(0, origOffset + finalDeltaSec);
                                  updateAudioTrack(track.id, { start_offset: roundTo2(newOffset) });
                                }
                              } else {
                                if (!isMulti) {
                                  clearAllSelections();
                                  toggleItemSelection(track.id, false);
                                  setSelectedAudioId(track.id);
                                  setCurrentTime(track.start_offset || 0);
                                }
                              }
                            }
                          );
                        }}
                        className={`absolute h-8 sm:h-9 rounded-lg border cursor-move flex items-center px-2 text-xs truncate overflow-hidden transition-all select-none group timeline-track-item ${
                          isDraggingThis ? 'z-30 shadow-2xl opacity-90 scale-[1.01] ring-2 ring-amber-400' : 'z-10'
                        } ${
                          isSelected
                            ? 'bg-[#FF8A00] text-black border-[#FF8A00] font-bold shadow-lg shadow-orange-500/20 ring-2 ring-amber-400'
                            : isLight
                            ? 'bg-orange-100/90 border-orange-300 text-orange-950 hover:border-orange-500'
                            : 'bg-[#1F1F1F] border-[#FF8A00]/50 text-[#FF8A00] hover:border-[#FF8A00]'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                        title={`Audio: ${track.filename} (${trackDur.toFixed(1)}s)`}
                      >
                        <Music className="w-3.5 h-3.5 mr-1 flex-shrink-0 pointer-events-none" />
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-black text-white flex items-center justify-center text-[6px] font-bold mr-1 flex-shrink-0">✓</span>
                        )}
                        <span className="truncate font-medium text-[11px] pointer-events-none">{track.filename}</span>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/40 text-orange-300 ml-1 flex-shrink-0 pointer-events-none">
                          {trackDur.toFixed(1)}s
                        </span>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            const origDur = track.duration || 10;
                            handleItemDrag(e, (deltaSec) => {
                              const newDur = Math.max(0.5, origDur + deltaSec);
                              updateAudioTrack(track.id, { duration: roundTo2(newDur) });
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-orange-400/60 hover:bg-orange-400 cursor-ew-resize rounded-r z-20 flex items-center justify-center transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Playhead Needle & Scrubber Pill (adaptive color in Light & Dark Mode) */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-30 transition-none"
                style={{ left: `${playheadLeft}px` }}
              >
                {/* Top Pill with time (e.g. 00:20) and arrow pointing down */}
                <div className="absolute top-0.5 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-40">
                  <div className={`px-1.5 py-0.5 rounded-full font-mono font-bold text-[9px] shadow-lg leading-none border ${
                    isLight
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md shadow-amber-600/30'
                      : 'bg-white text-black border-white/80'
                  }`}>
                    {formatRulerTime(currentTime)}
                  </div>
                  <div className={`w-0 h-0 border-x-3 border-x-transparent border-t-[4px] -mt-[1px] ${
                    isLight ? 'border-t-amber-600' : 'border-t-white'
                  }`} />
                </div>

                {/* Moving Vertical Line */}
                <div className={`h-full ${
                  isLight
                    ? 'w-[2px] bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)]'
                    : 'w-[1.5px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
