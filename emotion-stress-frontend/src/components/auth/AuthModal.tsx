'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  'your-google-client-id.apps.googleusercontent.com';

/**
 * AuthModal - Google Antigravity Premium Glassmorphic Authentication Portal.
 * Handles unified Login, Registration, Multi-Tier Role assignment ('user' | 'admin'),
 * and Google OAuth 2.0 (Sign in with Google) integration.
 */
export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    isLoading,
    error,
    closeAuthModal,
    openAuthModal,
    clearError,
    login,
    loginWithGoogle,
    register,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalValidation('Please enter both email and password.');
      return;
    }

    if (authModalMode === 'login') {
      await login({ email: email.trim(), password });
    } else {
      if (!username.trim()) {
        setLocalValidation('Please choose a username.');
        return;
      }
      if (password.length < 6) {
        setLocalValidation('Password must be at least 6 characters.');
        return;
      }
      if (role === 'admin' && !adminSecret.trim()) {
        setLocalValidation('Administrative secret key is required for Admin role.');
        return;
      }

      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        admin_secret: role === 'admin' ? adminSecret.trim() : undefined,
      });
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    setLocalValidation(null);
    clearError();
    if (!credential) {
      setLocalValidation('Google sign-in did not return a valid credential token.');
      return;
    }
    await loginWithGoogle(credential);
  };

  const isLogin = authModalMode === 'login';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dimmed Glassmorphic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-all"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-900 dark:text-slate-100"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header with Close Icon */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">MindCare Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isLogin ? 'Sign in to access your therapy session' : 'Create an emotion-aware account'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Close modal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Google One-Tap / OAuth Button */}
          <div className="mb-4 flex flex-col items-center justify-center">
            <div className="w-full flex justify-center py-1">
              <GoogleLogin
                onSuccess={(res) => handleGoogleSuccess(res.credential)}
                onError={() => {
                  setLocalValidation('Google sign-in was cancelled or failed to load.');
                }}
                theme="outline"
                size="large"
                shape="pill"
                width="340"
                text={isLogin ? 'signin_with' : 'signup_with'}
              />
            </div>
          </div>

          {/* Or Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 dark:bg-slate-900/95 px-3 text-slate-400 font-semibold tracking-wider text-[10px]">
                Or with Email
              </span>
            </div>
          </div>

          {/* Tab Toggle Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4 border border-slate-200/60 dark:border-slate-700/60 relative">
            <button
              type="button"
              onClick={() => {
                clearError();
                setLocalValidation(null);
                openAuthModal('login');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all relative z-10 cursor-pointer ${
                isLogin
                  ? 'text-blue-600 dark:text-blue-400 shadow-sm bg-white dark:bg-slate-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                clearError();
                setLocalValidation(null);
                openAuthModal('register');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all relative z-10 cursor-pointer ${
                !isLogin
                  ? 'text-blue-600 dark:text-blue-400 shadow-sm bg-white dark:bg-slate-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notification Banner */}
          <AnimatePresence>
            {(error || localValidation) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localValidation || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Field (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector (Registration only) */}
            {!isLogin && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'user'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Standard User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin Role</span>
                  </button>
                </div>

                {/* Admin Secret Key Input (Required for Admin role) */}
                {role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1"
                  >
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Administrative Secret Token
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="password"
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        placeholder="Enter ADMIN_SECRET_KEY"
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Authorized key required to bootstrap administrative privileges.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create MindCare Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Fast Login Preset Helper */}
          <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              Development Quick Fill:
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('alice@example.com');
                  setPassword('UserPass123!');
                }}
                className="px-2.5 py-1 rounded-xl text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors cursor-pointer"
              >
                Demo User
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('bob@example.com');
                  setPassword('AdminPass123!');
                }}
                className="px-2.5 py-1 rounded-xl text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 font-medium transition-colors cursor-pointer"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('root@example.com');
                  setPassword('SuperAdminPass123!');
                }}
                className="px-2.5 py-1 rounded-xl text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 font-medium transition-colors cursor-pointer"
              >
                Demo Super Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
}
