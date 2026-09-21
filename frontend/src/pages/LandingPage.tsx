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
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { AuthModal } from '../components/common/AuthModal';

interface LandingPageProps {
  onStartEditing: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartEditing, onGoToDashboard }) => {
  const { currentUser, isAuthModalOpen, setIsAuthModalOpen, theme, toggleTheme } = useEditorStore();

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
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={onGoToDashboard}
      />

      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col selection:bg-[#FFD21F] selection:text-black">
        {/* Navigation Bar with Studio Background Image */}
        <header
          className="h-16 border-b border-[#242424] px-4 sm:px-10 flex items-center justify-between sticky top-0 backdrop-blur-md z-30 shadow-lg relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(13, 13, 13, 0.94) 0%, rgba(20, 20, 20, 0.88) 50%, rgba(13, 13, 13, 0.94) 100%), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle Top Gold Ambient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD21F]/50 to-transparent pointer-events-none" />

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B1B1B] border border-[#333333] flex items-center justify-center shadow-md">
              <Film className="w-4 h-4 text-[#FFD21F]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-extrabold text-xl tracking-wider text-white">GBEST</span>
              <span className="text-xs font-semibold tracking-widest text-[#FFD21F]">STUDIO</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onGoToDashboard}
              className="text-xs font-medium text-[#A0A0A0] hover:text-white transition-colors hidden sm:block"
            >
              My Projects
            </button>

            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95 group shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD21F] group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Google Sign-in or User Avatar */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-[#1B1B1B] px-3 py-1.5 rounded-full border border-[#333333]">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FFD21F] text-black font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-gray-200 font-semibold max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow"
              >
                {/* Google G Logo */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            )}

            <button
              onClick={onStartEditing}
              className="px-4 py-2 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95"
            >
              Open Studio
            </button>
          </div>
        </header>

        {/* HERO SECTION WITH 3D PERSPECTIVE VIDEO STAGE */}
        <section className="px-6 py-12 sm:py-20 max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2F2F2F] text-xs text-[#FFD21F] mb-6 shadow">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD21F] animate-pulse" />
            <span>Modern AI Video Editor & Auto-Transcription</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Create. Caption. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD21F] to-[#FF8A00]">
              Edit. Export.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#A0A0A0] max-w-2xl leading-relaxed mb-8">
            Studio-grade video editor right in your browser. Real speech auto-captions with word highlight,
            1-click audio extraction, dynamic overlays, and pro transitions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-12 w-full sm:w-auto">
            <button
              onClick={onStartEditing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              <span>Launch Studio Editor</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2"
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
                  <video
                    ref={video3DRef}
                    src="/api/media/uploads/video_7b6fa80606aa.mp4"
                    autoPlay
                    loop
                    muted={isMuted3D}
                    playsInline
                    className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                  />

                  {/* Dynamic 3D Word-by-Word Highlight Captions Overlay */}
                  <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 text-center px-4 pointer-events-none z-20">
                    <div className="inline-block px-4 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-sm sm:text-base font-extrabold shadow-2xl">
                      <span>Create Viral Content with </span>
                      <span className="text-[#FFD21F] underline decoration-wavy decoration-[#FFD21F]">
                        GBEST STUDIO
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
        <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#222222]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] text-[11px] text-[#FFD21F] mb-3">
              <Ratio className="w-3.5 h-3.5" />
              <span>Multi-Platform Video Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Every Format. One Studio.
            </h2>
            <p className="text-sm text-[#A0A0A0] max-w-lg mx-auto">
              Effortlessly toggle canvas ratios for TikTok, YouTube, Instagram Reels, and podcasts.
            </p>

            {/* Format Selector Tabs */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setActiveFormatTab('9:16')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFormatTab === '9:16'
                    ? 'bg-[#FFD21F] text-black shadow-lg shadow-amber-500/10'
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
              className={`p-4 rounded-3xl bg-[#141414] border transition-all ${
                activeFormatTab === '9:16'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102'
                  : 'border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Smartphone frame */}
              <div className="w-full max-w-[240px] mx-auto aspect-[9/16] rounded-3xl bg-black border-4 border-[#2A2A2A] shadow-2xl overflow-hidden relative flex flex-col justify-between p-3">
                {/* Dynamic Island / Notch */}
                <div className="w-16 h-3 bg-[#1F1F1F] rounded-full mx-auto z-20" />

                {/* Simulated Video & Word Highlighting */}
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

                {/* Overlay TikTok UI elements */}
                <div className="relative z-10 flex items-end justify-between text-left">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white">@gbest_creator</p>
                    <p className="text-[9px] text-gray-300">Edited in 2 mins with AI #video #editing</p>
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
                <span className="text-xs font-bold text-white">9:16 Vertical Video</span>
                <p className="text-[10px] text-gray-400">TikTok, Instagram Reels, YouTube Shorts</p>
              </div>
            </div>

            {/* Card 2: 16:9 YouTube Ultra HD Cinema Display */}
            <div
              className={`p-4 rounded-3xl bg-[#141414] border transition-all ${
                activeFormatTab === '16:9'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102'
                  : 'border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-video w-full rounded-2xl bg-black border-2 border-[#2A2A2A] shadow-2xl overflow-hidden relative p-3 flex flex-col justify-between">
                {/* Header timecode */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    REC 4K 60FPS
                  </span>
                  <span className="text-[9px] font-mono text-gray-300 bg-black/60 px-1.5 py-0.5 rounded">
                    16:9 LANDSCAPE
                  </span>
                </div>

                {/* Center Content */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1E112A] via-[#10192A] to-[#111] flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD21F] text-black flex items-center justify-center shadow-xl shadow-amber-500/20 mb-2">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                  <span className="text-xs font-extrabold text-white">Cinematic Documentary</span>
                  <span className="text-[10px] text-[#FFD21F]">Color Graded: Teal & Orange</span>
                </div>

                {/* Audio Waveform bottom bar */}
                <div className="relative z-10 bg-black/75 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between text-[9px] font-mono">
                  <div className="flex items-center space-x-1">
                    <Music className="w-3 h-3 text-[#FF8A00]" />
                    <span className="text-gray-300">Isolated 320kbps Audio</span>
                  </div>
                  <span className="text-[#FFD21F]">03:42 / 12:10</span>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-bold text-white">16:9 Cinema Widescreen</span>
                <p className="text-[10px] text-gray-400">YouTube, Podcasts, Film & TV</p>
              </div>
            </div>

            {/* Card 3: 1:1 Square Motion Social Post */}
            <div
              className={`p-4 rounded-3xl bg-[#141414] border transition-all ${
                activeFormatTab === '1:1'
                  ? 'border-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-2xl scale-102'
                  : 'border-[#262626] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="aspect-square w-full max-w-[240px] mx-auto rounded-2xl bg-black border-2 border-[#2A2A2A] shadow-2xl overflow-hidden relative p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between z-10">
                  <span className="text-[9px] font-bold text-[#FFD21F] bg-[#1F1F1F] px-2 py-0.5 rounded-full border border-[#FFD21F]/30">
                    SQUARE FEED
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#FFD21F] fill-[#FFD21F]" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-[#1C2012] via-[#1F1A12] to-[#121212] flex flex-col items-center justify-center p-4 text-center">
                  <Rocket className="w-8 h-8 text-[#FFD21F] mb-1" />
                  <p className="text-xs font-black text-white leading-tight">
                    Product Teaser <br />
                    <span className="text-[#FFD21F]">With Dynamic Text</span>
                  </p>
                </div>

                <div className="relative z-10 bg-black/75 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between text-[9px]">
                  <span className="text-gray-300 font-medium">1080 x 1080 px</span>
                  <span className="text-emerald-400 font-bold">Ready to Post</span>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-bold text-white">1:1 Square Feed</span>
                <p className="text-[10px] text-gray-400">Instagram Feed, LinkedIn, Twitter</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: BEFORE & AFTER CREATIVE VIDEO / COLOR GRADING SLIDER           */}
        {/* ========================================================================= */}
        <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#222222]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] text-[11px] text-[#FFD21F] mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Color Science & AI Subtitles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Transform Flat Footage in 1 Click
            </h2>
            <p className="text-sm text-[#A0A0A0] max-w-lg mx-auto">
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
          <div className="flex justify-between text-xs text-gray-500 font-mono mt-2 max-w-4xl mx-auto px-2">
            <span>← Raw Video Input</span>
            <span className="text-gray-400">Drag Slider to Compare</span>
            <span>Studio Master Output →</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: DESIGN ASSETS & STICKERS SHOWCASE                             */}
        {/* ========================================================================= */}
        <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#222222]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] text-[11px] text-[#FFD21F] mb-3">
              <Smile className="w-3.5 h-3.5" />
              <span>Creative Asset Library</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Hundreds of Motion Stickers & Effects
            </h2>
            <p className="text-sm text-[#A0A0A0] max-w-lg mx-auto">
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
                  className="p-4 rounded-2xl bg-[#141414] border border-[#262626] hover:border-[#FFD21F] text-center transition-all group hover:-translate-y-1 shadow-lg flex flex-col items-center justify-center"
                >
                  <div className={`w-12 h-12 rounded-2xl ${sticker.bg} border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                    <Icon className="w-6 h-6" style={{ color: sticker.color }} />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{sticker.label}</h4>
                  <span className="text-[9px] text-[#FFD21F] font-mono block mt-1">{sticker.tag}</span>
                </div>
              );
            })}
          </div>

          {/* Subtitle Style Presets Preview Strip */}
          <div className="mt-8 p-5 rounded-2xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Kinetic Subtitle Presets</span>
              <span className="text-[11px] text-gray-400">
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
        <section id="features" className="px-6 py-16 max-w-6xl mx-auto border-t border-[#222222]">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Engineered for High-Velocity Creators
            </h2>
            <p className="text-sm text-[#A0A0A0] max-w-xl mx-auto">
              Everything you need to produce viral short-form and high-impact long-form video content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Sparkles className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Exact AI Speech Captions</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Transcribe speech accurately into synchronized animated subtitles with word-by-word highlight effects.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Music className="w-6 h-6 text-[#FF8A00]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Convert Video to Audio</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                1-click audio extraction isolates crystal-clear MP3 tracks onto the timeline with independent volume mixing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Sliders className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pro Color Adjustments</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Dial in Exposure, Saturation, Temperature, Tint, Vignette, Letterbox, and cinematic LUT presets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Smile className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Animated Stickers & Images</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Add trending social badges, emojis, and logo overlays with bounce, pulse, spin, and float animations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Shield className="w-6 h-6 text-[#FF8A00]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Google Cloud Auto-Save</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Sign in with Google to sync your projects securely and resume editing on any device seamlessly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#FFD21F]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center mb-4 group-hover:border-[#FFD21F] transition-colors">
                <Download className="w-6 h-6 text-[#FFD21F]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lightning Fast Export</h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Hardware-accelerated FFmpeg export pipeline produces crisp MP4 files optimized for YouTube, TikTok, and Instagram.
              </p>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="px-6 py-16 max-w-5xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-r from-[#1B1B1B] via-[#241F14] to-[#1B1B1B] border border-[#333333] shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Ready to Create High-Performing Videos?
            </h2>
            <p className="text-sm text-gray-300 max-w-lg mx-auto mb-8">
              No software installation required. Run GBEST Studio directly in your web browser.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onStartEditing}
                className="px-8 py-3.5 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95"
              >
                Open Studio Editor Now
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm"
              >
                Connect with Gmail
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#222222] py-8 px-6 text-center text-xs text-[#666666]">
          <p>© 2026 GBEST STUDIO. All rights reserved. Professional Web Video Editor.</p>
        </footer>
      </div>
    </>
  );
};
