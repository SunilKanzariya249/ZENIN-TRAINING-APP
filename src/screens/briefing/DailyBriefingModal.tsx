import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ZeninLogo } from '../../assets/icons';
import { format } from 'date-fns';
import {
  Sparkles,
  Flame,
  Zap,
  Target,
  ChevronRight,
  X,
} from 'lucide-react';

export const DailyBriefingModal: React.FC = () => {
  const {
    dailyBriefingOpen,
    setDailyBriefingOpen,
    missions,
    user,
  } = useAppStore();

  if (!dailyBriefingOpen) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayMissions = missions.filter(
    (m) => !m.archived && (m.dueDate === todayStr || (!m.dueDate && m.status === 'active'))
  );

  const highPriorityCount = todayMissions.filter(
    (m) => m.priority === 'EPIC' || m.priority === 'LEGENDARY'
  ).length;

  const totalXpAvailable = todayMissions
    .filter((m) => m.status === 'active')
    .reduce((acc, m) => acc + m.xpReward, 0);

  const primaryTarget = todayMissions.find((m) => m.status === 'active' && (m.priority === 'LEGENDARY' || m.priority === 'EPIC')) || todayMissions[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 9, 0.9)',
        backdropFilter: 'blur(14px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => setDailyBriefingOpen(false)}
    >
      <div
        className="system-box screen-fade-in"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px 20px',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
          }}
        >
          <ZeninLogo size={18} showGlow={false} />
          <span>[SYSTEM BRIEFING PROTOCOL]</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
          className="glow-text-cyan"
        >
          GOOD MORNING, HUNTER.
        </h2>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Your daily directives have been computed and synchronized.
        </p>

        {/* Telemetry Stats Grid */}
        <div
          style={{
            margin: '16px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            textAlign: 'left',
          }}
        >
          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              TODAY'S MISSIONS
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              {todayMissions.length}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-crimson)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              HIGH PRIORITY
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              {highPriorityCount}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              XP READY TO CLAIM
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              +{totalXpAvailable}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: '#F97316', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              ACTIVE STREAK
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              {user.currentStreak} DAYS
            </div>
          </div>
        </div>

        {/* Primary Focus Directive */}
        {primaryTarget && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '10px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--accent-violet)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              PRIMARY FOCUS PROTOCOL
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
              {primaryTarget.title}
            </div>
          </div>
        )}

        <button
          onClick={() => setDailyBriefingOpen(false)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
          }}
        >
          <span>BEGIN DAY</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
