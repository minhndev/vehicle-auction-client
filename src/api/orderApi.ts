import axiosClient from './axiosClient';

export interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  auctionId: string;
  productName: string;
}

export const orderApi = {
  getMyOrders: async (params?: { page?: number; size?: number; sort?: string[] }) => {
    const response = await axiosClient.get('/orders/my-orders', { params });
    return response.data || response;
  },

  getOrderById: async (id: string) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data || response;
  },

  payOrder: async (id: string, paymentMethod: string) => {
    const response = await axiosClient.post(`/orders/${id}/pay`, { paymentMethod });
    return response.data || response;
  }
};
