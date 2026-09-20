import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/authService';
import { migrationService } from '../src/services/migrationService';
import { User, Mission, FocusSession, Achievement, XpTransaction } from '../src/types';

describe('Direct Mobile Number & Password Authentication (No OTP)', () => {
  beforeEach(() => {
    authService.clearMemoryVault();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('formats phone numbers into E.164 international standard', () => {
    expect(authService.formatPhoneE164('9876543210', '+91')).toBe('+919876543210');
    expect(authService.formatPhoneE164('+91 98765-43210')).toBe('+919876543210');
    expect(authService.formatPhoneE164('(555) 123-4567', '+1')).toBe('+15551234567');
    expect(authService.formatPhoneE164('+44 7911 123456')).toBe('+447911123456');
  });

  it('signs up a new hunter directly with mobile number and password without OTP', async () => {
    const testPhone = '+919988776655';
    const testPassword = 'hunterSecretPassword123';
    const testName = 'Ren Vanguard Alpha';

    const signupRes = await authService.signUpWithPhonePassword(testPhone, testPassword, testName);

    expect(signupRes.success).toBe(true);
    expect(signupRes.user).toBeDefined();
    expect(signupRes.user?.name).toBe(testName);
    expect(signupRes.user?.phone).toBe(testPhone);
    expect(signupRes.user?.isGuest).toBe(false);
  });

  it('logs in an existing hunter with mobile number and password directly without OTP', async () => {
    const testPhone = '+919876500112';
    const testPassword = 'mySecurePassword';

    // 1. Sign up
    await authService.signUpWithPhonePassword(testPhone, testPassword, 'Shadow Monarch');

    // 2. Log in with same mobile and password
    const loginRes = await authService.loginWithPhonePassword(testPhone, testPassword);
    expect(loginRes.success).toBe(true);
    expect(loginRes.user).toBeDefined();
    expect(loginRes.user?.phone).toBe(testPhone);
    expect(loginRes.user?.name).toBe('Shadow Monarch');
  });

  it('rejects login with incorrect password', async () => {
    const testPhone = '+919876500113';
    const testPassword = 'correctPassword';

    await authService.signUpWithPhonePassword(testPhone, testPassword, 'Jin Woo');

    const wrongLogin = await authService.loginWithPhonePassword(testPhone, 'wrongPassword');
    expect(wrongLogin.success).toBe(false);
    expect(wrongLogin.error).toContain('Invalid access key');
  });

  it('rejects sign up if mobile number is already registered', async () => {
    const testPhone = '+919876500114';
    const testPassword = 'password123';

    const first = await authService.signUpWithPhonePassword(testPhone, testPassword, 'Hunter 1');
    expect(first.success).toBe(true);

    const duplicate = await authService.signUpWithPhonePassword(testPhone, testPassword, 'Hunter 2');
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toContain('already exists');
  });
});

describe('Guest-to-Account Migration Engine (Zero Data Loss)', () => {
  it('merges guest progress, preserving highest level, XP, and missions', async () => {
    const authenticatedUser: User = {
      id: 'auth-user-999',
      name: 'Hunter 6655',
      phone: '+919988776655',
      email: '9988776655@zenin.network',
      avatar: 'https://example.com/avatar.png',
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
      isGuest: false,
    };

    const guestMissions: Mission[] = [
      {
        id: 'guest-m-1',
        userId: 'guest-user-123',
        title: 'Clear Shadow Dungeon (10km Run)',
        description: 'Physical rank enhancement',
        priority: 'EPIC',
        categoryId: 'cat-fitness',
        status: 'completed',
        dueDate: '2026-09-15',
        recurrence: 'none',
        tags: ['run', 'rank'],
        subtasks: [],
        estimatedDuration: 60,
        xpReward: 120,
        createdAt: '2026-09-15 10:00:00',
        updatedAt: '2026-09-15 11:00:00',
        completedAt: '2026-09-15 11:00:00',
        favorite: true,
        archived: false,
        xpAwarded: true,
      },
      {
        id: 'guest-m-2',
        userId: 'guest-user-123',
        title: 'Awaken Void Blade (Design Specs)',
        description: 'Architecture review',
        priority: 'LEGENDARY',
        categoryId: 'cat-work',
        status: 'active',
        dueDate: '2026-09-16',
        recurrence: 'none',
        tags: ['code'],
        subtasks: [],
        estimatedDuration: 90,
        xpReward: 200,
        createdAt: '2026-09-15 12:00:00',
        updatedAt: '2026-09-15 12:00:00',
        favorite: false,
        archived: false,
        xpAwarded: false,
      },
    ];

    const guestFocus: FocusSession[] = [
      {
        id: 'focus-1',
        missionId: 'guest-m-2',
        missionTitle: 'Awaken Void Blade (Design Specs)',
        durationMinutes: 45,
        xpEarned: 90,
        completedAt: '2026-09-15 14:00:00',
        type: 'pomodoro',
      },
    ];

    const guestUser: User = {
      id: 'guest-user-123',
      name: 'Novice Guest',
      email: 'guest@zenin.local',
      avatar: 'https://example.com/guest.png',
      level: 4,
      currentXp: 350,
      totalXpEarned: 1850,
      currentStreak: 3,
      bestStreak: 5,
      lastActiveDate: '2026-09-15',
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 12,
      totalFocusMinutes: 180,
      createdAt: '2026-09-10',
      isGuest: true,
    };

    const guestAchievements: Achievement[] = [
      {
        id: 'first_mission',
        name: 'FIRST AWAKENING',
        description: 'Conquer your initial mission directive.',
        icon: 'target',
        category: 'missions',
        requirement: 'Complete 1 mission',
        unlocked: true,
        unlockedAt: '2026-09-11 10:00:00',
        progress: 1,
        maxProgress: 1,
        rewardXp: 100,
      },
    ];

    const guestXpTx: XpTransaction[] = [
      {
        id: 'tx-1',
        sourceId: 'guest-m-1',
        sourceType: 'mission',
        amount: 120,
        timestamp: '2026-09-15 11:00:00',
        reason: 'mission_completion',
        uniqueEventId: 'ev-1',
      },
    ];

    const res = await migrationService.migrateGuestToAccount(authenticatedUser, {
      user: guestUser,
      missions: guestMissions,
      focusSessions: guestFocus,
      achievements: guestAchievements,
      xpTransactions: guestXpTx,
    });

    expect(res.success).toBe(true);
    expect(res.mergedUser.level).toBe(4);
    expect(res.mergedUser.totalXpEarned).toBe(1850);
    expect(res.mergedUser.phone).toBe('+919988776655');
    expect(res.mergedUser.isGuest).toBe(false);

    expect(res.mergedMissions.length).toBe(2);
    expect(res.mergedMissions[0].userId).toBe('auth-user-999');
    expect(res.mergedMissions[1].userId).toBe('auth-user-999');

    expect(res.mergedFocusSessions.length).toBe(1);
    expect(res.mergedAchievements.find((a) => a.id === 'first_mission')?.unlocked).toBe(true);
    expect(res.mergedXpTransactions.length).toBe(1);
  });
});
