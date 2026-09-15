import { Mission, FocusSession } from '../types';

export interface ProductivityBreakdown {
  score: number; // 0 - 100
  completionRate: number; // 0 - 100 percentage
  completionPoints: number; // max 35
  consistencyPoints: number; // max 25
  focusPoints: number; // max 20
  difficultyPoints: number; // max 20
  ratingTitle: string;
  explanation: string;
}

export function calculateProductivityScore(
  missions: Mission[],
  focusSessions: FocusSession[],
  currentStreak: number,
  dailyGoal = 5
): ProductivityBreakdown {
  const nonArchived = missions.filter((m) => !m.archived);
  const totalCount = nonArchived.length;
  const completedCount = nonArchived.filter((m) => m.status === 'completed').length;

  // 1. Completion Rate (Max 35 points)
  let completionPct = 0;
  if (totalCount > 0) {
    completionPct = Math.round((completedCount / totalCount) * 100);
  } else {
    completionPct = 100; // Fresh system default
  }
  const completionPoints = Math.round((completionPct / 100) * 35);

  // 2. Consistency & Streak (Max 25 points)
  // Reaching a 7-day streak yields maximum consistency points
  const streakFactor = Math.min(1, currentStreak / 7);
  const consistencyPoints = Math.round(streakFactor * 25);

  // 3. Focus Chamber Immersion (Max 20 points)
  // Target: 100 focus minutes logged
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusFactor = Math.min(1, totalFocusMinutes / 100);
  const focusPoints = Math.round(focusFactor * 20);

  // 4. Mission Difficulty & High Priority Execution (Max 20 points)
  // Evaluates how many Epic and Legendary missions have been conquered
  const completedMissions = nonArchived.filter((m) => m.status === 'completed');
  let highTierPoints = 10;
  if (completedMissions.length > 0) {
    const epicOrLegendary = completedMissions.filter(
      (m) => m.priority === 'EPIC' || m.priority === 'LEGENDARY'
    ).length;
    const highTierRatio = epicOrLegendary / completedMissions.length;
    highTierPoints = Math.round(Math.min(1, highTierRatio * 2) * 20);
  }
  const difficultyPoints = highTierPoints;

  // Total Score (0 - 100)
  const score = Math.max(0, Math.min(100, completionPoints + consistencyPoints + focusPoints + difficultyPoints));

  let ratingTitle = 'RECRUIT';
  if (score >= 90) ratingTitle = 'APEX HUNTER';
  else if (score >= 75) ratingTitle = 'VANGUARD';
  else if (score >= 60) ratingTitle = 'OPERATIVE';
  else if (score >= 40) ratingTitle = 'SCOUT';

  const explanation = `Score is computed deterministically: Completion Rate (${completionPoints}/35 pts), Consistency & Streak (${consistencyPoints}/25 pts), Deep Focus Chamber (${focusPoints}/20 pts), and High-Priority Execution (${difficultyPoints}/20 pts).`;

  return {
    score,
    completionRate: completionPct,
    completionPoints,
    consistencyPoints,
    focusPoints,
    difficultyPoints,
    ratingTitle,
    explanation,
  };
}
