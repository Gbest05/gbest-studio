import React, { useRef, useState, useEffect } from 'react';
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
  Trash2,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api, VideoUploadResult } from '../../services/api';
import { VideoClip, ImageOverlay, VideoOverlay } from '../../types/editor';

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

  const [uploadedVideos, setUploadedVideos] = useState<
    Array<{ id: string; video_id: string; url: string; filename: string; duration: number; width: number; height: number; fps: number }>
  >([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    projectId,
    clips,
    addClip,
    removeClip,
    setSelectedClipId,
    setCaptions,
    setActiveTool,
    addAudioTrack,
    setIsMuted,
    currentTime,
    duration,
    addImageOverlay,
    setSelectedImageId,
    videoOverlays,
    addVideoOverlay,
    removeVideoOverlay,
    selectedVideoOverlayId,
    setSelectedVideoOverlayId,
    theme,
  } = useEditorStore();

  const isLight = theme === 'light';

  // Auto-dismiss messages so they don't stick around permanently
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const shortFilename = (name: string, maxLen = 24) => {
    if (!name) return '';
    return name.length > maxLen ? `${name.substring(0, maxLen - 3)}...` : name;
  };

  const allLibraryVideos = [
    ...uploadedVideos,
    ...clips
      .filter((c) => !uploadedVideos.some((v) => (v.video_id && v.video_id === c.video_id) || (v.url && v.url === c.url)))
      .map((c) => ({
        id: c.id,
        video_id: c.video_id || c.id,
        url: c.url,
        filename: c.filename,
        duration: c.duration || 10,
        width: c.width || 1920,
        height: c.height || 1080,
        fps: c.fps || 30,
      })),
  ];

  const handleAddVideoToTimeline = (vid: {
    video_id: string;
    url: string;
    filename: string;
    duration: number;
    width: number;
    height: number;
    fps: number;
  }) => {
    const newClip: VideoClip = {
      id: `clip_${Date.now()}`,
      video_id: vid.video_id,
      url: vid.url,
      filename: vid.filename,
      duration: vid.duration || 10,
      start_time: Math.round(currentTime * 100) / 100,
      trim_start: 0,
      trim_end: vid.duration || 10,
      width: vid.width,
      height: vid.height,
      fps: vid.fps,
    };
    addClip(newClip);
    setSelectedClipId(newClip.id);
    setSuccessMessage(`Added "${shortFilename(vid.filename)}" to video track line!`);
  };

  const handleAddImageToVideoTrack = (img: { id?: string; url: string; filename: string; width?: number; height?: number }) => {
    const imgClip: VideoClip = {
      id: `clip_img_${Date.now()}`,
      video_id: img.id || `img_${Date.now()}`,
      url: img.url,
      filename: img.filename,
      duration: 4.0,
      start_time: Math.round(currentTime * 100) / 100,
      trim_start: 0,
      trim_end: 4.0,
      width: img.width || 1920,
      height: img.height || 1080,
      fps: 30,
    };
    addClip(imgClip);
    setSelectedClipId(imgClip.id);
    setSuccessMessage(`Added "${shortFilename(img.filename)}" to video track line!`);
  };

  const handleAddVideoOverlay = (vid: {
    video_id: string;
    url: string;
    filename: string;
    duration: number;
  }) => {
    const newOverlay: VideoOverlay = {
      id: `v_ov_${Date.now()}`,
      video_id: vid.video_id,
      url: vid.url,
      filename: vid.filename,
      start_time: Math.round(currentTime * 10) / 10,
      end_time: Math.round(Math.min(duration || 10, currentTime + (vid.duration || 5)) * 10) / 10,
      x: 50,
      y: 50,
      scale: 0.45,
      rotation: 0,
      opacity: 1,
      volume: 1,
      is_muted: false,
      border_radius: 8,
      border_color: '#FFD21F',
      border_width: 0,
      shadow: true,
    };
    addVideoOverlay(newOverlay);
    setSelectedVideoOverlayId(newOverlay.id);
    setSuccessMessage(`Added "${shortFilename(vid.filename)}" as overlay on screen!`);
  };

  const handleDeleteUploadedVideo = async (vidId: string, videoId: string, filename: string) => {
    if (window.confirm(`Delete "${filename}" from library?`)) {
      setUploadedVideos((prev) => prev.filter((v) => v.id !== vidId));
      try {
        await api.deleteVideo(videoId).catch(() => {});
      } catch {}
    }
  };

  const handleDeleteClip = async (clip: VideoClip) => {
    if (window.confirm(`Delete "${clip.filename}" from timeline?`)) {
      try {
        if (clip.video_id) {
          await api.deleteVideo(clip.video_id).catch(() => {});
        }
      } catch {}
      removeClip(clip.id);
      setSuccessMessage(`Deleted "${clip.filename}" from timeline`);
    }
  };

  const handleDeleteUploadedImage = async (imgId: string, filename: string) => {
    if (window.confirm(`Delete "${filename}"?`)) {
      setUploadedImages((prev) => prev.filter((i) => i.id !== imgId));
      try {
        await api.deleteVideo(imgId).catch(() => {});
      } catch {}
    }
  };

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

      const newVid = {
        id: `vid_${Date.now()}`,
        video_id: res.id,
        url: res.video_url,
        filename: res.original_filename,
        duration: res.duration || 10,
        width: res.width,
        height: res.height,
        fps: res.fps,
      };

      setUploadedVideos((prev) => [newVid, ...prev]);

      // Requirement 2: Image and video should be uploaded to the video track line
      const newClip: VideoClip = {
        id: `clip_${Date.now()}`,
        video_id: res.id,
        url: res.video_url,
        filename: res.original_filename,
        duration: res.duration || 10,
        start_time: Math.round(currentTime * 100) / 100,
        trim_start: 0,
        trim_end: res.duration || 10,
        width: res.width || 1920,
        height: res.height || 1080,
        fps: res.fps || 30,
      };
      addClip(newClip);
      setSelectedClipId(newClip.id);
      setSuccessMessage(`Added "${shortFilename(res.original_filename)}" to video track line!`);
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

      // Requirement 2: Image and video should be uploaded to the video track line
      const imgClip: VideoClip = {
        id: `clip_img_${Date.now()}`,
        video_id: res.id,
        url: res.video_url,
        filename: res.original_filename,
        duration: 4.0,
        start_time: Math.round(currentTime * 100) / 100,
        trim_start: 0,
        trim_end: 4.0,
        width: res.width || 1920,
        height: res.height || 1080,
        fps: 30,
      };
      addClip(imgClip);
      setSelectedClipId(imgClip.id);
      setSuccessMessage(`Added image "${shortFilename(newImg.filename)}" to video track line!`);
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
    <div className={`flex flex-col h-full select-none ${isLight ? 'bg-[#F8FAFC]' : 'bg-[#161616]'}`}>
      {/* Tab Switcher: Videos vs Images */}
      <div className={`flex border-b p-1.5 gap-1 ${isLight ? 'border-slate-200 bg-slate-100' : 'border-[#242424] bg-[#141414]'}`}>
        <button
          onClick={() => setActiveMediaTab('videos')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeMediaTab === 'videos'
              ? isLight
                ? 'bg-white text-amber-800 shadow-sm border border-slate-200 font-bold'
                : 'bg-[#242424] text-[#FFD21F] shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-black hover:bg-slate-200/60'
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
              ? isLight
                ? 'bg-white text-amber-800 shadow-sm border border-slate-200 font-bold'
                : 'bg-[#242424] text-[#FFD21F] shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-black hover:bg-slate-200/60'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Images & Logo ({uploadedImages.length})</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 sm:pb-32">
        {/* Status Messages - Requirement 1: Never overflow container box */}
        {errorMessage && (
          <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-xs w-full max-w-full overflow-hidden shadow-sm animate-fade-in ${
            isLight ? 'bg-red-50 border-red-300 text-red-800' : 'bg-red-950/60 border-red-800/80 text-red-200'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <span className="flex-1 min-w-0 break-words break-all text-xs leading-relaxed">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className={`p-0.5 rounded transition-colors flex-shrink-0 ${isLight ? 'hover:bg-red-100 text-red-700' : 'hover:bg-red-900 text-red-400'}`}
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className={`p-2.5 rounded-xl border flex items-start space-x-2 text-xs w-full max-w-full overflow-hidden shadow-sm animate-fade-in ${
            isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
          }`}>
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
            <span className="flex-1 min-w-0 break-words break-all text-xs leading-relaxed">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className={`p-0.5 rounded transition-colors flex-shrink-0 ${isLight ? 'hover:bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-900 text-emerald-400'}`}
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

            {/* Compact Video Import / Upload Trigger */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processVideoUpload(file);
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`w-full py-2.5 px-3 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-between shadow-sm group ${
                isUploading
                  ? isLight
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-[#FFD21F] bg-[#1F1F1F]'
                  : isLight
                  ? 'border-slate-300 hover:border-amber-500 bg-white hover:bg-slate-50'
                  : 'border-[#383838] hover:border-[#FFD21F] bg-[#1A1A1A] hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isLight ? 'bg-slate-100 group-hover:bg-amber-100 border-slate-200' : 'bg-[#252525] group-hover:bg-[#FFD21F]/20 border-[#333333]'
                }`}>
                  <Upload className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                </div>
                <div className="truncate text-left">
                  <p className={`text-xs font-semibold transition-colors leading-tight truncate ${
                    isLight ? 'text-slate-800 group-hover:text-amber-600' : 'text-white group-hover:text-[#FFD21F]'
                  }`}>
                    {isUploading ? 'Uploading & processing...' : '+ Import / Upload Video'}
                  </p>
                  <p className={`text-[9.5px] leading-tight ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    MP4, MOV, WebM, AVI (up to 500MB)
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <div className={`w-14 sm:w-16 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#252525]'}`}>
                    <div
                      className="bg-[#FFD21F] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-[#FFD21F]'}`}>{uploadProgress}%</span>
                </div>
              )}
            </div>

            {/* Quick Auto-Caption Banner */}
            {clips.length > 0 && (
              <div className={`p-3 rounded-xl space-y-1.5 border transition-all ${
                isLight
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm'
                  : 'bg-gradient-to-r from-[#201D12] to-[#1A1A1A] border-[#FFD21F]/30 text-white'
              }`}>
                <div className={`flex items-center space-x-1.5 font-bold text-xs ${
                  isLight ? 'text-amber-900' : 'text-[#FFD21F]'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 stroke-[2.5] ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                  <span>AI Speech-to-Text Transcription</span>
                </div>
                <p className={`text-[10px] leading-snug ${isLight ? 'text-slate-600 font-medium' : 'text-[#C0C0C0]'}`}>
                  Transcribe exact spoken words into synchronized animated captions.
                </p>
                <button
                  onClick={() => handleAutoCaptionClip(clips[0])}
                  disabled={isGeneratingCaptions}
                  className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-sm ${
                    isLight
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                      : 'bg-[#FFD21F] hover:bg-[#E6BC15] text-black'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isGeneratingCaptions ? 'Transcribing...' : '✨ Transcribe Video to Captions'}</span>
                </button>
              </div>
            )}

            {/* Uploaded Video Library: Square side by side grid with actual screen video images */}
            <div className="space-y-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 block ${
                isLight ? 'text-amber-800' : 'text-[#FFD21F]'
              }`}>
                <Film className="w-3.5 h-3.5" />
                <span>Uploaded Videos ({allLibraryVideos.length})</span>
              </span>

              {allLibraryVideos.length === 0 ? (
                <div className={`text-center py-6 px-3 rounded-xl border text-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'border-[#262626] bg-[#141414] text-gray-500'
                }`}>
                  No videos uploaded yet. Click "+ Import / Upload Video" above.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {allLibraryVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="aspect-square rounded-xl overflow-hidden relative border border-[#2D2D2D] hover:border-[#FFD21F] bg-[#121212] group transition-all flex flex-col justify-between shadow-md select-none"
                    >
                      {/* Screen Video Image (Live video frame thumbnail preview) */}
                      <div className="absolute inset-0 bg-[#0C1E1D] overflow-hidden">
                        {vid.url ? (
                          <video
                            src={`${vid.url}#t=0.1`}
                            className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121212] to-[#1e1e1e]">
                            <FileVideo className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Top Floating Badges */}
                      <div className="relative z-10 p-1.5 flex items-center justify-between pointer-events-none">
                        <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono text-white font-semibold shadow">
                          {Math.floor(vid.duration / 60)}:{String(Math.floor(vid.duration % 60)).padStart(2, '0')}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUploadedVideo(vid.id, vid.video_id, vid.filename);
                          }}
                          className="pointer-events-auto p-1 rounded bg-black/75 hover:bg-red-600 text-gray-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow"
                          title="Delete from library"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Bottom Gradient Overlay with Filename & Quick Action Buttons */}
                      <div className="relative z-10 bg-gradient-to-t from-black via-black/85 to-transparent p-1.5 pt-5 flex flex-col justify-end space-y-1">
                        <p className="text-[10px] font-medium text-white truncate drop-shadow-sm leading-tight" title={vid.filename}>
                          {vid.filename}
                        </p>

                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => handleAddVideoToTimeline(vid)}
                            className="py-1 px-1 rounded bg-[#252525] hover:bg-[#333333] hover:text-[#FFD21F] text-gray-200 font-bold text-[9px] flex items-center justify-center space-x-0.5 transition-all border border-[#3A3A3A] active:scale-95 shadow-sm"
                            title="Set as main video on timeline"
                          >
                            <Plus className="w-2.5 h-2.5 text-[#FFD21F]" />
                            <span>Track</span>
                          </button>
                          <button
                            onClick={() => handleAddVideoOverlay(vid)}
                            className="py-1 px-1 rounded bg-[#FFD21F] hover:bg-[#FFE066] text-black font-extrabold text-[9px] flex items-center justify-center space-x-0.5 transition-all active:scale-95 shadow-sm"
                            title="Overlay video on screen (Picture-in-Picture)"
                          >
                            <Layers className="w-2.5 h-2.5 stroke-[2.5]" />
                            <span>Overlay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Overlays (Picture-in-Picture) List */}
            {videoOverlays.length > 0 && (
              <div className="space-y-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 block ${
                  isLight ? 'text-amber-800' : 'text-amber-400'
                }`}>
                  <Layers className="w-3.5 h-3.5 text-[#FFD21F]" />
                  <span>Overlay Videos on Screen ({videoOverlays.length})</span>
                </span>
                <div className="space-y-1.5">
                  {videoOverlays.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVideoOverlayId(v.id);
                        setActiveTool(null); // opens right inspector
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between space-x-2 cursor-pointer transition-colors shadow-sm ${
                        selectedVideoOverlayId === v.id
                          ? isLight
                            ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-[#222222] border-[#FFD21F] ring-1 ring-[#FFD21F]'
                          : isLight
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-[#181818] border-[#2A2A2A] hover:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileVideo className="w-3.5 h-3.5 text-[#FFD21F] flex-shrink-0" />
                        <span className={`text-xs truncate font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{v.filename}</span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>({Math.round(v.scale * 100)}% size)</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVideoOverlay(v.id);
                        }}
                        className={`p-1 rounded transition-colors ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-400'}`}
                        title="Remove overlay video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Clips List */}
            <div className="space-y-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-700' : 'text-[#777777]'
              }`}>
                Clips on Timeline ({clips.length})
              </span>

              {clips.length === 0 ? (
                <div className={`text-center py-6 text-xs ${isLight ? 'text-slate-500' : 'text-[#666666]'}`}>
                  No video clips uploaded yet.
                </div>
              ) : (
                clips.map((clip) => {
                  const extracted = extractedAudios[clip.id];

                  return (
                    <div
                      key={clip.id}
                      onClick={() => setSelectedClipId(clip.id)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer space-y-2.5 shadow-sm ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-amber-500 text-slate-800'
                          : 'bg-[#1B1B1B] border-[#2B2B2B] hover:border-[#FFD21F]/60 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isLight ? 'bg-amber-50 border border-amber-200' : 'bg-[#242424]'
                        }`}>
                          <FileVideo className="w-4 h-4 text-[#FFD21F]" />
                        </div>
                        <div className="truncate flex-1">
                          <p className={`text-xs truncate ${isLight ? 'font-semibold text-slate-900' : 'font-medium text-white'}`}>{clip.filename}</p>
                          <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#888888]'}`}>
                            {clip.width} × {clip.height} • {clip.duration.toFixed(1)}s
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClip(clip);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLight
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title="Delete video from project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Convert to Audio & Download Row */}
                      <div className={`pt-2 border-t flex flex-col gap-1.5 ${isLight ? 'border-slate-200' : 'border-[#262626]'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExtractAudio(clip);
                          }}
                          disabled={isExtractingAudio}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 ${
                            isLight
                              ? 'bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-800'
                              : 'bg-[#222222] hover:bg-[#2A2A2A] border-[#333333] hover:border-[#FF8A00] text-[#FF8A00]'
                          }`}
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
                            className={`w-full py-1 px-2 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors ${
                              isLight
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-[#252525] hover:bg-[#2F2F2F] border-[#3A3A3A] text-green-400'
                            }`}
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
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 ${
                            isLight
                              ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 hover:border-amber-500 text-amber-800'
                              : 'bg-[#252525] hover:bg-[#2E2E2E] border-[#383838] hover:border-[#FFD21F]/60 text-[#FFD21F]'
                          }`}
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

            {/* Compact Image Upload Trigger */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) processImageUpload(file);
              }}
              onClick={() => !isUploading && imageInputRef.current?.click()}
              className={`w-full py-2.5 px-3 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-between shadow-sm group ${
                isUploading
                  ? isLight
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-[#FFD21F] bg-[#1F1F1F]'
                  : isLight
                  ? 'border-slate-300 hover:border-amber-500 bg-white hover:bg-slate-50'
                  : 'border-[#383838] hover:border-[#FFD21F] bg-[#1A1A1A] hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isLight ? 'bg-slate-100 group-hover:bg-amber-100 border-slate-200' : 'bg-[#252525] group-hover:bg-[#FFD21F]/20 border-[#333333]'
                }`}>
                  <ImageIcon className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD21F]'}`} />
                </div>
                <div className="truncate text-left">
                  <p className={`text-xs font-semibold transition-colors leading-tight truncate ${
                    isLight ? 'text-slate-800 group-hover:text-amber-600' : 'text-white group-hover:text-[#FFD21F]'
                  }`}>
                    {isUploading ? 'Uploading image...' : '+ Import / Upload Image'}
                  </p>
                  <p className={`text-[9.5px] leading-tight ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    PNG, JPG, SVG, WebP, GIF
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <div className={`w-14 sm:w-16 h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#252525]'}`}>
                    <div
                      className="bg-[#FFD21F] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-amber-700' : 'text-[#FFD21F]'}`}>{uploadProgress}%</span>
                </div>
              )}
            </div>

            {/* Image Library Grid */}
            <div className="space-y-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 block ${
                isLight ? 'text-amber-800' : 'text-[#FFD21F]'
              }`}>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Uploaded Images ({uploadedImages.length})</span>
              </span>

              {uploadedImages.length === 0 ? (
                <div className={`text-center py-8 text-xs rounded-xl border ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#141414] border-[#262626] text-gray-500'
                }`}>
                  No images uploaded yet. Upload PNG logos, photos, watermarks or graphics.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className={`p-2 rounded-xl flex flex-col items-center space-y-2 group transition-all border shadow-sm ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-amber-500 text-slate-800'
                          : 'bg-[#1B1B1B] border-[#2B2B2B] hover:border-[#FFD21F] text-white'
                      }`}
                    >
                      <div className={`w-full h-24 rounded-lg overflow-hidden flex items-center justify-center relative ${
                        isLight ? 'bg-slate-100' : 'bg-[#111111]'
                      }`}>
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className={`text-[10px] font-medium truncate w-full text-center ${
                        isLight ? 'text-slate-800' : 'text-gray-300'
                      }`} title={img.filename}>
                        {img.filename}
                      </span>
                      <div className="flex space-x-1 w-full">
                        <button
                          onClick={() => handleAddImageToVideoTrack(img)}
                          className={`flex-1 py-1 px-1 rounded-lg text-[9px] font-bold flex items-center justify-center space-x-0.5 transition-all border active:scale-95 shadow-sm ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 hover:border-amber-500'
                              : 'bg-[#252525] hover:bg-[#333333] hover:text-[#FFD21F] text-gray-200 border-[#3A3A3A]'
                          }`}
                          title="Add as 4s clip to main video track line"
                        >
                          <Film className="w-2.5 h-2.5 text-[#FFD21F]" />
                          <span>Track</span>
                        </button>
                        <button
                          onClick={() => handleAddImageToCanvas(img)}
                          className="flex-1 py-1 px-1 bg-[#FFD21F] hover:bg-[#FFE066] text-black font-extrabold text-[9px] rounded-lg flex items-center justify-center space-x-0.5 transition-all active:scale-95 shadow-sm"
                          title="Overlay image on screen canvas"
                        >
                          <Layers className="w-2.5 h-2.5 stroke-[2.5]" />
                          <span>Overlay</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUploadedImage(img.id, img.filename)}
                          className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                            isLight
                              ? 'bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500'
                              : 'bg-[#282828] hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                          }`}
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
