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
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  LayoutGrid,
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
    selectedClipId,
    setSelectedClipId,
    captions,
    setCaptions,
    selectedCaptionId,
    setSelectedCaptionId,
    removeCaption,
    addCaption,
    audioTracks,
    selectedAudioId,
    setSelectedAudioId,
    removeAudioTrack,
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
    coverImage,
    isTimelineFloating,
    setIsTimelineFloating,
    isTrackSideCollapsed,
    setIsTrackSideCollapsed,
    isCompactTracks,
    setIsCompactTracks,
  } = useEditorStore();

  const totalDuration = Math.max(duration, 10);
  const basePixelsPerSecond = 30 * timelineZoom;
  const timelineWidth = Math.max(240, totalDuration * basePixelsPerSecond);

  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth || 600;
    const availableWidth = Math.max(200, clientWidth - 60);
    const targetZoom = availableWidth / (totalDuration * 30);
    setTimelineZoom(Math.max(0.04, Math.min(3.5, Number(targetZoom.toFixed(3)))));
  };

  // Convert X pixel position in timeline to seconds
  const handleSeekFromEvent = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const targetSeconds = Math.max(0, Math.min(totalDuration, clickX / basePixelsPerSecond));
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

  const clearAllSelections = () => {
    setSelectedClipId(null);
    setSelectedCaptionId(null);
    setSelectedStickerId(null);
    setSelectedImageId(null);
    setSelectedAudioId(null);
  };

  const handleDeleteSelected = () => {
    if (selectedCaptionId) {
      removeCaption(selectedCaptionId);
      setSelectedCaptionId(null);
    } else if (selectedStickerId) {
      removeSticker(selectedStickerId);
      setSelectedStickerId(null);
    } else if (selectedImageId) {
      removeImageOverlay(selectedImageId);
      setSelectedImageId(null);
    } else if (selectedAudioId) {
      removeAudioTrack(selectedAudioId);
      setSelectedAudioId(null);
    } else if (selectedClipId) {
      removeClip(selectedClipId);
      setSelectedClipId(null);
    }
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
    const clip = clips[0];
    setIsGeneratingCaptions(true);
    try {
      const res = await api.generateCaptions(clip.video_id, projectId);
      if (res.segments && res.segments.length > 0) {
        setCaptions(res.segments);
        setActiveTool('captions');
      }
    } catch (e) {
      console.error('Timeline auto caption error:', e);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const roundTo2 = (num: number) => Math.round(num * 100) / 100;

  // Time markers for the ruler
  const stepSeconds =
    timelineZoom > 2.5
      ? 0.5
      : timelineZoom > 1.2
      ? 1
      : timelineZoom > 0.6
      ? 2
      : timelineZoom > 0.25
      ? 5
      : timelineZoom > 0.1
      ? 10
      : timelineZoom > 0.04
      ? 30
      : 60;
  const markers = [];
  for (let s = 0; s <= totalDuration; s += stepSeconds) {
    markers.push(s);
  }

  const playheadLeft = currentTime * basePixelsPerSecond;
  const hasSelectedItem =
    selectedClipId || selectedCaptionId || selectedStickerId || selectedImageId || selectedAudioId;

  // Compact vs Standard Track Heights
  const trackHeightClass = isCompactTracks ? 'h-8' : 'h-12';
  const itemHeightClass = isCompactTracks ? 'h-6 top-1' : 'h-9 top-1.5';
  const trackSideWidthClass = isTrackSideCollapsed ? 'w-7 sm:w-8' : 'w-20 sm:w-26';

  return (
    <>
      {/* Cover Page Modal */}
      <CoverModal isOpen={isCoverModalOpen} onClose={() => setIsCoverModalOpen(false)} />

      <div
        className={`bg-[#111111] border-t border-[#242424] flex flex-col select-none ${
          isTimelineFloating
            ? 'fixed bottom-4 left-4 right-4 z-40 rounded-2xl border shadow-2xl bg-[#141414]/95 backdrop-blur-md max-h-80 border-[#333333]'
            : isCompactTracks
            ? 'h-40 sm:h-52'
            : 'h-48 sm:h-72'
        }`}
      >
        {/* Timeline Controls Bar (Mobile Responsive & Touch-Scrollable) */}
        <div className="h-10 bg-[#161616] border-b border-[#242424] px-2 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 select-none flex-nowrap">
          {/* Left Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            {/* Split */}
            <Tooltip content="Split at playhead (S)">
              <button
                onClick={splitClipAtPlayhead}
                className="p-1.5 rounded text-[#A0A0A0] hover:text-white hover:bg-[#242424] border border-transparent hover:border-[#333333] transition-colors"
              >
                <Scissors className="w-3.5 h-3.5 text-[#FFD21F]" />
              </button>
            </Tooltip>

            {/* Delete */}
            <Tooltip content="Delete selected item (Delete)">
              <button
                onClick={handleDeleteSelected}
                disabled={!hasSelectedItem}
                className="p-1.5 rounded text-[#A0A0A0] hover:text-red-400 hover:bg-[#242424] disabled:opacity-30 disabled:hover:text-[#A0A0A0] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <div className="h-4 w-[1px] bg-[#333333] mx-0.5 sm:mx-1" />

            {/* Add Cover Button */}
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] hover:border-[#FFD21F] text-xs font-semibold text-white transition-colors flex-shrink-0"
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
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] text-xs font-medium text-white transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>Caption</span>
            </button>

            {/* Auto AI Captions */}
            <button
              onClick={handleAutoGenerateFromTimeline}
              disabled={isGeneratingCaptions || clips.length === 0}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#FFD21F]/15 hover:bg-[#FFD21F]/25 border border-[#FFD21F]/40 text-xs font-semibold text-[#FFD21F] transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{isGeneratingCaptions ? 'Transcribing...' : 'Transcribe'}</span>
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
                    ? 'bg-[#FFD21F]/20 text-[#FFD21F] border-[#FFD21F]/40'
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
                    : 'text-[#A0A0A0] hover:text-white bg-[#1F1F1F] border-[#333333]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <div className="h-4 w-[1px] bg-[#333333] hidden sm:block" />

            {/* Zoom Controls & Fit to Screen */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
              <Tooltip content="Fit Entire Project in View">
                <button
                  onClick={handleFitToScreen}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#FFD21F] bg-[#1F1F1F] hover:bg-[#282828] border border-[#3A3A3A] hover:border-[#FFD21F]/50 transition-colors flex-shrink-0"
                  title="Fit all clips to screen"
                >
                  FIT
                </button>
              </Tooltip>

              <button
                onClick={() => setTimelineZoom(Math.max(0.04, Number((timelineZoom * 0.75).toFixed(3))))}
                className="text-[#A0A0A0] hover:text-white p-1 transition-colors"
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
                className="text-[#A0A0A0] hover:text-white p-1 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Track Workspace */}
        <div className="flex-1 flex overflow-hidden relative bg-[#111111]">
          {/* Left Track Headers Column (Collapsible to very small!) */}
          <div
            className={`${trackSideWidthClass} flex-shrink-0 bg-[#141414] border-r border-[#242424] flex flex-col z-20 select-none shadow-md transition-all duration-150`}
          >
            {/* Header with Decrease Track Side (<< / >>) Button */}
            <div className="h-6 bg-[#161616] border-b border-[#242424] px-1.5 flex items-center justify-between text-[10px] text-[#666666] font-mono font-semibold">
              {!isTrackSideCollapsed && <span>TRACKS</span>}
              <button
                onClick={() => setIsTrackSideCollapsed(!isTrackSideCollapsed)}
                className="p-0.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded transition-colors ml-auto"
                title={isTrackSideCollapsed ? 'Expand Track Side' : 'Decrease Track Side (Make Small)'}
              >
                {isTrackSideCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#FFD21F]" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Header Rows for Each Track */}
            <div className="p-1.5 space-y-2 flex-1">
              {/* Video Track */}
              <div
                className={`${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] flex items-center px-1.5 space-x-1.5 text-[11px] font-semibold text-[#A0A0A0]`}
                title="Video Track"
              >
                <VideoIcon className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                {!isTrackSideCollapsed && <span className="truncate">Video</span>}
              </div>

              {/* Captions Track */}
              <div
                className={`${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] flex items-center px-1.5 space-x-1.5 text-[11px] font-semibold text-[#A0A0A0]`}
                title="Captions Track"
              >
                <Type className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                {!isTrackSideCollapsed && <span className="truncate">Captions</span>}
              </div>

              {/* Overlays Track */}
              <div
                className={`${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] flex items-center px-1.5 space-x-1.5 text-[11px] font-semibold text-[#A0A0A0]`}
                title="Stickers & Images Overlays Track"
              >
                <Smile className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                {!isTrackSideCollapsed && <span className="truncate">Overlays</span>}
              </div>

              {/* Audio Track */}
              <div
                className={`${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] flex items-center px-1.5 space-x-1.5 text-[11px] font-semibold text-[#A0A0A0]`}
                title="Audio Tracks"
              >
                <Music className="w-3.5 h-3.5 text-[#FF8A00] flex-shrink-0" />
                {!isTrackSideCollapsed && <span className="truncate">Audio</span>}
              </div>
            </div>
          </div>

          {/* Scrollable Tracks Area */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDownScrub}
            onMouseMove={handleMouseMoveScrub}
            onMouseUp={handleMouseUpScrub}
            onMouseLeave={handleMouseUpScrub}
            onClick={(e) => {
              // Click empty space to deselect
              if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('track-lane')) {
                clearAllSelections();
              }
            }}
            className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#111111]"
          >
            <div style={{ width: `${timelineWidth}px` }} className="relative h-full min-h-[170px]">
              {/* Time Ruler */}
              <div className="h-6 bg-[#161616] border-b border-[#242424] relative flex items-end">
                {markers.map((sec) => (
                  <div
                    key={sec}
                    className="absolute text-[10px] font-mono text-[#777777] border-l border-[#333333] pl-1 h-3 flex items-start"
                    style={{ left: `${sec * basePixelsPerSecond}px` }}
                  >
                    {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Tracks Lanes */}
              <div className="p-1.5 space-y-2">
                {/* 1. Video Track Lane */}
                <div
                  className={`track-lane ${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] relative overflow-hidden flex items-center`}
                >
                  {/* Cover Preview Tile at beginning of video track */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCoverModalOpen(true);
                    }}
                    className="absolute left-1 z-10 h-5/6 w-14 rounded bg-[#1B1B1B] border border-[#FFD21F]/40 hover:border-[#FFD21F] cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all shadow"
                    title="Click to edit project cover"
                  >
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-[9px] text-[#FFD21F]">
                        <ImageIcon className="w-3 h-3 mb-0.5" />
                        <span>Cover</span>
                      </div>
                    )}
                  </div>

                  {/* Video Clips */}
                  {clips.map((clip) => {
                    const clipStartSec = clip.trim_start || 0;
                    const clipEndSec = clip.trim_end || clip.duration;
                    const clipDur = Math.max(0.2, clipEndSec - clipStartSec);
                    const leftPx = clipStartSec * basePixelsPerSecond;
                    const widthPx = clipDur * basePixelsPerSecond;
                    const isSelected = selectedClipId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSelections();
                          setSelectedClipId(clip.id);
                        }}
                        className={`absolute ${itemHeightClass} rounded bg-[#242424] border transition-all cursor-pointer flex items-center justify-between px-2.5 overflow-hidden ${
                          isSelected
                            ? 'border-[#FFD21F] shadow-lg shadow-amber-500/20 ring-2 ring-[#FFD21F]'
                            : 'border-[#383838] hover:border-[#FFD21F]/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <span className="text-xs text-white truncate max-w-full font-medium">
                          {clip.filename}
                        </span>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startX = e.clientX;
                            const origTrim = clip.trim_start || 0;
                            const onMove = (moveEvt: MouseEvent) => {
                              const deltaSec = (moveEvt.clientX - startX) / basePixelsPerSecond;
                              const newStart = Math.max(0, Math.min(clip.trim_end - 0.5, origTrim + deltaSec));
                              updateClipTrim(clip.id, newStart, clip.trim_end);
                            };
                            const onUp = () => {
                              window.removeEventListener('mousemove', onMove);
                              window.removeEventListener('mouseup', onUp);
                            };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 bg-[#FFD21F]/50 hover:bg-[#FFD21F] cursor-ew-resize rounded-l"
                        />

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startX = e.clientX;
                            const origEnd = clip.trim_end || clip.duration;
                            const onMove = (moveEvt: MouseEvent) => {
                              const deltaSec = (moveEvt.clientX - startX) / basePixelsPerSecond;
                              const newEnd = Math.max(clip.trim_start + 0.5, Math.min(clip.duration, origEnd + deltaSec));
                              updateClipTrim(clip.id, clip.trim_start, newEnd);
                            };
                            const onUp = () => {
                              window.removeEventListener('mousemove', onMove);
                              window.removeEventListener('mouseup', onUp);
                            };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 bg-[#FFD21F]/50 hover:bg-[#FFD21F] cursor-ew-resize rounded-r"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 2. Caption Track Lane */}
                <div
                  className={`track-lane ${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] relative overflow-hidden flex items-center`}
                >
                  {captions.map((cap) => {
                    const leftPx = cap.start * basePixelsPerSecond;
                    const widthPx = Math.max(24, (cap.end - cap.start) * basePixelsPerSecond);
                    const isSelected = selectedCaptionId === cap.id;

                    return (
                      <div
                        key={cap.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSelections();
                          setSelectedCaptionId(cap.id);
                          setCurrentTime(cap.start);
                        }}
                        className={`absolute ${itemHeightClass} rounded border transition-all cursor-pointer flex items-center px-2 text-xs truncate overflow-hidden font-medium ${
                          isSelected
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-lg shadow-amber-500/20 ring-2 ring-white'
                            : 'bg-[#292929] text-white border-[#383838] hover:border-[#FFD21F]/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <span className="truncate">{cap.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Overlays Track Lane (Stickers & Image Overlays) */}
                <div
                  className={`track-lane ${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] relative overflow-hidden flex items-center`}
                >
                  {/* Stickers */}
                  {(stickerOverlays || []).map((sticker) => {
                    const leftPx = sticker.start_time * basePixelsPerSecond;
                    const widthPx = Math.max(28, (sticker.end_time - sticker.start_time) * basePixelsPerSecond);
                    const isSelected = selectedStickerId === sticker.id;

                    return (
                      <div
                        key={sticker.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSelections();
                          setSelectedStickerId(sticker.id);
                          setCurrentTime(sticker.start_time);
                        }}
                        className={`absolute ${itemHeightClass} rounded-lg border transition-all cursor-pointer flex items-center px-2 space-x-1 text-xs truncate overflow-hidden ${
                          isSelected
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-lg ring-2 ring-white'
                            : 'bg-[#222222] border-[#383838] text-gray-200 hover:border-[#FFD21F]/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <span>{sticker.content ? sticker.content : <Smile className="w-3 h-3 text-[#FFD21F]" />}</span>
                        <span className="truncate text-[10px] capitalize">{sticker.type}</span>
                      </div>
                    );
                  })}

                  {/* Images */}
                  {(imageOverlays || []).map((img) => {
                    const leftPx = img.start_time * basePixelsPerSecond;
                    const widthPx = Math.max(28, (img.end_time - img.start_time) * basePixelsPerSecond);
                    const isSelected = selectedImageId === img.id;

                    return (
                      <div
                        key={img.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSelections();
                          setSelectedImageId(img.id);
                          setCurrentTime(img.start_time);
                        }}
                        className={`absolute ${itemHeightClass} rounded-lg border transition-all cursor-pointer flex items-center px-1.5 space-x-1.5 text-xs truncate overflow-hidden ${
                          isSelected
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-lg ring-2 ring-white'
                            : 'bg-[#222222] border-[#383838] text-gray-200 hover:border-[#FFD21F]/60'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                        <span className="truncate text-[10px]">{img.filename}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Audio Track Lane (Selectable!) */}
                <div
                  className={`track-lane ${trackHeightClass} bg-[#181818] rounded-md border border-[#242424] relative overflow-hidden flex items-center`}
                >
                  {audioTracks.map((track) => {
                    const leftPx = (track.start_offset || 0) * basePixelsPerSecond;
                    const widthPx = (track.duration || 10) * basePixelsPerSecond;
                    const isSelected = selectedAudioId === track.id;

                    return (
                      <div
                        key={track.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllSelections();
                          setSelectedAudioId(track.id);
                          setCurrentTime(track.start_offset || 0);
                        }}
                        className={`absolute ${itemHeightClass} rounded-lg border cursor-pointer flex items-center px-2 text-xs truncate overflow-hidden transition-all ${
                          isSelected
                            ? 'bg-[#FF8A00] text-black border-[#FF8A00] font-bold shadow-lg shadow-orange-500/20 ring-2 ring-white'
                            : 'bg-[#1F1F1F] border-[#FF8A00]/50 text-[#FF8A00] hover:border-[#FF8A00]'
                        }`}
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <Music className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate font-medium text-[11px]">{track.filename}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Yellow Playhead Bar & Scrubber */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-30 transition-none"
                style={{ left: `${playheadLeft}px` }}
              >
                {/* Playhead Top Pin */}
                <div className="relative -left-[7px] top-0 w-3.5 h-5 bg-[#FFD21F] rounded-t-sm clip-playhead shadow-md flex items-center justify-center">
                  <div className="w-1 h-2 bg-black rounded-full" />
                </div>
                {/* Vertical Line */}
                <div className="w-[1.5px] h-full bg-[#FFD21F] shadow-[0_0_6px_rgba(255,210,31,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
