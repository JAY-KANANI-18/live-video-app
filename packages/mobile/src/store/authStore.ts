import { create } from 'zustand';
import { authService, User } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string | undefined, phoneNumber: string | undefined, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  login: async (email, phoneNumber, otp) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login({ email, phoneNumber, otp });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear state anyway
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  loadStoredUser: async () => {
    try {
      set({ isLoading: true });
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const user = await authService.getStoredUser();
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Load stored user error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refreshProfile: async () => {
    try {
      const user = await authService.getProfile();
      set({ user });
    } catch (error: any) {
      console.error('Refresh profile error:', error);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        get().logout();
      }
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.updateProfile(data);
      set({
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },
}));
