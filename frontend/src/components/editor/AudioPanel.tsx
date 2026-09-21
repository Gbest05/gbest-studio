import React, { useRef, useState } from 'react';
import { Music, Volume2, VolumeX, Upload, Trash2, Sliders } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

export const AudioPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadAudio(file, projectId);
      addAudioTrack({
        id: `audio_${Date.now()}`,
        filename: res.original_filename,
        url: res.url,
        duration: res.duration || 15,
        start_offset: 0,
        volume: 0.5,
        is_muted: false,
        fade_in: 1.0,
        fade_out: 1.0,
      });
    } catch (err) {
      console.error('Audio upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <span className="font-mono text-white">{Math.round(currentVideoVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
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
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
            Background Tracks ({audioTracks.length})
          </span>
        </div>

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

        {audioTracks.map((track) => (
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
                onClick={() => removeAudioTrack(track.id)}
                className="text-[#666666] hover:text-red-400 p-1"
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
        ))}
      </div>
    </div>
  );
};
