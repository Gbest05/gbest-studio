import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialMode }) => {
  const { setCurrentUser, authModalMode, setAuthModalMode } = useEditorStore();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode || authModalMode || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || authModalMode || 'login');
      setError(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode, authModalMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Client-side validations
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.signup(name.trim(), cleanEmail, password);
        setCurrentUser(res.user);
      } else {
        const res = await api.login(cleanEmail, password);
        setCurrentUser(res.user);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-[#181818] border border-[#2D2D2D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD21F]/15 flex items-center justify-center text-[#FFD21F]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {mode === 'signup' ? 'Create an Account' : 'Sign In to GBEST Studio'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === 'signup'
                  ? 'Your projects are private and isolated to your account'
                  : 'Resume your private video editing workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        <div className="flex border-b border-[#262626] bg-[#141414]">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-[#FFD21F] text-[#FFD21F] bg-[#1C1C1C]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[#FFD21F] text-[#FFD21F] bg-[#1C1C1C]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-medium flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[10px] text-gray-500">Required</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F] focus:ring-1 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-300 font-medium flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-gray-500">Required</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F] focus:ring-1 focus:ring-[#FFD21F]"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-gray-300 font-medium">Password</label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-gray-500">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F] focus:ring-1 focus:ring-[#FFD21F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 p-0.5 text-gray-400 hover:text-white rounded transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-gray-300 font-medium">Confirm Password</label>
                  {passwordsMatch && (
                    <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>Passwords match</span>
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[10px] text-red-400">Passwords do not match</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-[#1C1C1C] border rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                      passwordsMismatch
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : passwordsMatch
                        ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                        : 'border-[#333333] focus:border-[#FFD21F] focus:ring-[#FFD21F]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2 p-0.5 text-gray-400 hover:text-white rounded transition-colors focus:outline-none"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/10 active:scale-98 disabled:opacity-60"
            >
              <span>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'signup'
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Switch mode links */}
          <div className="pt-2 text-center text-xs text-gray-400 border-t border-[#262626]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-[#FFD21F] font-semibold hover:underline ml-1"
                >
                  Create one free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-[#FFD21F] font-semibold hover:underline ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#262626] bg-[#141414] text-center flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>Isolated User Workspace</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Private Projects</span>
          </div>
        </div>
      </div>
    </div>
  );
};
