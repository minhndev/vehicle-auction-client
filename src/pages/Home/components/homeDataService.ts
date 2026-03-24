import { catalogApi } from '../../../api/catalogApi';
import { auctionApi, type AuctionQueryParams } from '../../../features/bidding/api/auctionApi';
import type { AuctionResponse, CategoryResponse } from '../../../types';

const DEFAULT_PAGE = 0;

let categoriesCache: CategoryResponse[] | null = null;
let categoriesPending: Promise<CategoryResponse[] | null> | null = null;
let categoriesForbidden = false;

const isStatus = (error: unknown, status: number) => {
  if (!error || typeof error !== 'object') return false;
  const maybe = error as { response?: { status?: number } };
  return maybe.response?.status === status;
};

export const getHomeCategories = async (): Promise<CategoryResponse[] | null> => {
  if (categoriesCache) return categoriesCache;
  if (categoriesForbidden) return null;
  if (categoriesPending) return categoriesPending;

  categoriesPending = (async () => {
    try {
      const page = await catalogApi.getCategories({ page: DEFAULT_PAGE, size: 50, sort: 'name,asc' });
      const content = Array.isArray(page?.content) ? page.content : [];
      categoriesCache = content;
      return content;
    } catch (error) {
      if (isStatus(error, 403)) {
        categoriesForbidden = true;
      }
      return null;
    } finally {
      categoriesPending = null;
    }
  })();

  return categoriesPending;
};

export const getAuctionList = async (params: AuctionQueryParams): Promise<AuctionResponse[]> => {
  try {
    const page = await auctionApi.getPublicAuctions(params);
    return Array.isArray(page?.content) ? page.content : [];
  } catch {
    return [];
  }
};

export const getUpcomingAuctions = async (size: number): Promise<AuctionResponse[]> => {
  return getAuctionList({ status: 'UPCOMING', page: DEFAULT_PAGE, size });
};
