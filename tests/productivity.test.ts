import { describe, it, expect } from 'vitest';
import { calculateProductivityScore } from '../src/services/productivityScore';
import { Mission, FocusSession } from '../src/types';

describe('productivityScore Service', () => {
  it('bounds the score strictly between 0 and 100', () => {
    const missions: Mission[] = [
      {
        id: 'm-1',
        userId: 'u-1',
        title: 'Task 1',
        description: '',
        priority: 'EPIC',
        categoryId: 'c-1',
        status: 'completed',
        recurrence: 'none',
        tags: [],
        subtasks: [],
        estimatedDuration: 30,
        xpReward: 150,
        createdAt: '2026-09-15',
        updatedAt: '2026-09-15',
        favorite: false,
        archived: false,
        xpAwarded: true,
      },
    ];

    const focus: FocusSession[] = [
      {
        id: 'f-1',
        durationMinutes: 45,
        xpEarned: 90,
        completedAt: '2026-09-15',
        type: 'pomodoro',
      },
    ];

    const result = calculateProductivityScore(missions, focus, 7, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.ratingTitle).toBeDefined();
    expect(result.explanation).toContain('Score is computed deterministically');
  });

  it('handles empty missions gracefully', () => {
    const result = calculateProductivityScore([], [], 0, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
