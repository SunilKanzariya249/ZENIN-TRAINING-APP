import React, { useState, useEffect } from 'react';
import { alarmService } from '../../services/alarmService';
import { Alarm } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { Bell, BellRing, Clock, Volume2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { format } from 'date-fns';

export const AlarmRingingModal: React.FC = () => {
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(alarmService.getActiveAlarm());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const unsub = alarmService.onActiveAlarmChange((alarm) => {
      setActiveAlarm(alarm);
    });

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 500);

    return () => {
      unsub();
      clearInterval(clockTimer);
    };
  }, []);

  if (!activeAlarm) return null;

  const handleSnooze = () => {
    soundService.playClick();
    hapticService.medium();
    alarmService.snoozeActiveAlarm(activeAlarm.snoozeMinutes || 5);
  };

  const handleDismiss = () => {
    soundService.playMissionClear();
    hapticService.success();
    alarmService.dismissActiveAlarm();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#030508',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 20px 40px',
        overflow: 'hidden',
      }}
      className="screen-fade-in"
    >
      {/* Background Cyber Glowing Ambient Pulses */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          animation: 'pulse 1.8s infinite alternate',
        }}
      />

      {/* Top Protocol Header */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
            marginBottom: '12px',
          }}
        >
          <BellRing size={15} color="#EF4444" className="animate-bounce" />
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: '#EF4444',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ACTIVE ALARM DIRECTIVE
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.04em',
            margin: '0 0 4px',
            textTransform: 'uppercase',
          }}
        >
          {activeAlarm.label || 'Hunter Alarm'}
        </h1>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Center Giant Pulsing Clock & Visual Equalizer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Pulsing Alarm Beacon */}
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <Clock size={52} color="#EF4444" />
        </div>

        {/* Digital Time Display */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '56px',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '0.04em',
            textShadow: '0 0 25px rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}
        >
          <span>{format(currentTime, 'hh:mm')}</span>
          <span style={{ fontSize: '24px', color: 'var(--accent-cyan)' }}>{format(currentTime, 'a')}</span>
        </div>

        {/* Sound Equalizer Bars Animation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '24px', height: '24px' }}>
          {[16, 24, 12, 20, 24, 14, 22, 18].map((h, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                height: `${h}px`,
                backgroundColor: 'var(--accent-cyan)',
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.8)',
                animation: `pulse 0.6s infinite alternate ${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Ringtone label */}
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          <Volume2 size={13} color="var(--accent-violet)" />
          <span>SYNTH: {activeAlarm.ringtone.toUpperCase().replace('_', ' ')}</span>
        </div>
      </div>

      {/* Bottom Action Controls: Snooze & Dismiss */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Disarm Alarm Button */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.45)',
          }}
        >
          <Check size={20} />
          <span>DISARM ALARM DIRECTIVE</span>
        </button>

        {/* Snooze Button */}
        <button
          onClick={handleSnooze}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Clock size={16} />
          <span>SNOOZE (+{activeAlarm.snoozeMinutes || 5} MINUTES)</span>
        </button>
      </div>
    </div>
  );
};
