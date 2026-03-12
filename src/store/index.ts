import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import auctionReducer from './slices/auctionSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    auction: auctionReducer,
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
