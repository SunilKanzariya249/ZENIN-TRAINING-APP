import { format, addDays, addWeeks, addMonths, isWeekend, parseISO } from 'date-fns';
import { Mission, RecurrenceRule } from '../types';

/**
 * Computes the next occurrence date string (YYYY-MM-DD) based on current due date and rule
 */
export function getNextOccurrenceDate(
  currentDueDateStr: string,
  rule: RecurrenceRule,
  interval = 1
): string {
  let date: Date;
  try {
    date = parseISO(currentDueDateStr);
  } catch {
    date = new Date();
  }

  const safeInterval = Math.max(1, interval);

  switch (rule) {
    case 'daily':
      return format(addDays(date, safeInterval), 'yyyy-MM-dd');

    case 'weekdays': {
      let nextDate = addDays(date, 1);
      while (isWeekend(nextDate)) {
        nextDate = addDays(nextDate, 1);
      }
      return format(nextDate, 'yyyy-MM-dd');
    }

    case 'weekly':
      return format(addWeeks(date, safeInterval), 'yyyy-MM-dd');

    case 'monthly':
      return format(addMonths(date, safeInterval), 'yyyy-MM-dd');

    case 'custom':
      return format(addDays(date, safeInterval), 'yyyy-MM-dd');

    case 'none':
    default:
      return currentDueDateStr;
  }
}

/**
 * Creates the next recurring instance of a completed mission
 */
export function createNextRecurringMission(completedMission: Mission): Mission | null {
  if (!completedMission.recurrence || completedMission.recurrence === 'none') {
    return null;
  }

  const baseDueDate = completedMission.dueDate || format(new Date(), 'yyyy-MM-dd');
  const nextDueDate = getNextOccurrenceDate(
    baseDueDate,
    completedMission.recurrence,
    completedMission.recurrenceInterval || 1
  );

  // Reset subtasks to uncompleted
  const resetSubtasks = (completedMission.subtasks || []).map((st) => ({
    ...st,
    id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    completed: false,
    createdAt: format(new Date(), 'yyyy-MM-dd'),
  }));

  const nextMission: Mission = {
    ...completedMission,
    id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'active',
    dueDate: nextDueDate,
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    completedAt: undefined,
    xpAwarded: false,
    subtasks: resetSubtasks,
  };

  return nextMission;
}
