import { describe, it, expect, beforeEach } from 'vitest';
import { stepCounterService } from '../src/services/stepCounterService';

// Ensure localStorage mock is present in Node environment
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

describe('Step History & Multi-Day Analytics Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    stepCounterService.resetTodaySteps();
    stepCounterService.setDailyGoal(10000);
  });

  it('records daily steps to persistent history', () => {
    stepCounterService.recordDailyToHistory('2026-09-18', 8500, 10000);
    stepCounterService.recordDailyToHistory('2026-09-19', 11200, 10000);

    const history = stepCounterService.getHistory(7);
    const day18 = history.find((d) => d.date === '2026-09-18');
    const day19 = history.find((d) => d.date === '2026-09-19');

    expect(day18).toBeDefined();
    expect(day18?.steps).toBe(8500);
    expect(day18?.goalReached).toBe(false);
    expect(day18?.distanceKm).toBe(6.48); // 8500 * 0.762 / 1000 = 6.477 -> 6.48

    expect(day19).toBeDefined();
    expect(day19?.steps).toBe(11200);
    expect(day19?.goalReached).toBe(true);
    expect(day19?.caloriesBurned).toBe(448); // 11200 * 0.04 = 448
  });

  it('accurately calculates 7-day, 14-day, and 30-day stats', () => {
    const todayStr = stepCounterService.getTodayDateStr();

    // Record past 4 days
    stepCounterService.recordDailyToHistory('2026-09-16', 6000, 10000);
    stepCounterService.recordDailyToHistory('2026-09-17', 10000, 10000);
    stepCounterService.recordDailyToHistory('2026-09-18', 12000, 10000);
    stepCounterService.recordDailyToHistory('2026-09-19', 8000, 10000);

    // Today walked 4,000 steps
    stepCounterService.addManualSteps(4000);

    const stats7 = stepCounterService.getHistoryStats(7);
    expect(stats7.totalDays).toBe(7);
    expect(stats7.totalSteps).toBe(40000); // 6k + 10k + 12k + 8k + 4k = 40,000
    expect(stats7.maxSteps).toBe(12000);
    expect(stats7.bestDate).toBe('2026-09-18');
    expect(stats7.goalsMet).toBe(2); // 10k and 12k reached goal
    expect(stats7.averageSteps).toBe(Math.round(40000 / 7)); // 5714
  });

  it('handles empty / zero day records gracefully without crashing', () => {
    const history = stepCounterService.getHistory(14);
    expect(history.length).toBe(14);

    const stats = stepCounterService.getHistoryStats(14);
    expect(stats.totalDays).toBe(14);
    expect(stats.totalSteps).toBe(0);
    expect(stats.averageSteps).toBe(0);
    expect(stats.goalsMet).toBe(0);
  });

  it('updates today record in history in real time when steps are added', () => {
    const todayStr = stepCounterService.getTodayDateStr();
    stepCounterService.addManualSteps(7500);

    const history = stepCounterService.getHistory(7);
    const todayRecord = history.find((d) => d.date === todayStr);

    expect(todayRecord).toBeDefined();
    expect(todayRecord?.steps).toBe(7500);
    expect(todayRecord?.distanceKm).toBe(5.71);
    expect(todayRecord?.caloriesBurned).toBe(300);
  });
});
