import React, { useRef, useState } from 'react';
import { Music, Volume2, VolumeX, Upload, Trash2, Sliders, Plus } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface UploadedAudioItem {
  id: string;
  filename: string;
  url: string;
  duration: number;
}

export const AudioPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAudios, setUploadedAudios] = useState<UploadedAudioItem[]>([]);

  const {
    volume,
    setVolume,
    videoVolume,
    setVideoVolume,
    isMuted,
    setIsMuted,
    audioTracks,
    addAudioTrack,
    removeAudioTrack,
    updateAudioTrack,
    projectId,
  } = useEditorStore();

  const handleDeleteAudio = async (trackId: string) => {
    removeAudioTrack(trackId);
    try {
      await api.deleteAudio(trackId).catch(() => {});
    } catch {}
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadAudio(file, projectId);
      const newAudio: UploadedAudioItem = {
        id: `uploaded_audio_${Date.now()}`,
        filename: res.original_filename,
        url: res.url,
        duration: res.duration || 15,
      };
      setUploadedAudios((prev) => [newAudio, ...prev]);
    } catch (err) {
      console.error('Audio upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddAudioToTimeline = (audio: UploadedAudioItem) => {
    addAudioTrack({
      id: `audio_${Date.now()}`,
      filename: audio.filename,
      url: audio.url,
      duration: audio.duration || 15,
      start_offset: 0,
      volume: 0.5,
      is_muted: false,
      fade_in: 1.0,
      fade_out: 1.0,
    });
  };

  const handleDeleteUploadedAudio = (id: string) => {
    setUploadedAudios((prev) => prev.filter((a) => a.id !== id));
  };

  const currentVideoVol = isMuted ? 0 : (videoVolume ?? volume);

  return (
    <div className="p-4 space-y-5 text-sm overflow-y-auto select-none">
      <div>
        <h3 className="font-semibold text-white text-base">Audio Controls</h3>
        <p className="text-xs text-[#A0A0A0]">Manage video audio and background music.</p>
      </div>

      {/* 1. Original Video Audio */}
      <div className="p-3.5 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-[#FFD21F]" />
            <span>Original Video Audio</span>
          </span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded transition-colors ${
              isMuted ? 'text-[#FF8A00] bg-orange-950/40' : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#888888]">
            <span>Volume</span>
            <span className={`font-mono ${currentVideoVol > 1.0 ? 'text-[#FFD21F] font-bold' : 'text-white'}`}>
              {Math.round(currentVideoVol * 100)}%
              {currentVideoVol > 1.0 && <span className="text-[10px] ml-1 text-amber-400 font-semibold">(Boost)</span>}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2.0"
            step="0.05"
            value={currentVideoVol}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVideoVolume(val);
              setVolume(val);
              if (isMuted) setIsMuted(false);
            }}
            className="w-full accent-[#FFD21F]"
          />
        </div>
      </div>

      {/* 2. Background Music / Sound FX */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/aac,audio/m4a,audio/ogg"
          onChange={handleAudioUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-3 px-4 border border-dashed border-[#333333] hover:border-[#FF8A00] bg-[#161616] hover:bg-[#1A1A1A] rounded-xl flex items-center justify-center space-x-2 text-xs font-medium text-white transition-colors"
        >
          <Upload className="w-4 h-4 text-[#FF8A00]" />
          <span>{isUploading ? 'Uploading Audio...' : 'Upload Music / Sound FX (MP3, WAV)'}</span>
        </button>

        {/* Uploaded Audio Library */}
        {uploadedAudios.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF8A00] block">
              Uploaded Audio Library ({uploadedAudios.length})
            </span>
            <div className="space-y-2">
              {uploadedAudios.map((audio) => (
                <div
                  key={audio.id}
                  className="p-2.5 rounded-xl bg-[#1D1D1D] border border-[#2F2F2F] hover:border-[#FF8A00] transition-all flex items-center justify-between space-x-2"
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-[#FF8A00]" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{audio.filename}</p>
                      <p className="text-[10px] text-gray-400">{audio.duration.toFixed(1)}s</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleAddAudioToTimeline(audio)}
                      className="px-2.5 py-1 rounded-lg bg-[#FF8A00] hover:bg-[#E67A00] text-white font-bold text-xs flex items-center space-x-1 transition-transform active:scale-95 shadow-sm"
                      title="Place audio onto timeline track"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUploadedAudio(audio.id)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Audio Tracks on Timeline */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
            Tracks on Timeline ({audioTracks.length})
          </span>

          {audioTracks.length === 0 ? (
            <div className="text-center py-4 text-xs text-[#666666]">
              No audio tracks placed on timeline yet.
            </div>
          ) : (
            audioTracks.map((track) => (
              <div
                key={track.id}
                className="p-3 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <Music className="w-3.5 h-3.5 text-[#FF8A00] flex-shrink-0" />
                    <span className="text-xs font-medium text-white truncate">{track.filename}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAudio(track.id)}
                    className="text-[#666666] hover:text-red-400 p-1"
                    title="Remove from timeline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#888888]">
                    <span>Music Volume</span>
                    <span className="font-mono text-white">{Math.round(track.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.volume}
                    onChange={(e) => updateAudioTrack(track.id, { volume: parseFloat(e.target.value) })}
                    className="w-full accent-[#FF8A00]"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
