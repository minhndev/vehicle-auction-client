import axiosClient from './axiosClient';

export const watchlistApi = {
  getWatchlist: async () => {
    const response = await axiosClient.get('/watchlist');
    return response.data || response;
  },

  addToWatchlist: async (productId: string) => {
    const response = await axiosClient.post(`/watchlist/${productId}`);
    return response.data || response;
  },

  removeFromWatchlist: async (productId: string) => {
    const response = await axiosClient.delete(`/watchlist/${productId}`);
    return response.data || response;
  }
};
