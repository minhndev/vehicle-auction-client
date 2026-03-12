import axiosClient from '../../../api/axiosClient';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest 
} from '../../../types/auth.types';
import type { UserProfile } from '../../../types/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', credentials);
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/register', userData);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/refresh-token', data);
  },

  verifyAccount: async (token: string): Promise<void> => {
    return axiosClient.get(`/auth/verify?token=${token}`);
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return axiosClient.get('/users/me');
  },
};
