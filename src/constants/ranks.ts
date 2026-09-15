import { Rank } from '../types';

export const RANKS: Rank[] = [
  {
    title: 'NOVICE',
    minLevel: 1,
    maxLevel: 4,
    badgeColor: '#94A3B8', // Slate
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    description: 'Freshly awakened. Learning the foundational laws of the System.',
    perks: ['Standard Mission Access', 'Daily Streak Tracking'],
  },
  {
    title: 'INITIATE',
    minLevel: 5,
    maxLevel: 9,
    badgeColor: '#38BDF8', // Cyan
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    description: 'Disciplined and focused. The System manifests with greater clarity.',
    perks: ['Focus Mode Access', 'Custom Tags Unlocked'],
  },
  {
    title: 'HUNTER',
    minLevel: 10,
    maxLevel: 17,
    badgeColor: '#3B82F6', // Blue
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    description: 'A proven operative capable of executing difficult missions.',
    perks: ['Epic Mission XP Boost (+5%)', 'Daily Briefing AI Synthesis'],
  },
  {
    title: 'ELITE HUNTER',
    minLevel: 18,
    maxLevel: 24,
    badgeColor: '#8B5CF6', // Purple
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    description: 'Unflinching consistency. High-priority objectives are second nature.',
    perks: ['Streak Freeze Reserve (+1)', 'Advanced Calendar Heatmap'],
  },
  {
    title: 'MASTER',
    minLevel: 25,
    maxLevel: 34,
    badgeColor: '#A855F7', // Violet
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    description: 'Mastery over personal time and willpower. A beacon in the darkness.',
    perks: ['Legendary Mission Multiplier (+10%)', 'Audio Frequency Modulation'],
  },
  {
    title: 'ASCENDANT',
    minLevel: 35,
    maxLevel: 49,
    badgeColor: '#F59E0B', // Amber / Gold
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    description: 'Transcendental focus. Obstacles dissolve into pure progression.',
    perks: ['Infinite Subtask Trees', 'System Chrono Overdrive'],
  },
  {
    title: 'ARCHON',
    minLevel: 50,
    maxLevel: 69,
    badgeColor: '#EC4899', // Pink / Magenta
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    description: 'Ruler of destiny and focus. Only a handful ever reach this threshold.',
    perks: ['Apex Productivity Aura', 'Archon Title Frame'],
  },
  {
    title: 'ZENIN',
    minLevel: 70,
    maxLevel: 999,
    badgeColor: '#00F5FF', // Neon Cyan / Cosmic
    badgeBg: 'rgba(0, 245, 255, 0.3)',
    description: 'The pinnacle of existence. Absolute harmony of willpower and output.',
    perks: ['Absolute System Synchronization', 'Legendary Sovereign Aura'],
  },
];

export function getRankForLevel(level: number): Rank {
  const found = RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel);
  return found || RANKS[RANKS.length - 1];
}
