import React, { useEffect, useState } from 'react';
import {
  Film,
  Plus,
  MoreVertical,
  Trash2,
  Copy,
  Edit2,
  Clock,
  Ratio,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { api, ProjectSummary } from '../services/api';
import { useEditorStore } from '../store/useEditorStore';

interface DashboardPageProps {
  onOpenProject: (projectId: string) => void;
  onNavigateHome: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenProject, onNavigateHome }) => {
  const { theme, toggleTheme } = useEditorStore();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState('16:9');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await api.getProjects();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const name = newProjectName.trim() || 'Untitled Project';
      const created = await api.createProject(name, newAspectRatio);
      setShowNewModal(false);
      setNewProjectName('');
      onOpenProject(created.id);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.duplicateProject(id);
      loadProjects();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await api.deleteProject(id);
        loadProjects();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setRenamingId(id);
      setRenameValue(proj.name);
    }
  };

  const handleSaveRename = async (id: string) => {
    if (renameValue.trim()) {
      try {
        await api.updateProject(id, { name: renameValue.trim() });
        setRenamingId(null);
        loadProjects();
      } catch (err) {
        console.error('Rename failed:', err);
      }
    } else {
      setRenamingId(null);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col select-none">
      {/* Header */}
      <header className="h-16 border-b border-[#222222] px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-[#111111]/90 backdrop-blur-md z-30">
        <button onClick={onNavigateHome} className="flex items-center space-x-2.5 focus:outline-none">
          <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] border border-[#333333] flex items-center justify-center">
            <Film className="w-4 h-4 text-[#FFD21F]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold text-xl tracking-wider text-white">GBEST</span>
            <span className="text-xs font-semibold tracking-widest text-[#FFD21F]">STUDIO</span>
          </div>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Dark/Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#1B1B1B] hover:bg-[#252525] border border-[#333333] text-white transition-all active:scale-95 group shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFD21F] group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Projects
            </h1>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Resume editing or start a fresh video project.
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-[#181818] border border-[#242424] animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="p-12 border-2 border-dashed border-[#2B2B2B] rounded-2xl text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 bg-[#141414]">
            <div className="w-16 h-16 rounded-2xl bg-[#1C1C1C] border border-[#333333] flex items-center justify-center mb-4">
              <Film className="w-8 h-8 text-[#FFD21F]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
            <p className="text-xs text-[#A0A0A0] mb-6 leading-relaxed">
              Start your first video project to generate captions, edit, and export.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-2.5 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center space-x-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* New Project Card */}
            <button
              onClick={() => setShowNewModal(true)}
              className="h-56 rounded-2xl border-2 border-dashed border-[#2B2B2B] hover:border-[#FFD21F] bg-[#141414] hover:bg-[#181818] flex flex-col items-center justify-center space-y-2.5 transition-all text-[#A0A0A0] hover:text-white group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#202020] border border-[#333333] flex items-center justify-center group-hover:border-[#FFD21F] transition-colors">
                <Plus className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <span className="text-xs font-semibold">New Project</span>
            </button>

            {/* Project Cards */}
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                className="h-56 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#FFD21F]/60 overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:shadow-black/50 group"
              >
                {/* Thumbnail Area */}
                <div className="h-32 bg-[#0F0F0F] relative overflow-hidden flex items-center justify-center">
                  {proj.thumbnail_url ? (
                    <img
                      src={proj.thumbnail_url}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] flex items-center justify-center">
                      <Film className="w-6 h-6 text-[#FFD21F]/80" />
                    </div>
                  )}

                  {/* Aspect Ratio Badge */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-[#FFD21F] border border-[#333333]">
                    {proj.aspect_ratio || '16:9'}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-3.5 flex items-center justify-between border-t border-[#222222]">
                  <div className="truncate flex-1 mr-2">
                    {renamingId === proj.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleSaveRename(proj.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(proj.id)}
                        autoFocus
                        className="bg-[#1C1C1C] border border-[#FFD21F] text-xs text-white rounded px-1.5 py-0.5 w-full outline-none"
                      />
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FFD21F] transition-colors">
                          {proj.name}
                        </h4>
                        <p className="text-[10px] text-[#777777] flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(proj.updated_at)}</span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Rename"
                      onClick={(e) => handleRename(proj.id, e)}
                      className="p-1.5 rounded text-[#777777] hover:text-white hover:bg-[#242424] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Duplicate"
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className="p-1.5 rounded text-[#777777] hover:text-[#FFD21F] hover:bg-[#242424] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="p-1.5 rounded text-[#777777] hover:text-red-400 hover:bg-[#242424] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="font-bold text-white text-base">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888888]">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. TikTok Dance Reel #1"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1F1F1F] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FFD21F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#888888]">Default Aspect Ratio</label>
                <select
                  value={newAspectRatio}
                  onChange={(e) => setNewAspectRatio(e.target.value)}
                  className="w-full bg-[#1F1F1F] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FFD21F]"
                >
                  <option value="9:16">9:16 (TikTok, Reels, Shorts)</option>
                  <option value="16:9">16:9 (YouTube, Landscape)</option>
                  <option value="1:1">1:1 (Instagram Square)</option>
                  <option value="4:5">4:5 (Instagram Portrait)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1F1F1F] hover:bg-[#292929] text-white text-xs border border-[#333333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs shadow-md shadow-amber-500/10"
                >
                  Create & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
