import axiosClient from './axiosClient';

export const miscApi = {
  // Roles
  getRoles: async () => {
    const response = await axiosClient.get('/roles');
    return response.data || response;
  },
  createRole: async (data: { name: string; description: string }) => {
    const response = await axiosClient.post('/roles', data);
    return response.data || response;
  },
  deleteRole: async (id: string | number) => {
    const response = await axiosClient.delete(`/roles/${id}`);
    return response.data || response;
  },
  restoreRole: async (id: string | number) => {
    const response = await axiosClient.put(`/roles/${id}/restore`);
    return response.data || response;
  },

  // Auth Verify
  verifyAccount: async (token: string) => {
    // Some systems use POST /auth/verify { token } or GET /auth/verify?token=
    const response = await axiosClient.post('/auth/verify', { token });
    return response.data || response;
  },

  // Deposits / Wallet
  getDeposits: async (params?: { page?: number; size?: number }) => {
    const response = await axiosClient.get('/deposits', { params });
    return response.data || response;
  },

  // Payment Return
  verifyVnPayReturn: async (queryString: string) => {
    // Provide the raw query string from url
    const response = await axiosClient.get(`/payments/vnpay-return${queryString}`);
    return response.data || response;
  }
};
