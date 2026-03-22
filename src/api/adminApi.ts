import axiosClient from './axiosClient';
import { catalogApi } from './catalogApi';
import type { CategoryResponse } from '../types';

export interface Category {
  id: string | number;
  name: string;
  description?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
  status: string; // Active, Banned...
  active?: boolean;
  verified?: boolean;
  deleted?: boolean;
  createdAt: string;
}

export interface AdminProductQueryParams {
  keyword?: string;
  status?: string;
  categoryId?: string;
  sellerId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

type UsersPayload = {
  content?: unknown;
  items?: unknown;
  data?: unknown;
  result?: unknown;
};

const toStringSafe = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const normalizeUser = (user: unknown, index: number): UserResponse => {
  const source = (user && typeof user === 'object' ? user : {}) as Record<string, unknown>;
  const id = toStringSafe(source.id, `user-${index}`);
  const email = toStringSafe(source.email, 'unknown@example.com');
  const firstName = toStringSafe(source.firstName || source.first_name || source.givenName, toStringSafe(source.fullName, 'Unknown'));
  const lastName = toStringSafe(source.lastName || source.last_name || source.familyName, '');
  const roles = Array.isArray(source.roles)
    ? source.roles.map((value) => toStringSafe(value).toUpperCase()).filter(Boolean)
    : [];
  const role = toStringSafe(source.role, roles[0] || 'USER').toUpperCase();
  const active = typeof source.active === 'boolean' ? source.active : undefined;
  const verified = typeof source.verified === 'boolean' ? source.verified : undefined;
  const deleted = typeof source.deleted === 'boolean' ? source.deleted : undefined;
  const status = toStringSafe(source.status, active === false ? 'BANNED' : 'ACTIVE').toUpperCase();
  const createdAt = toStringSafe(source.createdAt || source.created_at, '');

  return {
    id,
    email,
    firstName,
    lastName,
    role,
    roles,
    status,
    active,
    verified,
    deleted,
    createdAt,
  };
};

const extractUsers = (payload: unknown): UserResponse[] => {
  if (Array.isArray(payload)) {
    return payload.map((user, index) => normalizeUser(user, index));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const container = payload as UsersPayload;
  const firstLevel = [container.content, container.items, container.data, container.result];

  for (const candidate of firstLevel) {
    if (Array.isArray(candidate)) {
      return candidate.map((user, index) => normalizeUser(user, index));
    }

    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.content)) {
        return nested.content.map((user, index) => normalizeUser(user, index));
      }
      if (Array.isArray(nested.items)) {
        return nested.items.map((user, index) => normalizeUser(user, index));
      }
    }
  }

  return [];
};

export const adminApi = {
  // Users Management (Assuming standard /users endpoint exists for Admin)
  getUsers: async (params?: { page?: number; size?: number; role?: string; keyword?: string; active?: boolean; verified?: boolean; deleted?: boolean; sort?: string }): Promise<UserResponse[]> => {
    const normalizedParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      role: params?.role,
      keyword: params?.keyword,
      active: params?.active,
      verified: params?.verified,
      deleted: params?.deleted,
      sort: params?.sort,
    };

    const candidates = ['/users', '/admin/users'];
    let lastError: unknown = null;

    for (const endpoint of candidates) {
      try {
        const response = await axiosClient.get(endpoint, { params: normalizedParams });
        return extractUsers(response);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
  
  updateUserRole: async (userId: string, targetRole: string) => {
    // Some implementations might be /users/{id}/role or /roles/assign
    // Depending on backend, we will try PUT /users/{id}/role 
    const response = await axiosClient.put(`/users/${userId}/role`, { role: targetRole });
    // @ts-ignore
    return response.data || response;
  },

  updateUserStatus: async (userId: string, active: boolean) => {
    const response = await axiosClient.patch(`/users/${userId}/status`, { active });
    // @ts-ignore
    return response.data || response;
  },

  grantSellerRole: async (userId: string): Promise<UserResponse> => {
    const response = await axiosClient.patch(`/users/${encodeURIComponent(userId)}/grant-seller`);
    return normalizeUser(response, 0);
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await axiosClient.get(`/users/${encodeURIComponent(userId)}`);
    return normalizeUser(response, 0);
  },

  // Vehicle Moderation
  getProducts: async (params?: AdminProductQueryParams) => {
    const response = await catalogApi.getProducts(params);
    return response.content || [];
  },

  getPendingVehicles: async (params?: { page?: number; size?: number }) => {
    const response = await catalogApi.getProducts({ ...params, status: 'PENDING' });
    return response.content || response;
  },

  approveVehicle: async (productId: string) => {
    return catalogApi.approveProduct(productId);
  },

  rejectVehicle: async (productId: string, reason?: string) => {
    return catalogApi.rejectProduct(productId, reason);
  },

  deleteProduct: async (productId: string) => {
    return catalogApi.deleteProduct(productId);
  },

  restoreProduct: async (productId: string) => {
    return catalogApi.restoreProduct(productId);
  },

  // Category Management
  getCategories: async () => {
    const response = await catalogApi.getCategories();
    const items = response.content || [];
    return items.map((item: CategoryResponse) => ({
      id: item.id || '',
      name: item.name || '',
      description: item.description,
    }));
  },

  createCategory: async (data: Omit<Category, 'id'>) => {
    const created = await catalogApi.createCategory(data);
    return {
      id: created.id || '',
      name: created.name || data.name,
      description: created.description || data.description,
    } as Category;
  },

  updateCategory: async (id: string | number, data: Omit<Category, 'id'>) => {
    const updated = await catalogApi.updateCategory(String(id), data);
    return {
      id: updated.id || id,
      name: updated.name || data.name,
      description: updated.description || data.description,
    } as Category;
  },

  deleteCategory: async (id: string | number) => {
    return catalogApi.deleteCategory(String(id));
  },

  // Auction Moderation
  cancelAuction: async (auctionId: string, reason: string = 'Admin forcefully cancelled the auction.') => {
    const response = await axiosClient.post(`/auctions/${auctionId}/cancel`, { reason });
    // @ts-ignore
    return response.data || response;
  }
};
