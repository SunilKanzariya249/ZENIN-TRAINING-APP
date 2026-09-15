import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';
import { format } from 'date-fns';

interface MobileShellProps {
  children: React.ReactNode;
}

type DevicePreset = 'iphone' | 'samsung' | 'pixel' | 'compact' | 'fullscreen';

interface PresetConfig {
  id: DevicePreset;
  name: string;
  width: number;
  height: number;
  radius: number;
}

const PRESETS: Record<DevicePreset, PresetConfig> = {
  iphone: { id: 'iphone', name: 'iPhone 15 Pro (393px)', width: 393, height: 830, radius: 44 },
  samsung: { id: 'samsung', name: 'Galaxy S24 (360px)', width: 360, height: 780, radius: 36 },
  pixel: { id: 'pixel', name: 'Pixel 8 (412px)', width: 412, height: 860, radius: 40 },
  compact: { id: 'compact', name: 'Compact (320px)', width: 320, height: 680, radius: 28 },
  fullscreen: { id: 'fullscreen', name: 'Native Fullscreen', width: 0, height: 0, radius: 0 },
};

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const [device, setDevice] = useState<DevicePreset>('iphone');
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm'));
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm'));
    }, 10000);

    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth <= 500);
      if (window.innerWidth <= 500) {
        setDevice('fullscreen');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const activePreset = PRESETS[device];
  const isFullscreen = device === 'fullscreen' || isMobileScreen;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#020305',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Device Switcher Toolbar (Visible on Desktop / wider viewports) */}
      {!isMobileScreen && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(12, 17, 26, 0.85)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '999px',
            padding: '4px 8px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-muted)',
              paddingLeft: '6px',
              marginRight: '4px',
              fontWeight: 600,
            }}
          >
            <Smartphone size={13} color="var(--accent-cyan)" />
            <span>VIEWPORT:</span>
          </div>

          {(['iphone', 'samsung', 'pixel', 'compact', 'fullscreen'] as DevicePreset[]).map((presetKey) => {
            const p = PRESETS[presetKey];
            const isSelected = device === presetKey;
            return (
              <button
                key={presetKey}
                onClick={() => setDevice(presetKey)}
                style={{
                  background: isSelected ? 'var(--accent-violet)' : 'transparent',
                  border: 'none',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isSelected ? 700 : 500,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {presetKey.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Device Frame or Fullscreen Canvas */}
      <div
        style={{
          width: isFullscreen ? '100%' : `${activePreset.width}px`,
          height: isFullscreen ? '100%' : `${activePreset.height}px`,
          maxHeight: isFullscreen ? '100vh' : '90vh',
          borderRadius: isFullscreen ? '0px' : `${activePreset.radius}px`,
          border: isFullscreen ? 'none' : '8px solid #131A29',
          boxShadow: isFullscreen
            ? 'none'
            : '0 0 0 2px rgba(139, 92, 246, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Dynamic Island / Mobile Status Bar */}
        <div
          style={{
            height: isFullscreen ? '28px' : '34px',
            backgroundColor: 'rgba(5, 7, 11, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            zIndex: 80,
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* Clock */}
          <span>{currentTime}</span>

          {/* Dynamic Island Sensor Notch (for iPhone preset on desktop) */}
          {!isFullscreen && device === 'iphone' && (
            <div
              style={{
                width: '88px',
                height: '18px',
                borderRadius: '12px',
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            />
          )}

          {/* Mobile Status Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} />
          </div>
        </div>

        {/* Scrollable Viewport Content */}
        <div
          id="zenin-viewport-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            paddingBottom: '80px', // Space for bottom nav
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
