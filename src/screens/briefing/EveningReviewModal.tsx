import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ZeninLogo } from '../../assets/icons';
import { format } from 'date-fns';
import {
  Moon,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';

export const EveningReviewModal: React.FC = () => {
  const {
    eveningReviewOpen,
    setEveningReviewOpen,
    missions,
    focusSessions,
    user,
  } = useAppStore();

  if (!eveningReviewOpen) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Completed missions today
  const completedToday = missions.filter(
    (m) => m.status === 'completed' && m.completedAt && m.completedAt.startsWith(todayStr)
  );

  // Incomplete missions for today
  const incompleteToday = missions.filter(
    (m) => m.status === 'active' && !m.archived && m.dueDate === todayStr
  );

  const xpEarnedToday = completedToday.reduce((acc, m) => acc + m.xpReward, 0);

  // Focus time today
  const focusTodayMinutes = focusSessions
    .filter((f) => f.completedAt && f.completedAt.startsWith(todayStr))
    .reduce((acc, f) => acc + f.durationMinutes, 0);

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
      onClick={() => setEveningReviewOpen(false)}
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
            color: 'var(--accent-violet)',
            fontWeight: 700,
          }}
        >
          <Moon size={16} color="var(--accent-violet)" />
          <span>[EVENING RECON PROTOCOL]</span>
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
          className="glow-text-violet"
        >
          CYCLE DEBRIEFING
        </h2>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Day cycle complete. Reviewing tactical output.
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
              CLEARED MISSIONS
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#10B981' }}>
              {completedToday.length}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              XP CONQUERED
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              +{xpEarnedToday}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-violet)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              FOCUS CHAMBER
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              {Math.floor(focusTodayMinutes / 60)}h {focusTodayMinutes % 60}m
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px' }}>
            <div style={{ fontSize: '10px', color: '#F97316', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              CURRENT STREAK
            </div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
              {user.currentStreak} DAYS
            </div>
          </div>
        </div>

        {/* Incomplete Missions Section: "What remains?" */}
        {incompleteToday.length > 0 ? (
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                color: '#F59E0B',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={13} color="#F59E0B" />
              <span>WHAT REMAINS? ({incompleteToday.length} OUTSTANDING)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {incompleteToday.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  • {m.title}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#10B981',
              fontWeight: 600,
            }}
          >
            All scheduled missions conquered. Flawless execution.
          </div>
        )}

        <button
          onClick={() => setEveningReviewOpen(false)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
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
          <span>CONCLUDE DEBRIEFING</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
