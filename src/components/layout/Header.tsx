import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RankBadge } from '../rpg/RankBadge';
import { Bell, Sparkles, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, notes, setNotesModalOpen, setDailyBriefingOpen, setEveningReviewOpen } = useAppStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Hunter.';
    if (hour < 18) return 'Good afternoon, Hunter.';
    return 'Good evening, Hunter.';
  };

  const isNight = new Date().getHours() >= 18;

  return (
    <header
      style={{
        padding: '12px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(5, 7, 11, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Hunter Identity & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--accent-violet)',
            boxShadow: '0 0 10px var(--accent-violet-glow)',
          }}
        >
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 6px #10B981',
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {getGreeting()}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{user.name}</span>
          </div>
        </div>
      </div>

      {/* Right controls: Rank Badge, Notes quick access & Briefing Beacon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RankBadge level={user.level} size="sm" />

        <button
          onClick={() => setNotesModalOpen(true)}
          title="Tactical Notes & Logs"
          style={{
            position: 'relative',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '8px',
            padding: '6px',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={16} />
          {notes && notes.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '14px',
                height: '14px',
                borderRadius: '7px',
                backgroundColor: 'var(--accent-cyan)',
                color: '#000',
                fontSize: '9px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px',
                boxShadow: '0 0 6px rgba(6, 182, 212, 0.6)',
              }}
            >
              {notes.length > 99 ? '99+' : notes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => (isNight ? setEveningReviewOpen(true) : setDailyBriefingOpen(true))}
          title="System Briefing"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            padding: '6px',
            color: 'var(--accent-violet)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={16} />
        </button>
      </div>
    </header>
  );
};
