import React from 'react';
import {
  Settings2,
  Smile,
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
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { CaptionStylePanel } from './CaptionStylePanel';
import { EffectsPanel } from './EffectsPanel';

export const PropertiesInspector: React.FC = () => {
  const {
    selectedCaptionId,
    selectedClipId,
    selectedTextId,
    selectedStickerId,
    selectedImageId,
    selectedAudioId,
    stickerOverlays,
    imageOverlays,
    clips,
    audioTracks,
    filters,
    updateSticker,
    removeSticker,
    setSelectedStickerId,
    updateImageOverlay,
    removeImageOverlay,
    setSelectedImageId,
    setSelectedAudioId,
    updateAudioTrack,
    removeAudioTrack,
    setFilters,
    setIsRightBarCollapsed,
  } = useEditorStore();

  const selectedSticker = stickerOverlays.find((s) => s.id === selectedStickerId);
  const selectedImage = imageOverlays.find((img) => img.id === selectedImageId);
  const selectedAudio = audioTracks.find((a) => a.id === selectedAudioId);

  // Determine Title & Icon
  let title = 'Inspector';
  let HeaderIcon = Settings2;

  if (selectedCaptionId) {
    title = 'Caption Properties';
  } else if (selectedClipId) {
    title = 'Clip & Effects';
  } else if (selectedStickerId && selectedSticker) {
    title = 'Sticker Settings';
    HeaderIcon = Smile;
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
    <aside className="w-80 bg-[#161616] border-l border-[#242424] flex flex-col h-full select-none flex-shrink-0">
      {/* Top Header */}
      <div className="h-12 border-b border-[#242424] px-4 flex items-center justify-between bg-[#141414]">
        <div className="flex items-center space-x-2">
          <HeaderIcon className="w-4 h-4 text-[#FFD21F]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">{title}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {(selectedStickerId || selectedImageId || selectedAudioId) && (
            <button
              onClick={() => {
                if (selectedStickerId) setSelectedStickerId(null);
                if (selectedImageId) setSelectedImageId(null);
                if (selectedAudioId) setSelectedAudioId(null);
              }}
              className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#202020] hover:bg-[#282828] transition-colors"
            >
              Deselect
            </button>
          )}
          <button
            onClick={() => setIsRightBarCollapsed(true)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#222222] transition-colors"
            title="Collapse Inspector"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Case 1: Caption Selected */}
        {selectedCaptionId ? (
          <CaptionStylePanel />
        ) : /* Case 2: Clip Selected */
        selectedClipId ? (
          <EffectsPanel />
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
        ) : /* Case 4: Sticker Selected */
        selectedStickerId && selectedSticker ? (
          <div className="p-4 space-y-5">
            {/* Sticker Preview Badge */}
            <div className="flex items-center justify-between p-3 bg-[#1D1D1D] rounded-xl border border-[#282828]">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#262626] rounded-lg flex items-center justify-center text-3xl shadow-inner">
                  {selectedSticker.content ? selectedSticker.content : <Smile className="w-6 h-6 text-[#FFD21F]" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white capitalize">
                    {selectedSticker.type} Sticker
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

            {/* Scale Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Scale / Size</span>
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
                <span className="text-gray-400">Rotation</span>
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
                <span className="text-gray-400">Opacity</span>
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
              <span className="text-xs text-gray-400 block font-medium">Entrance Animation</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['none', 'bounce', 'pulse', 'spin', 'float', 'pop'] as const).map((anim) => (
                  <button
                    key={anim}
                    onClick={() => updateSticker(selectedSticker.id, { animation: anim })}
                    className={`px-2 py-1.5 rounded-lg text-xs capitalize transition-all border ${
                      selectedSticker.animation === anim
                        ? 'bg-[#FFD21F] text-black font-bold border-[#FFD21F]'
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
              className="w-full py-2 bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-[#2B2B2B] flex items-center justify-center space-x-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Center Sticker on Canvas</span>
            </button>
          </div>
        ) : /* Case 5: Image Overlay Selected */
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
        ) : (
          /* Case 6: Default Inspector (When nothing is selected) - Note: Canvas settings completely absent! */
          <div className="p-4 space-y-5">
            {/* Quick Summary Card */}
            <div className="p-3.5 bg-[#1B1B1B] rounded-xl border border-[#282828] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Project Composition
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#222222] p-2.5 rounded-lg border border-[#2C2C2C] flex items-center space-x-2">
                  <Film className="w-4 h-4 text-[#FFD21F]" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Video Clips</span>
                    <span className="font-bold text-white">{clips.length}</span>
                  </div>
                </div>
                <div className="bg-[#222222] p-2.5 rounded-lg border border-[#2C2C2C] flex items-center space-x-2">
                  <Music className="w-4 h-4 text-[#FF8A00]" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Audio Tracks</span>
                    <span className="font-bold text-white">{audioTracks.length}</span>
                  </div>
                </div>
                <div className="bg-[#222222] p-2.5 rounded-lg border border-[#2C2C2C] flex items-center space-x-2">
                  <Smile className="w-4 h-4 text-[#FFD21F]" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Stickers</span>
                    <span className="font-bold text-white">{stickerOverlays.length}</span>
                  </div>
                </div>
                <div className="bg-[#222222] p-2.5 rounded-lg border border-[#2C2C2C] flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-gray-300" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Images</span>
                    <span className="font-bold text-white">{imageOverlays.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Brightness & Contrast */}
            <div className="p-3.5 bg-[#1B1B1B] rounded-xl border border-[#282828] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                  <SunMedium className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span className="font-semibold">Quick Adjustments</span>
                </div>
                {(filters.brightness !== 0 || filters.contrast !== 1) && (
                  <button
                    onClick={() => setFilters({ brightness: 0, contrast: 1 })}
                    className="text-[10px] text-[#FFD21F] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Brightness</span>
                  <span className="text-white font-mono">{filters.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.brightness}
                  onChange={(e) => setFilters({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Contrast</span>
                  <span className="text-white font-mono">{Math.round(filters.contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={filters.contrast}
                  onChange={(e) => setFilters({ contrast: parseFloat(e.target.value) })}
                  className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-1.5 rounded-lg"
                />
              </div>
            </div>

            {/* Helpful Hint */}
            <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl text-left space-y-1.5">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-300">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span>Interactive Inspector</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Click any clip, caption, sticker, image, or audio track on the timeline to customize its precise properties here.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
