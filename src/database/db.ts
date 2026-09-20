import { User, Mission, Category, Achievement, FocusSession, UserSettings, XpTransaction } from '../types';
import { INITIAL_USER, INITIAL_SETTINGS, SAMPLE_MISSIONS, SAMPLE_FOCUS_SESSIONS, SAMPLE_XP_TRANSACTIONS } from '../constants/seedData';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { ACHIEVEMENTS } from '../constants/achievements';
import { authService } from '../services/authService';

const STORAGE_KEYS = {
  USER: 'zenin_user_v1',
  MISSIONS: 'zenin_missions_v1',
  CATEGORIES: 'zenin_categories_v1',
  ACHIEVEMENTS: 'zenin_achievements_v1',
  FOCUS_SESSIONS: 'zenin_focus_sessions_v1',
  SETTINGS: 'zenin_settings_v1',
  XP_TRANSACTIONS: 'zenin_xp_transactions_v1',
  IS_AUTHENTICATED: 'zenin_auth_status_v1',
  HAS_ONBOARDED: 'zenin_has_onboarded_v1',
};

const DEFAULT_GUEST_USER: User = {
  id: 'hunter-guest-01',
  name: 'Novice Hunter',
  email: 'guest@zenin.network',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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
  isGuest: true,
};

export interface DatabaseState {
  user: User;
  missions: Mission[];
  categories: Category[];
  achievements: Achievement[];
  focusSessions: FocusSession[];
  settings: UserSettings;
  xpTransactions: XpTransaction[];
  isAuthenticated: boolean;
  hasOnboarded: boolean;
}

export class StorageEngine {
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public loadState(): DatabaseState {
    if (!this.isAvailable()) {
      return this.getInitialState();
    }

    try {
      const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
      const missionsRaw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      const categoriesRaw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const achievementsRaw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const focusSessionsRaw = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      const settingsRaw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const xpTxRaw = localStorage.getItem(STORAGE_KEYS.XP_TRANSACTIONS);
      const isAuthRaw = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      const hasOnboardedRaw = localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);

      return {
        user: userRaw ? JSON.parse(userRaw) : DEFAULT_GUEST_USER,
        missions: missionsRaw ? JSON.parse(missionsRaw) : SAMPLE_MISSIONS,
        categories: categoriesRaw ? JSON.parse(categoriesRaw) : DEFAULT_CATEGORIES,
        achievements: achievementsRaw ? JSON.parse(achievementsRaw) : ACHIEVEMENTS,
        focusSessions: focusSessionsRaw ? JSON.parse(focusSessionsRaw) : SAMPLE_FOCUS_SESSIONS,
        settings: settingsRaw ? JSON.parse(settingsRaw) : INITIAL_SETTINGS,
        xpTransactions: xpTxRaw ? JSON.parse(xpTxRaw) : SAMPLE_XP_TRANSACTIONS,
        isAuthenticated: isAuthRaw !== null ? JSON.parse(isAuthRaw) : false,
        hasOnboarded: hasOnboardedRaw !== null ? JSON.parse(hasOnboardedRaw) : true,
      };
    } catch (err) {
      console.error('Storage parse error, falling back to seed state:', err);
      return this.getInitialState();
    }
  }

  public saveState(state: DatabaseState): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(state.missions));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state.achievements));
      localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(state.focusSessions));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      localStorage.setItem(STORAGE_KEYS.XP_TRANSACTIONS, JSON.stringify(state.xpTransactions));
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(state.isAuthenticated));
      localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(state.hasOnboarded));

      // If user is authenticated with a phone number, keep their database vault record updated
      if (state.user && !state.user.isGuest && state.user.phone) {
        authService.persistUserDataToVault(state.user.phone, state);
      }
    } catch (err) {
      console.error('Failed to write state to localStorage:', err);
    }
  }

  public getInitialState(): DatabaseState {
    return {
      user: DEFAULT_GUEST_USER,
      missions: [],
      categories: DEFAULT_CATEGORIES,
      achievements: ACHIEVEMENTS,
      focusSessions: [],
      settings: INITIAL_SETTINGS,
      xpTransactions: [],
      isAuthenticated: false,
      hasOnboarded: true,
    };
  }

  public clearAllData(): void {
    if (!this.isAvailable()) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
}

export const storageEngine = new StorageEngine();
