import axiosClient from './axiosClient';
import type { NotificationModel } from '../types/index';

export interface UnreadCountResponse {
  count: number;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; size?: number }): Promise<NotificationModel[]> => {
    return axiosClient.get('/notifications', { params });
  },

  getUnreadCount: async (): Promise<number> => {
    return axiosClient.get('/notifications/unread-count');
  },

  // PATCH — not PUT — per FRONTEND_INTEGRATION.md §12
  markAsRead: async (id: string): Promise<void> => {
    return axiosClient.patch(`/notifications/${id}/read`);
  },
};
