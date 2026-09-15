import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  streakFreezeAvailable?: number;
  compact?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  bestStreak,
  streakFreezeAvailable = 0,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'rgba(249, 115, 22, 0.15)',
          border: '1px solid rgba(249, 115, 22, 0.35)',
          borderRadius: '8px',
          color: '#FB923C',
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <Flame size={14} color="#F97316" fill="#F97316" />
        <span>{currentStreak}D</span>
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(249, 115, 22, 0.3)',
          }}
        >
          <Flame size={20} color="#FB923C" fill="#F97316" />
        </div>
        <div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            HUNTER STREAK
          </div>
          <div
            style={{
              fontSize: '16px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            {currentStreak}{' '}
            <span style={{ fontSize: '12px', color: '#FB923C', fontWeight: 600 }}>DAYS</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          RECORD: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{bestStreak}D</strong>
        </div>
        {streakFreezeAvailable > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ShieldCheck size={11} color="var(--accent-cyan)" />
            <span>FREEZE ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
};
