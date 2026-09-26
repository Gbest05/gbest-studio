import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Palette,
  Layout,
  Video as VideoIcon,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Type,
  Eye,
  Film,
  Users,
  UserX,
  UserCheck,
  Trash2,
  Search,
  Sun,
  Moon,
  Clock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useSiteConfigStore, SiteConfig } from '../store/useSiteConfigStore';
import { useEditorStore } from '../store/useEditorStore';
import { api } from '../services/api';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onNavigateStudio: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateHome,
  onNavigateStudio,
}) => {
  const { config, fetchConfig, updateConfigField, saveConfig, resetToDefaults, isSaving } =
    useSiteConfigStore();
  const { currentUser, openAuthModal, theme } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'content' | 'studio' | 'users'>('branding');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [previewMode, setPreviewMode] = useState<'auto' | 'light' | 'dark'>('auto');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const isAdmin = Boolean(
    currentUser?.is_admin ||
    currentUser?.email?.toLowerCase() === 'princegbest555@gmail.com'
  );

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await api.getAdminUsers();
      setUsersList(res.users || []);
    } catch (e) {
      console.error('Failed to load users for admin:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, activeTab]);

  const handleToggleSuspend = async (userId: string, email: string) => {
    try {
      setActionInProgress(userId);
      const res = await api.toggleUserSuspension(userId);
      setSaveStatus({ type: 'success', message: res.message });
      setTimeout(() => setSaveStatus(null), 3500);
      await fetchUsers();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Failed to update user status' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${email}" and all associated projects? This cannot be reversed.`)) {
      return;
    }
    try {
      setActionInProgress(userId);
      const res = await api.deleteAdminUser(userId);
      setSaveStatus({ type: 'success', message: res.message });
      setTimeout(() => setSaveStatus(null), 3500);
      await fetchUsers();
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Failed to delete user' });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus(null);
      await saveConfig();
      setSaveStatus({ type: 'success', message: 'All changes saved and live across GBEST Studio!' });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Failed to save settings. Please ensure you are logged in as admin.',
      });
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const res = await api.uploadSiteAsset(file);
      updateConfigField('hero_media_url', res.url);
      updateConfigField('hero_media_type', res.media_type);
      setSaveStatus({ type: 'success', message: 'Hero media uploaded successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: err.message || 'Media upload failed' });
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-[#FFD21F]">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Privileges Required</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              You must be logged in as an authorized administrator (<code className="text-amber-400">princegbest555@gmail.com</code>) to access the website management dashboard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {!currentUser ? (
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-3 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs transition-all shadow-lg active:scale-95"
              >
                Sign In as Administrator
              </button>
            ) : (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs">
                Current account (<span className="font-semibold">{currentUser.email}</span>) does not have admin permissions.
              </div>
            )}

            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-gray-300 text-xs font-semibold transition-all border border-[#333333]"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0E0E0E] text-white'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 shadow-xs' : 'bg-[#141414]/95 border-[#242424]'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateHome}
            className={`p-2 rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border-slate-300'
                : 'bg-[#202020] hover:bg-[#282828] text-gray-300 hover:text-white border-[#333333]'
            }`}
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD21F] text-black flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-extrabold text-sm sm:text-base tracking-wide ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  GBEST Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-[#FFD21F] border border-amber-500/40">
                  ADMIN
                </span>
              </div>
              <p className={`text-[10px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Dynamic Website, Studio Editor & User Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onNavigateStudio}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#202020] hover:bg-[#2A2A2A] border-[#333333] text-gray-300 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span className="hidden sm:inline">Open Studio</span>
          </button>

          <button
            onClick={resetToDefaults}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#202020] hover:bg-[#2A2A2A] border-[#333333] text-gray-300 hover:text-white'
            }`}
            title="Reset form fields to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/15 active:scale-95 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : 'Save Live Changes'}</span>
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveStatus && (
        <div
          className={`mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fade-in ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
          <button
            onClick={() => setSaveStatus(null)}
            className="text-gray-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className={`flex items-center space-x-1 p-1.5 rounded-2xl border transition-colors ${
            isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#161616] border-[#252525]'
          }`}>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'branding'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#252525] text-[#FFD21F] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Branding</span>
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'hero'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#252525] text-[#FFD21F] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hero</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'content'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#252525] text-[#FFD21F] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Content</span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'studio'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-[#252525] text-[#FFD21F] shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'users'
                  ? isLight
                    ? 'bg-amber-100 text-amber-950 font-extrabold shadow-sm'
                    : 'bg-amber-500/20 text-[#FFD21F] font-extrabold shadow-sm border border-amber-500/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Users ({usersList.length})</span>
            </button>
          </div>

          {/* TAB 1: BRANDING & COLORS */}
          {activeTab === 'branding' && (
            <div className="bg-[#151515] border border-[#252525] rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-[#FFD21F]" />
                  <span>Branding & Visual Identity</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Configure brand names, taglines, and theme colors rendered across all pages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Brand Name</label>
                  <input
                    type="text"
                    value={config.brand_name}
                    onChange={(e) => updateConfigField('brand_name', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Brand Tagline</label>
                  <input
                    type="text"
                    value={config.brand_tagline}
                    onChange={(e) => updateConfigField('brand_tagline', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#252525]">
                {/* Primary Color Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Primary Brand Color</label>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateConfigField('primary_color', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[#333333] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => updateConfigField('primary_color', e.target.value)}
                      className="flex-1 bg-[#1F1F1F] border border-[#333333] rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Accent Color</label>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => updateConfigField('accent_color', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[#333333] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.accent_color}
                      onChange={(e) => updateConfigField('accent_color', e.target.value)}
                      className="flex-1 bg-[#1F1F1F] border border-[#333333] rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                {/* Background Color Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Background Tone</label>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="color"
                      value={config.background_color}
                      onChange={(e) => updateConfigField('background_color', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[#333333] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.background_color}
                      onChange={(e) => updateConfigField('background_color', e.target.value)}
                      className="flex-1 bg-[#1F1F1F] border border-[#333333] rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO SECTION & MEDIA */}
          {activeTab === 'hero' && (
            <div className="bg-[#151515] border border-[#252525] rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <VideoIcon className="w-4 h-4 text-[#FFD21F]" />
                  <span>Landing Page Hero & Media Showcase</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Customize the main headline, call-to-actions, and background showcase video.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Hero Badge Text</label>
                  <input
                    type="text"
                    value={config.hero_badge}
                    onChange={(e) => updateConfigField('hero_badge', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Hero Title / Headline</label>
                  <input
                    type="text"
                    value={config.hero_title}
                    onChange={(e) => updateConfigField('hero_title', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Hero Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={config.hero_subtitle}
                    onChange={(e) => updateConfigField('hero_subtitle', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={config.hero_cta_text}
                      onChange={(e) => updateConfigField('hero_cta_text', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">CTA Subtext Notice</label>
                    <input
                      type="text"
                      value={config.hero_cta_sub}
                      onChange={(e) => updateConfigField('hero_cta_sub', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                {/* Media URL & Direct Upload */}
                <div className="pt-2 border-t border-[#252525] space-y-3">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Showcase Media URL (Video or Image)</span>
                    <span className="text-[10px] text-amber-400 uppercase font-mono">
                      Type: {config.hero_media_type}
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={config.hero_media_url}
                      onChange={(e) => updateConfigField('hero_media_url', e.target.value)}
                      placeholder="https://...mp4 or /api/media/..."
                      className="flex-1 bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="px-3.5 py-2.5 bg-[#252525] hover:bg-[#303030] border border-[#3A3A3A] rounded-xl text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-all flex-shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FFD21F]" />
                      <span>{isUploadingMedia ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,image/png,image/jpeg,image/webp"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANDING CONTENT & BANNER */}
          {activeTab === 'content' && (
            <div className="bg-[#151515] border border-[#252525] rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Layout className="w-4 h-4 text-[#FFD21F]" />
                  <span>Landing Page Sections & Footer</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust features headings, bottom call-to-action banners, and footer copyright text.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Features Section Title</label>
                  <input
                    type="text"
                    value={config.features_title}
                    onChange={(e) => updateConfigField('features_title', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Features Subtitle</label>
                  <input
                    type="text"
                    value={config.features_subtitle}
                    onChange={(e) => updateConfigField('features_subtitle', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="pt-2 border-t border-[#252525] space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Bottom CTA Banner Title</label>
                    <input
                      type="text"
                      value={config.cta_banner_title}
                      onChange={(e) => updateConfigField('cta_banner_title', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Bottom CTA Banner Subtitle</label>
                    <input
                      type="text"
                      value={config.cta_banner_subtitle}
                      onChange={(e) => updateConfigField('cta_banner_subtitle', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Bottom CTA Button Text</label>
                    <input
                      type="text"
                      value={config.cta_button_text}
                      onChange={(e) => updateConfigField('cta_button_text', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252525] space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Footer Copyright Text</label>
                  <input
                    type="text"
                    value={config.footer_copyright}
                    onChange={(e) => updateConfigField('footer_copyright', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO DEFAULTS */}
          {activeTab === 'studio' && (
            <div className="bg-[#151515] border border-[#252525] rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#FFD21F]" />
                  <span>Studio Editor Global Defaults</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Configure default banner text, studio highlights, and watermark options.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Studio Top Bar Text</label>
                  <input
                    type="text"
                    value={config.studio_banner_text}
                    onChange={(e) => updateConfigField('studio_banner_text', e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300">Studio Accent Highlight Color</label>
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="color"
                      value={config.studio_accent_color}
                      onChange={(e) => updateConfigField('studio_accent_color', e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[#333333] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.studio_accent_color}
                      onChange={(e) => updateConfigField('studio_accent_color', e.target.value)}
                      className="flex-1 bg-[#1F1F1F] border border-[#333333] rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252525] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-200">Default Watermark Enabled</span>
                      <p className="text-[11px] text-gray-400">Add watermark overlay on studio exports by default</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.studio_watermark_enabled}
                      onChange={(e) => updateConfigField('studio_watermark_enabled', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-[#FFD21F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Watermark Text</label>
                    <input
                      type="text"
                      value={config.studio_watermark_text}
                      onChange={(e) => updateConfigField('studio_watermark_text', e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333333] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USER MONITORING & SUSPENSION */}
          {activeTab === 'users' && (
            <div className={`border rounded-2xl p-6 space-y-6 shadow-xl transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#151515] border-[#252525]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-base font-bold flex items-center space-x-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <Users className="w-4 h-4 text-[#FFD21F]" />
                    <span>User Accounts Management</span>
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Monitor registered users, manage account suspension status, and delete accounts.
                  </p>
                </div>

                <button
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all self-start sm:self-auto ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#202020] hover:bg-[#282828] border-[#333333] text-gray-200'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1D1D1D] border-[#2A2A2A]'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Total Users</span>
                  <span className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{usersList.length}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/40'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Active</span>
                  <span className="text-lg font-bold text-emerald-500">{usersList.filter(u => !u.is_suspended).length}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/20 border-red-900/40'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-red-700' : 'text-red-400'}`}>Suspended</span>
                  <span className="text-lg font-bold text-red-500">{usersList.filter(u => u.is_suspended).length}</span>
                </div>
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-900/40'}`}>
                  <span className={`text-[10px] block ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>Admins</span>
                  <span className="text-lg font-bold text-[#FFD21F]">{usersList.filter(u => u.is_admin).length}</span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className={`flex-1 flex items-center px-3 py-2 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#1C1C1C] border-[#2E2E2E]'
                }`}>
                  <Search className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by user name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className={`w-full bg-transparent text-xs outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                  />
                  {userSearchQuery && (
                    <button onClick={() => setUserSearchQuery('')} className="text-xs text-gray-400 hover:text-white ml-1">✕</button>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {(['all', 'active', 'suspended'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setUserStatusFilter(filter)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        userStatusFilter === filter
                          ? isLight
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-[#FFD21F] text-black border-[#FFD21F] shadow-sm'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                          : 'bg-[#222222] hover:bg-[#2A2A2A] border-[#333333] text-gray-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List */}
              {isLoadingUsers ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading user accounts...</div>
              ) : (
                <div className="space-y-2.5">
                  {usersList
                    .filter((u) => {
                      if (userStatusFilter === 'active' && u.is_suspended) return false;
                      if (userStatusFilter === 'suspended' && !u.is_suspended) return false;
                      if (!userSearchQuery) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                    })
                    .map((userItem) => {
                      const isSelf = userItem.id === currentUser?.id || userItem.email?.toLowerCase() === currentUser?.email?.toLowerCase();
                      return (
                        <div
                          key={userItem.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            userItem.is_suspended
                              ? isLight
                                ? 'bg-red-50/70 border-red-200'
                                : 'bg-red-950/20 border-red-900/40'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#383838]'
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            {userItem.avatar ? (
                              <img src={userItem.avatar} alt={userItem.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#FFD21F] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {userItem.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}

                            <div className="overflow-hidden">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {userItem.name}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    YOU
                                  </span>
                                )}
                                {userItem.is_admin && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-[#FFD21F] border border-amber-500/30">
                                    ADMIN
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  userItem.is_suspended
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {userItem.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                                </span>
                              </div>
                              <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                {userItem.email}
                              </p>
                              <div className="flex items-center space-x-3 text-[10px] text-gray-500 mt-1">
                                <span>{userItem.project_count || 0} projects</span>
                                <span>•</span>
                                <span>Auth: {userItem.provider || 'email'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                            {!userItem.is_admin && !isSelf && (
                              <>
                                <button
                                  onClick={() => handleToggleSuspend(userItem.id, userItem.email)}
                                  disabled={actionInProgress === userItem.id}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                                    userItem.is_suspended
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  }`}
                                  title={userItem.is_suspended ? 'Reactivate account' : 'Suspend account'}
                                >
                                  {userItem.is_suspended ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Suspend</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                  disabled={actionInProgress === userItem.id}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
                                  title="Permanently Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`sticky top-20 border rounded-2xl p-5 shadow-2xl space-y-4 transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#151515] border-[#252525]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-[#252525]'
            }`}>
              <span className={`text-xs font-bold flex items-center space-x-1.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Eye className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span>Live Hero Preview</span>
              </span>

              {/* Preview Theme Toggle */}
              <div className={`flex items-center space-x-1 p-0.5 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-black/30 border-[#333333]'
              }`}>
                <button
                  type="button"
                  onClick={() => setPreviewMode('auto')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    previewMode === 'auto'
                      ? 'bg-[#FFD21F] text-black font-bold shadow-xs'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('light')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-0.5 transition-all ${
                    previewMode === 'light'
                      ? 'bg-amber-500 text-black font-bold shadow-xs'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sun className="w-2.5 h-2.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-0.5 transition-all ${
                    previewMode === 'dark'
                      ? 'bg-black text-white font-bold shadow-xs'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Moon className="w-2.5 h-2.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Mock Landing Preview Card (Adaptive for Light and Dark Modes) */}
            {(() => {
              const isCardLight = previewMode === 'light' || (previewMode === 'auto' && isLight);
              return (
                <div
                  className={`rounded-xl overflow-hidden border p-5 space-y-4 text-center transition-all ${
                    isCardLight ? 'bg-white border-slate-300 shadow-md' : 'bg-[#111111] border-[#333333]'
                  }`}
                  style={{
                    backgroundColor: isCardLight ? '#FFFFFF' : (config.background_color || '#111111')
                  }}
                >
                  {/* Mock Nav Brand */}
                  <div className="flex items-center justify-center space-x-1">
                    <span className={`font-black text-sm tracking-wider ${
                      isCardLight ? 'text-slate-900' : 'text-white keep-white'
                    }`}>
                      {config.brand_name}
                    </span>
                    <span
                      className="font-bold text-xs tracking-widest"
                      style={{ color: config.primary_color }}
                    >
                      {config.brand_tagline}
                    </span>
                  </div>

                  {/* Mock Badge */}
                  <div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border shadow-xs"
                      style={{
                        backgroundColor: `${config.primary_color}1A`,
                        color: config.primary_color,
                        borderColor: `${config.primary_color}4D`,
                      }}
                    >
                      {config.hero_badge}
                    </span>
                  </div>

                  {/* Mock Title */}
                  <h2 className={`text-xl font-black leading-tight ${
                    isCardLight ? 'text-slate-900' : 'text-white keep-white'
                  }`}>
                    {config.hero_title}
                  </h2>

                  {/* Mock Subtitle */}
                  <p className={`text-xs line-clamp-3 leading-relaxed ${
                    isCardLight ? 'text-slate-600' : 'text-gray-300 keep-white'
                  }`}>
                    {config.hero_subtitle}
                  </p>

                  {/* Mock Button */}
                  <div>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl font-black text-xs text-black shadow-md transition-all pointer-events-none"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      {config.hero_cta_text}
                    </button>
                    <p className={`text-[10px] mt-1 ${isCardLight ? 'text-slate-500' : 'text-gray-500'}`}>
                      {config.hero_cta_sub}
                    </p>
                  </div>

                  {/* Mock Media Display */}
                  <div className={`mt-4 rounded-xl overflow-hidden border aspect-video flex items-center justify-center relative ${
                    isCardLight ? 'bg-slate-100 border-slate-300' : 'bg-black/50 border-[#333333]'
                  }`}>
                    {config.hero_media_url ? (
                      config.hero_media_type === 'video' ? (
                        <video
                          src={config.hero_media_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={config.hero_media_url}
                          alt="Hero Showcase"
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Film className={`w-8 h-8 mb-1 ${isCardLight ? 'text-slate-400' : 'text-gray-600'}`} />
                        <span className={`text-[10px] font-semibold ${isCardLight ? 'text-slate-500' : 'text-gray-500'}`}>
                          No Hero Media Uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#1A1A1A] border-[#2B2B2B] text-gray-400'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className={isLight ? 'text-slate-800' : 'text-gray-300'}>Active Administrator:</span>
                <span className="text-amber-500 font-bold">{currentUser.name}</span>
              </div>
              <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{currentUser.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
