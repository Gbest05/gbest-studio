import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api, ExportStatus } from '../../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const {
    projectId,
    aspectRatio,
    duration,
    clips,
    getExportableState,
  } = useEditorStore();

  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [quality, setQuality] = useState<'standard' | 'high' | 'max'>('high');
  const [fps, setFps] = useState<number>(30);
  const [isExporting, setIsExporting] = useState(false);
  const [exportJob, setExportJob] = useState<ExportStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsExporting(false);
      setExportJob(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Poll export status
  useEffect(() => {
    if (!isExporting || !exportJob?.id || exportJob.status === 'completed' || exportJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await api.getExportStatus(exportJob.id);
        setExportJob(updated);
        if (updated.status === 'completed' || updated.status === 'failed') {
          setIsExporting(false);
          if (updated.status === 'failed') {
            setErrorMessage(updated.error || 'Video rendering failed on backend');
          }
        }
      } catch (err: any) {
        console.error('Polling export status error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isExporting, exportJob?.id]);

  if (!isOpen) return null;

  const primaryClip = clips[0];
  const isUpscaling = primaryClip && primaryClip.height < 1080 && resolution === '1080p';

  // Calculate estimated file size
  const bitrateMbps = quality === 'standard' ? 4 : quality === 'high' ? 8 : 14;
  const estimatedMB = Math.max(2, Math.round(((duration || 10) * bitrateMbps) / 8));

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const timelineState = getExportableState();
      const job = await api.startExport({
        project_id: projectId,
        resolution,
        aspect_ratio: aspectRatio,
        quality,
        fps,
        timeline_state: timelineState,
      });
      setExportJob(job);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMessage(err.message || 'Failed to start export');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161616] border border-[#2E2E2E] rounded-2xl shadow-2xl overflow-hidden select-none">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#242424] flex items-center justify-center">
              <Download className="w-4 h-4 text-[#FFD21F]" />
            </div>
            <h3 className="font-bold text-white text-sm">Export Video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-[#242424] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Active Job Progress View */}
          {exportJob && (
            <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  {exportJob.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Ready for Download!</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 text-[#FFD21F] animate-spin" />
                      <span>Rendering Video...</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[#FFD21F] font-bold text-sm">
                  {exportJob.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#111111] h-2.5 rounded-full overflow-hidden border border-[#2B2B2B]">
                <div
                  className="bg-gradient-to-r from-[#FF8A00] to-[#FFD21F] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${exportJob.progress}%` }}
                />
              </div>

              <p className="text-[11px] text-[#A0A0A0]">{exportJob.message}</p>

              {/* Download link when finished */}
              {exportJob.status === 'completed' && exportJob.download_url && (
                <a
                  href={exportJob.download_url}
                  download
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Download className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Download MP4 Video</span>
                </a>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-2 text-red-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isExporting && exportJob?.status !== 'completed' && (
            <>
              {/* Resolution Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#888888]">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['720p', '1080p'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        resolution === res
                          ? 'bg-[#222222] border-[#FFD21F] text-white font-semibold ring-1 ring-[#FFD21F]'
                          : 'bg-[#181818] border-[#2A2A2A] text-[#888888] hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{res === '1080p' ? '1080p Full HD' : '720p HD'}</div>
                      <div className="text-[10px] text-[#777777]">
                        {res === '1080p'
                          ? aspectRatio === '9:16' ? '1080 × 1920' : '1920 × 1080'
                          : aspectRatio === '9:16' ? '720 × 1280' : '1280 × 720'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Settings */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#888888]">
                  Export Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'high', 'max'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`py-2 px-2.5 rounded-lg border capitalize transition-colors ${
                        quality === q
                          ? 'bg-[#222222] border-[#FFD21F] text-[#FFD21F] font-semibold'
                          : 'bg-[#181818] border-[#2A2A2A] text-[#888888] hover:text-white'
                      }`}
                    >
                      {q === 'max' ? 'Maximum' : q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Rate */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-[#888888]">
                  Frame Rate (FPS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 30, 60].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      className={`py-2 px-2.5 rounded-lg border transition-colors ${
                        fps === f
                          ? 'bg-[#222222] border-[#FFD21F] text-[#FFD21F] font-semibold'
                          : 'bg-[#181818] border-[#2A2A2A] text-[#888888] hover:text-white'
                      }`}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Warning */}
              {isUpscaling && (
                <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg flex items-center space-x-2 text-amber-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Source is lower resolution. Upscaling may not increase sharpness.</span>
                </div>
              )}

              {/* Summary Specs */}
              <div className="p-3 rounded-lg bg-[#181818] border border-[#242424] flex items-center justify-between text-[#888888]">
                <span>Estimated file size:</span>
                <span className="font-mono text-white font-semibold">~{estimatedMB} MB</span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-[#242424] flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1F1F1F] hover:bg-[#292929] text-white font-medium text-xs border border-[#333333] transition-colors"
          >
            {exportJob?.status === 'completed' ? 'Close' : 'Cancel'}
          </button>

          {!isExporting && exportJob?.status !== 'completed' && (
            <button
              onClick={handleStartExport}
              disabled={clips.length === 0}
              className="px-5 py-2 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/10 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Export Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
