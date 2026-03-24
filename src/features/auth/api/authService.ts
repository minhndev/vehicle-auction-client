import axiosClient from '../../../api/axiosClient';
import type {
  AuthResponse,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest
} from '../../../types/auth.types';
import type { UserRole, UserProfile } from '../../../types/auth.types';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const GOOGLE_OAUTH2_AUTHORIZE_PATH = '/oauth2/authorization/google';
const GOOGLE_OAUTH2_AUTHORIZE_URL_OVERRIDE = import.meta.env.VITE_GOOGLE_OAUTH2_AUTHORIZE_URL;

const joinApiUrl = (baseUrl: string, path: string): string => {
  const sanitizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${sanitizedBase}${normalizedPath}`;
};

const getBackendOrigin = (baseUrl: string): string => {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return 'http://localhost:8080';
  }
};

const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ROLE_PRIORITY: UserRole[] = ['ADMIN', 'SELLER', 'BUYER', 'MEMBER', 'USER', 'BIDDER'];

const normalizeRoleToken = (roleLike: string): string[] => {
  return roleLike
    .split(/[\s,]+/)
    .map((value) => value.replace('ROLE_', '').trim().toUpperCase())
    .filter(Boolean);
};

const pickBestRole = (candidates: string[]): UserRole => {
  const normalized = candidates
    .map((value) => value.replace('ROLE_', '').trim().toUpperCase())
    .filter((value) => ['ADMIN', 'SELLER', 'BIDDER', 'USER', 'MEMBER', 'BUYER'].includes(value));

  for (const role of ROLE_PRIORITY) {
    if (normalized.includes(role)) {
      return role;
    }
  }

  return 'USER';
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', credentials);
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/google-login', data);
  },

  getGoogleOAuth2AuthorizeUrl: (): string => {
    if (GOOGLE_OAUTH2_AUTHORIZE_URL_OVERRIDE) {
      return GOOGLE_OAUTH2_AUTHORIZE_URL_OVERRIDE;
    }

    return joinApiUrl(getBackendOrigin(API_BASE_URL), GOOGLE_OAUTH2_AUTHORIZE_PATH);
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/register', userData);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/refresh-token', data);
  },

  logout: async (): Promise<void> => {
    return axiosClient.post('/auth/logout');
  },

  verifyAccount: async (token: string): Promise<void> => {
    return axiosClient.get(`/auth/verify?token=${token}`);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    return axiosClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    return axiosClient.post('/auth/reset-password', data);
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return axiosClient.get('/users/me');
  },

  // Simulate getting user from token since there is no /users/me endpoint
  getCurrentUserFromToken: (token: string): UserProfile => {
    const decoded = decodeToken(token) || {};

    const extractRole = (tokenData: any): UserRole => {
      const roleCandidates: string[] = [];

      if (typeof tokenData.role === 'string') {
        roleCandidates.push(...normalizeRoleToken(tokenData.role));
      }

      const rolesArr = tokenData.roles || tokenData.authorities;
      if (Array.isArray(rolesArr) && rolesArr.length > 0) {
        for (const item of rolesArr) {
          if (typeof item === 'string') {
            roleCandidates.push(...normalizeRoleToken(item));
          }
          if (item && typeof item === 'object') {
            const authority = (item as Record<string, unknown>).authority;
            const name = (item as Record<string, unknown>).name;
            if (typeof authority === 'string') {
              roleCandidates.push(...normalizeRoleToken(authority));
            }
            if (typeof name === 'string') {
              roleCandidates.push(...normalizeRoleToken(name));
            }
          }
        }
      }

      if (typeof tokenData.scope === 'string') {
        roleCandidates.push(...normalizeRoleToken(tokenData.scope));
      }

      return pickBestRole(roleCandidates);
    };

    const roleStr = extractRole(decoded);

    return {
      id: decoded.accountId || decoded.sub || 'unknown-id',
      email: decoded.sub || decoded.email || '',
      role: roleStr,
      firstName: decoded.firstName || 'User',
      lastName: decoded.lastName || '',
    };
  },
};
