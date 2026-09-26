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
  User as UserIcon,
  LogOut,
  Shield,
} from 'lucide-react';
import { api, ProjectSummary } from '../services/api';
import { useEditorStore } from '../store/useEditorStore';
import { useSiteConfigStore } from '../store/useSiteConfigStore';
import { AuthModal } from '../components/common/AuthModal';
import { ProfileModal } from '../components/common/ProfileModal';

interface DashboardPageProps {
  onOpenProject: (projectId: string) => void;
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenProject, onNavigateHome, onNavigateAdmin }) => {
  const { config } = useSiteConfigStore();
  const {
    theme,
    toggleTheme,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    openAuthModal,
    isProfileModalOpen,
    setIsProfileModalOpen,
    logout,
  } = useEditorStore();
  const isLight = theme === 'light';
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState('16:9');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

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
  }, [currentUser]);

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
    <div className={`min-h-screen flex flex-col select-none transition-colors duration-200 ${
      isLight ? 'bg-[#F8FAFC] text-gray-900' : 'bg-[#111111] text-white'
    }`}>
      {/* Header */}
      <header className={`h-16 border-b px-3 sm:px-10 flex items-center justify-between sticky top-0 backdrop-blur-md z-30 transition-colors ${
        isLight ? 'bg-white/90 border-gray-200 text-gray-900 shadow-xs' : 'bg-[#111111]/90 border-[#222222] text-white'
      }`}>
        <button onClick={onNavigateHome} className="flex items-center space-x-2 focus:outline-none flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] border border-[#333333] flex items-center justify-center flex-shrink-0">
            <Film className="w-4 h-4 text-[#FFD21F]" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`font-extrabold text-lg sm:text-xl tracking-wider ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {config.brand_name || 'GBEST'}
            </span>
            <span
              className="hidden xs:inline text-xs font-semibold tracking-widest"
              style={{ color: config.primary_color || '#FFD21F' }}
            >
              {config.brand_tagline || 'STUDIO'}
            </span>
          </div>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Dark/Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all active:scale-95 group shadow-xs ${
              isLight
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                : 'bg-[#1B1B1B] hover:bg-[#252525] border-[#333333] text-white'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFD21F] group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* User profile dropdown or Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-colors focus:outline-none ${
                  isLight
                    ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                    : 'bg-[#1B1B1B] hover:bg-[#252525] border-[#333333] text-gray-200'
                }`}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FFD21F] text-black font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`hidden sm:inline text-xs font-semibold max-w-[100px] truncate ${
                  isLight ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {showUserDropdown && (
                <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-xl' : 'bg-[#181818] border-[#2B2B2B] text-white'
                }`}>
                  <div className={`px-2.5 py-1.5 border-b mb-1 ${isLight ? 'border-gray-200' : 'border-[#252525]'}`}>
                    <p className={`font-semibold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentUser.name}</p>
                    <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{currentUser.email}</p>
                  </div>
                  {(currentUser.is_admin || currentUser.email?.toLowerCase() === 'princegbest555@gmail.com') && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (onNavigateAdmin) onNavigateAdmin();
                        else window.location.href = '/admin';
                      }}
                      className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center justify-between border transition-all ${
                        isLight
                          ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-[#FFD21F]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-[#FFD21F]" />
                        <span className="font-bold">Admin Dashboard</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-[#FFD21F] border border-amber-500/40">
                        ADMIN
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsProfileModalOpen(true);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center space-x-2 ${
                      isLight ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#222222]'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#FFD21F]" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            onClick={() => currentUser ? setShowNewModal(true) : openAuthModal('signup')}
            className="px-4 py-2 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Guest Isolation Notice */}
        {!currentUser && (
          <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${
            isLight
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center space-x-3 text-xs">
              <Shield className="w-5 h-5 text-[#FFD21F] flex-shrink-0" />
              <span>
                You are browsing as a guest. <strong>Sign up</strong> or <strong>log in</strong> to create, edit, and keep your video projects private.
              </span>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="ml-4 px-3.5 py-1.5 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs flex-shrink-0 transition-transform active:scale-95 shadow-xs"
            >
              Sign Up Free
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              {currentUser ? `${currentUser.name.split(' ')[0]}'s Projects` : 'My Projects'}
            </h1>
            <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-[#A0A0A0]'}`}>
              {currentUser
                ? 'Your private, isolated video projects saved securely to your account.'
                : 'Resume editing or start a fresh video project.'}
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
          <div className={`p-12 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 transition-colors ${
            isLight ? 'border-gray-300 bg-white shadow-sm' : 'border-[#2B2B2B] bg-[#141414]'
          }`}>
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${
              isLight ? 'bg-amber-50 border-amber-200' : 'bg-[#1C1C1C] border-[#333333]'
            }`}>
              <Film className="w-8 h-8 text-[#FFD21F]" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>No projects yet</h3>
            <p className={`text-xs mb-6 leading-relaxed ${isLight ? 'text-gray-500' : 'text-[#A0A0A0]'}`}>
              Start your first video project to generate captions, edit, and export.
            </p>
            <button
              onClick={() => currentUser ? setShowNewModal(true) : openAuthModal('signup')}
              className="px-6 py-2.5 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-semibold text-xs flex items-center space-x-2 transition-transform active:scale-95 shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* New Project Card */}
            <button
              onClick={() => currentUser ? setShowNewModal(true) : openAuthModal('signup')}
              className={`h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center space-y-2.5 transition-all group ${
                isLight
                  ? 'border-gray-300 hover:border-[#FFD21F] bg-white hover:bg-gray-50 text-gray-700 shadow-xs'
                  : 'border-[#2B2B2B] hover:border-[#FFD21F] bg-[#141414] hover:bg-[#181818] text-[#A0A0A0] hover:text-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                isLight ? 'bg-gray-100 border-gray-200 group-hover:border-[#FFD21F]' : 'bg-[#202020] border-[#333333] group-hover:border-[#FFD21F]'
              }`}>
                <Plus className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <span className="text-xs font-semibold">New Project</span>
            </button>

            {/* Project Cards */}
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => currentUser ? onOpenProject(proj.id) : openAuthModal('signup')}
                className={`h-56 rounded-2xl border overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl group ${
                  isLight
                    ? 'bg-white border-gray-200 hover:border-[#FFD21F] shadow-xs'
                    : 'bg-[#161616] border-[#262626] hover:border-[#FFD21F]/60 hover:shadow-black/50'
                }`}
              >
                {/* Thumbnail Area */}
                <div className={`h-32 relative overflow-hidden flex items-center justify-center ${
                  isLight ? 'bg-slate-100' : 'bg-[#0F0F0F]'
                }`}>
                  {proj.thumbnail_url && !failedThumbnails[proj.id] && (proj.thumbnail_url.startsWith('http') || proj.thumbnail_url.startsWith('/') || proj.thumbnail_url.startsWith('data:')) ? (
                    <img
                      src={proj.thumbnail_url}
                      alt={proj.name}
                      onError={() => setFailedThumbnails((prev) => ({ ...prev, [proj.id]: true }))}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-3 select-none ${
                      isLight
                        ? 'bg-gradient-to-br from-amber-50/90 via-slate-100 to-amber-100/50 text-slate-800'
                        : 'bg-gradient-to-br from-[#1c1a14] via-[#141414] to-[#0d0d0d] text-gray-300'
                    }`}>
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 border shadow-xs transition-transform duration-300 group-hover:scale-110 ${
                        isLight ? 'bg-white border-amber-200 text-amber-600' : 'bg-[#1C1C1C] border-amber-500/30 text-[#FFD21F]'
                      }`}>
                        <Film className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold tracking-wide truncate max-w-[130px] opacity-90">
                        {proj.name}
                      </span>
                    </div>
                  )}

                  {/* Aspect Ratio Badge */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-[#FFD21F] border border-[#333333]">
                    {proj.aspect_ratio || '16:9'}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className={`p-3.5 flex items-center justify-between border-t ${
                  isLight ? 'border-gray-200 bg-gray-50/50' : 'border-[#222222]'
                }`}>
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
                        className={`text-xs rounded px-1.5 py-0.5 w-full outline-none border border-[#FFD21F] ${
                          isLight ? 'bg-white text-gray-900' : 'bg-[#1C1C1C] text-white'
                        }`}
                      />
                    ) : (
                      <>
                        <h4 className={`text-xs font-bold truncate group-hover:text-[#FFD21F] transition-colors ${
                          isLight ? 'text-gray-900' : 'text-white'
                        }`}>
                          {proj.name}
                        </h4>
                        <p className={`text-[10px] flex items-center space-x-1 mt-0.5 ${
                          isLight ? 'text-gray-500' : 'text-[#777777]'
                        }`}>
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
                      className={`p-1.5 rounded transition-colors ${
                        isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'text-[#777777] hover:text-white hover:bg-[#242424]'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Duplicate"
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      className={`p-1.5 rounded transition-colors ${
                        isLight ? 'text-gray-500 hover:text-[#FFD21F] hover:bg-gray-200' : 'text-[#777777] hover:text-[#FFD21F] hover:bg-[#242424]'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => handleDelete(proj.id, e)}
                      className={`p-1.5 rounded transition-colors ${
                        isLight ? 'text-gray-500 hover:text-red-500 hover:bg-red-50' : 'text-[#777777] hover:text-red-400 hover:bg-[#242424]'
                      }`}
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
          <div className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl space-y-5 transition-all ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161616] border-[#2E2E2E] text-white'
          }`}>
            <h3 className={`font-bold text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. TikTok Dance Reel #1"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className={`w-full rounded-lg px-3 py-2 text-xs outline-none border focus:border-[#FFD21F] ${
                    isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#1F1F1F] border-[#333333] text-white'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Default Aspect Ratio</label>
                <select
                  value={newAspectRatio}
                  onChange={(e) => setNewAspectRatio(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs outline-none border focus:border-[#FFD21F] ${
                    isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-[#1F1F1F] border-[#333333] text-white'
                  }`}
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
                  className={`px-4 py-2 rounded-lg text-xs border ${
                    isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800' : 'bg-[#1F1F1F] hover:bg-[#292929] text-white border-[#333333]'
                  }`}
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

      {/* Auth & Profile Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => loadProjects()}
      />
      <ProfileModal />
    </div>
  );
};
