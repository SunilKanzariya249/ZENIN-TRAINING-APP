import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { downloadBackupFile, parseAndValidateBackup } from '../../database/backup';
import { notificationService } from '../../notifications/notificationService';
import { authService } from '../../services/authService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { alarmAudioService, AVAILABLE_RINGTONES } from '../../services/alarmAudioService';
import { RingtoneId } from '../../types';
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
  Footprints,
  Thermometer,
  Activity,
  AlarmClock,
  Play,
  Square,
  Music,
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
  const [previewingRingtone, setPreviewingRingtone] = useState<RingtoneId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      alarmAudioService.stopRingtone();
    };
  }, []);

  const toggleRingtonePreview = (id: RingtoneId) => {
    if (previewingRingtone === id) {
      alarmAudioService.stopRingtone();
      setPreviewingRingtone(null);
    } else {
      alarmAudioService.previewRingtone(id, 8);
      setPreviewingRingtone(id);
    }
  };

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
        zIndex: 150,
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

        {/* Alarm Protocols & Synthesized Ringtones */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlarmClock size={16} color="#F59E0B" />
            <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              ALARM PROTOCOLS & RINGTONES
            </h3>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 14px' }}>
            Preview real-time synthesized acoustic wake patterns for field missions and morning alerts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {AVAILABLE_RINGTONES.map((rt) => {
              const isPlaying = previewingRingtone === rt.id;
              return (
                <div
                  key={rt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isPlaying ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isPlaying ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Music size={15} color={isPlaying ? '#F59E0B' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: isPlaying ? '#F59E0B' : '#FFFFFF' }}>
                        {rt.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {rt.subtitle}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRingtonePreview(rt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: isPlaying ? '#EF4444' : 'rgba(245, 158, 11, 0.2)',
                      border: isPlaying ? '1px solid #EF4444' : '1px solid #F59E0B',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isPlaying ? <Square size={11} fill="#FFFFFF" /> : <Play size={11} fill="#F59E0B" />}
                    <span>{isPlaying ? 'STOP' : 'TEST'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Field Telemetry & Physical Sensors */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              FIELD TELEMETRY & PHYSICAL SENSORS
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step Goal Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Footprints size={15} color="var(--accent-cyan)" />
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>Daily Step Directive</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Calibrates kinetic activity detection and XP milestone rewards (25%, 50%, 75%, 100%).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[5000, 8000, 10000, 15000].map((steps) => {
                  const isSelected = (settings.dailyStepGoal || 10000) === steps;
                  return (
                    <button
                      key={steps}
                      type="button"
                      onClick={() => {
                        updateSettings({ dailyStepGoal: steps });
                        soundService.playClick();
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {(steps / 1000).toFixed(0)}k
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Temperature Unit Preference */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Thermometer size={15} color="var(--accent-amber)" />
                <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>Atmospheric Temperature Unit</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Real-time WMO weather condition and ambient thermal measurement scale.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { unit: 'celsius' as const, label: 'Celsius (°C)' },
                  { unit: 'fahrenheit' as const, label: 'Fahrenheit (°F)' },
                ].map(({ unit, label }) => {
                  const isSelected = (settings.temperatureUnit || 'celsius') === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        updateSettings({ temperatureUnit: unit });
                        soundService.playClick();
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid var(--accent-amber)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
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
                if (confirm('Reset application state back to fresh factory state?')) {
                  resetToDemoData();
                  showStatus('System reset to default state.');
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
