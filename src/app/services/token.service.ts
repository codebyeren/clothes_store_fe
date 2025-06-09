import { Injectable } from '@angular/core';
import { TokenData } from '../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  getTokenExp(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return Date.now() + 15 * 60 * 1000;
    }
  }

  getAccessToken(): string | null {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    return token;
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
  }

  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    const exp = parseInt(sessionStorage.getItem('accessTokenExp') || localStorage.getItem('accessTokenExp') || '0', 10);
    const isValid = !!token && Date.now() < exp;
    return isValid;
  }

  isRefreshTokenValid(): boolean {
    const token = this.getRefreshToken();
    const exp = parseInt(sessionStorage.getItem('refreshTokenExp') || localStorage.getItem('refreshTokenExp') || '0', 10);
    return !!token && Date.now() < exp;
  }

  saveTokens(data: TokenData): void {
    const storage = data.remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('accessTokenExp', data.accessTokenExp.toString());
    storage.setItem('refreshTokenExp', data.refreshTokenExp.toString());
  }

  clearTokens(): void {
    this.clearStorage(localStorage);
    this.clearStorage(sessionStorage);
  }

  private clearStorage(storage: Storage): void {
    storage.removeItem('accessToken');
    storage.removeItem('accessTokenExp');
    storage.removeItem('refreshToken');
    storage.removeItem('refreshTokenExp');
  }

  getCurrentUserId(): number | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  getUsername(): string | null {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return null;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (error) {
      return null;
    }
  }

  isAdmin(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return false;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isAdminUser = payload.role === 'ADMIN';
      return isAdminUser;
    } catch (error) {
      return false;
    }
  }
} 