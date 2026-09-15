import React from 'react';
import {
  Briefcase,
  User,
  Heart,
  BookOpen,
  DollarSign,
  Cpu,
  Flame,
  ShoppingCart,
  Layers,
  Sword,
  ShieldAlert,
  Zap,
  Award,
  Moon,
  Clock,
  Crown,
  FastForward,
  GitBranch,
  CheckCircle2,
  Hourglass,
  LucideProps,
} from 'lucide-react';

export const ZeninLogo: React.FC<{ size?: number; showGlow?: boolean; className?: string }> = ({
  size = 36,
  showGlow = true,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter: showGlow ? 'drop-shadow(0px 0px 8px rgba(139, 92, 246, 0.6))' : undefined,
      }}
    >
      <defs>
        <linearGradient id="zeninGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="45%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="coreGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#00F5FF" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Frame */}
      <polygon
        points="50,5 88,27 88,73 50,95 12,73 12,27"
        stroke="url(#zeninGrad)"
        strokeWidth="4"
        fill="rgba(10, 14, 23, 0.85)"
      />

      {/* Futuristic Angular 'Z' Sigil */}
      <path
        d="M28 32 L72 32 L36 68 L72 68"
        stroke="url(#zeninGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hunter Core Diamond */}
      <polygon points="50,44 56,50 50,56 44,50" fill="url(#coreGrad)" />
    </svg>
  );
};

export const CategoryIcon: React.FC<{ name: string; size?: number; color?: string; className?: string }> = ({
  name,
  size = 18,
  color,
  className = '',
}) => {
  const iconProps: LucideProps = { size, color, className };

  switch (name) {
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'User':
      return <User {...iconProps} />;
    case 'Heart':
      return <Heart {...iconProps} />;
    case 'BookOpen':
      return <BookOpen {...iconProps} />;
    case 'DollarSign':
      return <DollarSign {...iconProps} />;
    case 'Cpu':
      return <Cpu {...iconProps} />;
    case 'Flame':
      return <Flame {...iconProps} />;
    case 'ShoppingCart':
      return <ShoppingCart {...iconProps} />;
    case 'Layers':
    default:
      return <Layers {...iconProps} />;
  }
};

export const AchievementIcon: React.FC<{ name: string; size?: number; color?: string; className?: string }> = ({
  name,
  size = 20,
  color = '#F59E0B',
  className = '',
}) => {
  const iconProps: LucideProps = { size, color, className };

  switch (name) {
    case 'Sword':
      return <Sword {...iconProps} />;
    case 'ShieldAlert':
      return <ShieldAlert {...iconProps} />;
    case 'Flame':
      return <Flame {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'Moon':
      return <Moon {...iconProps} />;
    case 'Clock':
      return <Clock {...iconProps} />;
    case 'Crown':
      return <Crown {...iconProps} />;
    case 'FastForward':
      return <FastForward {...iconProps} />;
    case 'GitBranch':
      return <GitBranch {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'Hourglass':
      return <Hourglass {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};
