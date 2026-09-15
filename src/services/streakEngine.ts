import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { User, Mission, FocusSession } from '../types';

export interface StreakCheckResult {
  updatedUser: User;
  streakIncremented: boolean;
  streakBroken: boolean;
  freezeConsumed: boolean;
  currentStreak: number;
  bestStreak: number;
}

/**
 * Checks if a specific day is marked as active
 */
export function isDayActive(dateStr: string, missions: Mission[], focusSessions: FocusSession[]): boolean {
  const hasCompletedMission = missions.some(
    (m) => m.status === 'completed' && m.completedAt && m.completedAt.startsWith(dateStr)
  );
  if (hasCompletedMission) return true;

  const hasFocusSession = focusSessions.some(
    (f) => f.completedAt && f.completedAt.startsWith(dateStr) && f.durationMinutes >= 15
  );
  return hasFocusSession;
}

/**
 * Calculates and updates streak safely upon qualifying action
 */
export function recordUserActivity(
  user: User,
  todayStr: string = format(new Date(), 'yyyy-MM-dd')
): StreakCheckResult {
  const lastActive = user.lastActiveDate;

  // Already active today
  if (lastActive === todayStr) {
    return {
      updatedUser: user,
      streakIncremented: false,
      streakBroken: false,
      freezeConsumed: false,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
    };
  }

  // Calculate day difference
  let daysDiff = 1;
  if (lastActive) {
    try {
      const lastDate = parseISO(lastActive);
      const currDate = parseISO(todayStr);
      daysDiff = differenceInCalendarDays(currDate, lastDate);
    } catch {
      daysDiff = 1;
    }
  }

  let currentStreak = user.currentStreak;
  let freezeConsumed = false;
  let streakBroken = false;
  let streakFreezeAvailable = user.streakFreezeAvailable;

  if (daysDiff === 1) {
    // Yesterday was active! Advance streak
    currentStreak += 1;
  } else if (daysDiff === 2 && streakFreezeAvailable > 0) {
    // Missed yesterday, but consumed streak freeze
    streakFreezeAvailable -= 1;
    freezeConsumed = true;
    currentStreak += 1; // Resumed with freeze
  } else if (daysDiff > 1) {
    // Streak broken
    streakBroken = true;
    currentStreak = 1;
  } else {
    // First time or edge case
    currentStreak = Math.max(1, currentStreak);
  }

  const bestStreak = Math.max(user.bestStreak, currentStreak);

  const updatedUser: User = {
    ...user,
    currentStreak,
    bestStreak,
    lastActiveDate: todayStr,
    streakFreezeAvailable,
  };

  return {
    updatedUser,
    streakIncremented: !streakBroken && daysDiff === 1,
    streakBroken,
    freezeConsumed,
    currentStreak,
    bestStreak,
  };
}
