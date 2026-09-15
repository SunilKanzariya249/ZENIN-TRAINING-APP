import React from 'react';
import { useAppStore, NavTab } from '../../store/useAppStore';
import { Home, CheckSquare, Calendar, BarChart3, User, Plus } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setCreateMissionOpen } = useAppStore();

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'HOME', icon: <Home size={19} /> },
    { id: 'missions', label: 'MISSIONS', icon: <CheckSquare size={19} /> },
    { id: 'calendar', label: 'CALENDAR', icon: <Calendar size={19} /> },
    { id: 'statistics', label: 'STATS', icon: <BarChart3 size={19} /> },
    { id: 'profile', label: 'PROFILE', icon: <User size={19} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'rgba(7, 10, 16, 0.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 'calc(var(--safe-bottom) + 4px)',
        paddingTop: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          maxWidth: '500px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {tabs.slice(0, 2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.7))' : undefined,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}
              >
                {tab.icon}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Center Floating Action Button (CREATE MISSION) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setCreateMissionOpen(true)}
            aria-label="Create Mission"
            className="fab-button-glow"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 60%, #A855F7 100%)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: '-18px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.65)',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {tabs.slice(2).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.7))' : undefined,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}
              >
                {tab.icon}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
