import axiosClient from './axiosClient';

export interface Notification {
  id: string;
  message: string;
  type: 'AUCTION_WON' | 'OUTBID' | 'SYSTEM' | 'PAYMENT_SUCCESS';
  read: boolean;
  createdAt: string;
  referenceId?: string;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; size?: number }) => {
    const response = await axiosClient.get('/notifications', { params });
    return response.data || response;
  },

  getUnreadCount: async () => {
    const response = await axiosClient.get('/notifications/unread-count');
    return response;
  },

  markAsRead: async (id: string) => {
    const response = await axiosClient.put(`/notifications/${id}/read`);
    return response.data || response;
  }
};
