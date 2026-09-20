import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SystemNotification } from '../../types';
import { triggerMissionClearParticles, triggerLevelUpExplosion } from '../../animations/particles';
import { ZeninLogo } from '../../assets/icons';
import { ChevronRight, Zap, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SystemModalProps {
  notification: SystemNotification | null;
  onDismiss: () => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({ notification, onDismiss }) => {
  const { completeMission } = useAppStore();
  useEffect(() => {
    if (!notification) return;

    if (notification.type === 'level_up') {
      triggerLevelUpExplosion();
    } else if (notification.type === 'mission_cleared') {
      triggerMissionClearParticles();
    }
  }, [notification]);

  if (!notification) return null;

  const isLevelUp = notification.type === 'level_up';
  const isDeadlineAlert = !!notification.isDeadlineAlert;

  const handleCompleteNow = () => {
    if (notification.missionId) {
      completeMission(notification.missionId);
    }
    onDismiss();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 9, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onDismiss}
    >
      <div
        className="system-box screen-fade-in"
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '24px 20px',
          textAlign: 'center',
          borderColor: isDeadlineAlert
            ? '#F59E0B'
            : isLevelUp
            ? 'rgba(0, 245, 255, 0.6)'
            : 'rgba(139, 92, 246, 0.5)',
          boxShadow: isDeadlineAlert
            ? '0 0 45px -5px rgba(245, 158, 11, 0.4), 0 0 20px -2px rgba(239, 68, 68, 0.3)'
            : isLevelUp
            ? '0 0 45px -5px rgba(0, 245, 255, 0.4), 0 0 20px -2px rgba(139, 92, 246, 0.5)'
            : '0 0 35px -5px rgba(139, 92, 246, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: isDeadlineAlert
              ? '#F59E0B'
              : isLevelUp
              ? 'var(--accent-cyan)'
              : 'var(--accent-violet)',
            fontWeight: 700,
          }}
        >
          {isDeadlineAlert ? (
            <AlertTriangle size={18} color="#F59E0B" />
          ) : (
            <ZeninLogo size={18} showGlow={false} />
          )}
          <span>{isDeadlineAlert ? '[CRITICAL DEADLINE DIRECTIVE]' : '[SYSTEM DIRECTIVE]'}</span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isLevelUp ? '22px' : '19px',
            fontWeight: 900,
            letterSpacing: '0.06em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
          className={isDeadlineAlert ? '' : isLevelUp ? 'glow-text-cyan' : 'glow-text-violet'}
        >
          {notification.title}
        </h2>

        {/* Subtitle */}
        {notification.subtitle && (
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: '16px',
            }}
          >
            {notification.subtitle}
          </div>
        )}

        {/* XP / Level Reward Highlight Card */}
        <div
          style={{
            margin: '16px 0',
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {notification.xp !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
              }}
              className="glow-text-cyan"
            >
              <Zap size={22} fill="var(--accent-cyan)" />
              <span>+{notification.xp} XP</span>
            </div>
          )}

          {isLevelUp && notification.newLevel && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                }}
              >
                LEVEL {notification.newLevel}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--accent-violet)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}
              >
                RANK: {notification.newRank}
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              lineHeight: 1.4,
            }}
          >
            {notification.message}
          </div>
        </div>

        {/* Action Button */}
        {notification.missionId ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleCompleteNow}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>COMPLETE MISSION NOW</span>
            </button>

            <button
              onClick={onDismiss}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              DISMISS DIRECTIVE
            </button>
          </div>
        ) : (
          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: isLevelUp
                ? 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)'
                : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
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
            <span>CONTINUE PROGRESSION</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
