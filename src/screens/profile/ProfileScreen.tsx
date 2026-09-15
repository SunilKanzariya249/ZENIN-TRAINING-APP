import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RankBadge } from '../../components/rpg/RankBadge';
import { XPProgressBar } from '../../components/rpg/XPProgressBar';
import { AchievementIcon } from '../../assets/icons';
import { SettingsScreen } from '../settings/SettingsScreen';
import { getRankForLevel } from '../../constants/ranks';
import {
  Settings,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Lock,
  Check,
  Edit2,
  Share2,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, achievements, updateSettings, settings } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [activeAchievementCategory, setActiveAchievementCategory] = useState<string>('all');

  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

  const currentRank = getRankForLevel(user.level);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = achievements.filter((a) => {
    if (activeAchievementCategory === 'all') return true;
    return a.category === activeAchievementCategory;
  });

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="screen-fade-in">
      {/* 1. Hunter Profile Card */}
      <div
        className="glass-panel-glow"
        style={{
          padding: '20px 16px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(26, 16, 44, 0.9) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--accent-violet)',
                boxShadow: '0 0 16px var(--accent-violet-glow)',
              }}
            >
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                }}
              >
                {user.name}
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {user.email}
              </div>
              <div style={{ marginTop: '6px' }}>
                <RankBadge level={user.level} size="sm" />
              </div>
            </div>
          </div>

          <button
            aria-label="Open Settings"
            onClick={() => setShowSettings(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* XP Level Bar */}
        <XPProgressBar currentXp={user.currentXp} level={user.level} height={9} />

        {/* Rank Description & Perks */}
        <div
          style={{
            marginTop: '14px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            {currentRank.title} DIRECTIVES
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>
            {currentRank.description}
          </p>
        </div>
      </div>

      {/* 2. Lifetime Statistics Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <CheckCircle2 size={16} color="var(--accent-cyan)" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
            {user.totalMissionsCompleted}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            CLEARED
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <Flame size={16} color="#F97316" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
            {user.bestStreak}D
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            RECORD STREAK
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <Clock size={16} color="var(--accent-violet)" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF' }}>
            {Math.floor(user.totalFocusMinutes / 60)}h
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            FOCUS TIME
          </div>
        </div>
      </div>

      {/* 3. Achievements Showcase */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#F59E0B" />
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              HUNTER TROPHIES ({unlockedAchievementsCount}/{achievements.length})
            </span>
          </div>

          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            {Math.round((unlockedAchievementsCount / achievements.length) * 100)}%
          </span>
        </div>

        {/* Filter categories */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
          {['all', 'missions', 'levels', 'streak', 'focus', 'special'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveAchievementCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: '999px',
                background: activeAchievementCategory === cat ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                border: 'none',
                color: activeAchievementCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievement Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className="glass-panel"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: isUnlocked ? 'rgba(16, 22, 35, 0.85)' : 'rgba(10, 14, 22, 0.6)',
                  border: isUnlocked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                  boxShadow: isUnlocked ? '0 0 15px -4px rgba(245, 158, 11, 0.2)' : 'none',
                  opacity: isUnlocked ? 1 : 0.65,
                }}
              >
                {/* Icon Circle */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isUnlocked
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isUnlocked ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isUnlocked ? (
                    <AchievementIcon name={ach.icon} size={20} color="#FBBF24" />
                  ) : (
                    <Lock size={18} color="var(--text-muted)" />
                  )}
                </div>

                {/* Details & Progress */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isUnlocked ? '#FFFFFF' : 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {ach.name}
                    </h4>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: isUnlocked ? '#F59E0B' : 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      +{ach.rewardXp} XP
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {ach.description}
                  </p>

                  {/* Progress bar if not unlocked */}
                  {!isUnlocked ? (
                    <div style={{ marginTop: '6px' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: 'var(--accent-violet)',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                        }}
                      >
                        <span>Requirement: {ach.requirement}</span>
                        <span>{ach.progress}/{ach.maxProgress}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: '#10B981',
                        marginTop: '4px',
                      }}
                    >
                      <Check size={11} />
                      <span>UNLOCKED {ach.unlockedAt ? `• ${ach.unlockedAt.split(' ')[0]}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
