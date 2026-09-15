import React from 'react';
import { Priority } from '../../types';
import { PRIORITIES } from '../../constants/priorities';

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md'; showXp?: boolean }> = ({
  priority,
  size = 'md',
  showXp = false,
}) => {
  const config = PRIORITIES[priority] || PRIORITIES.COMMON;

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 6px' : '3px 8px',
        borderRadius: '6px',
        background: config.badgeBg,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor,
        fontSize: isSmall ? '10px' : '11px',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        letterSpacing: '0.05em',
        boxShadow: `0 0 10px -2px ${config.glowColor}`,
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: isSmall ? '4px' : '6px',
          height: isSmall ? '4px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          boxShadow: `0 0 6px ${config.color}`,
        }}
      />
      {config.label}
      {showXp && <span style={{ opacity: 0.85, marginLeft: '2px' }}>+{config.defaultXp} XP</span>}
    </span>
  );
};
