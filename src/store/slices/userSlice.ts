import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Profile info for current logged-in user or fetched user profiles
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  stats?: {
    auctionsWon: number;
    activeBids: number;
  };
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setProfile, clearProfile, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;
