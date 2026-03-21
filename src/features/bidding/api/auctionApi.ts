import axiosClient from '../../../api/axiosClient';
import type { AuctionResponse, PageAuctionResponse, BidRequest, BidResponse } from '../../../types/index';

export interface AuctionQueryParams {
  keyword?: string;
  status?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const auctionApi = {
  getPublicAuctions: async (params?: AuctionQueryParams): Promise<PageAuctionResponse> => {
    return axiosClient.get('/auctions', { params });
  },

  getAuctionById: async (id: string): Promise<AuctionResponse> => {
    return axiosClient.get(`/auctions/${id}`);
  },

  placeBid: async (auctionId: string, data: BidRequest): Promise<BidResponse> => {
    return axiosClient.post(`/auctions/${auctionId}/bids`, data);
  },

  getAuctionBids: async (auctionId: string): Promise<BidResponse[]> => {
    return axiosClient.get(`/auctions/${auctionId}/bids`);
  },
};
