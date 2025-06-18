import { ApiResponse } from './api-response.model';

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExp: number;
  refreshTokenExp: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExp: number;
  refreshTokenExp: number;
  remember?: boolean;
}

export type AuthResponse<T> = ApiResponse<T>; 