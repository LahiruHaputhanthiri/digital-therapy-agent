'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Camera,
  Trash2,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Save,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Compresses an image file using an HTML5 Canvas to a maximum dimension of 256x256
 * and returns a lightweight Base64 JPEG dataURL (~20-40KB).
 */
async function compressImageFile(file: File, maxDim = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * ProfileSettingsModal - Google Antigravity User Profile & Account Settings.
 * Allows users to update display username, upload/change custom profile photo,
 * reset password, and manage account deletion.
 */
export function ProfileSettingsModal() {
  const {
    user,
    isProfileModalOpen,
    closeProfileModal,
    updateProfile,
    deleteAccount,
  } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize form values when modal opens or user updates
  useEffect(() => {
    if (user && isProfileModalOpen) {
      setUsername(user.username || '');
      setAvatar(user.avatar || null);
      setNewPassword('');
      setConfirmPassword('');
      setFeedback(null);
      setShowDeleteConfirm(false);
    }
  }, [user, isProfileModalOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isProfileModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          closeProfileModal();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileModalOpen, showDeleteConfirm, closeProfileModal]);

  if (!isProfileModalOpen || !user) {
    return null;
  }

  // Handle image file selection and client-side compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, WebP).' });
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 256, 0.85);
      setAvatar(compressedDataUrl);
      setFeedback(null);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to process image. Please try another file.' });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2) {
      setFeedback({ type: 'error', message: 'Username must be at least 2 characters long.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Passwords do not match. Please re-type your password.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const success = await updateProfile({
        username: cleanUsername,
        avatar: avatar,
        password: newPassword.trim() ? newPassword.trim() : undefined,
      });

      if (success) {
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: 'Failed to save changes. Please try again.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving profile.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAccount();
      if (!success) {
        setFeedback({ type: 'error', message: 'Failed to delete account. Please try again.' });
        setIsDeleting(false);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Account deletion failed.' });
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 -z-10"
        onClick={closeProfileModal}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
      >
        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
                Profile Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your account credentials and personal preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeProfileModal}
            aria-label="Close profile settings"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Status Feedback Banner ───────────────────────────────────── */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}

        {/* ── Profile Edit Form ────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-5">
          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-full ring-4 ring-teal-500/20 dark:ring-teal-400/20 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{username.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Quick overlay trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload new profile picture"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            {/* Avatar Actions */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Profile Photo
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Recommended square image (JPG, PNG, WebP). Automatically compressed for performance.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload profile image"
              />

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Camera className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                </Button>

                {avatar && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveAvatar}
                    className="rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Account Details & Username */}
          <div className="space-y-3">
            {/* Email & Role Badge (Immutable identification) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Address</span>
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all">
                  {user.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Account Role</span>
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center justify-between">
                  <span>{user.role === 'super_admin' ? 'Super Admin' : user.role}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    RBAC Active
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Username */}
            <div className="space-y-1">
              <label htmlFor="username-input" className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Display Username</span>
              </label>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display username"
                required
                minLength={2}
                maxLength={50}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Optional Password Reset */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Change Password (Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">Leave blank to keep current</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  minLength={6}
                  className="w-full px-3.5 py-2 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={closeProfileModal}
              disabled={isSaving}
              className="rounded-xl text-xs px-4 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl text-xs px-5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold gap-1.5 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ── Danger Zone: Account Deletion ───────────────────────────── */}
        <div className="mt-6 pt-4 border-t border-rose-200/80 dark:border-rose-900/40">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  Delete Account
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permanently delete account credentials and associated chat telemetry
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 dark:text-rose-400 dark:hover:bg-rose-950/50 font-bold shrink-0 cursor-pointer"
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200">
                    Are you absolutely sure?
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                    This action is permanent and cannot be undone. All your session records, telemetry logs, and account credentials will be immediately wiped from the database.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="rounded-xl text-xs px-3 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="rounded-xl text-xs px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Confirm Account Deletion</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
