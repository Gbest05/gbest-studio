import React, { useState, useRef } from 'react';
import {
  Film,
  Sparkles,
  Scissors,
  Download,
  Wand2,
  Ratio,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  Volume2,
  VolumeX,
  Layers,
  Music,
  Smile,
  Shield,
  Sliders,
  Smartphone,
  Monitor,
  Square,
  Flame,
  Star,
  Zap,
  Eye,
  Rocket,
  Crown,
  Gem,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { useSiteConfigStore } from '../store/useSiteConfigStore';
import { AuthModal } from '../components/common/AuthModal';
import { ProfileModal } from '../components/common/ProfileModal';

interface LandingPageProps {
  onStartEditing: () => void;
  onGoToDashboard: () => void;
  onNavigateAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartEditing,
  onGoToDashboard,
  onNavigateAdmin,
}) => {
  const { config } = useSiteConfigStore();
  const {
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    openAuthModal,
    setIsProfileModalOpen,
    theme,
    toggleTheme,
    logout,
  } = useEditorStore();
  const isLight = theme === 'light';
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [isPlaying3D, setIsPlaying3D] = useState(true);
  const [isMuted3D, setIsMuted3D] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const video3DRef = useRef<HTMLVideoElement>(null);

  // Before & After Interactive Slider State (0 - 100%)
  const [sliderPosition, setSliderPosition] = useState(52);
  const [activeFormatTab, setActiveFormatTab] = useState<'9:16' | '16:9' | '1:1'>('9:16');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 14;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const togglePlay3D = () => {
    if (!video3DRef.current) return;
    if (video3DRef.current.paused) {
      video3DRef.current.play().catch(() => {});
      setIsPlaying3D(true);
    } else {
      video3DRef.current.pause();
      setIsPlaying3D(false);
    }
  };

  return (
    <>
      {/* Auth & Profile Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={onGoToDashboard}
      />
      <ProfileModal />

      <div className={`min-h-screen flex flex-col selection:bg-[#FFD21F] selection:text-black transition-colors duration-200 ${
        isLight ? 'bg-[#F8F9FA] text-gray-900' : 'bg-[#0D0D0D] text-white'
      }`}>
        {/* Navigation Bar with Studio Background Image */}
        <header
          className={`h-16 border-b px-3 sm:px-10 flex items-center justify-between sticky top-0 backdrop-blur-md z-30 shadow-lg relative overflow-hidden transition-colors ${
            isLight
              ? 'bg-white/95 border-gray-200 text-gray-900 shadow-sm'
              : 'border-[#242424] text-white'
          }`}
          style={
            isLight
              ? {}
              : {
                  backgroundImage: `linear-gradient(90deg, rgba(13, 13, 13, 0.94) 0%, rgba(20, 20, 20, 0.88) 50%, rgba(13, 13, 13, 0.94) 100%), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
          }
        >
          {/* Subtle Top Gold Ambient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD21F]/50 to-transparent pointer-events-none" />

          <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md border flex-shrink-0 ${
              isLight ? 'bg-amber-50 border-amber-200' : 'bg-[#1B1B1B] border-[#333333]'
            }`}>
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
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onGoToDashboard}
              className={`text-xs font-medium transition-colors hidden sm:block ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              My Projects
            </button>

            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all active:scale-95 group shadow-sm ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD21F] group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Profile or Sign-in */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-colors focus:outline-none ${
                    isLight
                      ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                      : 'bg-[#1B1B1B] hover:bg-[#252525] border-[#333333]'
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
                  <div className={`absolute right-0 mt-2 w-48 max-w-[90vw] border rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in ${
                    isLight
                      ? 'bg-white border-gray-200 text-gray-900 shadow-xl'
                      : 'bg-[#181818] border-[#2B2B2B] text-white'
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
                        onGoToDashboard();
                      }}
                      className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center space-x-2 ${
                        isLight ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#222222]'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#FFD21F]" />
                      <span>My Projects</span>
                    </button>
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
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow active:scale-95 ${
                  isLight
                    ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95"
            >
              Open Studio
            </button>
          </div>
        </header>

        {/* HERO SECTION WITH 3D PERSPECTIVE VIDEO STAGE */}
        <section className="relative px-6 py-12 sm:py-20 max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* Ambient Hero Background Media Layer */}
          {config.hero_background_media_url && config.hero_background_media_type !== 'none' && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
              {config.hero_background_media_type === 'video' ? (
                <video
                  src={config.hero_background_media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-20 filter blur-[1px]"
                />
              ) : (
                <img
                  src={config.hero_background_media_url}
                  alt="Hero Background"
                  className="w-full h-full object-cover opacity-20 filter blur-[1px]"
                />
              )}
              <div
                className={`absolute inset-0 ${
                  isLight
                    ? 'bg-gradient-to-b from-white/70 via-white/85 to-white'
                    : 'bg-gradient-to-b from-[#0E0E0E]/50 via-[#0E0E0E]/80 to-[#0E0E0E]'
                }`}
              />
            </div>
          )}

          {/* Badge */}
          <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs mb-6 shadow ${
            isLight
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700'
              : 'bg-[#1A1A1A] border border-[#2F2F2F] text-[#FFD21F]'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-[#FFD21F] animate-pulse" />
            <span>{config.hero_badge || 'Modern AI Video Editor & Auto-Transcription'}</span>
          </div>

          {/* Large Headline */}
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            {config.hero_title || 'Create Viral Videos in Seconds'}
          </h1>

          {/* Subheading */}
          <p className={`text-base sm:text-lg max-w-2xl leading-relaxed mb-8 ${
            isLight ? 'text-gray-600' : 'text-[#A0A0A0]'
          }`}>
            {config.hero_subtitle || 'Studio-grade video editor right in your browser. Real speech auto-captions with word highlight, 1-click audio extraction, dynamic overlays, and pro transitions.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-12 w-full sm:w-auto">
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
              style={{ backgroundColor: config.primary_color || '#FFD21F' }}
            >
              <span>{config.hero_cta_text || 'Open Studio Editor'}</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                isLight
                  ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-800 shadow-sm'
                  : 'bg-[#181818] hover:bg-[#222222] border-[#333333] text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-[#FFD21F]" />
              <span>Sign Up with Gmail</span>
            </button>
          </div>

          {/* 3D Interactive Video Display Stage */}
          <div
            className="w-full max-w-4xl py-4"
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={stageRef}
              className="relative rounded-3xl p-1 bg-gradient-to-tr from-[#FFD21F]/30 via-[#2A2A2A] to-[#FF8A00]/20 shadow-2xl transition-transform duration-150 ease-out"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
                  isHovered ? 1.02 : 1
                }, ${isHovered ? 1.02 : 1}, 1)`,
                transformStyle: 'preserve-3d',
                boxShadow: isHovered
                  ? '0 30px 60px -12px rgba(255, 210, 31, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.9)'
                  : '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Inner 3D Glass Surface */}
              <div
                className="rounded-[22px] bg-[#121212] border border-[#2D2D2D] p-3 sm:p-5 overflow-hidden relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 3D Floating Badge 1: AI Captions (Z-Depth 40px) */}
                <div
                  className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30 bg-[#1A1A1A]/95 backdrop-blur-md border border-[#FFD21F]/60 rounded-xl px-3 py-2 shadow-2xl flex items-center space-x-2 text-xs transition-all pointer-events-none"
                  style={{
                    transform: 'translateZ(40px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-[#FFD21F] animate-spin" />
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                      Auto-Transcription
                    </span>
                    <span className="font-bold text-white">Exact Spoken Words</span>
                  </div>
                </div>

                {/* 3D Floating Badge 2: 1-Click Audio MP3 (Z-Depth 55px) */}
                <div
                  className="absolute bottom-6 left-4 sm:bottom-10 sm:left-8 z-30 bg-[#1E1810]/95 backdrop-blur-md border border-[#FF8A00]/60 rounded-xl px-3 py-2 shadow-2xl flex items-center space-x-2 text-xs transition-all pointer-events-none"
                  style={{
                    transform: 'translateZ(55px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  <Music className="w-4 h-4 text-[#FF8A00]" />
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                      Audio Engine
                    </span>
                    <span className="font-bold text-white">Convert Video to MP3</span>
                  </div>
                </div>

                {/* 3D Floating Badge 3: 4K 60FPS Pro Export (Z-Depth 50px) */}
                <div
                  className="absolute top-4 right-4 sm:top-8 sm:right-8 z-30 bg-[#1A1A1A]/95 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 shadow-2xl flex items-center space-x-2 text-xs transition-all pointer-events-none"
                  style={{
                    transform: 'translateZ(50px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                      Ultra HD
                    </span>
                    <span className="font-bold text-white">4K 60FPS Render</span>
                  </div>
                </div>

                {/* 3D Video Screen Canvas */}
                <div
                  className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-[#222222] flex items-center justify-center group cursor-pointer shadow-inner"
                  onClick={togglePlay3D}
                >
                  {config.hero_media_type === 'image' ? (
                    <img
                      src={config.hero_media_url || '/api/media/uploads/video_7b6fa80606aa.mp4'}
                      alt="Hero Showcase"
                      className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <video
                      ref={video3DRef}
                      src={config.hero_media_url || '/api/media/uploads/video_7b6fa80606aa.mp4'}
                      autoPlay
                      loop
                      muted={isMuted3D}
                      playsInline
                      className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  )}

                  {/* Dynamic 3D Word-by-Word Highlight Captions Overlay */}
                  <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 text-center px-4 pointer-events-none z-20">
                    <div className="inline-block px-4 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-sm sm:text-base font-extrabold shadow-2xl">
                      <span>Create Viral Content with </span>
                      <span
                        className="underline decoration-wavy"
                        style={{
                          color: config.primary_color || '#FFD21F',
                          textDecorationColor: config.primary_color || '#FFD21F',
                        }}
                      >
                        {config.brand_name || 'GBEST'} {config.brand_tagline || 'STUDIO'}
                      </span>
                    </div>
                  </div>

                  {/* Center Play/Pause Overlay Indicator */}
                  <div
                    className={`w-14 h-14 rounded-full bg-[#FFD21F] text-black flex items-center justify-center transition-all duration-200 shadow-2xl z-20 ${
                      isPlaying3D
                        ? 'opacity-0 group-hover:opacity-90 scale-90 group-hover:scale-100'
                        : 'opacity-100 scale-100'
                    }`}
                  >
                    {isPlaying3D ? (
                      <Pause className="w-6 h-6 fill-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black ml-1" />
                    )}
                  </div>

                  {/* Sound Toggle Button in bottom-right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (video3DRef.current) {
                        video3DRef.current.muted = !isMuted3D;
                        setIsMuted3D(!isMuted3D);
                      }
                    }}
                    className="absolute bottom-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-colors"
                    title={isMuted3D ? 'Unmute Sound' : 'Mute'}
                  >
                    {isMuted3D ? (
                      <VolumeX className="w-4 h-4 text-[#FF8A00]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#FFD21F]" />
                    )}
                  </button>
                </div>

                {/* 3D Timeline Bar Strip beneath video */}
                <div
                  className="mt-3 bg-[#181818] rounded-xl p-2.5 border border-[#262626] flex items-center justify-between text-xs"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFD21F]" />
                    <span className="text-gray-300 font-mono text-[11px]">3D Studio Realtime Engine</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-mono">
                    <span className="text-[#FFD21F]">60.0 FPS</span>
                    <span>•</span>
                    <span>H.264 Universal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: MULTI-FORMAT VIDEO SHOWCASE (9:16 Shorts, 16:9 Cinema, 1:1)   */}
        {/* ========================================================================= */}
        <section className={`px-6 py-16 max-w-6xl mx-auto border-t transition-colors ${
          isLight ? 'border-gray-200' : 'border-[#222222]'
        }`}>
          <div className="text-center mb-12">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] mb-3 ${
              isLight
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700'
                : 'bg-[#1A1A1A] border border-[#2C2C2C] text-[#FFD21F]'
            }`}>
              <Ratio className="w-3.5 h-3.5" />
              <span>Multi-Platform Video Formats</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Every Format. One Studio.
            </h2>
            <p className={`text-sm max-w-lg mx-auto ${
              isLight ? 'text-gray-600' : 'text-[#A0A0A0]'
            }`}>
              Effortlessly toggle canvas ratios for TikTok, YouTube, Instagram Reels, and podcasts.
            </p>

            {/* Format Selector Tabs */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setActiveFormatTab('9:16')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormatTab === '9:16'
                    ? 'bg-[#FFD21F] text-black shadow-lg shadow-amber-500/10'
                    : isLight
                    ? 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm'
                    : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2D2D2D]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Shorts & Reels</span>
              </button>

              <button
                onClick={() => setActiveFormatTab('16:9')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormatTab === '16:9'
                    ? 'bg-[#FFD21F] text-black shadow-lg shadow-amber-500/10'
                    : isLight
                    ? 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm'
                    : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2D2D2D]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 YouTube Cinema</span>
              </button>

              <button
                onClick={() => setActiveFormatTab('1:1')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormatTab === '1:1'
                    ? 'bg-[#FFD21F] text-black shadow-lg shadow-amber-500/10'
                    : isLight
                    ? 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm'
                    : 'bg-[#181818] text-gray-400 hover:text-white border border-[#2D2D2D]'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>1:1 Square Feed</span>
              </button>
            </div>
          </div>

          {/* Interactive Multi-Format Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Card 1: 9:16 Vertical Smartphone Mockup */}
            <div
              className={`p-4 rounded-3xl border transition-all ${
                activeFormatTab === '9:16'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102 ' + (isLight ? 'bg-white' : 'bg-[#141414]')
                  : isLight
                  ? 'bg-white border-gray-200 shadow-sm opacity-90 hover:opacity-100'
                  : 'bg-[#141414] border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Smartphone frame */}
              <div className="w-full max-w-[240px] mx-auto aspect-[9/16] rounded-3xl bg-black border-4 border-[#2A2A2A] shadow-2xl overflow-hidden relative flex flex-col justify-between p-3">
                {/* Dynamic Island / Notch */}
                <div className="w-16 h-3 bg-[#1F1F1F] rounded-full mx-auto z-20" />

                {/* Simulated Video or Admin Uploaded Video */}
                {config.frame_9_16_video_url ? (
                  <video
                    src={config.frame_9_16_video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1C1810] via-[#0E1520] to-[#14101E] flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#FFD21F]/10 border border-[#FFD21F]/40 flex items-center justify-center mb-3 animate-pulse">
                      <Sparkles className="w-6 h-6 text-[#FFD21F]" />
                    </div>
                    {/* Floating Karaoke Subtitle */}
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-black flex items-center">
                      <span>This edit is </span>
                      <span className="text-[#FFD21F] bg-[#FFD21F]/20 px-1 mx-1 rounded">INSANE</span>
                      <Flame className="w-3.5 h-3.5 text-[#FF8A00] inline" />
                    </div>
                  </div>
                )}

                {/* Overlay TikTok UI elements */}
                <div className="relative z-10 flex items-end justify-between text-left pointer-events-none drop-shadow-md">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white">@gbest_creator</p>
                    <p className="text-[9px] text-gray-200">Edited in 2 mins with AI #video #editing</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 text-white">
                    <div className="flex flex-col items-center">
                      <Flame className="w-4 h-4 text-[#FF8A00]" />
                      <span className="text-[8px] font-bold">54.2K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Music className="w-3.5 h-3.5 text-[#FFD21F]" />
                      <span className="text-[8px] font-bold">Sound</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>9:16 Vertical Video</span>
                <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>TikTok, Instagram Reels, YouTube Shorts</p>
              </div>
            </div>

            {/* Card 2: 16:9 YouTube Ultra HD Cinema Display */}
            <div
              className={`p-4 rounded-3xl border transition-all ${
                activeFormatTab === '16:9'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102 ' + (isLight ? 'bg-white' : 'bg-[#141414]')
                  : isLight
                  ? 'bg-white border-gray-200 shadow-sm opacity-90 hover:opacity-100'
                  : 'bg-[#141414] border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-video w-full rounded-2xl bg-black border-2 border-[#2A2A2A] shadow-2xl overflow-hidden relative p-3 flex flex-col justify-between">
                {/* Header timecode */}
                <div className="flex items-center justify-between z-10 pointer-events-none">
                  <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    REC 4K 60FPS
                  </span>
                  <span className="text-[9px] font-mono text-gray-300 bg-black/60 px-1.5 py-0.5 rounded">
                    16:9 LANDSCAPE
                  </span>
                </div>

                {/* Center Content / Video */}
                {config.frame_16_9_video_url ? (
                  <video
                    src={config.frame_16_9_video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#1E112A] via-[#10192A] to-[#111] flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFD21F] text-black flex items-center justify-center shadow-xl shadow-amber-500/20 mb-2">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                    <span className="text-xs font-extrabold text-white">Cinematic Documentary</span>
                    <span className="text-[10px] text-[#FFD21F]">Color Graded: Teal & Orange</span>
                  </div>
                )}

                {/* Audio Waveform bottom bar */}
                <div className="relative z-10 bg-black/75 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between text-[9px] font-mono pointer-events-none">
                  <div className="flex items-center space-x-1">
                    <Music className="w-3 h-3 text-[#FF8A00]" />
                    <span className="text-gray-300">Isolated 320kbps Audio</span>
                  </div>
                  <span className="text-[#FFD21F]">03:42 / 12:10</span>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>16:9 Cinema Widescreen</span>
                <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>YouTube, Podcasts, Film & TV</p>
              </div>
            </div>

            {/* Card 3: 1:1 Square Motion Social Post */}
            <div
              className={`p-4 rounded-3xl border transition-all ${
                activeFormatTab === '1:1'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102 ' + (isLight ? 'bg-white' : 'bg-[#141414]')
                  : isLight
                  ? 'bg-white border-gray-200 shadow-sm opacity-90 hover:opacity-100'
                  : 'bg-[#141414] border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-square w-full max-w-[240px] mx-auto rounded-2xl bg-black border-2 border-[#2A2A2A] shadow-2xl overflow-hidden relative p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between z-10 pointer-events-none">
                  <span className="text-[9px] font-bold text-[#FFD21F] bg-[#1F1F1F] px-2 py-0.5 rounded-full border border-[#FFD21F]/30">
                    SQUARE FEED
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#FFD21F] fill-[#FFD21F]" />
                </div>

                {/* Simulated or Admin-Uploaded Video */}
                {config.frame_1_1_video_url ? (
                  <video
                    src={config.frame_1_1_video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1C2012] via-[#1F1A12] to-[#121212] flex flex-col items-center justify-center p-4 text-center">
                    <Rocket className="w-8 h-8 text-[#FFD21F] mb-1" />
                    <p className="text-xs font-black text-white leading-tight">
                      Product Teaser <br />
                      <span className="text-[#FFD21F]">With Dynamic Text</span>
                    </p>
                  </div>
                )}

                <div className="relative z-10 bg-black/75 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between text-[9px] pointer-events-none">
                  <span className="text-gray-300 font-medium">1080 x 1080 px</span>
                  <span className="text-emerald-400 font-bold">Ready to Post</span>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>1:1 Square Feed</span>
                <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Instagram Feed, LinkedIn, Twitter</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: BEFORE & AFTER CREATIVE VIDEO / COLOR GRADING SLIDER           */}
        {/* ========================================================================= */}
        <section className={`px-6 py-16 max-w-6xl mx-auto border-t transition-colors ${
          isLight ? 'border-gray-200' : 'border-[#222222]'
        }`}>
          <div className="text-center mb-10">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] mb-3 ${
              isLight
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700'
                : 'bg-[#1A1A1A] border border-[#2C2C2C] text-[#FFD21F]'
            }`}>
              <Sliders className="w-3.5 h-3.5" />
              <span>Color Science & AI Subtitles</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Transform Flat Footage in 1 Click
            </h2>
            <p className={`text-sm max-w-lg mx-auto ${
              isLight ? 'text-gray-600' : 'text-[#A0A0A0]'
            }`}>
              Drag the interactive slider below to see how GBEST Studio elevates raw camera footage with pro color presets and auto-captions.
            </p>
          </div>

          {/* Interactive Split Comparison Card */}
          <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden border border-[#333333] shadow-2xl bg-black aspect-[16/9] select-none group">
            {/* Background "After" Layer (Vibrant, Color Graded, Auto-Captioned) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1B0B2E] via-[#0E2038] to-[#2B1B04] flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
                alt="After"
                className="w-full h-full object-cover brightness-110 saturate-140 contrast-110"
              />
              {/* After Badges */}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#FFD21F] px-3 py-1 rounded-full text-xs font-bold text-[#FFD21F] shadow-lg flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span>GBEST AI Enhanced (Graded + Subtitles)</span>
              </div>

              {/* Highlight Subtitle */}
              <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                <span className="px-4 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-[#FFD21F]/40 text-base font-black text-white shadow-2xl inline-flex items-center space-x-1">
                  <span>Level up your <span className="text-[#FFD21F]">storytelling</span> today</span>
                  <Zap className="w-4 h-4 text-[#FFD21F] fill-[#FFD21F]" />
                </span>
              </div>
            </div>

            {/* Foreground "Before" Layer (Raw, Desaturated, No Captions) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#FFD21F] shadow-2xl"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="absolute inset-0 w-[896px] h-full">
                <img
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
                  alt="Before"
                  className="w-full h-full object-cover grayscale brightness-75 contrast-90"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-gray-300">
                  Raw Flat Camera Feed
                </div>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute inset-y-0 -ml-3.5 z-20 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-[#FFD21F] text-black shadow-2xl flex items-center justify-center font-extrabold text-xs">
                ↔
              </div>
            </div>

            {/* Invisible Range Input for Smooth Dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              title="Slide to compare"
            />
          </div>
          <div className="flex justify-between text-xs font-mono mt-2 max-w-4xl mx-auto px-2 text-gray-500">
            <span>← Raw Video Input</span>
            <span className={isLight ? 'text-gray-700 font-semibold' : 'text-gray-400'}>Drag Slider to Compare</span>
            <span>Studio Master Output →</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: DESIGN ASSETS & STICKERS SHOWCASE                             */}
        {/* ========================================================================= */}
        <section className={`px-6 py-16 max-w-6xl mx-auto border-t transition-colors ${
          isLight ? 'border-gray-200' : 'border-[#222222]'
        }`}>
          <div className="text-center mb-12">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] mb-3 ${
              isLight
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700'
                : 'bg-[#1A1A1A] border border-[#2C2C2C] text-[#FFD21F]'
            }`}>
              <Smile className="w-3.5 h-3.5" />
              <span>Creative Asset Library</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-2 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Hundreds of Motion Stickers & Effects
            </h2>
            <p className={`text-sm max-w-lg mx-auto ${
              isLight ? 'text-gray-600' : 'text-[#A0A0A0]'
            }`}>
              Add social popups, animated emojis, neon lower-thirds, and cinematic sound FX instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { icon: Flame, color: '#FF8A00', bg: 'bg-orange-500/15 border-orange-500/30', label: 'Trending Fire', tag: 'Pop Animation' },
              { icon: Rocket, color: '#3B82F6', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Launch Rocket', tag: 'Bounce In' },
              { icon: Zap, color: '#FFD21F', bg: 'bg-yellow-500/15 border-yellow-500/30', label: 'Instant Lightning', tag: 'Glow Pulse' },
              { icon: Crown, color: '#F59E0B', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Crown Gold', tag: 'Rotate 3D' },
              { icon: Star, color: '#FFD21F', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Star Rating', tag: 'Sparkle' },
              { icon: Gem, color: '#EC4899', bg: 'bg-pink-500/15 border-pink-500/30', label: 'Diamond Pro', tag: 'Floating' },
            ].map((sticker, idx) => {
              const Icon = sticker.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center transition-all group hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col items-center justify-center ${
                    isLight
                      ? 'bg-white border-gray-200 hover:border-[#FFD21F]'
                      : 'bg-[#141414] border-[#262626] hover:border-[#FFD21F]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${sticker.bg} border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                    <Icon className="w-6 h-6" style={{ color: sticker.color }} />
                  </div>
                  <h4 className={`text-xs font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{sticker.label}</h4>
                  <span className="text-[9px] text-[#FFD21F] font-mono block mt-1 font-semibold">{sticker.tag}</span>
                </div>
              );
            })}
          </div>

          {/* Subtitle Style Presets Preview Strip */}
          <div className={`mt-8 p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm'
              : 'bg-[#141414] border-[#262626]'
          }`}>
            <div className="text-left">
              <span className={`text-xs font-bold block ${isLight ? 'text-gray-900' : 'text-white'}`}>Kinetic Subtitle Presets</span>
              <span className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Word-by-word active highlight, neon strokes, and TikTok bold styles.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#FFD21F] text-black font-extrabold text-xs shadow">
                KARAOKE YELLOW
              </span>
              <span className="px-3 py-1 rounded-lg bg-black text-white font-extrabold text-xs border border-white/40">
                TIKTOK BOLD
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#3B82F6] text-white font-extrabold text-xs">
                NEON BLUE
              </span>
              <span className="px-3 py-1 rounded-lg bg-red-600 text-white font-extrabold text-xs">
                NETFLIX RED
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: CORE FEATURES GRID                                            */}
        {/* ========================================================================= */}
        <section id="features" className={`px-6 py-16 max-w-6xl mx-auto border-t transition-colors ${
          isLight ? 'border-gray-200' : 'border-[#222222]'
        }`}>
          <div className="text-center mb-14">
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-3 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              Engineered for High-Velocity Creators
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${
              isLight ? 'text-gray-600' : 'text-[#A0A0A0]'
            }`}>
              Everything you need to produce viral short-form and high-impact long-form video content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                color: 'text-[#FFD21F]',
                title: 'Exact AI Speech Captions',
                desc: 'Transcribe speech accurately into synchronized animated subtitles with word-by-word highlight effects.'
              },
              {
                icon: Music,
                color: 'text-[#FF8A00]',
                title: 'Convert Video to Audio',
                desc: '1-click audio extraction isolates crystal-clear MP3 tracks onto the timeline with independent volume mixing.'
              },
              {
                icon: Sliders,
                color: 'text-[#FFD21F]',
                title: 'Pro Color Adjustments',
                desc: 'Dial in Exposure, Saturation, Temperature, Tint, Vignette, Letterbox, and cinematic LUT presets.'
              },
              {
                icon: Smile,
                color: 'text-[#FFD21F]',
                title: 'Animated Stickers & Images',
                desc: 'Add trending social badges, emojis, and logo overlays with bounce, pulse, spin, and float animations.'
              },
              {
                icon: Shield,
                color: 'text-[#FF8A00]',
                title: 'Private Workspace & Cloud Sync',
                desc: 'Create your account to sync your projects securely and keep your editing workspace completely private and isolated.'
              },
              {
                icon: Download,
                color: 'text-[#FFD21F]',
                title: 'Lightning Fast Export',
                desc: 'Hardware-accelerated FFmpeg export pipeline produces crisp MP4 files optimized for YouTube, TikTok, and Instagram.'
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border transition-all group shadow-sm hover:shadow-md ${
                    isLight
                      ? 'bg-white border-gray-200 hover:border-[#FFD21F]'
                      : 'bg-[#141414] border-[#242424] hover:border-[#FFD21F]/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors border ${
                    isLight
                      ? 'bg-gray-50 border-gray-200 group-hover:border-[#FFD21F]'
                      : 'bg-[#1E1E1E] border-[#333333] group-hover:border-[#FFD21F]'
                  }`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{f.title}</h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-[#A0A0A0]'}`}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="px-6 py-16 max-w-5xl mx-auto text-center">
          <div className={`p-10 rounded-3xl border shadow-2xl transition-colors ${
            isLight
              ? 'bg-gradient-to-r from-gray-50 via-amber-50/60 to-gray-50 border-gray-300'
              : 'bg-gradient-to-r from-[#1B1B1B] via-[#241F14] to-[#1B1B1B] border-[#333333]'
          }`}>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-3 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              {config.cta_banner_title || 'Ready to Create High-Performing Videos?'}
            </h2>
            <p className={`text-sm max-w-lg mx-auto mb-8 ${
              isLight ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {config.cta_banner_subtitle || 'No software installation required. Run GBEST Studio directly in your web browser.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onGoToDashboard}
                className="px-8 py-3.5 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95"
                style={{ backgroundColor: config.primary_color || '#FFD21F' }}
              >
                {config.cta_button_text || 'Open Studio Editor Now'}
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className={`px-6 py-3.5 rounded-xl border font-medium text-sm transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                Sign Up with Gmail / Email
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`mt-auto border-t py-8 px-6 text-center text-xs transition-colors ${
          isLight ? 'border-gray-200 text-gray-500 bg-white' : 'border-[#222222] text-[#666666]'
        }`}>
          <p>{config.footer_copyright || '© 2026 GBEST STUDIO. All rights reserved. Professional Web Video Editor.'}</p>
        </footer>
      </div>
    </>
  );
};
