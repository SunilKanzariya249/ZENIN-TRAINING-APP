import React from 'react';
import { getRankForLevel } from '../../constants/ranks';

export const RankBadge: React.FC<{ level: number; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  level,
  size = 'md',
  className = '',
}) => {
  const rank = getRankForLevel(level);

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '10px', iconSize: 10 },
    md: { padding: '4px 12px', fontSize: '12px', iconSize: 12 },
    lg: { padding: '6px 16px', fontSize: '14px', iconSize: 14 },
  }[size];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeStyles.padding,
        borderRadius: '999px',
        backgroundColor: rank.badgeBg,
        border: `1px solid ${rank.badgeColor}40`,
        boxShadow: `0 0 12px -2px ${rank.badgeColor}35`,
      }}
    >
      <span
        style={{
          width: `${sizeStyles.iconSize}px`,
          height: `${sizeStyles.iconSize}px`,
          borderRadius: '50%',
          backgroundColor: rank.badgeColor,
          boxShadow: `0 0 8px ${rank.badgeColor}`,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: '#FFFFFF',
          fontSize: sizeStyles.fontSize,
          textTransform: 'uppercase',
        }}
      >
        {rank.title}
      </span>
      <span
        style={{
          color: 'var(--accent-cyan)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: sizeStyles.fontSize,
        }}
      >
        LV.{level}
      </span>
    </div>
  );
};
