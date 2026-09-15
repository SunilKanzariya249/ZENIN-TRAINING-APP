import { User } from '../types';
import { INITIAL_USER } from '../constants/seedData';

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

class AuthService {
  private registeredUsersKey = 'zenin_registered_users_vault';

  private getVault(): Record<string, { passwordHash: string; user: User }> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(this.registeredUsersKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveVault(vault: Record<string, { passwordHash: string; user: User }>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.registeredUsersKey, JSON.stringify(vault));
  }

  // Simple, deterministic client-side hash
  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hsh_${Math.abs(hash).toString(16)}`;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();
    const vault = this.getVault();

    // Default admin / demo hunter
    if (trimmedEmail === 'ren.vanguard@zenin.network' || trimmedEmail === 'hunter@zenin.app') {
      return {
        success: true,
        user: INITIAL_USER,
        token: `zenin_tok_${Date.now()}`,
      };
    }

    const existing = vault[trimmedEmail];
    if (!existing) {
      return { success: false, error: 'Hunter not found with this neural link (email).' };
    }

    if (existing.passwordHash !== this.hashPassword(password)) {
      return { success: false, error: 'Invalid access key (password).' };
    }

    return {
      success: true,
      user: existing.user,
      token: `zenin_tok_${Date.now()}`,
    };
  }

  public async signUp(name: string, email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, error: 'All fields are mandatory to awaken the System.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Access key must be at least 6 characters.' };
    }

    const vault = this.getVault();
    if (vault[trimmedEmail]) {
      return { success: false, error: 'A Hunter is already registered with this email.' };
    }

    const newUser: User = {
      id: `hunter-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      level: 1,
      currentXp: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 0,
      totalFocusMinutes: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      isGuest: false,
    };

    vault[trimmedEmail] = {
      passwordHash: this.hashPassword(password),
      user: newUser,
    };
    this.saveVault(vault);

    return {
      success: true,
      user: newUser,
      token: `zenin_tok_${Date.now()}`,
    };
  }

  public createGuestUser(): User {
    return {
      id: `guest-hunter-${Date.now().toString().slice(-4)}`,
      name: 'Novice Hunter',
      email: 'guest@zenin.local',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      level: 1,
      currentXp: 0,
      totalXpEarned: 0,
      currentStreak: 1,
      bestStreak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 0,
      totalFocusMinutes: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      isGuest: true,
    };
  }

  public requestPasswordReset(email: string): { success: boolean; message: string } {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    return {
      success: true,
      message: `System reset beacon dispatched to ${trimmed}. Check your inbox.`,
    };
  }
}

export const authService = new AuthService();
