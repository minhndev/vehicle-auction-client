import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, AuthResponse } from '../../types/auth.types';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const loadUserFromStorage = (): UserProfile | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr) as UserProfile; } catch { return null; }
};

const storedToken = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: loadUserFromStorage(),
  accessToken: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; tokens: AuthResponse }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.tokens.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      // Persist tokens
      localStorage.setItem('accessToken', action.payload.tokens.accessToken);
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
      // Persist user role/info for easy reload (optional, alternatively fetch `/auth/me` on app load)
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    hydrateUser: (state) => {
      // Helper to restore user state from localStorage on page load
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          state.user = JSON.parse(userStr);
        } catch {
          // ignore
        }
      }
    }
  },
});

export const { setCredentials, logout, setLoading, setError, hydrateUser } = authSlice.actions;

export default authSlice.reducer;
