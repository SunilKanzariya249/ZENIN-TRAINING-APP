import { describe, it, expect } from 'vitest';
import { recordUserActivity } from '../src/services/streakEngine';
import { User } from '../src/types';

describe('streakEngine Service', () => {
  const baseUser: User = {
    id: 'streak-hunter',
    name: 'Streak Hunter',
    email: 'streak@zenin.local',
    avatar: '',
    level: 10,
    currentXp: 100,
    totalXpEarned: 1000,
    currentStreak: 5,
    bestStreak: 10,
    lastActiveDate: '2026-09-14',
    streakFreezeAvailable: 1,
    totalMissionsCompleted: 20,
    totalFocusMinutes: 100,
    createdAt: '2026-09-01',
  };

  it('increments streak when active on consecutive day', () => {
    // Yesterday was 2026-09-14, today is 2026-09-15
    const res = recordUserActivity(baseUser, '2026-09-15');
    expect(res.streakIncremented).toBe(true);
    expect(res.currentStreak).toBe(6);
    expect(res.updatedUser.currentStreak).toBe(6);
    expect(res.updatedUser.lastActiveDate).toBe('2026-09-15');
  });

  it('maintains streak without incrementing if already recorded today', () => {
    const todayUser: User = {
      ...baseUser,
      lastActiveDate: '2026-09-15',
    };
    const res = recordUserActivity(todayUser, '2026-09-15');
    expect(res.streakIncremented).toBe(false);
    expect(res.currentStreak).toBe(5);
  });

  it('consumes streak freeze when 1 day was missed', () => {
    // Last active was 2026-09-13, missed 2026-09-14, now 2026-09-15 (2 days diff)
    const missedDayUser: User = {
      ...baseUser,
      lastActiveDate: '2026-09-13',
      streakFreezeAvailable: 1,
    };
    const res = recordUserActivity(missedDayUser, '2026-09-15');
    expect(res.freezeConsumed).toBe(true);
    expect(res.streakBroken).toBe(false);
    expect(res.updatedUser.streakFreezeAvailable).toBe(0);
    expect(res.currentStreak).toBe(6);
  });

  it('resets streak to 1 when multiple days missed without freeze', () => {
    const brokenUser: User = {
      ...baseUser,
      lastActiveDate: '2026-09-10',
      streakFreezeAvailable: 0,
    };
    const res = recordUserActivity(brokenUser, '2026-09-15');
    expect(res.streakBroken).toBe(true);
    expect(res.currentStreak).toBe(1);
    expect(res.bestStreak).toBe(10); // Preserves best streak
  });
});
