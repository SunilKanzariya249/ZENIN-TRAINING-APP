import { User, Mission, Category, Achievement, FocusSession, UserSettings, XpTransaction, Note } from '../types';
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
  NOTES: 'zenin_notes_v1',
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
  notes: Note[];
  isAuthenticated: boolean;
  hasOnboarded: boolean;
}

export class StorageEngine {
  private memoryStore: Record<string, string> = {};

  private getStorage(): { getItem(key: string): string | null; setItem(key: string, val: string): void; removeItem(key: string): void } {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
    return {
      getItem: (key: string) => this.memoryStore[key] || null,
      setItem: (key: string, val: string) => {
        this.memoryStore[key] = val;
      },
      removeItem: (key: string) => {
        delete this.memoryStore[key];
      },
    };
  }

  private isAvailable(): boolean {
    return true;
  }

  public loadState(): DatabaseState {
    const storage = this.getStorage();

    try {
      const userRaw = storage.getItem(STORAGE_KEYS.USER);
      const missionsRaw = storage.getItem(STORAGE_KEYS.MISSIONS);
      const categoriesRaw = storage.getItem(STORAGE_KEYS.CATEGORIES);
      const achievementsRaw = storage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const focusSessionsRaw = storage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      const settingsRaw = storage.getItem(STORAGE_KEYS.SETTINGS);
      const xpTxRaw = storage.getItem(STORAGE_KEYS.XP_TRANSACTIONS);
      const notesRaw = storage.getItem(STORAGE_KEYS.NOTES);
      const isAuthRaw = storage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      const hasOnboardedRaw = storage.getItem(STORAGE_KEYS.HAS_ONBOARDED);

      return {
        user: userRaw ? JSON.parse(userRaw) : DEFAULT_GUEST_USER,
        missions: missionsRaw ? JSON.parse(missionsRaw) : SAMPLE_MISSIONS,
        categories: categoriesRaw ? JSON.parse(categoriesRaw) : DEFAULT_CATEGORIES,
        achievements: achievementsRaw ? JSON.parse(achievementsRaw) : ACHIEVEMENTS,
        focusSessions: focusSessionsRaw ? JSON.parse(focusSessionsRaw) : SAMPLE_FOCUS_SESSIONS,
        settings: settingsRaw ? JSON.parse(settingsRaw) : INITIAL_SETTINGS,
        xpTransactions: xpTxRaw ? JSON.parse(xpTxRaw) : SAMPLE_XP_TRANSACTIONS,
        notes: notesRaw ? JSON.parse(notesRaw) : [],
        isAuthenticated: isAuthRaw !== null ? JSON.parse(isAuthRaw) : false,
        hasOnboarded: hasOnboardedRaw !== null ? JSON.parse(hasOnboardedRaw) : true,
      };
    } catch (err) {
      console.error('Storage parse error, falling back to seed state:', err);
      return this.getInitialState();
    }
  }

  public saveState(state: DatabaseState): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      storage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(state.missions));
      storage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
      storage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state.achievements));
      storage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(state.focusSessions));
      storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
      storage.setItem(STORAGE_KEYS.XP_TRANSACTIONS, JSON.stringify(state.xpTransactions));
      storage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(state.notes || []));
      storage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(state.isAuthenticated));
      storage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(state.hasOnboarded));

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
      notes: [],
      isAuthenticated: false,
      hasOnboarded: true,
    };
  }

  public clearAllData(): void {
    const storage = this.getStorage();
    Object.values(STORAGE_KEYS).forEach((key) => storage.removeItem(key));
    this.memoryStore = {};
  }
}

export const storageEngine = new StorageEngine();
