import { Mission, User, UserSettings, FocusSession, XpTransaction } from '../types';
import { format } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');

export const INITIAL_SETTINGS: UserSettings = {
  themeIntensity: 'cyber',
  soundEnabled: true,
  soundVolume: 0.7,
  hapticsEnabled: true,
  notificationsEnabled: true,
  dailyBriefingEnabled: true,
  dailyBriefingTime: '08:00',
  eveningReviewEnabled: true,
  eveningReviewTime: '21:00',
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  weekStartDay: 'monday',
  dailyMissionGoal: 5,
  dailyStepGoal: 10000,
  temperatureUnit: 'celsius',
  reducedMotion: false,
  missionDeadlineAlertsEnabled: true,
};

export const INITIAL_USER: User = {
  id: 'hunter-novice-01',
  name: 'Novice Hunter',
  email: 'hunter@zenin.network',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  level: 1,
  currentXp: 0,
  totalXpEarned: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: todayStr,
  streakFreezeAvailable: 1,
  totalMissionsCompleted: 0,
  totalFocusMinutes: 0,
  createdAt: todayStr,
  isGuest: true,
};

// Clean zero-start defaults (No dummy data)
export const SAMPLE_MISSIONS: Mission[] = [];
export const SAMPLE_FOCUS_SESSIONS: FocusSession[] = [];
export const SAMPLE_XP_TRANSACTIONS: XpTransaction[] = [];
