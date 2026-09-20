import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { downloadBackupFile, parseAndValidateBackup } from '../../database/backup';
import { notificationService } from '../../notifications/notificationService';
import { authService } from '../../services/authService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
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
  UserX,
  RefreshCw,
} from 'lucide-react';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    settings,
    updateSettings,
    clearCompletedMissions,
    resetToDemoData,
    importDatabaseState,
    logoutUser,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    setIsDeleting(true);
    soundService.playClick();
    hapticService.heavy();

    try {
      await authService.deleteAccount(user.id);
      resetToDemoData();
      logoutUser();
      setShowDeleteModal(false);
      onClose();
    } catch (err: any) {
      alert('Failed to complete account deletion: ' + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#05070B',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="screen-fade-in"
    >
      {/* Top Header */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(5, 7, 11, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-violet)" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            SYSTEM PROTOCOLS & SETTINGS
          </h1>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Settings"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Settings Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {statusMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
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

        {/* 1. Theme & Sensory Interface */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            SENSORY & AUDIO INTERFACE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Audio Feedback */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {settings.soundEnabled ? <Volume2 size={16} color="var(--accent-cyan)" /> : <VolumeX size={16} color="var(--text-muted)" />}
                <div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>Audio Synthesis</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time Web Audio rank and quest cues</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            {/* Volume slider */}
            {settings.soundEnabled && (
              <div style={{ paddingLeft: '26px' }}>
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
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>
            )}

            {/* Haptics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={16} color="var(--accent-violet)" />
                <div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>Haptic Vibration</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tactile feedback on completion & ranks</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticsEnabled}
                onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)' }}
              />
            </div>
          </div>
        </div>

        {/* 2. Notifications & Reminders */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            TRANSMISSIONS & REMINDERS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={16} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>System Notifications</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mission reminders & daily briefings</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            {/* Daily briefing & evening review toggles */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>08:00 AM Dawn Briefing Protocol</div>
              <input
                type="checkbox"
                checked={settings.dailyBriefingEnabled}
                onChange={(e) => updateSettings({ dailyBriefingEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>08:00 PM Twilight Review Protocol</div>
              <input
                type="checkbox"
                checked={settings.eveningReviewEnabled}
                onChange={(e) => updateSettings({ eveningReviewEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Data Vault & Backups */}
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
                if (confirm('Purge all completed mission directives from active view?')) {
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
          </div>
        </div>

        {/* 4. Danger Zone & Account Deletion (Play Store Compliance) */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            background: 'rgba(239, 68, 68, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={16} color="#EF4444" />
            <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#EF4444', margin: 0 }}>
              DANGER ZONE & ACCOUNT PRIVACY
            </h3>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px' }}>
            In compliance with Google Play Store data privacy regulations, you have full authority to purge your data or permanently delete your hunter profile and all associated cloud records.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-secondary)',
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
              <RotateCcw size={15} />
              <span>FACTORY RESET LOCAL DATA</span>
            </button>

            <button
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
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
              <UserX size={15} />
              <span>PERMANENTLY DELETE ACCOUNT & CLOUD DATA</span>
            </button>
          </div>
        </div>

        {/* 5. System Info */}
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', paddingBottom: '20px' }}>
          <div>ZENIN SYSTEM v1.2.0 (Production Core)</div>
          <div style={{ marginTop: '2px' }}>Play Store Ready • Supabase PostgreSQL • Dark Fantasy RPG Architecture</div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 5, 10, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          className="screen-fade-in"
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '360px',
              background: '#0D111A',
              border: '1px solid #EF4444',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={20} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                PURGE HUNTER IDENTITY?
              </h3>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              This action is <strong style={{ color: '#EF4444' }}>IRREVERSIBLE</strong>. Your phone link, cloud missions, XP history, rank, and trophies will be permanently wiped from the database.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Type <strong style={{ color: '#FFFFFF' }}>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim() !== 'DELETE' || isDeleting}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: deleteConfirmText.trim() === 'DELETE' ? '#EF4444' : 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  cursor: deleteConfirmText.trim() === 'DELETE' && !isDeleting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>PURGING...</span>
                  </>
                ) : (
                  <span>PURGE IDENTITY</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
