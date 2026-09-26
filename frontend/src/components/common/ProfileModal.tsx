import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  User as UserIcon,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
];

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateCurrentUser,
    theme,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (currentUser && isProfileModalOpen) {
      setName(currentUser.name || '');
      setAvatarUrl(currentUser.avatar || '');
      setPreviewUrl(currentUser.avatar || null);
      setSelectedFile(null);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null);
    setAvatarUrl(url);
    setPreviewUrl(url);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Name must be at least 2 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // If user uploaded a new image file, upload to server first
      if (selectedFile) {
        const uploadRes = await api.uploadAvatar(selectedFile);
        if (uploadRes?.avatar_url) {
          finalAvatarUrl = uploadRes.avatar_url;
        }
      }

      // Update user profile info
      const updateRes = await api.updateProfile({
        name: trimmedName,
        avatar: finalAvatarUrl,
      });

      if (updateRes?.user) {
        updateCurrentUser({
          name: updateRes.user.name,
          avatar: updateRes.user.avatar,
        });
      } else {
        updateCurrentUser({
          name: trimmedName,
          avatar: finalAvatarUrl,
        });
      }

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedNew = newPassword.trim();
    if (!trimmedNew || trimmedNew.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (trimmedNew !== confirmPassword.trim()) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword || undefined,
        new_password: trimmedNew,
      });
      setSuccessMessage(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-gray-200 text-gray-900'
            : 'bg-[#181818] border-[#2E2E2E] text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'border-gray-200 bg-gray-50' : 'border-[#282828] bg-[#141414]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD21F]/15 border border-[#FFD21F]/30 flex items-center justify-center">
              {activeTab === 'profile' ? (
                <UserIcon className="w-4 h-4 text-[#FFD21F]" />
              ) : (
                <KeyRound className="w-4 h-4 text-[#FFD21F]" />
              )}
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {activeTab === 'profile' ? 'Account Settings' : 'Change Password'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {activeTab === 'profile' ? 'Manage your personal details and avatar' : 'Update your account security credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-gray-200 text-gray-500' : 'hover:bg-[#252525] text-gray-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-6 pt-3 gap-6 text-xs font-semibold ${
          isLight ? 'border-gray-200 bg-gray-50/70' : 'border-[#262626] bg-[#141414]'
        }`}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#FFD21F] text-[#FFD21F] font-bold'
                : isLight ? 'border-transparent text-gray-500 hover:text-gray-900' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'password'
                ? 'border-[#FFD21F] text-[#FFD21F] font-bold'
                : isLight ? 'border-transparent text-gray-500 hover:text-gray-900' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="px-6 pt-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-6 pt-3 space-y-4">
            {/* Avatar Upload / Preview */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative group">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg transition-all ${
                    isLight ? 'border-gray-200 bg-gray-100' : 'border-[#333333] bg-[#222222]'
                  }`}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FFD21F] text-black text-2xl font-black">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                {/* Camera Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium space-y-1 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#FFD21F]" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isLight
                      ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                      : 'bg-[#222222] hover:bg-[#2B2B2B] border-[#383838] text-gray-200'
                  }`}
                >
                  Upload Photo
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setAvatarUrl('');
                      setPreviewUrl(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Hidden Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Quick Avatar Presets */}
              <div className="w-full pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-semibold flex items-center space-x-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Sparkles className="w-3 h-3 text-[#FFD21F]" />
                    <span>Or choose an avatar:</span>
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(url)}
                      className={`w-9 h-9 rounded-full border overflow-hidden p-0.5 transition-all hover:scale-110 ${
                        previewUrl === url
                          ? 'border-[#FFD21F] ring-2 ring-[#FFD21F]/40'
                          : isLight
                          ? 'border-gray-200 hover:border-gray-400'
                          : 'border-[#333333] hover:border-[#555555]'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                Full Name
              </label>
              <div className="relative">
                <UserIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                    isLight
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#FFD21F]'
                      : 'bg-[#1C1C1C] border-[#333333] text-white focus:border-[#FFD21F]'
                  }`}
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`block text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  Email Address
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isLight ? 'bg-amber-100 text-amber-800' : 'bg-[#FFD21F]/15 text-[#FFD21F]'
                }`}>
                  Connected
                </span>
              </div>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none opacity-70 cursor-not-allowed ${
                    isLight
                      ? 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-[#141414] border-[#2A2A2A] text-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-dashed border-gray-200 dark:border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-[#252525] text-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs flex items-center space-x-2 transition-transform active:scale-95 shadow-md shadow-amber-500/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 pt-3 space-y-4">
            <div className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs ${
              isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-[#FFD21F]'
            }`}>
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>Choose a strong password with at least 6 characters to secure your projects and media.</span>
            </div>

            {/* Current Password (if email user) */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                Current Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border outline-none transition-all ${
                    isLight
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#FFD21F]'
                      : 'bg-[#1C1C1C] border-[#333333] text-white focus:border-[#FFD21F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                New Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border outline-none transition-all ${
                    isLight
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#FFD21F]'
                      : 'bg-[#1C1C1C] border-[#333333] text-white focus:border-[#FFD21F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  required
                  className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl border outline-none transition-all ${
                    isLight
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#FFD21F]'
                      : 'bg-[#1C1C1C] border-[#333333] text-white focus:border-[#FFD21F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-dashed border-gray-200 dark:border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-[#252525] text-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPw}
                className="px-5 py-2 rounded-xl bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs flex items-center space-x-2 transition-transform active:scale-95 shadow-md shadow-amber-500/10 disabled:opacity-50"
              >
                {isChangingPw ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

