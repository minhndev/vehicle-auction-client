import axiosClient from './axiosClient';

export interface Category {
  id: string | number;
  name: string;
  description: string;
}

export const adminApi = {
  // Vehicle Moderation
  getPendingVehicles: async (params?: { page?: number; size?: number }) => {
    // Assuming GET /products?status=PENDING or similar endpoint exists. 
    // Fallback to GET /products if specific endpoint is omitted, for demonstration.
    const response = await axiosClient.get('/products', { params: { ...params, status: 'PENDING' } });
    return response.data || response;
  },

  approveVehicle: async (productId: string) => {
    const response = await axiosClient.post(`/products/${productId}/approve`);
    return response.data || response;
  },

  rejectVehicle: async (productId: string, reason?: string) => {
    // Some implementations use POST /products/{id}/reject with a body.
    const response = await axiosClient.post(`/products/${productId}/reject`, { reason });
    return response.data || response;
  },

  // Category Management
  getCategories: async () => {
    const response = await axiosClient.get('/categories');
    return response.data || response;
  },

  createCategory: async (data: Omit<Category, 'id'>) => {
    const response = await axiosClient.post('/categories', data);
    return response.data || response;
  },

  updateCategory: async (id: string | number, data: Omit<Category, 'id'>) => {
    const response = await axiosClient.put(`/categories/${id}`, data);
    return response.data || response;
  },

  deleteCategory: async (id: string | number) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data || response;
  },

  // Auction Moderation
  cancelAuction: async (auctionId: string) => {
    const response = await axiosClient.post(`/auctions/${auctionId}/cancel`);
    return response.data || response;
  }
};
