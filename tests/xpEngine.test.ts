import { describe, it, expect } from 'vitest';
import { getXpRequiredForLevel, calculateLevelProgress, awardUserXp, calculateMissionXp } from '../src/services/xpEngine';
import { User } from '../src/types';

describe('xpEngine Service', () => {
  it('computes progressive XP requirements', () => {
    const lvl1Req = getXpRequiredForLevel(1);
    const lvl2Req = getXpRequiredForLevel(2);
    const lvl5Req = getXpRequiredForLevel(5);

    expect(lvl1Req).toBeGreaterThan(0);
    expect(lvl2Req).toBeGreaterThan(lvl1Req);
    expect(lvl5Req).toBeGreaterThan(lvl2Req);
  });

  it('calculates progress breakdown correctly', () => {
    const progress = calculateLevelProgress(50, 1);
    expect(progress.percent).toBeGreaterThanOrEqual(0);
    expect(progress.percent).toBeLessThanOrEqual(100);
    expect(progress.currentLevelXp).toBe(50);
  });

  it('awards XP and levels up the user atomically', () => {
    const initialUser: User = {
      id: 'test-hunter',
      name: 'Test Hunter',
      email: 'test@zenin.local',
      avatar: '',
      level: 1,
      currentXp: 50,
      totalXpEarned: 50,
      currentStreak: 1,
      bestStreak: 1,
      lastActiveDate: '2026-09-15',
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 0,
      totalFocusMinutes: 0,
      createdAt: '2026-09-15',
    };

    // Need ~150 XP for level 1
    const req = getXpRequiredForLevel(1);
    const result = awardUserXp(initialUser, req);

    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
    expect(result.updatedUser.level).toBe(2);
    expect(result.updatedUser.totalXpEarned).toBe(50 + req);
  });

  it('handles multi-level jumps on massive XP gain', () => {
    const initialUser: User = {
      id: 'test-hunter',
      name: 'Test Hunter',
      email: 'test@zenin.local',
      avatar: '',
      level: 1,
      currentXp: 0,
      totalXpEarned: 0,
      currentStreak: 1,
      bestStreak: 1,
      lastActiveDate: '2026-09-15',
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 0,
      totalFocusMinutes: 0,
      createdAt: '2026-09-15',
    };

    const massiveXp = 5000;
    const result = awardUserXp(initialUser, massiveXp);

    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBeGreaterThan(5);
    expect(result.updatedUser.totalXpEarned).toBe(massiveXp);
  });

  it('calculates mission XP with subtask bonuses', () => {
    const commonBase = calculateMissionXp('COMMON', 0);
    const commonWithSubtasks = calculateMissionXp('COMMON', 3);
    const epicBase = calculateMissionXp('EPIC', 0);

    expect(commonWithSubtasks).toBe(commonBase + 30);
    expect(epicBase).toBeGreaterThan(commonBase);
  });
});
