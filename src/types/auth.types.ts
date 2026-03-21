// Matches Java Enums and Role Constants
export type UserRole = 'ADMIN' | 'SELLER' | 'BIDDER' | 'USER' | 'MEMBER' | 'BUYER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Java Record: LoginRequest
export interface LoginRequest {
  email: string;
  password?: string;
}

// Java Record: RegisterRequest
export interface RegisterRequest {
  email: string;
  password?: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  birthdate: string; // LocalDate mapped as ISO Date String 'YYYY-MM-DD'
  gender: Gender;
  phoneNumber: string;
  address: string;
  avatarURL?: string;
}

// Java Record: AuthResponse
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // E.g., 'Bearer'
}

// Java Record: RefreshTokenRequest
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Global user profile mapped after login
export interface UserProfile {
  id: string; // The backend usually provides this via /me or decoded from JWT
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarURL?: string;
}

// Global Application Exception mapping
export interface AppExceptionResponse {
  code: number;
  message: string;
}
