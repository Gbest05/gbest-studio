import React from 'react';
import {
  Settings2,
  Smile,
  Shapes,
  Palette,
  Image as ImageIcon,
  Trash2,
  Sliders,
  RotateCw,
  Sparkles,
  Layers,
  Film,
  Music,
  Maximize2,
  SunMedium,
  CheckCircle2,
  Volume2,
  VolumeX,
  PanelRightClose,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { AVAILABLE_FONTS } from '../../types/editor';
import { CaptionStylePanel } from './CaptionStylePanel';
import { EffectsPanel } from './EffectsPanel';

export const PropertiesInspector: React.FC = () => {
  const {
    selectedCaptionId,
    setSelectedCaptionId,
    selectedClipId,
    selectedTextId,
    selectedStickerId,
    selectedImageId,
    selectedVideoOverlayId,
    selectedAudioId,
    stickerOverlays,
    imageOverlays,
    videoOverlays,
    clips,
    audioTracks,
    filters,
    updateSticker,
    removeSticker,
    setSelectedStickerId,
    updateImageOverlay,
    removeImageOverlay,
    setSelectedImageId,
    updateVideoOverlay,
    removeVideoOverlay,
    setSelectedVideoOverlayId,
    setSelectedAudioId,
    updateAudioTrack,
    removeAudioTrack,
    setFilters,
    setIsRightBarCollapsed,
    textOverlays,
    updateTextOverlay,
    removeTextOverlay,
    setSelectedTextId,
    captions,
    updateCaption,
    moveClipToOverlay,
    moveOverlayToMainTrack,
    theme,
    selectedItemIds,
    clearAllSelections,
    deleteSelectedItems,
    batchUpdateClips,
  } = useEditorStore();

  const isLight = theme === 'light';
  const isMultiSelect = selectedItemIds && selectedItemIds.length > 1;

  const selectedSticker = stickerOverlays.find((s) => s.id === selectedStickerId);
  const selectedImage = imageOverlays.find((img) => img.id === selectedImageId);
  const selectedVideoOverlay = videoOverlays.find((v) => v.id === selectedVideoOverlayId);
  const selectedAudio = audioTracks.find((a) => a.id === selectedAudioId);
  const selectedText = textOverlays.find((t) => t.id === selectedTextId);
  const selectedCaption = captions.find((c) => c.id === selectedCaptionId);

  // Determine Title & Icon
  let title = 'Inspector';
  let HeaderIcon = Settings2;

  if (isMultiSelect) {
    title = `Multi-Select (${selectedItemIds.length} items)`;
    HeaderIcon = Layers;
  } else if (selectedTextId && selectedText) {
    title = 'Text Overlay Properties';
    HeaderIcon = Sparkles;
  } else if (selectedCaptionId) {
    title = 'Caption Properties';
  } else if (selectedClipId) {
    title = 'Clip & Effects';
  } else if (selectedVideoOverlayId && selectedVideoOverlay) {
    title = 'Overlay Video (PIP)';
    HeaderIcon = Layers;
  } else if (selectedStickerId && selectedSticker) {
    const isShape = selectedSticker.type === 'shape' || !!selectedSticker.shape_type;
    title = isShape ? 'Shape Properties' : 'Sticker Settings';
    HeaderIcon = isShape ? Shapes : Smile;
  } else if (selectedImageId && selectedImage) {
    title = 'Image Overlay Settings';
    HeaderIcon = ImageIcon;
  } else if (selectedAudioId && selectedAudio) {
    title = 'Audio Track Settings';
    HeaderIcon = Music;
  } else {
    title = 'Project Inspector';
  }

  return (
    <aside className={`w-80 border-l flex flex-col h-full select-none flex-shrink-0 ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#161616] border-[#242424]'
    }`}>
      {/* Top Header */}
      <div className={`h-12 border-b px-4 flex items-center justify-between ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141414] border-[#242424]'
      }`}>
        <div className="flex items-center space-x-2 min-w-0">
          <HeaderIcon className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-amber-500' : 'text-[#FFD21F]'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{title}</span>
        </div>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {(isMultiSelect || selectedClipId || selectedStickerId || selectedImageId || selectedAudioId || selectedTextId || selectedCaptionId || selectedVideoOverlayId) && (
            <button
              onClick={clearAllSelections}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium ${
                isLight ? 'text-slate-600 hover:text-black bg-slate-200 hover:bg-slate-300' : 'text-gray-400 hover:text-white bg-[#202020] hover:bg-[#282828]'
              }`}
            >
              Deselect
            </button>
          )}
          <button
            onClick={() => setIsRightBarCollapsed(true)}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-600 hover:text-black hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-[#222222]'
            }`}
            title="Collapse Inspector"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Case Multi-Select: Multiple items selected on timeline */}
        {isMultiSelect ? (
          <div className="p-4 space-y-4 select-none">
            {/* Multi-Select Header Card */}
            <div className={`p-3.5 rounded-xl border ${
              isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-[#1E1E1E] border-[#333333]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Layers className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <span className={`text-xs font-bold ${isLight ? 'text-amber-950' : 'text-white'}`}>
                    {selectedItemIds.length} Items Selected
                  </span>
                </div>
                <button
                  onClick={clearAllSelections}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                    isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
                  }`}
                >
                  Clear Selection
                </button>
              </div>

              {/* Items Breakdown Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {clips.filter((c) => selectedItemIds.includes(c.id)).length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                    isLight ? 'bg-teal-100 text-teal-800' : 'bg-teal-950/70 border border-teal-800 text-teal-300'
                  }`}>
                    <Film className="w-3 h-3" />
                    <span>{clips.filter((c) => selectedItemIds.includes(c.id)).length} Clips</span>
                  </span>
                )}
                {videoOverlays.filter((v) => selectedItemIds.includes(v.id)).length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                  }`}>
                    <Layers className="w-3 h-3" />
                    <span>{videoOverlays.filter((v) => selectedItemIds.includes(v.id)).length} PIPs</span>
                  </span>
                )}
                {captions.filter((c) => selectedItemIds.includes(c.id)).length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                    isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-950/70 border border-amber-800 text-amber-300'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{captions.filter((c) => selectedItemIds.includes(c.id)).length} Captions</span>
                  </span>
                )}
                {audioTracks.filter((a) => selectedItemIds.includes(a.id)).length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                    isLight ? 'bg-orange-100 text-orange-800' : 'bg-orange-950/70 border border-orange-800 text-orange-300'
                  }`}>
                    <Music className="w-3 h-3" />
                    <span>{audioTracks.filter((a) => selectedItemIds.includes(a.id)).length} Audio</span>
                  </span>
                )}
              </div>
            </div>

            {/* Batch Delete Action */}
            <button
              onClick={() => {
                if (window.confirm(`Delete all ${selectedItemIds.length} selected items?`)) {
                  deleteSelectedItems();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-500 hover:text-red-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All {selectedItemIds.length} Selected Items</span>
            </button>

            {/* Batch Video Filters (if any video clips are in multi-selection) */}
            {clips.some((c) => selectedItemIds.includes(c.id)) && (
              <div className={`p-3 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Palette className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Apply Filter to Selected Clips
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'none', label: 'Original' },
                    { id: 'vivid', label: 'Vivid' },
                    { id: 'bw', label: 'B&W' },
                    { id: 'vintage', label: 'Vintage' },
                    { id: 'cinematic', label: 'Cinema' },
                    { id: 'cyberpunk', label: 'Cyber' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const selClipIds = clips.filter((c) => selectedItemIds.includes(c.id)).map((c) => c.id);
                        const newFilter = {
                          brightness: 0,
                          contrast: preset.id === 'cinematic' ? 1.3 : 1,
                          saturation: preset.id === 'bw' ? 0 : preset.id === 'vivid' ? 1.4 : 1,
                          temperature: preset.id === 'vintage' ? 25 : 0,
                          tint: 0,
                          exposure: 0,
                          highlights: 0,
                          shadows: 0,
                          blur: 0,
                          sharpen: 0,
                          vignette: false,
                          letterbox: false,
                          preset: preset.id as any,
                        };
                        setFilters(newFilter);
                        batchUpdateClips(selClipIds, { filters: newFilter });
                      }}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        isLight
                          ? 'bg-white hover:bg-amber-50 border-slate-300 hover:border-amber-400 text-slate-800'
                          : 'bg-[#222222] hover:bg-[#2A2A2A] border-[#333333] hover:border-[#FFD21F] text-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Transition (if multiple video clips are selected) */}
            {clips.some((c) => selectedItemIds.includes(c.id)) && (
              <div className={`p-3 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Apply Transition to Selected Clips
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'fade', label: 'Fade' },
                    { id: 'dissolve', label: 'Dissolve' },
                    { id: 'slide', label: 'Slide' },
                    { id: 'wipe', label: 'Wipe' },
                    { id: 'zoom', label: 'Zoom' },
                  ].map((trans) => (
                    <button
                      key={trans.id}
                      onClick={() => {
                        const selClipIds = clips.filter((c) => selectedItemIds.includes(c.id)).map((c) => c.id);
                        batchUpdateClips(selClipIds, {
                          transition: {
                            type: trans.id as any,
                            duration: 0.8,
                          },
                        });
                      }}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        isLight
                          ? 'bg-white hover:bg-amber-50 border-slate-300 hover:border-amber-400 text-slate-800'
                          : 'bg-[#222222] hover:bg-[#2A2A2A] border-[#333333] hover:border-[#FFD21F] text-gray-200'
                      }`}
                    >
                      {trans.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedTextId && selectedText ? (
          <div className="p-4 space-y-5 select-none">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 bg-[#1D1D1D] rounded-xl border border-[#282828]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center text-[#FFD21F]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">Text Overlay</span>
                  <span className="text-[10px] text-gray-500 block font-mono">
                    {selectedText.start_time.toFixed(1)}s - {selectedText.end_time.toFixed(1)}s
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  removeTextOverlay(selectedText.id);
                  setSelectedTextId(null);
                }}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Text Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                Text Content
              </label>
              <textarea
                rows={2}
                value={selectedText.text}
                onChange={(e) => updateTextOverlay(selectedText.id, { text: e.target.value })}
                className="w-full bg-[#181818] border border-[#333333] focus:border-[#FFD21F] rounded-lg p-2.5 text-xs text-white resize-none outline-none leading-relaxed"
              />
            </div>

            {/* Font Size & Stepper */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Font Size</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => updateTextOverlay(selectedText.id, { font_size: Math.max(4, selectedText.font_size - 1) })}
                    className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-200 hover:text-white font-bold text-xs transition-colors"
                    title="Decrease Font Size (A-)"
                  >
                    A-
                  </button>
                  <input
                    type="number"
                    min="4"
                    max="140"
                    value={selectedText.font_size}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 4;
                      updateTextOverlay(selectedText.id, { font_size: Math.max(4, Math.min(140, val)) });
                    }}
                    className="w-12 bg-[#181818] border border-[#333333] rounded px-1 py-0.5 font-mono text-[#FFD21F] font-bold text-xs text-center outline-none focus:border-[#FFD21F]"
                  />
                  <button
                    onClick={() => updateTextOverlay(selectedText.id, { font_size: Math.min(140, selectedText.font_size + 1) })}
                    className="px-2 py-0.5 rounded bg-[#242424] hover:bg-[#333333] text-gray-200 hover:text-white font-bold text-xs transition-colors"
                    title="Increase Font Size (A+)"
                  >
                    A+
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="4"
                max="140"
                value={selectedText.font_size}
                onChange={(e) => updateTextOverlay(selectedText.id, { font_size: Math.max(4, parseInt(e.target.value) || 4) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                Font Family
              </label>
              <select
                value={selectedText.font_family}
                onChange={(e) => updateTextOverlay(selectedText.id, { font_family: e.target.value })}
                className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400">Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) => updateTextOverlay(selectedText.id, { color: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] text-white font-mono">{selectedText.color}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400">Background</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateTextOverlay(selectedText.id, { background_color: selectedText.background_color === 'transparent' ? 'rgba(0,0,0,0.8)' : 'transparent' })}
                    className="px-2 py-1 rounded bg-[#242424] hover:bg-[#333333] text-[10px] text-white font-medium"
                  >
                    {selectedText.background_color === 'transparent' ? 'Transparent' : 'Dark'}
                  </button>
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rotation</span>
                <span className="text-[#FFD21F] font-mono">{selectedText.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedText.rotation}
                onChange={(e) => updateTextOverlay(selectedText.id, { rotation: parseInt(e.target.value) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* 2D Screen Position & Quick Placement */}
            <div className={`space-y-2.5 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#262626]'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Screen Position
                </label>
                <span className="text-[10px] text-[#FFD21F] font-mono">
                  X: {selectedText.x ?? 50}%, Y: {selectedText.y ?? 50}%
                </span>
              </div>

              {/* 9-Point Quick Alignment Grid */}
              <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#262626]'
              }`}>
                {[
                  { label: 'Top Left', x: 20, y: 15 },
                  { label: 'Top Center', x: 50, y: 15 },
                  { label: 'Top Right', x: 80, y: 15 },
                  { label: 'Mid Left', x: 20, y: 50 },
                  { label: 'Center', x: 50, y: 50 },
                  { label: 'Mid Right', x: 80, y: 50 },
                  { label: 'Bot Left', x: 20, y: 85 },
                  { label: 'Bottom', x: 50, y: 85 },
                  { label: 'Bot Right', x: 80, y: 85 },
                ].map((pos) => {
                  const isMatch = (selectedText.x ?? 50) === pos.x && (selectedText.y ?? 50) === pos.y;
                  return (
                    <button
                      key={pos.label}
                      type="button"
                      onClick={() => updateTextOverlay(selectedText.id, { x: pos.x, y: pos.y })}
                      className={`py-1 px-1 rounded text-[10px] font-semibold transition-all border ${
                        isMatch
                          ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-xs'
                          : isLight
                          ? 'bg-white border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50'
                          : 'bg-[#1C1C1C] border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#252525]'
                      }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>

              {/* Position X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Horizontal (X)</span>
                  <span className={`font-mono text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedText.x ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={selectedText.x ?? 50}
                  onChange={(e) => updateTextOverlay(selectedText.id, { x: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>

              {/* Position Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Vertical (Y)</span>
                  <span className={`font-mono text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedText.y ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={selectedText.y ?? 50}
                  onChange={(e) => updateTextOverlay(selectedText.id, { y: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : /* Case 1: Caption Selected */
        selectedCaptionId ? (
          <div className="space-y-3">
            {selectedCaption && (
              <div className="p-3 mx-4 mt-3 bg-[#1D1D1D] border border-[#FFD21F]/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFD21F] flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Edit Active Subtitle</span>
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {selectedCaption.start.toFixed(1)}s - {selectedCaption.end.toFixed(1)}s
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={selectedCaption.text}
                  onChange={(e) => updateCaption(selectedCaption.id, { text: e.target.value })}
                  className="w-full bg-[#121212] border border-[#333333] focus:border-[#FFD21F] rounded-lg p-2 text-xs text-white resize-none outline-none leading-relaxed"
                />
              </div>
            )}
            <CaptionStylePanel />
          </div>
        ) : /* Case 2: Clip Selected */
        selectedClipId ? (
          <div className="space-y-3">
            {/* Selected Clip Card with Move to Track 1 */}
            {(() => {
              const activeClip = clips.find((c) => c.id === selectedClipId);
              if (!activeClip) return null;
              return (
                <div className="p-4 pb-0 space-y-3">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1D1D1D] border-[#282828]'
                  }`}>
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-black border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {activeClip.url ? (
                          <video src={activeClip.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <Film className="w-4 h-4 text-teal-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className={`text-xs font-semibold block truncate w-36 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          {activeClip.filename}
                        </span>
                        <span className="text-[10px] text-gray-500 block font-mono">
                          Duration: {((activeClip.trim_end || activeClip.duration) - (activeClip.trim_start || 0)).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      moveClipToOverlay(activeClip.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                      isLight
                        ? 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100 shadow-xs'
                        : 'bg-teal-950/40 border-teal-700/60 text-teal-300 hover:bg-teal-900/60 shadow-md'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-teal-400" />
                    <span>Move to Overlay / PIP (Track 1)</span>
                  </button>
                </div>
              );
            })()}
            <EffectsPanel />
          </div>
        ) : /* Case 3: Audio Track Selected */
        selectedAudioId && selectedAudio ? (
          <div className="p-4 space-y-5">
            {/* Audio Info Card */}
            <div className="flex items-center justify-between p-3 bg-[#1D1D1D] rounded-xl border border-[#282828]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center text-[#FF8A00]">
                  <Music className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-white block truncate w-36">
                    {selectedAudio.filename}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Duration: {selectedAudio.duration?.toFixed(1) || 10}s
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  removeAudioTrack(selectedAudio.id);
                  setSelectedAudioId(null);
                }}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Audio Track"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-2 bg-[#1B1B1B] p-3 rounded-xl border border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-gray-300">
                  {selectedAudio.is_muted ? (
                    <VolumeX className="w-4 h-4 text-[#FF8A00]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#FFD21F]" />
                  )}
                  <span className="font-medium">Track Volume</span>
                </div>
                <span className="font-mono text-[#FFD21F] font-bold">
                  {selectedAudio.is_muted ? 'Muted (0%)' : `${Math.round(selectedAudio.volume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={selectedAudio.is_muted ? 0 : selectedAudio.volume}
                onChange={(e) => {
                  updateAudioTrack(selectedAudio.id, {
                    volume: parseFloat(e.target.value),
                    is_muted: false,
                  });
                }}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() =>
                    updateAudioTrack(selectedAudio.id, { is_muted: !selectedAudio.is_muted })
                  }
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    selectedAudio.is_muted
                      ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40'
                      : 'bg-[#252525] text-gray-300 hover:text-white'
                  }`}
                >
                  {selectedAudio.is_muted ? 'Unmute Audio' : 'Mute Audio'}
                </button>
                <div className="flex space-x-1">
                  {[0.25, 0.5, 1.0].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateAudioTrack(selectedAudio.id, { volume: v, is_muted: false })}
                      className="text-[10px] text-gray-400 hover:text-white bg-[#222222] px-1.5 py-0.5 rounded"
                    >
                      {Math.round(v * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fade In & Fade Out */}
            <div className="space-y-3 bg-[#1B1B1B] p-3 rounded-xl border border-[#2A2A2A]">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Audio Transitions
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Fade In</span>
                  <span className="font-mono text-[#FFD21F]">
                    {(selectedAudio.fade_in || 0).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={selectedAudio.fade_in || 0}
                  onChange={(e) =>
                    updateAudioTrack(selectedAudio.id, { fade_in: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Fade Out</span>
                  <span className="font-mono text-[#FFD21F]">
                    {(selectedAudio.fade_out || 0).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={selectedAudio.fade_out || 0}
                  onChange={(e) =>
                    updateAudioTrack(selectedAudio.id, { fade_out: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : /* Case 4: Sticker / Shape Selected */
        selectedStickerId && selectedSticker ? (() => {
          const isShape = selectedSticker.type === 'shape' || !!selectedSticker.shape_type;
          const shapeColors = ['#FFD21F', '#FFFFFF', '#FF3366', '#00F0FF', '#10B981', '#8B5CF6', '#F97316', '#111111'];
          const borderColors = ['#000000', '#FFFFFF', '#FFD21F', '#CBD5E1', '#E11D48'];

          return (
            <div className="p-4 space-y-4">
              {/* Sticker / Shape Preview Badge */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#1D1D1D] border-[#282828]'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-inner ${
                    isLight ? 'bg-slate-100' : 'bg-[#262626]'
                  }`}>
                    {isShape ? (
                      <div
                        className="w-7 h-7 rounded border-2 transition-colors"
                        style={{
                          backgroundColor: selectedSticker.shape_color || '#FFD21F',
                          borderColor: selectedSticker.shape_border_color || '#000000',
                          borderWidth: `${Math.min(3, selectedSticker.shape_border_width || 2)}px`,
                        }}
                      />
                    ) : selectedSticker.content ? (
                      selectedSticker.content
                    ) : (
                      <Smile className="w-6 h-6 text-[#FFD21F]" />
                    )}
                  </div>
                  <div>
                    <span className={`text-xs font-semibold capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isShape ? (selectedSticker.shape_type?.replace('_', ' ') || 'Vector Shape') : `${selectedSticker.type} Sticker`}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      {selectedSticker.start_time.toFixed(1)}s - {selectedSticker.end_time.toFixed(1)}s
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeSticker(selectedSticker.id);
                    setSelectedStickerId(null);
                  }}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Sticker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Shape-Specific Styling (Fill Color, Outline Border Color, Border Width) */}
              {isShape && (
                <div className={`p-3 rounded-xl border space-y-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161616] border-[#262626]'
                }`}>
                  {/* Fill Color */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-[#888888]'}`}>
                        Fill Color
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={selectedSticker.shape_color || '#FFD21F'}
                          onChange={(e) => updateSticker(selectedSticker.id, { shape_color: e.target.value })}
                          className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className={`font-mono text-[10px] ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                          {selectedSticker.shape_color || '#FFD21F'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {shapeColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateSticker(selectedSticker.id, { shape_color: c })}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            (selectedSticker.shape_color || '#FFD21F') === c ? 'border-[#FFD21F] scale-125 ring-2 ring-[#FFD21F]/40' : 'border-black/40 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Outline Border Color & Width */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-[#888888]'}`}>
                        Outline Border
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={selectedSticker.shape_border_color || '#000000'}
                          onChange={(e) => updateSticker(selectedSticker.id, { shape_border_color: e.target.value })}
                          className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className={`font-mono text-[10px] ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                          {selectedSticker.shape_border_color || '#000000'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {borderColors.map((bc) => (
                        <button
                          key={bc}
                          type="button"
                          onClick={() => updateSticker(selectedSticker.id, { shape_border_color: bc })}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            (selectedSticker.shape_border_color || '#000000') === bc ? 'border-[#FFD21F] scale-125 ring-2 ring-[#FFD21F]/40' : 'border-black/40 hover:scale-110'
                          }`}
                          style={{ backgroundColor: bc }}
                          title={bc}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Border Width */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Border Width</span>
                      <span className="text-[#FFD21F] font-mono">{selectedSticker.shape_border_width || 3}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={selectedSticker.shape_border_width || 3}
                      onChange={(e) => updateSticker(selectedSticker.id, { shape_border_width: parseInt(e.target.value) })}
                      className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* 2D Screen Position & Quick Placement */}
              <div className={`space-y-2.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#262626]'}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                    Screen Position
                  </label>
                  <span className="text-[10px] text-[#FFD21F] font-mono">
                    X: {selectedSticker.x ?? 50}%, Y: {selectedSticker.y ?? 50}%
                  </span>
                </div>

                {/* 9-Point Quick Alignment Grid */}
                <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#262626]'
                }`}>
                  {[
                    { label: 'Top Left', x: 20, y: 15 },
                    { label: 'Top Center', x: 50, y: 15 },
                    { label: 'Top Right', x: 80, y: 15 },
                    { label: 'Mid Left', x: 20, y: 50 },
                    { label: 'Center', x: 50, y: 50 },
                    { label: 'Mid Right', x: 80, y: 50 },
                    { label: 'Bot Left', x: 20, y: 85 },
                    { label: 'Bottom', x: 50, y: 85 },
                    { label: 'Bot Right', x: 80, y: 85 },
                  ].map((pos) => {
                    const isMatch = (selectedSticker.x ?? 50) === pos.x && (selectedSticker.y ?? 50) === pos.y;
                    return (
                      <button
                        key={pos.label}
                        type="button"
                        onClick={() => updateSticker(selectedSticker.id, { x: pos.x, y: pos.y })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold transition-all border ${
                          isMatch
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50'
                            : 'bg-[#1C1C1C] border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#252525]'
                        }`}
                      >
                        {pos.label}
                      </button>
                    );
                  })}
                </div>

                {/* Position X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Horizontal (X)</span>
                    <span className={`font-mono text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSticker.x ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={selectedSticker.x ?? 50}
                    onChange={(e) => updateSticker(selectedSticker.id, { x: parseInt(e.target.value) })}
                    className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                  />
                </div>

                {/* Position Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Vertical (Y)</span>
                    <span className={`font-mono text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedSticker.y ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={selectedSticker.y ?? 50}
                    onChange={(e) => updateSticker(selectedSticker.id, { y: parseInt(e.target.value) })}
                    className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                  />
                </div>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Scale / Size</span>
                  <span className="text-[#FFD21F] font-mono font-semibold">
                    {Math.round(selectedSticker.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="3.0"
                  step="0.1"
                  value={selectedSticker.scale}
                  onChange={(e) =>
                    updateSticker(selectedSticker.id, { scale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Rotation</span>
                  <span className="text-[#FFD21F] font-mono font-semibold">
                    {selectedSticker.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={selectedSticker.rotation}
                  onChange={(e) =>
                    updateSticker(selectedSticker.id, { rotation: parseInt(e.target.value) })
                  }
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Opacity</span>
                  <span className="text-[#FFD21F] font-mono font-semibold">
                    {Math.round(selectedSticker.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedSticker.opacity}
                  onChange={(e) =>
                    updateSticker(selectedSticker.id, { opacity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>

              {/* Animation Selector */}
              <div className="space-y-2">
                <span className={`text-xs block font-medium ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Entrance Animation</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'bounce', 'pulse', 'spin', 'float', 'pop'] as const).map((anim) => (
                    <button
                      key={anim}
                      onClick={() => updateSticker(selectedSticker.id, { animation: anim })}
                      className={`px-2 py-1.5 rounded-lg text-xs capitalize transition-all border ${
                        selectedSticker.animation === anim
                          ? 'bg-[#FFD21F] text-black font-bold border-[#FFD21F]'
                          : isLight
                          ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          : 'bg-[#1D1D1D] text-gray-300 border-[#2A2A2A] hover:border-[#404040]'
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Center Button */}
              <button
                onClick={() => updateSticker(selectedSticker.id, { x: 50, y: 50, rotation: 0 })}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-colors border flex items-center justify-center space-x-1.5 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    : 'bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white border-[#2B2B2B]'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Center on Canvas</span>
              </button>
            </div>
          );
        })() : /* Case 5: Image Overlay Selected */
        selectedImageId && selectedImage ? (
          <div className="p-4 space-y-5">
            {/* Image Preview & Delete */}
            <div className="flex items-center justify-between p-3 bg-[#1D1D1D] rounded-xl border border-[#282828]">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  className="w-12 h-12 rounded-lg object-cover bg-black border border-[#333333]"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-white block truncate w-36">
                    {selectedImage.filename}
                  </span>
                  <span className="text-[10px] text-gray-500 block font-mono">
                    {selectedImage.start_time.toFixed(1)}s - {selectedImage.end_time.toFixed(1)}s
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  removeImageOverlay(selectedImage.id);
                  setSelectedImageId(null);
                }}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Scale</span>
                <span className="text-[#FFD21F] font-mono font-semibold">
                  {Math.round(selectedImage.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={selectedImage.scale}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, { scale: parseFloat(e.target.value) })
                }
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rotation</span>
                <span className="text-[#FFD21F] font-mono font-semibold">
                  {selectedImage.rotation}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedImage.rotation}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, { rotation: parseInt(e.target.value) })
                }
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Opacity</span>
                <span className="text-[#FFD21F] font-mono font-semibold">
                  {Math.round(selectedImage.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedImage.opacity}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, { opacity: parseFloat(e.target.value) })
                }
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Corner Rounding */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Corner Radius</span>
                <span className="text-[#FFD21F] font-mono font-semibold">
                  {selectedImage.border_radius}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={selectedImage.border_radius}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, {
                    border_radius: parseInt(e.target.value),
                  })
                }
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Drop Shadow Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] rounded-lg border border-[#262626]">
              <span className="text-xs text-gray-300">Drop Shadow</span>
              <input
                type="checkbox"
                checked={selectedImage.shadow}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, { shadow: e.target.checked })
                }
                className="w-4 h-4 accent-[#FFD21F] rounded cursor-pointer"
              />
            </div>

            {/* Blend Mode */}
            <div className="space-y-1.5">
              <span className="text-xs text-gray-400 block font-medium">Blend Mode</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['normal', 'multiply', 'screen', 'overlay'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateImageOverlay(selectedImage.id, { blend_mode: mode })}
                    className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all border ${
                      selectedImage.blend_mode === mode
                        ? 'bg-[#FFD21F] text-black font-bold border-[#FFD21F]'
                        : 'bg-[#1D1D1D] text-gray-300 border-[#2A2A2A] hover:border-[#404040]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : /* Case 6: Overlay Video (Picture-in-Picture) Selected */
        selectedVideoOverlayId && selectedVideoOverlay ? (
          <div className="p-4 space-y-4">
            {/* Video Header & Delete */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1D1D1D] border-[#282828]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-black border border-[#333333] flex items-center justify-center overflow-hidden">
                  <video src={selectedVideoOverlay.url} className="w-full h-full object-cover pointer-events-none" muted />
                </div>
                <div className="overflow-hidden">
                  <span className={`text-xs font-semibold block truncate w-36 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {selectedVideoOverlay.filename}
                  </span>
                  <span className="text-[10px] text-gray-500 block font-mono">
                    {selectedVideoOverlay.start_time.toFixed(1)}s - {selectedVideoOverlay.end_time.toFixed(1)}s
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  removeVideoOverlay(selectedVideoOverlay.id);
                  setSelectedVideoOverlayId(null);
                }}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Overlay Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Move to Main Track Button */}
            <button
              onClick={() => {
                moveOverlayToMainTrack(selectedVideoOverlay.id);
              }}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                isLight
                  ? 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100 shadow-xs'
                  : 'bg-teal-950/40 border-teal-700/60 text-teal-300 hover:bg-teal-900/60 shadow-md'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5 text-teal-400" />
              <span>Move to Main Video (Track 2)</span>
            </button>

            {/* Background Removal Section: Blend Modes & Chroma Key */}
            <div className={`p-3 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161616] border-[#262626]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFD21F] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Remove Background</span>
                </span>
                {selectedVideoOverlay.chroma_key_enabled && (
                  <span className="text-[9px] bg-green-500/20 text-green-400 font-bold px-1.5 py-0.2 rounded border border-green-500/30">
                    CHROMA ACTIVE
                  </span>
                )}
              </div>

              {/* 1-Click Blend Mode Removal (Black/White/VFX removal) */}
              <div className="space-y-1.5">
                <span className={`text-[11px] font-semibold block ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Quick Blend Removal:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'normal', label: 'None' },
                    { id: 'screen', label: 'Remove Black' },
                    { id: 'multiply', label: 'Remove White' },
                    { id: 'lighten', label: 'Lighten' },
                    { id: 'overlay', label: 'Overlay' },
                    { id: 'difference', label: 'Difference' },
                  ].map((bm) => {
                    const isSelected = (selectedVideoOverlay.blend_mode || 'normal') === bm.id;
                    return (
                      <button
                        key={bm.id}
                        type="button"
                        onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { blend_mode: bm.id as any })}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-xs'
                            : isLight
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-[#202020] border-[#2E2E2E] text-gray-300 hover:bg-[#282828] hover:text-white'
                        }`}
                      >
                        {bm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-Time Green Screen / Chroma Key Removal */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-[#262626] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      id="chroma-toggle"
                      checked={!!selectedVideoOverlay.chroma_key_enabled}
                      onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { chroma_key_enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#FFD21F] rounded cursor-pointer"
                    />
                    <label htmlFor="chroma-toggle" className={`text-xs font-semibold cursor-pointer ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Green Screen Keyer
                    </label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="color"
                      value={selectedVideoOverlay.chroma_key_color || '#00FF00'}
                      onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { chroma_key_color: e.target.value })}
                      className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                      title="Custom Key Color"
                    />
                    <span className="font-mono text-[10px] text-gray-400">
                      {selectedVideoOverlay.chroma_key_color || '#00FF00'}
                    </span>
                  </div>
                </div>

                {/* Color Swatch Presets */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-500">Key Color:</span>
                  {[
                    { hex: '#00FF00', label: 'Green' },
                    { hex: '#0000FF', label: 'Blue' },
                    { hex: '#000000', label: 'Black' },
                    { hex: '#FFFFFF', label: 'White' },
                    { hex: '#FF00FF', label: 'Magenta' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => updateVideoOverlay(selectedVideoOverlay.id, {
                        chroma_key_color: c.hex,
                        chroma_key_enabled: true,
                      })}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        (selectedVideoOverlay.chroma_key_color || '#00FF00') === c.hex
                          ? 'border-[#FFD21F] scale-125 ring-2 ring-[#FFD21F]/40'
                          : 'border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={`Key ${c.label}`}
                    />
                  ))}
                </div>

                {/* Similarity / Tolerance Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Tolerance (Color Match)</span>
                    <span className="text-[#FFD21F] font-mono text-[11px]">{selectedVideoOverlay.chroma_key_tolerance ?? 35}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={selectedVideoOverlay.chroma_key_tolerance ?? 35}
                    onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, {
                      chroma_key_tolerance: parseInt(e.target.value),
                      chroma_key_enabled: true,
                    })}
                    className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                  />
                </div>

                {/* Edge Smoothness / Feather Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Edge Smoothness / Feather</span>
                    <span className="text-[#FFD21F] font-mono text-[11px]">{selectedVideoOverlay.chroma_key_smoothness ?? 10}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedVideoOverlay.chroma_key_smoothness ?? 10}
                    onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, {
                      chroma_key_smoothness: parseInt(e.target.value),
                      chroma_key_enabled: true,
                    })}
                    className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Timing on Timeline (Start & End Seconds) */}
            <div className={`p-3 rounded-xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161616] border-[#262626]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Timing & Seconds on Track
                </span>
                <span className="text-[10px] font-mono text-[#FFD21F] font-bold">
                  {(selectedVideoOverlay.end_time - selectedVideoOverlay.start_time).toFixed(1)}s duration
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500">Start (s)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={selectedVideoOverlay.start_time}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateVideoOverlay(selectedVideoOverlay.id, {
                        start_time: val,
                        end_time: Math.max(val + 0.5, selectedVideoOverlay.end_time),
                      });
                    }}
                    className={`w-full text-xs font-mono px-2 py-1 rounded border outline-none ${
                      isLight ? 'bg-white border-slate-300' : 'bg-[#222222] border-[#333333] text-white'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500">End (s)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={selectedVideoOverlay.end_time}
                    onChange={(e) => {
                      const val = Math.max(selectedVideoOverlay.start_time + 0.5, parseFloat(e.target.value) || 1);
                      updateVideoOverlay(selectedVideoOverlay.id, { end_time: val });
                    }}
                    className={`w-full text-xs font-mono px-2 py-1 rounded border outline-none ${
                      isLight ? 'bg-white border-slate-300' : 'bg-[#222222] border-[#333333] text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Playback Speed & Mirror Flip */}
            <div className={`p-3 rounded-xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161616] border-[#262626]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Speed & Flip
                </span>
                <span className="text-[10px] font-mono text-[#FFD21F]">
                  {selectedVideoOverlay.playback_rate || 1.0}x
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {[0.5, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { playback_rate: spd })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                      (selectedVideoOverlay.playback_rate || 1.0) === spd
                        ? 'bg-[#FFD21F] text-black border-[#FFD21F]'
                        : isLight
                        ? 'bg-white border-slate-300 text-slate-700'
                        : 'bg-[#222222] border-[#333333] text-gray-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { flip_h: !selectedVideoOverlay.flip_h })}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition-all ${
                    selectedVideoOverlay.flip_h
                      ? 'bg-[#FFD21F] text-black border-[#FFD21F]'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-700'
                      : 'bg-[#222222] border-[#333333] text-gray-300 hover:text-white'
                  }`}
                >
                  Flip Horizontal
                </button>
                <button
                  type="button"
                  onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { flip_v: !selectedVideoOverlay.flip_v })}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition-all ${
                    selectedVideoOverlay.flip_v
                      ? 'bg-[#FFD21F] text-black border-[#FFD21F]'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-700'
                      : 'bg-[#222222] border-[#333333] text-gray-300 hover:text-white'
                  }`}
                >
                  Flip Vertical
                </button>
              </div>
            </div>

            {/* Quick 9-Point Alignment Grid */}
            <div className={`space-y-2 pt-1 border-t ${isLight ? 'border-slate-200' : 'border-[#262626]'}`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Screen Position
                </label>
                <span className="text-[10px] text-[#FFD21F] font-mono">
                  X: {selectedVideoOverlay.x}%, Y: {selectedVideoOverlay.y}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl border bg-[#141414] border-[#262626]">
                {[
                  { label: 'Top Left', x: 22, y: 22 },
                  { label: 'Top Center', x: 50, y: 22 },
                  { label: 'Top Right', x: 78, y: 22 },
                  { label: 'Mid Left', x: 22, y: 50 },
                  { label: 'Center', x: 50, y: 50 },
                  { label: 'Mid Right', x: 78, y: 50 },
                  { label: 'Bot Left', x: 22, y: 78 },
                  { label: 'Bottom', x: 50, y: 78 },
                  { label: 'Bot Right', x: 78, y: 78 },
                ].map((pos) => {
                  const isMatch = selectedVideoOverlay.x === pos.x && selectedVideoOverlay.y === pos.y;
                  return (
                    <button
                      key={pos.label}
                      type="button"
                      onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { x: pos.x, y: pos.y })}
                      className={`py-1 px-1 rounded text-[10px] font-semibold transition-all border ${
                        isMatch
                          ? 'bg-[#FFD21F] text-black border-[#FFD21F] font-bold shadow-xs'
                          : 'bg-[#1C1C1C] border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#252525]'
                      }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>

              {/* Sliders for Position X and Y */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Horizontal (X)</span>
                  <span className="text-white font-mono">{selectedVideoOverlay.x}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={selectedVideoOverlay.x}
                  onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { x: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Vertical (Y)</span>
                  <span className="text-white font-mono">{selectedVideoOverlay.y}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={selectedVideoOverlay.y}
                  onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { y: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
            </div>

            {/* Video Size / Scale Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#262626]">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Size / Scale</span>
                <span className="font-mono text-[#FFD21F] font-bold">
                  {Math.round(selectedVideoOverlay.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="2.5"
                step="0.05"
                value={selectedVideoOverlay.scale}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { scale: parseFloat(e.target.value) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Rotation</span>
                <button
                  onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { rotation: 0 })}
                  className="font-mono text-[11px] text-[#FFD21F] hover:underline"
                >
                  {selectedVideoOverlay.rotation}° (Reset)
                </button>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedVideoOverlay.rotation}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { rotation: parseInt(e.target.value) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Opacity</span>
                <span className="font-mono text-[#FFD21F]">{Math.round(selectedVideoOverlay.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedVideoOverlay.opacity}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Overlay Audio Volume & Mute */}
            <div className="space-y-2 pt-2 border-t border-[#262626]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Overlay Audio</span>
                <button
                  onClick={() => updateVideoOverlay(selectedVideoOverlay.id, { is_muted: !selectedVideoOverlay.is_muted })}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center space-x-1 ${
                    selectedVideoOverlay.is_muted ? 'bg-red-500/20 text-red-400' : 'bg-[#242424] text-white hover:bg-[#333333]'
                  }`}
                >
                  {selectedVideoOverlay.is_muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-[#FFD21F]" />}
                  <span>{selectedVideoOverlay.is_muted ? 'Muted' : 'Sound On'}</span>
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedVideoOverlay.is_muted ? 0 : selectedVideoOverlay.volume}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { volume: parseFloat(e.target.value), is_muted: false })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Rounded Corners (Border Radius) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">Corner Radius</span>
                <span className="font-mono text-[#FFD21F]">{selectedVideoOverlay.border_radius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={selectedVideoOverlay.border_radius}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { border_radius: parseInt(e.target.value) })}
                className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
              />
            </div>

            {/* Drop Shadow Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] rounded-lg border border-[#262626]">
              <span className="text-xs text-gray-300">Drop Shadow</span>
              <input
                type="checkbox"
                checked={selectedVideoOverlay.shadow}
                onChange={(e) => updateVideoOverlay(selectedVideoOverlay.id, { shadow: e.target.checked })}
                className="w-4 h-4 accent-[#FFD21F] rounded cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* Case 6: Default Inspector (When nothing is selected) */
          <div className="p-4 space-y-5">
            {/* Quick Summary Card */}
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1B1B1B] border-[#282828]'
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-600' : 'text-gray-400'
              }`}>
                Project Composition
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#222222] border-[#2C2C2C]'
                }`}>
                  <Film className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Video Clips</span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{clips.length}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#222222] border-[#2C2C2C]'
                }`}>
                  <Music className="w-4 h-4 text-[#FF8A00]" />
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Audio Tracks</span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{audioTracks.length}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#222222] border-[#2C2C2C]'
                }`}>
                  <Smile className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Stickers</span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{stickerOverlays.length}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#222222] border-[#2C2C2C]'
                }`}>
                  <ImageIcon className={`w-4 h-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`} />
                  <div>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Images</span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{imageOverlays.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Brightness & Contrast */}
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1B1B1B] border-[#282828]'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-1.5 text-xs ${
                  isLight ? 'text-slate-800 font-bold' : 'text-gray-300 font-semibold'
                }`}>
                  <SunMedium className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <span>Quick Adjustments</span>
                </div>
                {(filters.brightness !== 0 || filters.contrast !== 1) && (
                  <button
                    onClick={() => setFilters({ brightness: 0, contrast: 1 })}
                    className={`text-[10px] hover:underline ${isLight ? 'text-amber-700 font-semibold' : 'text-[#FFD21F]'}`}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className={`flex justify-between text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  <span>Brightness</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{filters.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ brightness: parseInt(e.target.value) })}
                  className={`w-full accent-[#FFD21F] cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-[#242424]'}`}
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className={`flex justify-between text-[11px] ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  <span>Contrast</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{Math.round(filters.contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ contrast: parseFloat(e.target.value) })}
                  className={`w-full accent-[#FFD21F] cursor-pointer h-1.5 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-[#242424]'}`}
                />
              </div>
            </div>

            {/* Helpful Hint - Fixed for Light Mode (Resolves media_1790357191482.png) */}
            <div className={`p-3 rounded-xl text-left space-y-1.5 border transition-all ${
              isLight
                ? 'bg-amber-50/80 border-amber-200 text-amber-950 shadow-xs'
                : 'bg-[#171717] border-[#262626] text-gray-300'
            }`}>
              <div className={`flex items-center space-x-1.5 text-[11px] font-bold ${
                isLight ? 'text-amber-900' : 'text-gray-300'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                <span>Interactive Inspector</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-gray-400'
              }`}>
                Click any clip, caption, sticker, image, or audio track on the timeline to customize its precise properties here.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
