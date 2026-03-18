import axiosClient from '../../../api/axiosClient';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest 
} from '../../../types/auth.types';
import type { UserRole, UserProfile } from '../../../types/auth.types';

const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

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

  // Simulate getting user from token since there is no /users/me endpoint
  getCurrentUserFromToken: (token: string): UserProfile => {
    const decoded = decodeToken(token) || {};
    
    // Spring Security typically puts roles in an array, e.g. ["ROLE_USER"] or ["BUYER"]
    let role: UserRole = 'BIDDER';
    if (Array.isArray(decoded.roles) && decoded.roles.length > 0) {
       role = decoded.roles[0].replace('ROLE_', '') as UserRole;
    } else if (typeof decoded.role === 'string') {
       role = decoded.role.replace('ROLE_', '') as UserRole;
    }

    return {
      id: decoded.id || decoded.sub || 'unknown-id',
      email: decoded.sub || decoded.email || '',
      role: role || 'BIDDER',
      firstName: decoded.firstName || 'User',
      lastName: decoded.lastName || '',
    };
  },
};
