import { User, Priority } from '../types';
import { PRIORITIES } from '../constants/priorities';
import { getRankForLevel } from '../constants/ranks';

/**
 * Calculates XP required to advance from `level` to `level + 1`.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 0) return 100;
  // Deterministic progressive scaling curve
  // Level 1: 100 XP, Level 5: ~880 XP, Level 27: ~3,000 XP
  return Math.round(100 * Math.pow(level, 1.25) + 50 * level);
}

/**
 * Calculates level progress breakdown
 */
export function calculateLevelProgress(
  currentXp: number,
  level: number
): { currentLevelXp: number; neededXp: number; percent: number } {
  const neededXp = getXpRequiredForLevel(level);
  const safeCurrent = Math.max(0, currentXp);
  const percent = Math.min(100, Math.round((safeCurrent / neededXp) * 100));
  return {
    currentLevelXp: safeCurrent,
    neededXp,
    percent,
  };
}

/**
 * Calculates default XP for a mission
 */
export function calculateMissionXp(priority: Priority, subtaskCount = 0, customXp?: number): number {
  if (customXp && customXp > 0) return customXp;
  const base = PRIORITIES[priority]?.defaultXp || 50;
  const subtaskBonus = subtaskCount * 10;
  return base + subtaskBonus;
}

export interface AddXpResult {
  updatedUser: User;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  oldRank: string;
  newRank: string;
  gainedXp: number;
}

/**
 * Atomically awards XP to a user, handling multi-level jumps and rank upgrades.
 */
export function awardUserXp(user: User, amount: number): AddXpResult {
  const oldLevel = user.level;
  const oldRank = getRankForLevel(oldLevel).title;

  let level = user.level;
  let currentXp = user.currentXp + amount;
  const totalXpEarned = user.totalXpEarned + amount;

  let leveledUp = false;

  // Handle possible multi-level jumps if massive XP awarded
  while (true) {
    const requiredForCurrent = getXpRequiredForLevel(level);
    if (currentXp >= requiredForCurrent) {
      currentXp -= requiredForCurrent;
      level += 1;
      leveledUp = true;
    } else {
      break;
    }
  }

  const newRank = getRankForLevel(level).title;

  const updatedUser: User = {
    ...user,
    level,
    currentXp,
    totalXpEarned,
  };

  return {
    updatedUser,
    leveledUp,
    oldLevel,
    newLevel: level,
    oldRank,
    newRank,
    gainedXp: amount,
  };
}
