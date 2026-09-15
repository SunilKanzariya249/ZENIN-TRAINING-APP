import React from 'react';
import { calculateLevelProgress } from '../../services/xpEngine';

interface XPProgressBarProps {
  currentXp: number;
  level: number;
  showLabels?: boolean;
  height?: number;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXp,
  level,
  showLabels = true,
  height = 8,
  className = '',
}) => {
  const { currentLevelXp, neededXp, percent } = calculateLevelProgress(currentXp, level);

  return (
    <div className={className} style={{ width: '100%' }}>
      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            EXP PROGRESS
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>{currentLevelXp.toLocaleString()}</strong> /{' '}
            {neededXp.toLocaleString()} XP{' '}
            <span style={{ color: 'var(--accent-violet)', marginLeft: '4px' }}>({percent}%)</span>
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: `${height}px`,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          padding: '1px',
        }}
      >
        {/* Animated Fill Bar */}
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            borderRadius: `${height}px`,
            background: 'linear-gradient(90deg, #06B6D4 0%, #8B5CF6 60%, #A855F7 100%)',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.8)',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
        >
          {/* Subtle light glint */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '10px',
              background: '#FFFFFF',
              opacity: 0.7,
              filter: 'blur(2px)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
