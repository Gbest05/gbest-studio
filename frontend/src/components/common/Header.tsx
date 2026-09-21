import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Save,
  Film,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Check,
  RotateCcw,
  Upload,
  Link as LinkIcon,
  X,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Tooltip } from './Tooltip';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onOpenExport: () => void;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onSaveProject: () => void;
}

const BG_COLOR_PRESETS = [
  { name: 'Obsidian Noir', hex: '#141414' },
  { name: 'Midnight Navy', hex: '#0B132B' },
  { name: 'Studio Indigo', hex: '#1A1B2F' },
  { name: 'Deep Violet', hex: '#1F1030' },
  { name: 'Emerald Noir', hex: '#062A20' },
  { name: 'Crimson Wine', hex: '#2C0D13' },
  { name: 'Amber Bronze', hex: '#2B210B' },
  { name: 'Cyber Slate', hex: '#1E293B' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Soft Gray', hex: '#F3F4F6' },
];

const BG_IMAGE_PRESETS = [
  {
    id: 'studio',
    name: 'Studio Mixer',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'cyber',
    name: 'Cyberwave Glow',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'stage',
    name: 'Concert Stage',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'wave',
    name: 'Sound Waveforms',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'abstract',
    name: 'Abstract Flow',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'none',
    name: 'Solid Color Only',
    url: null,
  },
];

const isColorLight = (hex: string): boolean => {
  if (!hex || hex.startsWith('rgba') || hex === 'transparent') return false;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  return false;
};

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onNavigateHome,
  onNavigateDashboard,
  onSaveProject,
}) => {
  const {
    projectName,
    setProjectName,
    isSaving,
    lastSaved,
    undoStack,
    redoStack,
    undo,
    redo,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    logout,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
    headerBgColor,
    setHeaderBgColor,
    headerBgImage,
    setHeaderBgImage,
    headerBgOpacity,
    setHeaderBgOpacity,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showHeaderStylePopover, setShowHeaderStylePopover] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerStyleRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
      if (headerStyleRef.current && !headerStyleRef.current.contains(target)) {
        setShowHeaderStylePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNameBlur = () => {
    setIsEditingTitle(false);
    if (tempName.trim()) {
      setProjectName(tempName.trim());
      handleSaveCheck();
    } else {
      setTempName(projectName);
    }
  };

  const handleSaveCheck = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      onSaveProject();
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setHeaderBgImage(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setHeaderBgImage(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetHeaderStyle = () => {
    setHeaderBgColor('#141414');
    setHeaderBgImage('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80');
    setHeaderBgOpacity(0.88);
  };

  const isLight = theme === 'light'
    ? (!headerBgImage || isColorLight(headerBgColor))
    : (!headerBgImage && isColorLight(headerBgColor));

  const effectiveBgColor = theme === 'light' && (headerBgColor === '#141414' || headerBgColor === '#161616')
    ? '#FFFFFF'
    : (headerBgColor || '#141414');

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => onSaveProject()}
      />

      {/* Hidden file input for uploading custom header background image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileUpload}
        className="hidden"
      />

      <header
        className={`h-14 border-b px-2 sm:px-4 flex items-center justify-between select-none z-30 relative overflow-visible shadow-sm transition-colors duration-200 ${
          isLight
            ? 'border-slate-200 text-slate-900 bg-white'
            : 'border-[#282828] text-white'
        }`}
        style={{
          backgroundColor: effectiveBgColor,
          ...(headerBgImage && !isLight
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(12, 12, 12, ${headerBgOpacity}) 0%, rgba(20, 20, 20, ${Math.max(
                  0.1,
                  headerBgOpacity - 0.08
                )}) 50%, rgba(12, 12, 12, ${headerBgOpacity}) 100%), url('${headerBgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : headerBgImage && isLight
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.93) 0%, rgba(248, 250, 252, 0.90) 50%, rgba(255, 255, 255, 0.93) 100%), url('${headerBgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                backgroundImage: 'none',
              }),
        }}
      >
        {/* Subtle Top Gold Ambient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD21F]/60 to-transparent pointer-events-none" />

        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 flex-shrink-0">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-1.5 group focus:outline-none flex-shrink-0"
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center group-hover:border-[#FFD21F] transition-colors shadow-sm ${
                isLight ? 'bg-white/80 border-gray-300' : 'bg-[#1B1B1B]/80 border-[#333333]'
              }`}
            >
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD21F]" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span
                className={`font-extrabold text-base sm:text-lg tracking-wider ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}
              >
                GBEST
              </span>
              <span className="hidden sm:inline text-xs font-semibold tracking-widest text-[#FFD21F]">
                STUDIO
              </span>
            </div>
          </button>

          <button
            onClick={onNavigateDashboard}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded border transition-all ${
              isLight
                ? 'text-gray-700 hover:text-black hover:bg-black/5 border-transparent hover:border-gray-300'
                : 'text-[#A0A0A0] hover:text-white hover:bg-[#1B1B1B]/80 border-transparent hover:border-[#333333]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>Projects</span>
          </button>

          {/* Mobile Tools Drawer Quick Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className={`flex lg:hidden items-center space-x-1 px-2 py-1 rounded-lg border text-[11px] font-bold active:scale-95 transition-all flex-shrink-0 shadow-sm ${
              isLight
                ? 'bg-white/90 border-gray-300 text-gray-900 hover:border-[#FFD21F]'
                : 'bg-[#1B1B1B]/90 border-[#3A3A3A] text-[#FFD21F] hover:border-[#FFD21F]'
            }`}
            title="Open Creative Tools"
          >
            <Sparkles className="w-3 h-3 text-[#FFD21F]" />
            <span>Tools</span>
          </button>
        </div>

        {/* Center: Project Title */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0 mx-1 sm:mx-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className={`rounded px-2 py-0.5 text-xs sm:text-sm focus:outline-none w-20 xs:w-28 sm:w-48 border border-[#FFD21F] ${
                isLight ? 'bg-white text-gray-900' : 'bg-[#1B1B1B] text-white'
              }`}
            />
          ) : (
            <div
              onClick={() => {
                setTempName(projectName);
                setIsEditingTitle(true);
              }}
              className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded cursor-pointer border border-transparent transition-colors flex items-center min-w-0 ${
                isLight
                  ? 'text-gray-900 hover:bg-black/5 hover:border-gray-300'
                  : 'text-white/90 hover:bg-[#1B1B1B]/80 hover:border-[#333333]'
              }`}
              title="Click to rename project"
            >
              <span className="truncate max-w-[50px] xs:max-w-[85px] sm:max-w-[200px]">
                {projectName}
              </span>
            </div>
          )}

          {/* Autosave Pill */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs flex-shrink-0">
            {isSaving ? (
              <span className="flex items-center space-x-1 text-[#FF8A00]">
                <span className="w-2 h-2 rounded-full bg-[#FF8A00] animate-pulse" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-auto">
          {/* Undo / Redo (Desktop only) */}
          <div
            className={`hidden sm:flex items-center space-x-1 border-r pr-2 ${
              isLight ? 'border-gray-300' : 'border-[#2A2A2A]'
            }`}
          >
            <Tooltip content="Undo (Ctrl+Z)">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className={`p-1.5 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${
                  isLight
                    ? 'text-gray-600 hover:text-black hover:bg-black/5'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#1B1B1B]/80'
                }`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Redo (Ctrl+Shift+Z)">
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className={`p-1.5 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${
                  isLight
                    ? 'text-gray-600 hover:text-black hover:bg-black/5'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#1B1B1B]/80'
                }`}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Save Button */}
          <Tooltip content="Save Project">
            <button
              onClick={handleSaveCheck}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 flex-shrink-0 shadow-sm ${
                isLight
                  ? 'bg-white/80 hover:bg-white text-gray-800 border-gray-300'
                  : 'bg-[#1B1B1B]/80 hover:bg-[#252525] text-[#A0A0A0] hover:text-white border-[#333333]'
              }`}
            >
              <Save className="w-3.5 h-3.5 text-[#FFD21F]" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </Tooltip>

          {/* Header Theme & Style Popover (Background Image & Color Editor) */}
          <div className="relative flex-shrink-0" ref={headerStyleRef}>
            <Tooltip content="Header Style & Background">
              <button
                onClick={() => setShowHeaderStylePopover(!showHeaderStylePopover)}
                className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border transition-all flex items-center space-x-1 flex-shrink-0 shadow-sm ${
                  showHeaderStylePopover
                    ? 'border-[#FFD21F] bg-[#FFD21F]/20 text-[#FFD21F]'
                    : isLight
                    ? 'bg-white/80 hover:bg-white text-gray-700 border-gray-300'
                    : 'bg-[#1B1B1B]/80 hover:bg-[#252525] text-[#A0A0A0] hover:text-white border-[#333333]'
                }`}
                title="Customize Header Style"
              >
                <Palette className="w-3.5 h-3.5 text-[#FFD21F]" />
                <span className="hidden xl:inline text-xs font-medium">Header Style</span>
              </button>
            </Tooltip>

            {/* Header Style Popover Modal */}
            {showHeaderStylePopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181818] border border-[#2D2D2D] text-white rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-4 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-[#FFD21F]" />
                    <span className="font-bold text-sm text-white">Header Appearance</span>
                  </div>
                  <button
                    onClick={() => setShowHeaderStylePopover(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#252525]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: Background Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
                      Header Background Color
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      {headerBgColor}
                    </span>
                  </div>

                  {/* Swatches Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {BG_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => setHeaderBgColor(preset.hex)}
                        className={`h-7 rounded-lg border relative flex items-center justify-center transition-all ${
                          headerBgColor.toLowerCase() === preset.hex.toLowerCase()
                            ? 'border-[#FFD21F] scale-105 shadow-md shadow-amber-500/20 ring-1 ring-[#FFD21F]'
                            : 'border-white/10 hover:scale-102'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.name}
                      >
                        {headerBgColor.toLowerCase() === preset.hex.toLowerCase() && (
                          <Check
                            className={`w-3.5 h-3.5 stroke-[3] ${
                              isColorLight(preset.hex) ? 'text-black' : 'text-[#FFD21F]'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center space-x-2 pt-1">
                    <label
                      htmlFor="custom-header-color"
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] border border-[#333333] cursor-pointer text-[11px] text-gray-300 transition-colors flex-shrink-0"
                    >
                      <input
                        id="custom-header-color"
                        type="color"
                        value={headerBgColor}
                        onChange={(e) => setHeaderBgColor(e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span>Custom Color</span>
                    </label>
                    <input
                      type="text"
                      value={headerBgColor}
                      onChange={(e) => setHeaderBgColor(e.target.value)}
                      placeholder="#141414"
                      className="flex-1 bg-[#222222] border border-[#333333] rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-[#FFD21F] font-mono"
                    />
                  </div>
                </div>

                {/* Section 2: Background Image */}
                <div className="space-y-2 pt-2 border-t border-[#262626]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">
                      Header Background Image
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {headerBgImage ? 'Active' : 'Solid Color'}
                    </span>
                  </div>

                  {/* Presets Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {BG_IMAGE_PRESETS.map((preset) => {
                      const isSelected = headerBgImage === preset.url;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setHeaderBgImage(preset.url)}
                          className={`h-14 rounded-xl border relative overflow-hidden flex flex-col justify-end p-1.5 text-left transition-all ${
                            isSelected
                              ? 'border-[#FFD21F] ring-1 ring-[#FFD21F] shadow-lg shadow-amber-500/15'
                              : 'border-[#333333] hover:border-gray-500'
                          }`}
                          style={
                            preset.url
                              ? {
                                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2)), url('${preset.url}')`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : {
                                  backgroundColor: '#1C1C1C',
                                }
                          }
                        >
                          <span className="text-[9px] font-bold text-white truncate drop-shadow-md">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FFD21F] text-black flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom URL & Upload */}
                  <div className="space-y-1.5 pt-1">
                    <form onSubmit={handleApplyCustomUrl} className="flex items-center space-x-1.5">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3 h-3 text-gray-400 absolute left-2.5 top-2" />
                        <input
                          type="url"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="Paste image URL..."
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded-lg bg-[#333333] hover:bg-[#444444] text-[11px] font-medium text-white transition-colors"
                      >
                        Apply
                      </button>
                    </form>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] border border-[#333333] text-[11px] font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FFD21F]" />
                      <span>Upload Image from Device</span>
                    </button>
                  </div>
                </div>

                {/* Section 3: Overlay Darkness / Opacity */}
                {headerBgImage && (
                  <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-300 font-medium flex items-center space-x-1">
                        <Sliders className="w-3 h-3 text-[#FFD21F]" />
                        <span>Background Overlay Opacity</span>
                      </span>
                      <span className="font-mono text-[#FFD21F]">
                        {Math.round(headerBgOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.98"
                      step="0.02"
                      value={headerBgOpacity}
                      onChange={(e) => setHeaderBgOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Footer: Reset Button */}
                <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                  <button
                    onClick={handleResetHeaderStyle}
                    className="flex items-center space-x-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default Style</span>
                  </button>
                  <button
                    onClick={() => setShowHeaderStylePopover(false)}
                    className="px-3 py-1 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black text-[11px] font-bold transition-all shadow"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <Tooltip content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all flex items-center space-x-1 flex-shrink-0 shadow-sm group active:scale-95 ${
                isLight
                  ? 'bg-white/80 hover:bg-white text-amber-600 border-gray-300'
                  : 'bg-[#1B1B1B]/80 hover:bg-[#252525] text-amber-400 border-[#333333]'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFD21F] group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
              )}
              <span className="hidden xl:inline text-xs font-medium">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </Tooltip>

          {/* User Auth Profile / Google Sign-in */}
          {currentUser ? (
            <div className="relative flex-shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-1.5 p-0.5 sm:p-1 border rounded-full sm:rounded-xl transition-all flex-shrink-0 ${
                  isLight
                    ? 'bg-white/80 hover:bg-white border-gray-300'
                    : 'bg-[#1B1B1B]/80 hover:bg-[#252525] border-[#333333]'
                }`}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#444444]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#FFD21F] text-black font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={`hidden lg:inline text-xs font-semibold pr-1.5 max-w-[80px] truncate ${
                    isLight ? 'text-gray-800' : 'text-gray-200'
                  }`}
                >
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-[#2B2B2B] rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in text-white">
                  <div className="px-2.5 py-1.5 border-b border-[#252525] mb-1">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigateDashboard();
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-gray-300 hover:text-white hover:bg-[#222222] rounded-lg flex items-center space-x-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#FFD21F]" />
                    <span>My Projects</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all active:scale-95 flex-shrink-0 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Primary Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs transition-all shadow-md shadow-amber-500/15 active:scale-95 flex-shrink-0"
            title="Export Video"
          >
            <Download className="w-3.5 h-3.5 text-black stroke-[2.8]" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </header>
    </>
  );
};
