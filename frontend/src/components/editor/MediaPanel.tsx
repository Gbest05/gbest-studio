import React, { useRef, useState } from 'react';
import {
  Upload,
  Film,
  Clock,
  FileVideo,
  HardDrive,
  AlertCircle,
  Sparkles,
  Check,
  Music,
  Download,
  Image as ImageIcon,
  Plus,
  Layers,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api, VideoUploadResult } from '../../services/api';
import { VideoClip, ImageOverlay } from '../../types/editor';

export const MediaPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [activeMediaTab, setActiveMediaTab] = useState<'videos' | 'images'>('videos');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [generatingClipId, setGeneratingClipId] = useState<string | null>(null);

  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [extractingClipId, setExtractingClipId] = useState<string | null>(null);
  const [extractedAudios, setExtractedAudios] = useState<Record<string, { url: string; filename: string }>>({});

  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; url: string; filename: string; width: number; height: number }>
  >([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    projectId,
    clips,
    addClip,
    setSelectedClipId,
    setCaptions,
    setActiveTool,
    addAudioTrack,
    setIsMuted,
    currentTime,
    duration,
    addImageOverlay,
    setSelectedImageId,
  } = useEditorStore();

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processVideoUpload(file);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageUpload(file);
  };

  const processVideoUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.uploadVideo(file, projectId, (percent) => {
        setUploadProgress(percent);
      });

      // Add to clips in store
      addClip({
        id: `clip_${Date.now()}`,
        video_id: res.id,
        url: res.video_url,
        filename: res.original_filename,
        duration: res.duration || 10,
        trim_start: 0,
        trim_end: res.duration || 10,
        width: res.width,
        height: res.height,
        fps: res.fps,
      });

      setSuccessMessage('Video uploaded and ready! You can now auto-generate captions or extract audio.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.uploadVideo(file, projectId, (percent) => {
        setUploadProgress(percent);
      });

      const newImg = {
        id: res.id,
        url: res.video_url,
        filename: res.original_filename,
        width: res.width,
        height: res.height,
      };

      setUploadedImages((prev) => [newImg, ...prev]);

      // Automatically add as overlay to canvas
      handleAddImageToCanvas(newImg);
      setSuccessMessage('Image uploaded and placed onto the canvas!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleAddImageToCanvas = (img: { url: string; filename: string }) => {
    const start = Math.round(currentTime * 100) / 100;
    const end = Math.min(duration || 10, start + 4.0);

    const overlay: ImageOverlay = {
      id: `img_overlay_${Date.now()}`,
      url: img.url,
      filename: img.filename,
      start_time: start,
      end_time: end,
      x: 50,
      y: 50,
      scale: 0.8,
      rotation: 0,
      opacity: 1,
      border_radius: 8,
      border_color: '#FFFFFF',
      border_width: 0,
      shadow: true,
      blend_mode: 'normal',
      animation: 'fade',
    };

    addImageOverlay(overlay);
    setSelectedImageId(overlay.id);
  };

  const handleAutoCaptionClip = async (clip: VideoClip) => {
    setIsGeneratingCaptions(true);
    setGeneratingClipId(clip.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.generateCaptions(clip.video_id, projectId);
      if (res.segments && res.segments.length > 0) {
        setCaptions(res.segments);
        setSuccessMessage(`Successfully transcribed exact speech into ${res.segments.length} captions!`);
        setActiveTool('captions');
      } else {
        throw new Error('No speech detected in this video clip');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsGeneratingCaptions(false);
      setGeneratingClipId(null);
    }
  };

  const handleExtractAudio = async (clip: VideoClip) => {
    setIsExtractingAudio(true);
    setExtractingClipId(clip.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.extractAudioFromVideo(clip.video_id);
      const audioUrl = res?.url || res?.file_url;
      if (res && audioUrl) {
        // Add to audio tracks in store
        addAudioTrack({
          id: `audio_${Date.now()}`,
          filename: res.original_filename || `${clip.filename}.mp3`,
          url: audioUrl,
          duration: res.duration || clip.duration,
          start_offset: 0,
          volume: 1,
          is_muted: false,
          fade_in: 0,
          fade_out: 0,
        });

        // Mute video audio to prevent double playback
        setIsMuted(true);

        // Store extracted reference for download button
        setExtractedAudios((prev) => ({
          ...prev,
          [clip.id]: {
            url: audioUrl,
            filename: res.original_filename || `${clip.filename}.mp3`,
          },
        }));

        setSuccessMessage('Audio extracted as MP3! Added to timeline audio track & original video muted.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract audio from video.');
    } finally {
      setIsExtractingAudio(false);
      setExtractingClipId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161616] select-none">
      {/* Tab Switcher: Videos vs Images */}
      <div className="flex border-b border-[#242424] bg-[#141414] p-1.5 gap-1">
        <button
          onClick={() => setActiveMediaTab('videos')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeMediaTab === 'videos'
              ? 'bg-[#242424] text-[#FFD21F] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Videos ({clips.length})</span>
        </button>
        <button
          onClick={() => setActiveMediaTab('images')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeMediaTab === 'images'
              ? 'bg-[#242424] text-[#FFD21F] shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Images & Logo ({uploadedImages.length})</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeMediaTab === 'videos' ? (
          <>
            {/* Hidden Video Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,.mkv"
              onChange={handleVideoFileChange}
              className="hidden"
            />

            {/* Video Upload Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processVideoUpload(file);
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isUploading
                  ? 'border-[#FFD21F] bg-[#1F1F1F]'
                  : 'border-[#333333] hover:border-[#FFD21F] bg-[#1A1A1A] hover:bg-[#1E1E1E]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#383838] mx-auto flex items-center justify-center mb-2">
                <Upload className="w-5 h-5 text-[#FFD21F]" />
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <p className="font-semibold text-white text-xs">Uploading & processing video...</p>
                  <div className="w-full bg-[#242424] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFD21F] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#A0A0A0]">{uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <p className="font-medium text-white text-xs mb-0.5">
                    Click to add video or drag & drop
                  </p>
                  <p className="text-[10px] text-[#777777]">MP4, MOV, WebM, AVI (up to 500MB)</p>
                </>
              )}
            </div>

            {/* Quick Auto-Caption Banner */}
            {clips.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-[#201D12] to-[#1A1A1A] border border-[#FFD21F]/30 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-[#FFD21F] font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>AI Speech-to-Text Transcription</span>
                </div>
                <p className="text-[10px] text-[#C0C0C0] leading-relaxed">
                  Transcribe exact spoken words into synchronized animated captions.
                </p>
                <button
                  onClick={() => handleAutoCaptionClip(clips[0])}
                  disabled={isGeneratingCaptions}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>{isGeneratingCaptions ? 'Transcribing...' : '✨ Transcribe Video to Captions'}</span>
                </button>
              </div>
            )}

            {/* Status Messages */}
            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-950/40 border border-green-800/60 rounded-lg flex items-start space-x-2 text-green-300 text-xs">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Video Clips List */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                Clips in Project ({clips.length})
              </span>

              {clips.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#666666]">
                  No video clips uploaded yet.
                </div>
              ) : (
                clips.map((clip) => {
                  const extracted = extractedAudios[clip.id];

                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className="p-3 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] hover:border-[#FFD21F]/60 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center flex-shrink-0">
                          <FileVideo className="w-4 h-4 text-[#FFD21F]" />
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-xs font-medium text-white truncate">{clip.filename}</p>
                          <p className="text-[10px] text-[#888888]">
                            {clip.width} × {clip.height} • {clip.duration.toFixed(1)}s
                          </p>
                        </div>
                      </div>

                      {/* Convert to Audio & Download Row */}
                      <div className="pt-2 border-t border-[#262626] flex flex-col gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExtractAudio(clip);
                          }}
                          disabled={isExtractingAudio}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] border border-[#333333] hover:border-[#FF8A00] text-xs text-[#FF8A00] font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          <Music className="w-3.5 h-3.5" />
                          <span>
                            {extractingClipId === clip.id
                              ? 'Extracting MP3 Audio...'
                              : '🎵 Convert Video to Audio (MP3)'}
                          </span>
                        </button>

                        {extracted && (
                          <a
                            href={extracted.url}
                            download={extracted.filename}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-1 px-2 rounded-lg bg-[#252525] hover:bg-[#2F2F2F] border border-[#3A3A3A] text-[11px] text-green-400 font-medium flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Extracted MP3</span>
                          </a>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAutoCaptionClip(clip);
                          }}
                          disabled={isGeneratingCaptions}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#252525] hover:bg-[#2E2E2E] border border-[#383838] hover:border-[#FFD21F]/60 text-xs text-[#FFD21F] font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {generatingClipId === clip.id ? 'Transcribing...' : 'Transcribe to Captions'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Images & Overlays Tab */
          <>
            {/* Hidden Image Input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Image Upload Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processImageUpload(file);
              }}
              onClick={() => !isUploading && imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isUploading
                  ? 'border-[#FFD21F] bg-[#1F1F1F]'
                  : 'border-[#333333] hover:border-[#FFD21F] bg-[#1A1A1A] hover:bg-[#1E1E1E]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#383838] mx-auto flex items-center justify-center mb-2">
                <ImageIcon className="w-5 h-5 text-[#FFD21F]" />
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <p className="font-semibold text-white text-xs">Uploading image...</p>
                  <div className="w-full bg-[#242424] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FFD21F] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-white text-xs mb-0.5">
                    Click to add image or logo
                  </p>
                  <p className="text-[10px] text-[#777777]">PNG, JPG, SVG, WebP, GIF</p>
                </>
              )}
            </div>

            {/* Image Library Grid */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                Uploaded Images ({uploadedImages.length})
              </span>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#666666]">
                  No images uploaded yet. Upload transparent PNG logos, watermarks, or photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className="p-2 bg-[#1B1B1B] border border-[#2B2B2B] hover:border-[#FFD21F] rounded-xl flex flex-col items-center space-y-2 group transition-all"
                    >
                      <div className="w-full h-24 rounded-lg bg-[#111111] overflow-hidden flex items-center justify-center relative">
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-gray-300 font-medium truncate w-full text-center">
                        {img.filename}
                      </span>
                      <button
                        onClick={() => handleAddImageToCanvas(img)}
                        className="w-full py-1 bg-[#282828] hover:bg-[#FFD21F] text-gray-300 hover:text-black font-semibold text-[10px] rounded-lg flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Canvas</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
