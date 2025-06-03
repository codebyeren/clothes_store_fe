import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'reset_password_session';

  private generateSessionId(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  setResetSession(sessionId?: string): string {
    const finalSessionId = sessionId || this.generateSessionId();
    localStorage.setItem(this.SESSION_KEY, finalSessionId);
    return finalSessionId;
  }

  getResetSession(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  clearResetSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  hasValidResetSession(): boolean {
    return !!this.getResetSession();
  }
} 