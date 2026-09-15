import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateProductivityScore } from '../../services/productivityScore';
import { FocusModeScreen } from '../focus/FocusModeScreen';
import { PRIORITIES } from '../../constants/priorities';
import { format, subDays, parseISO } from 'date-fns';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Info,
  Layers,
  Award,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const StatisticsScreen: React.FC = () => {
  const { user, missions, focusSessions, categories, settings } = useAppStore();
  const [subView, setSubView] = useState<'stats' | 'focus'>('stats');
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  // If user selected Focus mode from sub-navigation
  if (subView === 'focus') {
    return (
      <div>
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSubView('stats')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← BACK TO ANALYTICS
          </button>
        </div>
        <FocusModeScreen />
      </div>
    );
  }

  // Calculate Productivity Score
  const scoreBreakdown = calculateProductivityScore(
    missions,
    focusSessions,
    user.currentStreak,
    settings.dailyMissionGoal
  );

  const completedMissions = missions.filter((m) => m.status === 'completed');
  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions.length / totalMissions) * 100) : 100;

  // Last 7 days XP calculations for chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayLabel = format(d, 'EEE');

    // Missions completed on this day
    const dayMissions = completedMissions.filter(
      (m) => m.completedAt && m.completedAt.startsWith(dateStr)
    );
    const dayMissionXp = dayMissions.reduce((acc, m) => acc + m.xpReward, 0);

    // Focus sessions completed on this day
    const dayFocus = focusSessions.filter(
      (f) => f.completedAt && f.completedAt.startsWith(dateStr)
    );
    const dayFocusXp = dayFocus.reduce((acc, f) => acc + f.xpEarned, 0);

    const totalDayXp = dayMissionXp + dayFocusXp;

    return {
      day: dayLabel,
      date: dateStr,
      xp: totalDayXp,
      missionsCount: dayMissions.length,
    };
  });

  const maxWeeklyXp = Math.max(...last7Days.map((d) => d.xp), 200);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  missions.forEach((m) => {
    categoryCounts[m.categoryId] = (categoryCounts[m.categoryId] || 0) + 1;
  });

  // Priority breakdown
  const priorityCounts = {
    COMMON: missions.filter((m) => m.priority === 'COMMON').length,
    RARE: missions.filter((m) => m.priority === 'RARE').length,
    EPIC: missions.filter((m) => m.priority === 'EPIC').length,
    LEGENDARY: missions.filter((m) => m.priority === 'LEGENDARY').length,
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="screen-fade-in">
      {/* Top Header & Focus Chamber Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            [SYSTEM TELEMETRY]
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
            PRODUCTIVITY METRICS
          </h2>
        </div>

        <button
          onClick={() => setSubView('focus')}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: 'var(--accent-cyan)',
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Clock size={14} />
          <span>FOCUS CHAMBER</span>
        </button>
      </div>

      {/* 1. Calculated Productivity Score (0-100) Card */}
      <div
        className="glass-panel-glow"
        style={{
          padding: '16px',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(26, 18, 48, 0.85) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="var(--accent-cyan)" />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              PRODUCTIVITY INDEX
            </span>
          </div>

          <button
            onClick={() => setShowScoreInfo(!showScoreInfo)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <Info size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '36px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1,
              }}
              className="glow-text-violet"
            >
              {scoreBreakdown.score}
              <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
            </div>

            <div
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginTop: '4px',
              }}
            >
              RATING: {scoreBreakdown.ratingTitle}
            </div>
          </div>

          {/* Mini Score Factor breakdown pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Clear Rate: <strong style={{ color: '#FFFFFF' }}>{scoreBreakdown.completionPoints}/35</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Streak Power: <strong style={{ color: '#FFFFFF' }}>{scoreBreakdown.consistencyPoints}/25</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Deep Focus: <strong style={{ color: '#FFFFFF' }}>{scoreBreakdown.focusPoints}/20</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Tier Mastery: <strong style={{ color: '#FFFFFF' }}>{scoreBreakdown.difficultyPoints}/20</strong>
            </span>
          </div>
        </div>

        {showScoreInfo && (
          <div
            className="screen-fade-in"
            style={{
              marginTop: '12px',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            {scoreBreakdown.explanation}
          </div>
        )}
      </div>

      {/* 2. Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            <CheckCircle2 size={13} color="var(--accent-cyan)" />
            <span>MISSIONS CLEARED</span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {completedMissions.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {completionRate}% completion rate
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            <Flame size={13} color="#F97316" />
            <span>CURRENT STREAK</span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {user.currentStreak} <span style={{ fontSize: '12px', color: '#F97316' }}>DAYS</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Best record: {user.bestStreak} days
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            <Clock size={13} color="var(--accent-violet)" />
            <span>FOCUS IMMERSION</span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {Math.floor(user.totalFocusMinutes / 60)}h {user.totalFocusMinutes % 60}m
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {focusSessions.length} total sessions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            <Zap size={13} color="var(--accent-cyan)" />
            <span>LIFETIME EXP</span>
          </div>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
            {user.totalXpEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Level {user.level} Hunter
          </div>
        </div>
      </div>

      {/* 3. Weekly XP Bar Chart (Responsive SVG) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            WEEKLY XP OUTPUT (7 DAYS)
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            {last7Days.reduce((sum, d) => sum + d.xp, 0)} XP Total
          </span>
        </div>

        {/* Bar Chart Container */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '8px' }}>
          {last7Days.map((item, idx) => {
            const barHeightPercent = Math.max(8, Math.round((item.xp / maxWeeklyXp) * 100));
            const isTodayBar = idx === last7Days.length - 1;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {/* XP tooltip value */}
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: item.xp > 0 ? 'var(--accent-cyan)' : 'transparent',
                    marginBottom: '4px',
                  }}
                >
                  {item.xp > 0 ? item.xp : ''}
                </span>

                {/* Animated Bar Column */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '24px',
                    height: `${barHeightPercent}%`,
                    borderRadius: '6px 6px 2px 2px',
                    background: isTodayBar
                      ? 'linear-gradient(180deg, #06B6D4 0%, #8B5CF6 100%)'
                      : 'linear-gradient(180deg, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.3) 100%)',
                    boxShadow: isTodayBar ? '0 0 12px rgba(6, 182, 212, 0.6)' : 'none',
                    transition: 'height 0.6s ease',
                  }}
                />

                {/* Day label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: isTodayBar ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: isTodayBar ? 700 : 500,
                    marginTop: '6px',
                  }}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Priority Tier Distribution */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          PRIORITY TIER DISTRIBUTION
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((tier) => {
            const config = PRIORITIES[tier];
            const count = priorityCounts[tier];
            return (
              <div
                key={tier}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  background: config.badgeBg,
                  border: `1px solid ${config.borderColor}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '10px', color: config.textColor, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {tier}
                </div>
                <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Category Breakdown */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          CATEGORY BREAKDOWN
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const pct = totalMissions > 0 ? Math.round((count / totalMissions) * 100) : 0;
            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {count} missions ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: cat.color,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
