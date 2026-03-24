import axiosClient from '../../../api/axiosClient';
import type { AuctionRequest, AuctionResponse, PageAuctionResponse, BidRequest, BidResponse } from '../../../types/index';

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

export interface BidHistoryQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

const normalizeBidHistory = (payload: unknown): BidResponse[] => {
  const candidates: unknown[] = [payload];

  if (payload && typeof payload === 'object') {
    const root = payload as { data?: unknown; content?: unknown[]; items?: unknown[]; result?: unknown };
    candidates.push(root.data, root.content, root.items, root.result);

    if (root.data && typeof root.data === 'object') {
      const nested = root.data as { content?: unknown[]; items?: unknown[]; result?: unknown };
      candidates.push(nested.content, nested.items, nested.result);
    }
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as BidResponse[];
    }
  }

  return [];
};

export const auctionApi = {
  createAuction: async (data: AuctionRequest): Promise<AuctionResponse> => {
    return axiosClient.post('/auctions', data);
  },

  getPublicAuctions: async (params?: AuctionQueryParams): Promise<PageAuctionResponse> => {
    return axiosClient.get('/auctions', { params });
  },

  getAuctionById: async (id: string): Promise<AuctionResponse> => {
    return axiosClient.get(`/auctions/${id}`);
  },

  placeBid: async (auctionId: string, data: BidRequest): Promise<BidResponse> => {
    return axiosClient.post(`/auctions/${auctionId}/bids`, data);
  },

  getAuctionBids: async (auctionId: string, params?: BidHistoryQueryParams): Promise<BidResponse[]> => {
    const hasParams = params && Object.keys(params).length > 0;
    const response = await axiosClient.get(`/auctions/${auctionId}/bids`, hasParams ? { params } : undefined);
    return normalizeBidHistory(response);
  },
};
