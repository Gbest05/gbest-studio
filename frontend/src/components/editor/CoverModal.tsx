import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Upload, Sparkles, Check, Type, Move } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface CoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverModal: React.FC<CoverModalProps> = ({ isOpen, onClose }) => {
  const { clips, coverImage, setCoverImage, projectId, duration } = useEditorStore();
  const primaryClip = clips[0];

  const [activeTab, setActiveTab] = useState<'video' | 'upload'>('video');
  const [frameTime, setFrameTime] = useState(0);
  const [coverText, setCoverText] = useState('');
  const [coverTextColor, setCoverTextColor] = useState('#FFD21F');
  const [coverTextBg, setCoverTextBg] = useState('rgba(0,0,0,0.7)');
  const [selectedPreview, setSelectedPreview] = useState<string | null>(coverImage);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync video time when frame slider changes
  useEffect(() => {
    if (videoRef.current && primaryClip) {
      videoRef.current.currentTime = frameTime;
    }
  }, [frameTime, primaryClip]);

  if (!isOpen) return null;

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedPreview(dataUrl);
      }
    } catch (e) {
      console.error('Failed to capture frame from video canvas:', e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCover = async () => {
    if (!selectedPreview) return;
    setIsSaving(true);
    try {
      setCoverImage(selectedPreview);
      // Persist to project if projectId exists
      if (projectId) {
        await api.updateProject(projectId, {
          thumbnail_url: selectedPreview,
        }).catch(() => {});
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD21F]/15 flex items-center justify-center text-[#FFD21F]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Project Cover Page</h2>
              <p className="text-[11px] text-gray-400">
                Choose a video frame or upload custom artwork for your video thumbnail.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tab Switcher */}
          <div className="flex bg-[#121212] p-1 rounded-xl border border-[#242424]">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'video'
                  ? 'bg-[#222222] text-[#FFD21F] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Select from Video</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#222222] text-[#FFD21F] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Image</span>
            </button>
          </div>

          {/* Tab 1: Video Frame Capture */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              {primaryClip ? (
                <>
                  <div className="relative aspect-video max-h-52 bg-black rounded-xl overflow-hidden border border-[#2B2B2B] mx-auto flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={primaryClip.url}
                      className="w-full h-full object-contain pointer-events-none"
                      preload="auto"
                      crossOrigin="anonymous"
                    />
                    {coverText && (
                      <div
                        className="absolute bottom-4 left-4 right-4 text-center px-4 py-2 font-black text-sm uppercase rounded shadow-lg"
                        style={{
                          color: coverTextColor,
                          backgroundColor: coverTextBg,
                        }}
                      >
                        {coverText}
                      </div>
                    )}
                  </div>

                  {/* Scrubber Range Slider */}
                  <div className="space-y-1.5 bg-[#141414] p-3 rounded-xl border border-[#242424]">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span className="font-medium">Scrub to Frame:</span>
                      <span className="font-mono text-[#FFD21F] font-bold">
                        {frameTime.toFixed(1)}s / {(duration || primaryClip.duration || 10).toFixed(1)}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || primaryClip.duration || 10}
                      step="0.1"
                      value={frameTime}
                      onChange={(e) => setFrameTime(parseFloat(e.target.value))}
                      className="w-full accent-[#FFD21F] cursor-pointer bg-[#242424] h-2 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={handleCaptureFrame}
                    className="w-full py-2 bg-[#252525] hover:bg-[#2F2F2F] text-[#FFD21F] border border-[#FFD21F]/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Capture Current Frame as Cover</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No video clips loaded. Upload a video clip first or use Custom Image upload.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Upload Custom Image */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#333333] hover:border-[#FFD21F] bg-[#141414] hover:bg-[#181818] rounded-xl p-8 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#222222] border border-[#333333] mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-[#FFD21F]" />
                </div>
                <p className="text-xs font-semibold text-white mb-1">Click to select cover image</p>
                <p className="text-[10px] text-gray-500">Supports PNG, JPG, WebP (up to 20MB)</p>
              </div>
            </div>
          )}

          {/* Cover Title / Headline Text Customizer */}
          <div className="space-y-3 bg-[#131313] p-4 rounded-xl border border-[#242424]">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
              <Type className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span>Cover Title / Headline Text (Optional)</span>
            </div>
            <input
              type="text"
              placeholder="e.g. VIRAL HACKS #1, HOW TO EDIT FASTER..."
              value={coverText}
              onChange={(e) => setCoverText(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F]"
            />
            {coverText && (
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-gray-400">Color:</span>
                  <input
                    type="color"
                    value={coverTextColor}
                    onChange={(e) => setCoverTextColor(e.target.value)}
                    className="w-6 h-6 rounded border border-gray-600 cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-gray-400">Badge Background:</span>
                  <select
                    value={coverTextBg}
                    onChange={(e) => setCoverTextBg(e.target.value)}
                    className="bg-[#1C1C1C] text-xs text-white border border-[#2E2E2E] rounded px-2 py-1"
                  >
                    <option value="rgba(0,0,0,0.8)">Dark Shadow</option>
                    <option value="#FFD21F">Yellow Highlight (Dark Text)</option>
                    <option value="#FF0000">Red Punch</option>
                    <option value="transparent">Transparent</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Active Preview Thumbnail Card */}
          {selectedPreview && (
            <div className="p-3 bg-[#141414] rounded-xl border border-[#282828] space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Selected Cover Preview
              </span>
              <div className="relative aspect-video max-h-40 rounded-lg overflow-hidden bg-black mx-auto border border-[#333333]">
                <img
                  src={selectedPreview}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                {coverText && (
                  <div
                    className="absolute bottom-2 left-2 right-2 text-center px-2 py-1 font-bold text-xs uppercase rounded"
                    style={{
                      color: coverTextBg === '#FFD21F' ? '#000' : coverTextColor,
                      backgroundColor: coverTextBg,
                    }}
                  >
                    {coverText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#262626] bg-[#141414] flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedPreview(null);
              setCoverImage(null);
              onClose();
            }}
            className="text-xs text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-[#202020] transition-colors"
          >
            Remove Cover
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCover}
              disabled={!selectedPreview || isSaving}
              className="px-5 py-2 bg-[#FFD21F] hover:bg-[#E6BC15] text-black text-xs font-bold rounded-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 shadow-md shadow-amber-500/10"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'Saving...' : 'Set as Project Cover'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
