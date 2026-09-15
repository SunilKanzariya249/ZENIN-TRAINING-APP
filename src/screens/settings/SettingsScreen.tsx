import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { downloadBackupFile, parseAndValidateBackup } from '../../database/backup';
import { notificationService } from '../../notifications/notificationService';
import {
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Bell,
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Shield,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    settings,
    updateSettings,
    clearCompletedMissions,
    resetToDemoData,
    importDatabaseState,
    user,
    missions,
    categories,
    achievements,
    focusSessions,
    xpTransactions,
    isAuthenticated,
    hasOnboarded,
  } = useAppStore();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = () => {
    const fullState = {
      user,
      missions,
      categories,
      achievements,
      focusSessions,
      settings,
      xpTransactions,
      isAuthenticated,
      hasOnboarded,
    };
    downloadBackupFile(fullState);
    showStatus('Backup archive successfully generated and downloaded.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { valid, state, error } = parseAndValidateBackup(content);
      if (valid && state) {
        importDatabaseState(state);
        showStatus('System state successfully restored from archive.');
      } else {
        alert(error || 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        alert('Notification permission was declined by the browser. Please enable notifications in your browser settings.');
        updateSettings({ notificationsEnabled: false });
        return;
      }
    }
    updateSettings({ notificationsEnabled: enabled });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 9, 0.95)',
        backdropFilter: 'blur(16px)',
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="screen-fade-in"
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            [SYSTEM PREFERENCES]
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
            SETTINGS & SYSTEM
          </h2>
        </div>

        <button
          aria-label="Close Settings"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            margin: '12px 20px 0',
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#10B981',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Settings Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Theme & Appearance */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            APPEARANCE & ATMOSPHERE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                THEME INTENSITY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['cyber', 'void', 'neon'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateSettings({ themeIntensity: t })}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: settings.themeIntensity === t ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.04)',
                      border: settings.themeIntensity === t ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: settings.themeIntensity === t ? '#FFFFFF' : 'var(--text-muted)',
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
        </div>

        {/* 2. Audio & Haptics Feedback */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            AUDIO & HAPTIC SYNTHESIS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Sound Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Synthesized System Audio</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Original Web Audio RPG effects</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>

            {/* Volume Slider */}
            {settings.soundEnabled && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Volume</span>
                  <span>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-violet)' }}
                />
              </div>
            )}

            {/* Haptics Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Haptic Sensory Pulses</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vibration on complete and level up</div>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticsEnabled}
                onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Notifications & Quiet Hours */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            NEURAL REMINDERS & ALERTS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>System Reminders</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local due date & streak beacons</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>

            {/* Quiet Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  QUIET HOURS START
                </label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  QUIET HOURS END
                </label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Data Vault & Backups */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            DATA ARCHIVE & VAULT
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleExport}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Download size={15} color="var(--accent-cyan)" />
              <span>EXPORT HUNTER ARCHIVE (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Upload size={15} color="var(--accent-violet)" />
              <span>IMPORT & RESTORE ARCHIVE</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => {
                if (confirm('Purge all completed mission directives from view?')) {
                  clearCompletedMissions();
                  showStatus('Completed missions cleared from active registry.');
                }
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Trash2 size={15} />
              <span>PURGE COMPLETED MISSIONS</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset application state back to fresh demo seed?')) {
                  resetToDemoData();
                  showStatus('System reset to default seed state.');
                }
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
            >
              <RotateCcw size={15} />
              <span>FACTORY RESET TO SEED DATA</span>
            </button>
          </div>
        </div>

        {/* 5. System Info */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', paddingBottom: '20px' }}>
          <div>ZENIN SYSTEM v1.0.0 (Production Core)</div>
          <div style={{ marginTop: '2px' }}>Engineered for Mobile Mastery • Dark Fantasy RPG Architecture</div>
        </div>
      </div>
    </div>
  );
};
