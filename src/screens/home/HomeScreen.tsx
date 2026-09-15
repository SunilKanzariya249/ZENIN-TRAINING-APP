import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { XPProgressBar } from '../../components/rpg/XPProgressBar';
import { StreakBadge } from '../../components/rpg/StreakBadge';
import { SwipeableMissionCard } from '../../components/missions/SwipeableMissionCard';
import { format, isToday, parseISO } from 'date-fns';
import {
  Plus,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
  ChevronRight,
  Target,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    user,
    missions,
    categories,
    setActiveTab,
    setCreateMissionOpen,
    setInspectingMissionId,
    completeMission,
    deleteMission,
    toggleFavorite,
    setActiveFocusMissionId,
    setDailyBriefingOpen,
  } = useAppStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter today's missions
  const todayMissions = missions.filter(
    (m) => !m.archived && (m.dueDate === todayStr || (!m.dueDate && m.status === 'active'))
  );

  const completedToday = todayMissions.filter((m) => m.status === 'completed').length;
  const totalToday = todayMissions.length;
  const todayProgressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100;

  // Active high priority missions for today
  const activeToday = todayMissions.filter((m) => m.status === 'active');
  const highPriorityMission = activeToday.find((m) => m.priority === 'LEGENDARY' || m.priority === 'EPIC') || activeToday[0];

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="screen-fade-in">
      {/* 1. Hunter Level & XP Power Card */}
      <div
        className="glass-panel-glow"
        style={{
          padding: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(20, 15, 38, 0.9) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              HUNTER POWER LEVEL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
                marginTop: '2px',
              }}
            >
              LEVEL {user.level}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--accent-violet)',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>PROFILE</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Animated XP Bar */}
        <XPProgressBar currentXp={user.currentXp} level={user.level} height={9} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>TOTAL LIFETIME XP:</span>
          <strong style={{ color: 'var(--accent-cyan)' }}>{user.totalXpEarned.toLocaleString()} XP</strong>
        </div>
      </div>

      {/* 2. Today's Progress Meter & Current Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Today's Progress Card */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle2 size={12} color="var(--accent-cyan)" />
            <span>TODAY'S MISSIONS</span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginTop: '6px',
            }}
          >
            {completedToday} / {totalToday}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: todayProgressPercent === 100 && totalToday > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
              marginTop: '2px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {totalToday === 0 ? 'No tasks today' : `${todayProgressPercent}% Cleared`}
          </div>

          {/* Mini progress bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '2px',
              marginTop: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${todayProgressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Streak Component */}
        <StreakBadge
          currentStreak={user.currentStreak}
          bestStreak={user.bestStreak}
          streakFreezeAvailable={user.streakFreezeAvailable}
        />
      </div>

      {/* 3. System Directive / Highest Priority Mission */}
      {highPriorityMission && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(16, 22, 35, 0.7) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-violet)',
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--accent-violet)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                SYSTEM RECOMMENDATION
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                }}
              >
                {highPriorityMission.title}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveFocusMissionId(highPriorityMission.id);
              setActiveTab('missions');
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--accent-violet)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 10px var(--accent-violet-glow)',
            }}
          >
            FOCUS
          </button>
        </div>
      )}

      {/* 4. Quick Action Grid */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          QUICK PROTOCOLS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            {
              label: 'CREATE',
              icon: <Plus size={18} color="var(--accent-cyan)" />,
              action: () => setCreateMissionOpen(true),
            },
            {
              label: 'CALENDAR',
              icon: <Calendar size={18} color="var(--accent-violet)" />,
              action: () => setActiveTab('calendar'),
            },
            {
              label: 'FOCUS',
              icon: <Clock size={18} color="#F59E0B" />,
              action: () => {
                setActiveTab('statistics'); // Focus can be triggered from header or stats
                setActiveFocusMissionId(highPriorityMission?.id || null);
              },
            },
            {
              label: 'STATS',
              icon: <BarChart3 size={18} color="#10B981" />,
              action: () => setActiveTab('statistics'),
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 6px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              {item.icon}
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Daily Missions List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            DAILY MISSIONS ({todayMissions.length})
          </div>

          <button
            onClick={() => setActiveTab('missions')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>VIEW ALL</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {todayMissions.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Sparkles size={28} color="var(--accent-violet)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                color: '#FFFFFF',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              THE SYSTEM IS CLEAR
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>No active missions scheduled for today.</div>
            <button
              onClick={() => setCreateMissionOpen(true)}
              style={{
                marginTop: '14px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--accent-violet)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              INITIALIZE MISSION
            </button>
          </div>
        ) : (
          todayMissions.map((mission) => {
            const cat = categories.find((c) => c.id === mission.categoryId);
            return (
              <SwipeableMissionCard
                key={mission.id}
                mission={mission}
                category={cat}
                onComplete={completeMission}
                onDelete={deleteMission}
                onToggleFavorite={toggleFavorite}
                onSelect={(id) => setInspectingMissionId(id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
