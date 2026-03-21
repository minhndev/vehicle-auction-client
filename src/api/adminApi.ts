import axiosClient from './axiosClient';

export interface Category {
  id: string | number;
  name: string;
  description: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string; // Active, Banned...
  createdAt: string;
}

export const adminApi = {
  // Users Management (Assuming standard /users endpoint exists for Admin)
  getUsers: async (params?: { page?: number; size?: number; role?: string; keyword?: string }): Promise<UserResponse[]> => {
    const response = await axiosClient.get('/users', { params });
    // @ts-ignore
    return response.content || response.data?.content || response.data || response;
  },
  
  updateUserRole: async (userId: string, targetRole: string) => {
    // Some implementations might be /users/{id}/role or /roles/assign
    // Depending on backend, we will try PUT /users/{id}/role 
    const response = await axiosClient.put(`/users/${userId}/role`, { role: targetRole });
    // @ts-ignore
    return response.data || response;
  },

  updateUserStatus: async (userId: string, newStatus: string) => {
    const response = await axiosClient.put(`/users/${userId}/status`, { status: newStatus });
    // @ts-ignore
    return response.data || response;
  },

  // Vehicle Moderation
  getPendingVehicles: async (params?: { page?: number; size?: number }) => {
    const response = await axiosClient.get('/products', { params: { ...params, status: 'PENDING' } });
    // @ts-ignore
    return response.content || response.data?.content || response.data || response;
  },

  approveVehicle: async (productId: string) => {
    const response = await axiosClient.patch(`/products/${productId}/approve`);
    // @ts-ignore
    return response.data || response;
  },

  rejectVehicle: async (productId: string, reason?: string) => {
    const response = await axiosClient.patch(`/products/${productId}/reject`, { reason });
    // @ts-ignore
    return response.data || response;
  },

  // Category Management
  getCategories: async () => {
    const response = await axiosClient.get('/categories');
    // @ts-ignore
    return response.content || response.data?.content || response.data || response;
  },

  createCategory: async (data: Omit<Category, 'id'>) => {
    const response = await axiosClient.post('/categories', data);
    // @ts-ignore
    return response.data || response;
  },

  updateCategory: async (id: string | number, data: Omit<Category, 'id'>) => {
    const response = await axiosClient.put(`/categories/${id}`, data);
    // @ts-ignore
    return response.data || response;
  },

  deleteCategory: async (id: string | number) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    // @ts-ignore
    return response.data || response;
  },

  // Auction Moderation
  cancelAuction: async (auctionId: string, reason: string = 'Admin forcefully cancelled the auction.') => {
    const response = await axiosClient.post(`/auctions/${auctionId}/cancel`, { reason });
    // @ts-ignore
    return response.data || response;
  }
};
