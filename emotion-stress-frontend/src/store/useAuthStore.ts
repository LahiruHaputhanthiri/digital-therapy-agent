import { create } from 'zustand';
import { AuthUser, LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types';
import { ApiService } from '@/services/api';

const TOKEN_KEY = 'mindcare_auth_token';
const USER_KEY = 'mindcare_auth_user';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isProfileModalOpen: boolean;
  activeView: 'chat' | 'admin';

  // Actions
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  setActiveView: (view: 'chat' | 'admin') => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  logout: () => void;
}

/**
 * Authentication Store for MindCare Frontend.
 * Manages JWT tokens, user claims, RBAC view routing, and profile/auth modal visibility.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  isProfileModalOpen: false,
  activeView: 'chat',

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  openProfileModal: () => {
    set({ isProfileModalOpen: true, error: null });
  },

  closeProfileModal: () => {
    set({ isProfileModalOpen: false, error: null });
  },

  setActiveView: (view) => {
    set({ activeView: view });
  },

  clearError: () => {
    set({ error: null });
  },

  /**
   * Hydrate auth state from localStorage on client-side bootstrap
   */
  initAuth: async () => {
    if (typeof window === 'undefined') return;

    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        let parsedUser: AuthUser | null = null;
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch {
            parsedUser = null;
          }
        }

        set({
          token: storedToken,
          user: parsedUser,
          isAuthenticated: true,
          activeView: parsedUser && (parsedUser.role === 'admin' || parsedUser.role === 'super_admin') ? 'admin' : 'chat',
        });

        // Verify validity with the backend
        try {
          const freshUser = await ApiService.getMe();
          if (freshUser) {
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            set({
              user: freshUser,
              isAuthenticated: true,
            });

            // Fetch and hydrate past chat history
            try {
              const history = await ApiService.getChatHistory();
              if (history && history.length > 0) {
                const { useStressStore } = await import('@/store/useStressStore');
                useStressStore.getState().loadChatHistory(history);
              }
            } catch (histErr) {
              console.warn('[useAuthStore] History pre-load error:', histErr);
            }
          }
        } catch {
          // Token expired or invalid
          console.warn('[useAuthStore] Stored session invalid or expired.');
          get().logout();
        }
      }
    } catch (err) {
      console.error('[useAuthStore] Initialization failed:', err);
    } finally {
      set({ isInitialized: true });
    }
  },

  /**
   * Log in user and route based on role
   */
  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ApiService.login(payload);
      if (!res || !res.access_token) {
        throw new Error('Authentication failed. No access token returned.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }

      const isPrivileged = res.user.role === 'admin' || res.user.role === 'super_admin';

      set({
        token: res.access_token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthModalOpen: false,
        error: null,
        // Route admin/super_admin to Admin Dashboard, user to Chat
        activeView: isPrivileged ? 'admin' : 'chat',
      });

      // Hydrate chat history
      try {
        const history = await ApiService.getChatHistory();
        if (history && history.length > 0) {
          const { useStressStore } = await import('@/store/useStressStore');
          useStressStore.getState().loadChatHistory(history);
        }
      } catch (histErr) {
        console.warn('[useAuthStore] Post-login history fetch failed:', histErr);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Authenticate / auto-register user via Google OAuth 2.0 ID Token
   */
  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ApiService.loginWithGoogle(credential);
      if (!res || !res.access_token) {
        throw new Error('Google authentication failed. No access token returned.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }

      const isPrivileged = res.user.role === 'admin' || res.user.role === 'super_admin';

      set({
        token: res.access_token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        isAuthModalOpen: false,
        error: null,
        activeView: isPrivileged ? 'admin' : 'chat',
      });

      // Hydrate chat history
      try {
        const history = await ApiService.getChatHistory();
        if (history && history.length > 0) {
          const { useStressStore } = await import('@/store/useStressStore');
          useStressStore.getState().loadChatHistory(history);
        }
      } catch (histErr) {
        console.warn('[useAuthStore] Google login history fetch failed:', histErr);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Register a new user / admin
   */
  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const registeredUser = await ApiService.register(payload);
      if (!registeredUser) {
        throw new Error('Registration failed. Please try again.');
      }

      // Automatically log the user in following successful registration
      return await get().login({
        email: payload.email,
        password: payload.password,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please check your inputs.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Update user profile (username, password, avatar)
   */
  updateProfile: async (payload: UpdateProfilePayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await ApiService.updateAuthProfile(payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      set({
        user: updatedUser,
        isLoading: false,
        isProfileModalOpen: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Delete user account permanently
   */
  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await ApiService.deleteAccount();
      get().logout();
      set({ isProfileModalOpen: false, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Terminate active session and clear credentials
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isProfileModalOpen: false,
      activeView: 'chat',
      error: null,
    });

    import('@/store/useStressStore').then(({ useStressStore }) => {
      useStressStore.getState().createNewSession();
    }).catch(() => {});
  },
}));
