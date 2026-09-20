import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RankBadge } from '../../components/rpg/RankBadge';
import { XPProgressBar } from '../../components/rpg/XPProgressBar';
import { AchievementIcon } from '../../assets/icons';
import { SettingsScreen } from '../settings/SettingsScreen';
import { getRankForLevel } from '../../constants/ranks';
import { syncEngine } from '../../services/syncEngine';
import { authService } from '../../services/authService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { SyncStatus } from '../../types';
import {
  Settings,
  Flame,
  Award,
  Clock,
  Target,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  LogOut,
  Smartphone,
  RefreshCw,
  ShieldCheck,
  Zap,
  Cloud,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, missions, focusSessions, achievements, logoutUser, setAuthModal } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [activeAchievementCategory, setActiveAchievementCategory] = useState<string>('all');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncEngine.getStatus());
  const [lastSynced, setLastSynced] = useState<string | null>(syncEngine.getLastSyncedAt());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Subscribe to real-time sync engine updates
  useEffect(() => {
    const unsub = syncEngine.onSyncStatusChange((status, timestamp) => {
      setSyncStatus(status);
      setLastSynced(timestamp);
    });
    return unsub;
  }, []);

  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

  const currentRank = getRankForLevel(user.level);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = achievements.filter((a) => {
    if (activeAchievementCategory === 'all') return true;
    return a.category === activeAchievementCategory;
  });

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    soundService.playClick();
    hapticService.light();

    const res = await syncEngine.syncNow(user.id, user, missions, focusSessions);
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage('Cloud matrix updated.');
      soundService.playMissionClear();
      hapticService.success();
    } else {
      setSyncMessage(res.error || 'Sync deferred.');
    }
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleLogout = async () => {
    if (window.confirm('Disconnect from neural link session? Your progress will remain saved in the cloud.')) {
      soundService.playClick();
      await authService.logout();
      logoutUser();
    }
  };

  const maskPhone = (ph?: string) => {
    if (!ph) return '';
    const clean = ph.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 4)} •••• ••${clean.slice(-4)}`;
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="screen-fade-in">
      {/* 0. GUEST SECURE ACCOUNT PROMPT (Shown only for guest / unlinked users) */}
      {user.isGuest ? (
        <div
          className="glass-panel-glow"
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(14, 26, 45, 0.95) 0%, rgba(20, 16, 40, 0.95) 100%)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-cyan)',
                }}
              >
                <Smartphone size={18} color="var(--accent-cyan)" />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                GUEST PROTOCOL ACTIVE
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              LOCAL STORAGE
            </span>
          </div>

          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 4px',
              }}
            >
              SECURE & SYNC PROGRESSION
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Currently running in local guest mode. Log in or create an account with your mobile number to permanently store missions, level, and XP in the database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                soundService.playClick();
                setAuthModal(true, 'login');
              }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Smartphone size={15} />
              <span>LOG IN</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                setAuthModal(true, 'signup');
              }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.35)',
              }}
            >
              <Zap size={15} />
              <span>CREATE ACCOUNT</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACCOUNT & CLOUD STATUS RIBBON (Shown for registered hunters) */
        <div
          className="glass-panel"
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.9) 0%, rgba(10, 14, 24, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10B981" />
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  CLOUD SECURED HUNTER
                </div>
                <div style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {maskPhone(user.phone) || user.email}
                </div>
              </div>
            </div>

            {/* Sync Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '6px',
                background:
                  syncStatus === 'synced'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : syncStatus === 'syncing'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(255, 255, 255, 0.06)',
                border:
                  syncStatus === 'synced'
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : syncStatus === 'syncing'
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Cloud
                size={12}
                color={syncStatus === 'synced' ? '#10B981' : syncStatus === 'syncing' ? '#F59E0B' : '#94A3B8'}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: syncStatus === 'synced' ? '#10B981' : syncStatus === 'syncing' ? '#F59E0B' : '#94A3B8',
                  textTransform: 'uppercase',
                }}
              >
                {syncStatus}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {syncMessage ? syncMessage : lastSynced ? `Last sync: ${new Date(lastSynced).toLocaleTimeString()}` : 'Cloud ready'}
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>SYNC NOW</span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  color: '#F87171',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
                title="Log Out"
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

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
                {user.phone ? maskPhone(user.phone) : user.email}
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
            {achievements.length > 0 ? Math.round((unlockedAchievementsCount / achievements.length) * 100) : 0}%
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

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isUnlocked ? '#FFFFFF' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ach.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: isUnlocked ? '#F59E0B' : 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      +{ach.rewardXp} XP
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {ach.description}
                  </p>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: isUnlocked
                          ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                          : 'var(--accent-cyan)',
                        borderRadius: '2px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
