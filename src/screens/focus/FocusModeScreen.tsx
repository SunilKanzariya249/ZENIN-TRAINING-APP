import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

interface FocusModeScreenProps {
  onClose?: () => void;
}

export const FocusModeScreen: React.FC<FocusModeScreenProps> = ({ onClose }) => {
  const {
    missions,
    activeFocusMissionId,
    setActiveFocusMissionId,
    completeFocusSession,
    focusSessions,
  } = useAppStore();

  const presets = [15, 25, 45, 60];
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mission to link
  const [targetMissionId, setTargetMissionId] = useState<string>(activeFocusMissionId || '');

  // Reset timer whenever preset changes and not running
  const handleSelectPreset = (mins: number) => {
    if (isActive) return;
    setSelectedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            // Award focus XP and record session
            completeFocusSession(selectedMinutes, targetMissionId || undefined);
            return selectedMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, selectedMinutes, targetMissionId, completeFocusSession]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeftSeconds(selectedMinutes * 60);
  };

  // Format MM:SS
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Circular progress calculation
  const totalSeconds = selectedMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeftSeconds) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const targetMission = missions.find((m) => m.id === targetMissionId);

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
      className="screen-fade-in"
    >
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            [HYPER-FOCUS CHAMBER]
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            FOCUS PROTOCOL
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Target Mission Linker */}
      <div
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(16, 22, 35, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
        }}
      >
        <label
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-muted)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '4px',
          }}
        >
          CONNECTED MISSION OBJECTIVE
        </label>
        <select
          value={targetMissionId}
          onChange={(e) => setTargetMissionId(e.target.value)}
          disabled={isActive}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#FFFFFF',
            padding: '8px 10px',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="" style={{ background: '#0B0F19' }}>-- General Deep Work --</option>
          {missions
            .filter((m) => m.status === 'active' && !m.archived)
            .map((m) => (
              <option key={m.id} value={m.id} style={{ background: '#0B0F19' }}>
                [{m.priority}] {m.title}
              </option>
            ))}
        </select>
      </div>

      {/* Circular Progress Dial */}
      <div style={{ position: 'relative', width: '250px', height: '250px', margin: '10px 0' }}>
        <svg width="250" height="250" viewBox="0 0 250 250">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          {/* Background Ring Track */}
          <circle
            cx="125"
            cy="125"
            r="110"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Animated Glowing Dial */}
          <circle
            cx="125"
            cy="125"
            r="110"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 125 125)"
            style={{
              transition: 'stroke-dashoffset 0.8s ease',
              filter: isActive ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.7))' : 'none',
            }}
          />
        </svg>

        {/* Inner Counter Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '38px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
            className={isActive ? 'glow-text-cyan' : ''}
          >
            {timeFormatted}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-violet)',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            <Zap size={13} fill="var(--accent-violet)" />
            <span>+{selectedMinutes * 2} XP REWARD</span>
          </div>

          <div
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              color: isActive ? '#10B981' : 'var(--text-muted)',
              marginTop: '6px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {isActive ? 'NEURAL LINK ACTIVE' : 'SYSTEM STANDBY'}
          </div>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {presets.map((minsVal) => {
          const isSelected = selectedMinutes === minsVal;
          return (
            <button
              key={minsVal}
              onClick={() => handleSelectPreset(minsVal)}
              disabled={isActive}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: isSelected ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: isActive ? 'not-allowed' : 'pointer',
                opacity: isActive && !isSelected ? 0.4 : 1,
                boxShadow: isSelected ? '0 0 10px var(--accent-violet-glow)' : 'none',
              }}
            >
              {minsVal}M
            </button>
          );
        })}
      </div>

      {/* Primary Timer Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
        <button
          onClick={resetTimer}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reset Protocol"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggleTimer}
          style={{
            padding: '14px 32px',
            borderRadius: '999px',
            background: isActive
              ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
              : 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isActive ? '0 0 20px rgba(244, 63, 94, 0.5)' : '0 0 20px rgba(139, 92, 246, 0.5)',
          }}
        >
          {isActive ? (
            <>
              <Pause size={18} fill="#FFFFFF" />
              <span>PAUSE LINK</span>
            </>
          ) : (
            <>
              <Play size={18} fill="#FFFFFF" />
              <span>ENGAGE FOCUS</span>
            </>
          )}
        </button>

        {/* Instant Complete / Skip button */}
        <button
          onClick={() => {
            if (confirm('Complete focus session early and claim partial rewards?')) {
              setIsActive(false);
              completeFocusSession(Math.max(5, Math.round((totalSeconds - timeLeftSeconds) / 60)), targetMissionId || undefined);
            }
          }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Complete Early"
        >
          <CheckCircle2 size={18} />
        </button>
      </div>

      {/* Focus History Log */}
      <div style={{ width: '100%', marginTop: '10px' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          RECENT IMMERSION LOGS ({focusSessions.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {focusSessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className="glass-panel"
              style={{
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {session.missionTitle || 'Deep Focus Session'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {session.completedAt}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  +{session.xpEarned} XP
                </span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{session.durationMinutes} mins</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
