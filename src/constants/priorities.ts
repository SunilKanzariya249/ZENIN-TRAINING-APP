import { Priority } from '../types';

export interface PriorityConfig {
  id: Priority;
  label: string;
  defaultXp: number;
  minXp: number;
  maxXp: number;
  color: string;
  glowColor: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
}

export const PRIORITIES: Record<Priority, PriorityConfig> = {
  COMMON: {
    id: 'COMMON',
    label: 'COMMON',
    defaultXp: 35,
    minXp: 10,
    maxXp: 50,
    color: '#38BDF8', // Cyan
    glowColor: 'rgba(56, 189, 248, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    textColor: '#7DD3FC',
    badgeBg: 'rgba(14, 165, 233, 0.2)',
    description: 'Routine missions and minor tasks',
  },
  RARE: {
    id: 'RARE',
    label: 'RARE',
    defaultXp: 75,
    minXp: 50,
    maxXp: 100,
    color: '#3B82F6', // Royal Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    textColor: '#93C5FD',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    description: 'Standard objectives with moderate impact',
  },
  EPIC: {
    id: 'EPIC',
    label: 'EPIC',
    defaultXp: 175,
    minXp: 100,
    maxXp: 250,
    color: '#A855F7', // Electric Violet
    glowColor: 'rgba(168, 85, 247, 0.45)',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0.7) 100%)',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    textColor: '#D8B4FE',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    description: 'Critical milestones with high priority',
  },
  LEGENDARY: {
    id: 'LEGENDARY',
    label: 'LEGENDARY',
    defaultXp: 350,
    minXp: 250,
    maxXp: 600,
    color: '#F43F5E', // Crimson / Rose
    glowColor: 'rgba(244, 63, 94, 0.55)',
    bgGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(234, 179, 8, 0.1) 50%, rgba(15, 23, 42, 0.8) 100%)',
    borderColor: 'rgba(244, 63, 94, 0.5)',
    textColor: '#FDA4AF',
    badgeBg: 'rgba(244, 63, 94, 0.25)',
    description: 'Monumental challenges that redefine your limits',
  },
};
