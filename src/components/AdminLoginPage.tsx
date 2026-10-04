import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Store,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { loginAdmin } from '../utils/adminAuth';

interface AdminLoginPageProps {
  settings?: StoreSettings;
  onLoginSuccess: () => void;
  onBackToStore: () => void;
  redirectNotice?: string | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  settings,
  onLoginSuccess,
  onBackToStore,
  redirectNotice,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storeName = settings?.storeName || 'China Direct BD';
  const storeLogo = settings?.storeLogo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdmin(cleanUser, cleanPass);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Invalid username or password. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden font-sans">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back link to Store */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <button
          id="admin-login-back-to-store"
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition py-1.5 px-3 rounded-lg hover:bg-slate-800/60 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Storefront</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-[11px] tracking-wider uppercase">Secure Portal</span>
        </div>
      </div>

      {/* Login Card Container */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        {/* Brand / Logo Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                referrerPolicy="no-referrer"
                className="h-14 w-auto max-w-[170px] object-contain rounded-lg p-1 bg-white/5 border border-slate-800 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-900/30">
                {storeName
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('') || 'CD'}
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sign in to access <strong className="text-slate-200">{storeName}</strong> control panel
          </p>
        </div>

        {/* Redirect Notice Banner (if unauthenticated attempt was made) */}
        {redirectNotice && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{redirectNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="admin-login-error"
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username or Email Input */}
          <div>
            <label
              htmlFor="admin-login-username"
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or support@chinadirectbd.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <label
              htmlFor="admin-login-password"
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <button
                id="toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <div className="pt-2">
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Admin</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security & Default Credentials Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          
          <p className="text-[11px] text-slate-400 mt-2">
            Protected area. All actions are logged and authenticated server-side.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-400 flex items-center gap-2">
        <Store className="w-3.5 h-3.5" />
        <span>{storeName} &bull; Internal Administration</span>
      </div>
    </div>
  );
};
