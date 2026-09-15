export type Priority = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type MissionStatus = 'active' | 'completed' | 'archived';

export type RecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Mission {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  categoryId: string;
  status: MissionStatus;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startDate?: string;
  reminderTime?: string;
  recurrence: RecurrenceRule;
  recurrenceInterval?: number; // e.g. every X days/weeks
  tags: string[];
  subtasks: Subtask[];
  estimatedDuration: number; // in minutes
  xpReward: number;
  customXp?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  attachments?: Attachment[];
  favorite: boolean;
  archived: boolean;
  xpAwarded: boolean;
}

export interface Rank {
  title: string;
  minLevel: number;
  maxLevel: number;
  badgeColor: string;
  badgeBg: string;
  description: string;
  perks: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  currentXp: number;
  totalXpEarned: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakFreezeAvailable: number;
  totalMissionsCompleted: number;
  totalFocusMinutes: number;
  createdAt: string;
  isGuest?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rewardXp: number;
  category: 'missions' | 'streak' | 'levels' | 'focus' | 'special';
}

export interface FocusSession {
  id: string;
  missionId?: string;
  missionTitle?: string;
  durationMinutes: number;
  xpEarned: number;
  completedAt: string;
  type: 'pomodoro' | 'custom' | 'short_break' | 'long_break';
}

export interface UserSettings {
  themeIntensity: 'cyber' | 'void' | 'neon';
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  dailyBriefingEnabled: boolean;
  dailyBriefingTime: string; // e.g. "08:00"
  eveningReviewEnabled: boolean;
  eveningReviewTime: string; // e.g. "20:00"
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  weekStartDay: 'sunday' | 'monday';
  dailyMissionGoal: number;
  reducedMotion: boolean;
}

export interface XpTransaction {
  id: string;
  sourceId: string;
  sourceType: 'mission' | 'focus' | 'achievement' | 'streak_bonus';
  amount: number;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  type: 'level_up' | 'mission_cleared' | 'achievement_unlocked' | 'streak_milestone' | 'system_alert';
  title: string;
  subtitle?: string;
  message: string;
  xp?: number;
  newRank?: string;
  newLevel?: number;
  timestamp: string;
}

export interface ProductivityStats {
  totalCompleted: number;
  totalCreated: number;
  completionRate: number;
  productivityScore: number;
  weeklyXp: { day: string; date: string; xp: number; completedCount: number }[];
  categoryDistribution: { categoryId: string; count: number; name: string; color: string }[];
  priorityDistribution: { priority: Priority; count: number }[];
  mostProductiveDay: string;
  mostProductiveHour: string;
  averageTasksPerDay: number;
}
