import { describe, it, expect, beforeEach } from 'vitest';
import { notificationService } from '../src/notifications/notificationService';
import { Mission, UserSettings } from '../src/types';

// Mock localStorage
if (typeof localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

const mockSettings: UserSettings = {
  themeIntensity: 'cyber',
  soundEnabled: true,
  soundVolume: 0.8,
  hapticsEnabled: true,
  notificationsEnabled: true,
  missionDeadlineAlertsEnabled: true,
  dailyBriefingEnabled: true,
  dailyBriefingTime: '08:00',
  eveningReviewEnabled: true,
  eveningReviewTime: '21:00',
  quietHoursStart: '23:30',
  quietHoursEnd: '06:00',
  weekStartDay: 'monday',
  dailyMissionGoal: 5,
  dailyStepGoal: 10000,
  temperatureUnit: 'celsius',
  reducedMotion: false,
};

describe('Mission Deadline Notification Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    notificationService.clearNotifiedKeys();
  });

  it('triggers notification when an active mission reaches its deadline time', () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const activeMission: Mission = {
      id: 'mission-deadline-1',
      userId: 'u1',
      title: 'Defeat Shadow Monarch In Gate',
      description: 'Clear the high-rank dungeon gate',
      priority: 'LEGENDARY',
      categoryId: 'cat-boss',
      status: 'active', // NOT completed
      archived: false,
      xpAwarded: false,
      dueDate: todayStr,
      dueTime: currentTimeStr, // Exact deadline reached!
      recurrence: 'none',
      tags: ['boss', 'dungeon'],
      subtasks: [],
      estimatedDuration: 60,
      xpReward: 500,
      createdAt: todayStr,
      updatedAt: todayStr,
      favorite: true,
    };

    let alertFired = false;
    let alertedMission: Mission | null = null;

    const triggeredIds = notificationService.checkMissionReminders(
      [activeMission],
      mockSettings,
      (m: Mission) => {
        alertFired = true;
        alertedMission = m;
      }
    );

    expect(triggeredIds).toContain('mission-deadline-1');
    expect(alertFired).toBe(true);
    expect(alertedMission).not.toBeNull();
    if (alertedMission) {
      expect((alertedMission as Mission).id).toBe('mission-deadline-1');
    }
  });

  it('does NOT trigger notification if mission is already completed', () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const completedMission: Mission = {
      id: 'mission-completed-1',
      userId: 'u1',
      title: 'Morning 5km Cardio Run',
      description: 'Aerobic conditioning',
      priority: 'RARE',
      categoryId: 'cat-fitness',
      status: 'completed', // Already completed!
      archived: false,
      xpAwarded: true,
      dueDate: todayStr,
      dueTime: currentTimeStr,
      recurrence: 'daily',
      tags: ['cardio'],
      subtasks: [],
      estimatedDuration: 30,
      xpReward: 150,
      createdAt: todayStr,
      updatedAt: todayStr,
      completedAt: todayStr,
      favorite: false,
    };

    let alertFired = false;
    const triggeredIds = notificationService.checkMissionReminders(
      [completedMission],
      mockSettings,
      () => {
        alertFired = true;
      }
    );

    expect(triggeredIds.length).toBe(0);
    expect(alertFired).toBe(false);
  });

  it('does NOT trigger notification if mission is archived', () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const archivedMission: Mission = {
      id: 'mission-archived-1',
      userId: 'u1',
      title: 'Old Tactical Directive',
      description: 'Archived task',
      priority: 'COMMON',
      categoryId: 'cat-tasks',
      status: 'archived',
      archived: true,
      xpAwarded: false,
      dueDate: todayStr,
      dueTime: currentTimeStr,
      recurrence: 'none',
      tags: [],
      subtasks: [],
      estimatedDuration: 15,
      xpReward: 50,
      createdAt: todayStr,
      updatedAt: todayStr,
      favorite: false,
    };

    const triggeredIds = notificationService.checkMissionReminders([archivedMission], mockSettings);
    expect(triggeredIds.length).toBe(0);
  });

  it('does not send duplicate notifications for the same deadline', () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const activeMission: Mission = {
      id: 'mission-dup-test',
      userId: 'u1',
      title: 'Deduplication Test Directive',
      description: '',
      priority: 'EPIC',
      categoryId: 'cat-study',
      status: 'active',
      archived: false,
      xpAwarded: false,
      dueDate: todayStr,
      dueTime: currentTimeStr,
      recurrence: 'none',
      tags: [],
      subtasks: [],
      estimatedDuration: 45,
      xpReward: 200,
      createdAt: todayStr,
      updatedAt: todayStr,
      favorite: false,
    };

    // First check: should trigger
    const firstRun = notificationService.checkMissionReminders([activeMission], mockSettings);
    expect(firstRun).toContain('mission-dup-test');

    // Second check immediately after (e.g. 10s later in same minute): should NOT trigger again
    const secondRun = notificationService.checkMissionReminders([activeMission], mockSettings);
    expect(secondRun.length).toBe(0);
  });

  it('respects missionDeadlineAlertsEnabled setting when toggled off', () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const activeMission: Mission = {
      id: 'mission-disabled-setting',
      userId: 'u1',
      title: 'Silenced Mission Directive',
      description: '',
      priority: 'COMMON',
      categoryId: 'cat-general',
      status: 'active',
      archived: false,
      xpAwarded: false,
      dueDate: todayStr,
      dueTime: currentTimeStr,
      recurrence: 'none',
      tags: [],
      subtasks: [],
      estimatedDuration: 20,
      xpReward: 80,
      createdAt: todayStr,
      updatedAt: todayStr,
      favorite: false,
    };

    const disabledSettings: UserSettings = {
      ...mockSettings,
      missionDeadlineAlertsEnabled: false,
    };

    const triggeredIds = notificationService.checkMissionReminders([activeMission], disabledSettings);
    expect(triggeredIds.length).toBe(0);
  });

  it('silences notifications during quiet hours', () => {
    const quietSettings: UserSettings = {
      ...mockSettings,
      quietHoursStart: '00:00',
      quietHoursEnd: '23:59',
    };

    expect(notificationService.isQuietHours(quietSettings)).toBe(true);
  });
});
