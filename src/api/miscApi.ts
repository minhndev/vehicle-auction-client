import axiosClient from './axiosClient';

export const miscApi = {
  // Roles
  getRoles: async (params?: { page?: number; size?: number; keyword?: string }) => {
    const response = await axiosClient.get('/roles', { params });
    return response.data || response;
  },
  getRoleById: async (id: string | number) => {
    const response = await axiosClient.get(`/roles/${id}`);
    return response.data || response;
  },
  createRole: async (data: { name: string; description: string }) => {
    const response = await axiosClient.post('/roles', data);
    return response.data || response;
  },
  updateRole: async (id: string | number, data: { name?: string; description?: string; permissionIds?: string[] }) => {
    const response = await axiosClient.put(`/roles/${id}`, data);
    return response.data || response;
  },
  deleteRole: async (id: string | number) => {
    const response = await axiosClient.delete(`/roles/${id}`);
    return response.data || response;
  },
  restoreRole: async (id: string | number) => {
    const response = await axiosClient.patch(`/roles/${id}/restore`);
    return response.data || response;
  },

  // Permissions
  getPermissions: async (params?: { page?: number; size?: number; keyword?: string; groupName?: string }) => {
    const response = await axiosClient.get('/permissions', { params });
    return response.data || response;
  },
  getPermissionById: async (id: string | number) => {
    const response = await axiosClient.get(`/permissions/${id}`);
    return response.data || response;
  },
  createPermission: async (data: { name: string; groupName: string; description: string }) => {
    const response = await axiosClient.post('/permissions', data);
    return response.data || response;
  },

  // Auth Verify
  verifyAccount: async (token: string) => {
    const response = await axiosClient.get(`/auth/verify?token=${encodeURIComponent(token)}`);
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
  },

  verifyVnPayIpn: async (queryString: string) => {
    const response = await axiosClient.get(`/payments/vnpay-ipn${queryString}`);
    return response.data || response;
  }
};
