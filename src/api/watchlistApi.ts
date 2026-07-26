import axiosClient from './axiosClient';
import type { WatchlistModel, ProductResponse } from '../types/index';

export interface WatchlistItem {
  watchlist: WatchlistModel;
  product?: ProductResponse;
}

export const watchlistApi = {
  getWatchlist: async (): Promise<WatchlistModel[]> => {
    return axiosClient.get('/watchlist');
  },

  addToWatchlist: async (productId: string): Promise<WatchlistModel> => {
    return axiosClient.post(`/watchlist/${productId}`);
  },

  removeFromWatchlist: async (productId: string): Promise<void> => {
    return axiosClient.delete(`/watchlist/${productId}`);
  },
};
