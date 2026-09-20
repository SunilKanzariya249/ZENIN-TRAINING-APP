import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ZeninLogo } from '../../assets/icons';
import {
  ChevronRight,
  Target,
  Zap,
  Flame,
  Award,
  Bell,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, settings } = useAppStore();
  const [step, setStep] = useState(1);

  // User onboarding preferences
  const [dailyGoal, setDailyGoal] = useState<number>(5);
  const [reminderTime, setReminderTime] = useState<string>('08:30');
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>('monday');
  const [theme, setTheme] = useState<'cyber' | 'void' | 'neon'>('cyber');
  const [notifs, setNotifs] = useState<boolean>(true);

  const steps = [
    {
      title: 'WELCOME TO THE SYSTEM',
      subtitle: 'THE SYSTEM AWAITS.',
      content: 'ZENIN transforms your everyday productivity into an RPG progression system. You are the Hunter. Every task you create is a Mission directive.',
      icon: <ZeninLogo size={64} showGlow={true} className="animate-pulse-glow" />,
    },
    {
      title: 'EXP & ADVANCEMENT',
      subtitle: 'MISSION CLEARED = POWER GAINED',
      content: 'Conquer missions to acquire EXP. Complete higher-tier objectives (Rare, Epic, Legendary) to earn monumental rewards and advance your Hunter Level.',
      icon: <Zap size={56} color="var(--accent-cyan)" />,
    },
    {
      title: 'STREAKS & IMMERSION',
      subtitle: 'CONSISTENCY BREEDS APEX POWER',
      content: 'Maintain an unbroken daily streak. Enter the deep Focus Chamber to eliminate distractions and supercharge your productivity index.',
      icon: <Flame size={56} color="#F97316" />,
    },
    {
      title: 'CALIBRATE YOUR PROTOCOL',
      subtitle: 'CONFIGURE SYSTEM PREFERENCES',
      content: 'Set your daily mission quota, reminder frequency, and theme intensity.',
      icon: <Target size={56} color="var(--accent-violet)" />,
    },
  ];

  const current = steps[step - 1];

  const handleFinish = () => {
    completeOnboarding({
      dailyMissionGoal: dailyGoal,
      dailyBriefingTime: reminderTime,
      weekStartDay: weekStart,
      themeIntensity: theme,
      notificationsEnabled: notifs,
    });
  };

  return (
    <div
      style={{
        padding: '30px 20px',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
      }}
      className="screen-fade-in"
    >
      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              width: s === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: s === step ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Main Illustration / Icon */}
      <div style={{ margin: '30px 0 10px', display: 'flex', justifyContent: 'center' }}>
        {current.icon}
      </div>

      {/* Titles */}
      <div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}
        >
          [{current.subtitle}]
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.04em',
            marginTop: '6px',
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '10px',
            lineHeight: 1.5,
            maxWidth: '320px',
          }}
        >
          {current.content}
        </p>
      </div>

      {/* Step 4: Interactive Preference Choices */}
      {step === 4 && (
        <div
          className="glass-panel screen-fade-in"
          style={{
            width: '100%',
            padding: '16px',
            textAlign: 'left',
            margin: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Daily Goal */}
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              DAILY MISSION TARGET
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
              {[3, 5, 8].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setDailyGoal(g)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: dailyGoal === g ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {g} Missions
                </button>
              ))}
            </div>
          </div>

          {/* Theme Intensity */}
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              THEME INTENSITY
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
              {(['cyber', 'void', 'neon'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: theme === t ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleFinish}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          [ SKIP PROTOCOL CALIBRATION → ]
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
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
            <span>PROCEED</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 60%, #A855F7 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
            }}
            className="animate-pulse-glow"
          >
            AWAKEN THE SYSTEM
          </button>
        )}
      </div>
    </div>
  );
};
