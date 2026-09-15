import { User, Mission, FocusSession, Achievement } from '../types';
import { format } from 'date-fns';

export function evaluateAchievements(
  user: User,
  missions: Mission[],
  focusSessions: FocusSession[],
  currentAchievements: Achievement[]
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const completedMissions = missions.filter((m) => m.status === 'completed');
  const totalSubtasksCreated = missions.reduce((acc, m) => acc + (m.subtasks?.length || 0), 0);

  // Count late night missions (completed between 22:00 and 04:00)
  const lateNightMissionsCount = completedMissions.filter((m) => {
    if (!m.completedAt) return false;
    const timeMatch = m.completedAt.match(/\s(\d\d):/);
    if (!timeMatch) return false;
    const hour = parseInt(timeMatch[1], 10);
    return hour >= 22 || hour < 4;
  }).length;

  const hasLegendaryCompleted = completedMissions.some((m) => m.priority === 'LEGENDARY');

  const updatedAchievements = currentAchievements.map((ach) => {
    if (ach.unlocked) return ach;

    let currentProgress = ach.progress;
    let shouldUnlock = false;

    switch (ach.id) {
      case 'ach-first-blood':
        currentProgress = completedMissions.length >= 1 ? 1 : 0;
        shouldUnlock = currentProgress >= 1;
        break;

      case 'ach-rising-hunter':
        currentProgress = user.level;
        shouldUnlock = user.level >= 5;
        break;

      case 'ach-consistency':
        currentProgress = Math.min(ach.maxProgress, user.currentStreak);
        shouldUnlock = user.currentStreak >= 7;
        break;

      case 'ach-unstoppable':
        currentProgress = Math.min(ach.maxProgress, user.currentStreak);
        shouldUnlock = user.currentStreak >= 30;
        break;

      case 'ach-mission-master':
        currentProgress = Math.min(ach.maxProgress, completedMissions.length);
        shouldUnlock = completedMissions.length >= 100;
        break;

      case 'ach-night-owl':
        currentProgress = Math.min(ach.maxProgress, lateNightMissionsCount);
        shouldUnlock = lateNightMissionsCount >= 10;
        break;

      case 'ach-focus-master':
        currentProgress = Math.min(ach.maxProgress, focusSessions.length);
        shouldUnlock = focusSessions.length >= 20;
        break;

      case 'ach-legend':
        currentProgress = hasLegendaryCompleted ? 1 : 0;
        shouldUnlock = hasLegendaryCompleted;
        break;

      case 'ach-speedrunner': {
        // Count completions grouped by date
        const countsByDay: Record<string, number> = {};
        completedMissions.forEach((m) => {
          if (m.completedAt) {
            const day = m.completedAt.split(' ')[0] || m.completedAt.split('T')[0];
            countsByDay[day] = (countsByDay[day] || 0) + 1;
          }
        });
        const maxInSingleDay = Object.values(countsByDay).reduce((max, c) => Math.max(max, c), 0);
        currentProgress = Math.min(ach.maxProgress, maxInSingleDay);
        shouldUnlock = maxInSingleDay >= 5;
        break;
      }

      case 'ach-architect':
        currentProgress = Math.min(ach.maxProgress, totalSubtasksCreated);
        shouldUnlock = totalSubtasksCreated >= 10;
        break;

      case 'ach-perfect-day': {
        // Check if all scheduled missions for today are completed
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayMissions = missions.filter((m) => m.dueDate === todayStr && !m.archived);
        const allDone = todayMissions.length > 0 && todayMissions.every((m) => m.status === 'completed');
        currentProgress = allDone ? 1 : 0;
        shouldUnlock = allDone;
        break;
      }

      case 'ach-chrono-knight':
        currentProgress = Math.min(ach.maxProgress, user.totalFocusMinutes);
        shouldUnlock = user.totalFocusMinutes >= 500;
        break;

      default:
        break;
    }

    if (shouldUnlock) {
      const unlockedAch: Achievement = {
        ...ach,
        unlocked: true,
        progress: ach.maxProgress,
        unlockedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return {
      ...ach,
      progress: currentProgress,
    };
  });

  return { updatedAchievements, newlyUnlocked };
}
