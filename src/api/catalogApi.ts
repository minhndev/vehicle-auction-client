import axiosClient from './axiosClient';
import type {
  CategoryRequest,
  CategoryResponse,
  PageCategoryResponse,
  PageProductResponse,
  ProductRequest,
  ProductResponse,
} from '../types';

export interface ProductQueryParams {
  keyword?: string;
  status?: string;
  categoryId?: string;
  sellerId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CategoryQueryParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const catalogApi = {
  // Products
  getProducts: async (params?: ProductQueryParams): Promise<PageProductResponse> => {
    return axiosClient.get('/products', { params });
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    return axiosClient.get(`/products/${id}`);
  },

  createProduct: async (data: ProductRequest): Promise<ProductResponse> => {
    return axiosClient.post('/products', data);
  },

  updateProduct: async (id: string, data: ProductRequest): Promise<ProductResponse> => {
    return axiosClient.put(`/products/${id}`, data);
  },

  approveProduct: async (id: string): Promise<ProductResponse> => {
    return axiosClient.patch(`/products/${id}/approve`);
  },

  rejectProduct: async (id: string, reason?: string): Promise<ProductResponse> => {
    return axiosClient.patch(`/products/${id}/reject`, { reason });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return axiosClient.delete(`/products/${id}`);
  },

  restoreProduct: async (id: string): Promise<ProductResponse> => {
    return axiosClient.patch(`/products/${id}/restore`);
  },

  // Categories
  getCategories: async (params?: CategoryQueryParams): Promise<PageCategoryResponse> => {
    return axiosClient.get('/categories', { params });
  },

  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    return axiosClient.get(`/categories/${id}`);
  },

  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    return axiosClient.post('/categories', data);
  },

  updateCategory: async (id: string, data: CategoryRequest): Promise<CategoryResponse> => {
    return axiosClient.put(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return axiosClient.delete(`/categories/${id}`);
  },

  restoreCategory: async (id: string): Promise<CategoryResponse> => {
    return axiosClient.patch(`/categories/${id}/restore`);
  },
};
