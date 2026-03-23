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

  loginWithGoogle: async (idToken: String): Promise<AuthResponse> => {
    return axiosClient.post('/auth/google-login', { idToken });
  },

  // Simulate getting user from token since there is no /users/me endpoint
  getCurrentUserFromToken: (token: string): UserProfile => {
    const decoded = decodeToken(token) || {};

    const extractRole = (tokenData: any): string => {
      if (typeof tokenData.role === 'string') return tokenData.role;
      const rolesArr = tokenData.roles || tokenData.authorities;
      if (Array.isArray(rolesArr) && rolesArr.length > 0) {
        if (typeof rolesArr[0] === 'string') return rolesArr[0];
        if (typeof rolesArr[0] === 'object' && rolesArr[0].authority) return rolesArr[0].authority;
        if (typeof rolesArr[0] === 'object' && rolesArr[0].name) return rolesArr[0].name;
      }
      if (typeof tokenData.scope === 'string') return tokenData.scope.split(' ')[0];
      return 'USER';
    };

    let roleStr = extractRole(decoded).replace('ROLE_', '').toUpperCase();
    if (!['ADMIN', 'SELLER', 'BIDDER', 'USER', 'MEMBER'].includes(roleStr)) {
      roleStr = 'USER';
    }

    return {
      id: decoded.accountId || decoded.sub || 'unknown-id',
      email: decoded.sub || decoded.email || '',
      role: roleStr as UserRole,
      firstName: decoded.firstName || 'User',
      lastName: decoded.lastName || '',
    };
  },
};
