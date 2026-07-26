import axiosClient from './axiosClient';

export interface MeResponse {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatarURL?: string;
  phoneNumber?: string;
  address?: string;
}

export const userApi = {
  getMe: async (): Promise<MeResponse> => {
    return axiosClient.get('/users/me');
  },
  getUserById: async (id: string): Promise<MeResponse> => {
    return axiosClient.get(`/users/${id}`);
  },
  updateUser: async (userId: string, data: any): Promise<any> => {
    return axiosClient.put(`/users/${userId}`, data);
  },
};
