import { describe, it, expect } from 'vitest';
import { getNextOccurrenceDate, createNextRecurringMission } from '../src/services/recurrenceEngine';
import { Mission } from '../src/types';

describe('recurrenceEngine Service', () => {
  it('calculates daily recurrence correctly', () => {
    const next = getNextOccurrenceDate('2026-09-15', 'daily', 1);
    expect(next).toBe('2026-09-16');
  });

  it('calculates weekly recurrence correctly', () => {
    const next = getNextOccurrenceDate('2026-09-15', 'weekly', 1);
    expect(next).toBe('2026-09-22');
  });

  it('generates next recurring mission clone with reset subtasks and new ID', () => {
    const original: Mission = {
      id: 'm-orig-1',
      userId: 'u-1',
      title: 'Workout session',
      description: '',
      priority: 'RARE',
      categoryId: 'cat-fitness',
      status: 'completed',
      dueDate: '2026-09-15',
      recurrence: 'daily',
      tags: ['fitness'],
      subtasks: [
        { id: 'st-1', title: 'Warmup', completed: true, createdAt: '2026-09-15' },
      ],
      estimatedDuration: 30,
      xpReward: 80,
      createdAt: '2026-09-15',
      updatedAt: '2026-09-15',
      favorite: false,
      archived: false,
      xpAwarded: true,
    };

    const next = createNextRecurringMission(original);
    expect(next).not.toBeNull();
    expect(next?.id).not.toBe(original.id);
    expect(next?.status).toBe('active');
    expect(next?.dueDate).toBe('2026-09-16');
    expect(next?.xpAwarded).toBe(false);
    expect(next?.subtasks[0].completed).toBe(false);
  });
});
