import React, { useEffect, useState, useRef } from 'react';
import { PanelRightOpen, X } from 'lucide-react';
import { Header } from '../components/common/Header';
import { VideoPreview } from '../components/editor/VideoPreview';
import { PlaybackControls } from '../components/editor/PlaybackControls';
import { Timeline } from '../components/editor/Timeline';
import { SidebarTools } from '../components/editor/SidebarTools';
import { PropertiesInspector } from '../components/editor/PropertiesInspector';
import { MobileToolbar } from '../components/editor/MobileToolbar';
import { ExportModal } from '../components/editor/ExportModal';
import { useEditorStore } from '../store/useEditorStore';
import { api } from '../services/api';

interface EditorPageProps {
  projectId: string;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  projectId,
  onNavigateHome,
  onNavigateDashboard,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setProjectId,
    setProjectName,
    setIsSaving,
    setLastSaved,
    loadProjectData,
    getExportableState,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    selectedClipId,
    selectedCaptionId,
    selectedStickerId,
    selectedImageId,
    selectedAudioId,
    removeClip,
    removeCaption,
    removeSticker,
    removeImageOverlay,
    removeAudioTrack,
    undo,
    redo,
    addClip,
    isTimelineFloating,
    isRightBarCollapsed,
    setIsRightBarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useEditorStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set project ID & load from backend
  useEffect(() => {
    if (!projectId) return;
    setProjectId(projectId);

    const loadProject = async () => {
      try {
        const data = await api.getProject(projectId);
        setProjectName(data.name);
        if (data.project_data) {
          try {
            const parsed = JSON.parse(data.project_data);
            loadProjectData(parsed);
          } catch (e) {
            console.error('Failed to parse project_data:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load project from server:', err);
      }
    };

    loadProject();
  }, [projectId]);

  // Debounced Autosave to backend and localStorage
  useEffect(() => {
    if (!projectId) return;

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        const state = getExportableState();
        const serialized = JSON.stringify(state);

        // Backup in localStorage
        localStorage.setItem(`gbest_project_${projectId}`, serialized);

        // Persist in backend DB
        await api.updateProject(projectId, {
          project_data: serialized,
        });

        setLastSaved(new Date());
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [getExportableState, projectId]);

  // Universal Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Space = Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      // Arrow Left = Step backward
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 1));
      }
      // Arrow Right = Step forward
      else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(Math.min(duration, currentTime + 1));
      }
      // Delete / Backspace = Delete selected item
      else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedCaptionId) {
          e.preventDefault();
          removeCaption(selectedCaptionId);
        } else if (selectedStickerId) {
          e.preventDefault();
          removeSticker(selectedStickerId);
        } else if (selectedImageId) {
          e.preventDefault();
          removeImageOverlay(selectedImageId);
        } else if (selectedAudioId) {
          e.preventDefault();
          removeAudioTrack(selectedAudioId);
        } else if (selectedClipId) {
          e.preventDefault();
          removeClip(selectedClipId);
        }
      }
      // Ctrl + Z = Undo
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        undo();
      }
      // Ctrl + Shift + Z = Redo
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    currentTime,
    duration,
    selectedClipId,
    selectedCaptionId,
    selectedStickerId,
    selectedImageId,
    selectedAudioId,
  ]);

  const handleManualSave = async () => {
    if (!projectId) return;
    try {
      setIsSaving(true);
      const state = getExportableState();
      await api.updateProject(projectId, {
        project_data: JSON.stringify(state),
      });
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadVideo(file, projectId);
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
    } catch (err) {
      console.error('Video upload failed:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#111111] overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Editor Header */}
      <Header
        onOpenExport={() => setShowExportModal(true)}
        onNavigateHome={onNavigateHome}
        onNavigateDashboard={onNavigateDashboard}
        onSaveProject={handleManualSave}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar: Always visible on desktop screens */}
        <div className="hidden lg:flex h-full select-none">
          <SidebarTools />
        </div>

        {/* Center: Video Preview & Playback Controls & Timeline */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0D]">
          {/* Top Video Preview Stage */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <VideoPreview onTriggerUpload={handleTriggerUpload} />
          </div>

          {/* Transport / Playback Controls */}
          <PlaybackControls />

          {/* Docked Timeline */}
          {!isTimelineFloating && <Timeline />}
        </div>

        {/* Desktop Right Sidebar: Contextual Properties Inspector */}
        <div className="hidden lg:flex">
          {!isRightBarCollapsed ? (
            <PropertiesInspector />
          ) : (
            <button
              onClick={() => setIsRightBarCollapsed(false)}
              className="w-8 bg-[#161616] border-l border-[#242424] hover:bg-[#202020] text-gray-400 hover:text-white flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors"
              title="Open Inspector"
            >
              <PanelRightOpen className="w-4 h-4 text-[#FFD21F]" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Timeline (When Detached) */}
      {isTimelineFloating && <Timeline />}

      {/* Mobile Dedicated Bottom Navigation & Dynamic Panels */}
      <div className="flex lg:hidden flex-shrink-0 w-full z-30">
        <MobileToolbar />
      </div>

      {/* Mobile Slide-Over Tools Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="w-[88vw] max-w-sm h-full bg-[#141414] border-r border-[#2D2D2D] flex flex-col shadow-2xl animate-fade-in z-50">
            <div className="p-3 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
              <span className="text-xs font-bold text-[#FFD21F] uppercase tracking-wider">
                Creative Tools & Panels
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarTools />
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
