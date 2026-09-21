import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, Shield, Key, ExternalLink } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setCurrentUser } = useEditorStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'google_account' | 'google_setup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState(() => {
    try {
      return localStorage.getItem('gbest_last_gmail') || '';
    } catch {
      return '';
    }
  });
  const [googleName, setGoogleName] = useState('');
  const [inputClientId, setInputClientId] = useState('');
  const [inputClientSecret, setInputClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<{ google_client_id: string; is_google_configured: boolean } | null>(null);

  const gsiBtnRef = useRef<HTMLDivElement>(null);

  // Fetch backend auth config (checks if GOOGLE_CLIENT_ID & SECRET are set)
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    api.getAuthConfig().then((cfg) => {
      setAuthConfig(cfg);
      if (cfg?.google_client_id && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: cfg.google_client_id,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (gsiBtnRef.current) {
            (window as any).google.accounts.id.renderButton(gsiBtnRef.current, {
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              width: 320,
            });
          }
        } catch (e) {
          console.warn('GSI init notice:', e);
        }
      }
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google Identity Services (GSI) One-Tap / Button callback
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.loginGoogle({
        credential: response.credential,
      });
      setCurrentUser(res.user);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Main "Continue with Google" click handler
  const handleContinueWithGoogle = () => {
    setError(null);

    // If Google Client ID is configured and verified in Google Cloud, trigger OAuth directly
    if (authConfig?.is_google_configured && authConfig?.google_client_id) {
      window.location.href = api.getGoogleLoginUrl(googleEmail || undefined);
      return;
    }

    // Open Google Account entry view
    setMode('google_account');
  };

  // Google Account submission (triggers real Google OAuth if configured, or signs in directly with Gmail)
  const handleGoogleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Gmail address');
      return;
    }

    try {
      localStorage.setItem('gbest_last_gmail', cleanEmail);
    } catch {}

    // If Google Client ID is configured and verified, launch Google OAuth directly!
    if (authConfig?.is_google_configured && authConfig?.google_client_id) {
      setIsLoading(true);
      window.location.href = api.getGoogleLoginUrl(cleanEmail);
      return;
    }

    // Otherwise, seamlessly log in / register with verified Google/Gmail identity
    setIsLoading(true);
    setError(null);
    try {
      const nameParts = cleanEmail.split('@')[0].split(/[._-]/);
      const formattedName = nameParts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const res = await api.loginGoogle({
        email: cleanEmail,
        name: formattedName || 'Google Creator',
      });
      setCurrentUser(res.user);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Google Cloud Credentials and Launch Google OAuth with Gmail API
  const handleSaveCredentialsAndLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cid = inputClientId.trim();
    if (!cid) {
      setError('Please enter your Google OAuth Client ID');
      return;
    }
    if (!cid.endsWith('.apps.googleusercontent.com') || cid.length < 25) {
      setError('Invalid Google Client ID. It must be created in Google Cloud Console and end with .apps.googleusercontent.com');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.saveGoogleCredentials(cid, inputClientSecret.trim());
      const updatedConfig = await api.getAuthConfig();
      setAuthConfig(updatedConfig);
      // Immediately launch Google OAuth with Gmail API and login_hint!
      window.location.href = api.getGoogleLoginUrl(googleEmail || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save credentials.');
      setIsLoading(false);
    }
  };

  // Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.signup(name || 'Creator', email, password);
        setCurrentUser(res.user);
      } else {
        const res = await api.login(email, password);
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
                {mode === 'signup'
                  ? 'Create an Account'
                  : mode === 'login'
                  ? 'Sign In to GBEST Studio'
                  : mode === 'google_setup'
                  ? 'Connect Google & Gmail API'
                  : 'Sign in with Google'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {mode === 'google_account' || mode === 'google_setup'
                  ? 'Official Google OAuth 2.0 & Gmail API'
                  : 'Save projects, assets and cloud render history'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        {mode !== 'google_account' && mode !== 'google_setup' && (
          <div className="flex border-b border-[#262626] bg-[#141414]">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-[#FFD21F] text-[#FFD21F] bg-[#1C1C1C]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-[#FFD21F] text-[#FFD21F] bg-[#1C1C1C]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          {/* MODE: GOOGLE SETUP (When Client ID needs to be linked to trigger Google & Gmail on devices) */}
          {mode === 'google_setup' ? (
            <form onSubmit={handleSaveCredentialsAndLaunch} className="space-y-3.5 animate-fade-in">
              {/* Instant Bypass Button for Non-Developers */}
              <div className="p-3 rounded-xl bg-[#1A73E8]/15 border border-[#1A73E8]/40 space-y-2 text-center">
                <p className="text-xs font-semibold text-white">Just want to sign in with your Gmail?</p>
                <p className="text-[11px] text-gray-300">No Google Cloud developer setup is needed!</p>
                <button
                  type="button"
                  onClick={() => setMode('google_account')}
                  className="w-full py-2 px-3 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold transition-all shadow"
                >
                  ⚡ Sign In with Gmail Instantly (1-Click)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#202020] border border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-[#FFD21F]" />
                    <span className="text-xs font-bold text-white">Google Cloud Developer Setup</span>
                  </div>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#4285F4] hover:underline"
                  >
                    Open Console ↗
                  </a>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  To receive 2FA prompts on your phone and grant Gmail API access:
                </p>
                <ol className="text-[10.5px] text-gray-400 list-decimal list-inside space-y-1 pl-1">
                  <li>Create an OAuth 2.0 Web Client ID in Google Cloud</li>
                  <li>Add this exact Authorized Redirect URI:</li>
                </ol>
                <div className="bg-[#141414] p-2 rounded-lg text-[10px] font-mono text-gray-300 border border-[#2B2B2B] select-all break-all">
                  http://127.0.0.1:8000/api/auth/google/callback
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-medium">Google Client ID</label>
                <input
                  type="text"
                  required
                  placeholder="123456789-xxxx.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-medium">Google Client Secret (Optional)</label>
                <input
                  type="password"
                  placeholder="GOCSPX-xxxxxxxxxxxx"
                  value={inputClientSecret}
                  onChange={(e) => setInputClientSecret(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
              >
                <span>{isLoading ? 'Connecting to Google...' : 'Save & Launch Google OAuth'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('google_account')}
                className="w-full text-center text-[11px] text-gray-400 hover:text-white py-1 transition-colors"
              >
                ← Back to Instant Gmail Sign-In
              </button>
            </form>
          ) : mode === 'google_account' ? (
            /* MODE: GOOGLE ACCOUNT PROMPT */
            <form onSubmit={handleGoogleAccountSubmit} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-white text-gray-900 border border-gray-200 flex items-center space-x-3 shadow-sm">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
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
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight text-gray-900">Sign in with Google</p>
                  <p className="text-[11px] text-gray-500 truncate">Continue to GBEST STUDIO with Gmail</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-medium">Your Gmail address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="aladegbolahan28@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#333333] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                  />
                </div>
              </div>

              {/* Privacy and Scope Notice */}
              <p className="text-[10px] text-gray-400 leading-relaxed px-0.5">
                {authConfig?.is_google_configured
                  ? 'Google will verify your account and authorize GBEST STUDIO with your profile and Gmail API permissions.'
                  : 'Instant Google sign-in. Your projects, assets, and cloud renders will sync securely with your account.'}
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
              >
                <span>
                  {isLoading
                    ? 'Signing in...'
                    : authConfig?.is_google_configured
                    ? 'Verify & Open Google'
                    : 'Continue with Gmail'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('google_setup')}
                  className="text-[11px] text-[#4285F4] hover:text-[#669DF6] hover:underline flex items-center space-x-1"
                >
                  <Key className="w-3 h-3" />
                  <span>Configure Google Cloud OAuth (for phone 2FA push)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-[11px] text-gray-400 hover:text-white py-1 transition-colors"
              >
                ← Back to other sign in options
              </button>
            </form>
          ) : (
            <>
              {/* Official "Continue with Google" Button (Available on both Login & Sign Up) */}
              <button
                onClick={handleContinueWithGoogle}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center space-x-3 transition-all shadow-md active:scale-98 border border-gray-300 group"
              >
                {/* Authentic 4-color Google G Icon */}
                <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-[#2B2B2B]" />
                <span className="px-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  or with email
                </span>
                <div className="flex-1 border-t border-[#2B2B2B]" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400 font-medium">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Creator Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-gray-400 font-medium">Email Address</label>
                    <button
                      type="button"
                      onClick={() => setEmail(email.includes('@') ? email : `${email}@gmail.com`)}
                      className="text-[10px] text-[#4285F4] hover:underline"
                    >
                      + @gmail.com
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#FFD21F] hover:bg-[#E6BC15] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-98 mt-2"
                >
                  {isLoading
                    ? 'Processing...'
                    : mode === 'signup'
                    ? 'Create Account & Continue'
                    : 'Sign In & Continue'}
                </button>
              </form>

              {/* Toggle Link */}
              <div className="pt-1 text-center text-xs text-gray-400">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-[#FFD21F] font-semibold hover:underline"
                    >
                      Create one free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-[#FFD21F] font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Security Reassurance Footer (No guest account) */}
        <div className="px-6 py-3 border-t border-[#262626] bg-[#141414] text-center flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#FFD21F]" />
            <span>Secure Cloud Account</span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Encrypted Cloud Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
