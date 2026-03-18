import axiosClient from '../../../api/axiosClient';
import type { Auction } from '../types';

export interface PageAuctionResponse {
  content: Auction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const auctionApi = {
  getPublicAuctions: async (params?: { page?: number; size?: number; sort?: string[] }) => {
    const response = await axiosClient.get<PageAuctionResponse>('/auctions', { params });
    return response.data || response;
  },

  getAuctionById: async (id: string) => {
    const response = await axiosClient.get<Auction>(`/auctions/${id}`);
    return response.data || response;
  },

  // other endpoints...
};
