import React, { useState, useEffect } from 'react';
import { alarmService, NextAlarmInfo } from '../../services/alarmService';
import { alarmAudioService, AVAILABLE_RINGTONES } from '../../services/alarmAudioService';
import { Alarm, RingtoneId } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  X,
  Plus,
  Clock,
  Bell,
  BellRing,
  Volume2,
  Play,
  Square,
  Trash2,
  Check,
  ChevronRight,
  Smartphone,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface AlarmManagerModalProps {
  onClose: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AlarmManagerModal: React.FC<AlarmManagerModalProps> = ({ onClose }) => {
  const [alarms, setAlarms] = useState<Alarm[]>(alarmService.getAlarms());
  const [nextAlarm, setNextAlarm] = useState<NextAlarmInfo | null>(alarmService.getNextAlarm());
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState<RingtoneId | null>(null);

  // Form State
  const [formTime, setFormTime] = useState('07:00');
  const [formLabel, setFormLabel] = useState('Hunter Awakening Directive');
  const [formDays, setFormDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [formRingtone, setFormRingtone] = useState<RingtoneId>('awakening');
  const [formSnooze, setFormSnooze] = useState(5);
  const [formVibrate, setFormVibrate] = useState(true);

  useEffect(() => {
    const unsub = alarmService.onAlarmsListChange((list) => {
      setAlarms(list);
      setNextAlarm(alarmService.getNextAlarm());
    });

    const timer = setInterval(() => {
      setNextAlarm(alarmService.getNextAlarm());
      setPlayingPreviewId(alarmAudioService.getCurrentPlayingId());
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
      alarmAudioService.stopRingtone();
    };
  }, []);

  const handleOpenCreate = () => {
    soundService.playClick();
    hapticService.light();
    setFormTime('07:00');
    setFormLabel('Hunter Morning Protocol');
    setFormDays([1, 2, 3, 4, 5]);
    setFormRingtone('awakening');
    setFormSnooze(5);
    setFormVibrate(true);
    setEditingAlarm(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (alarm: Alarm) => {
    soundService.playClick();
    hapticService.light();
    setFormTime(alarm.time);
    setFormLabel(alarm.label);
    setFormDays(alarm.days);
    setFormRingtone(alarm.ringtone);
    setFormSnooze(alarm.snoozeMinutes || 5);
    setFormVibrate(alarm.vibrate);
    setEditingAlarm(alarm);
    setIsCreating(true);
  };

  const handleSaveAlarm = () => {
    soundService.playClick();
    hapticService.medium();
    alarmAudioService.stopRingtone();

    alarmService.saveAlarm({
      id: editingAlarm ? editingAlarm.id : undefined,
      time: formTime,
      label: formLabel.trim() || 'Hunter Alarm',
      enabled: true,
      days: formDays,
      ringtone: formRingtone,
      snoozeMinutes: formSnooze,
      vibrate: formVibrate,
    });

    setIsCreating(false);
    setEditingAlarm(null);
  };

  const handleDeleteAlarm = (id: string) => {
    if (confirm('Delete this alarm directive?')) {
      soundService.playClick();
      hapticService.medium();
      alarmService.deleteAlarm(id);
      if (editingAlarm?.id === id) {
        setIsCreating(false);
        setEditingAlarm(null);
      }
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    if (formDays.includes(dayIndex)) {
      setFormDays(formDays.filter((d) => d !== dayIndex));
    } else {
      setFormDays([...formDays, dayIndex].sort());
    }
  };

  const handlePreviewRingtone = (ringtoneId: RingtoneId) => {
    if (playingPreviewId === ringtoneId) {
      alarmAudioService.stopRingtone();
      setPlayingPreviewId(null);
    } else {
      alarmAudioService.previewRingtone(ringtoneId);
      setPlayingPreviewId(ringtoneId);
    }
  };

  const formatTime12h = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return { timeStr: `${displayH}:${mStr}`, ampm };
  };

  const formatDaysSummary = (days: number[]) => {
    if (days.length === 0) return 'Ring Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays (Mon-Fri)';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends (Sat-Sun)';
    return days.map((d) => DAY_LABELS[d]).join(', ');
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
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(5, 7, 11, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCreating ? (
            <button
              onClick={() => {
                alarmAudioService.stopRingtone();
                setIsCreating(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <Clock size={17} color="#F59E0B" />
            </div>
          )}

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              {isCreating ? (editingAlarm ? 'EDIT ALARM' : 'NEW ALARM') : 'CHRONO ALARM DIRECTIVES'}
            </h2>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {isCreating ? 'CALIBRATE WAKE SCHEDULE' : 'TACTICAL WAKE & SNOOZE'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isCreating && (
            <button
              onClick={handleOpenCreate}
              style={{
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: 'var(--accent-cyan)',
                fontSize: '11px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>NEW</span>
            </button>
          )}

          <button
            onClick={() => {
              alarmAudioService.stopRingtone();
              onClose();
            }}
            aria-label="Close Alarm Manager"
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
      </div>

      {/* Main Content Body */}
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
        {isCreating ? (
          /* ========================================================= */
          /* ALARM CREATION / EDITING FORM */
          /* ========================================================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="screen-fade-in">
            {/* 1. Big Time Picker */}
            <div
              className="glass-panel"
              style={{
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(20, 16, 38, 0.95) 100%)',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                WAKE TIME (24-HOUR FORMAT)
              </div>

              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '2px solid var(--accent-cyan)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 900,
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
                  cursor: 'pointer',
                }}
              />

              <div style={{ marginTop: '10px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {formatTime12h(formTime).timeStr} {formatTime12h(formTime).ampm}
              </div>
            </div>

            {/* 2. Directive Label Input */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                ALARM DIRECTIVE LABEL
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Hunter Dawn Awakening"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* 3. Repeat Days Selector */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)' }}>
                  REPEAT DAYS
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {formatDaysSummary(formDays)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {DAY_LABELS.map((dayLabel, idx) => {
                  const isSelected = formDays.includes(idx);
                  return (
                    <button
                      key={dayLabel}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      style={{
                        padding: '10px 0',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {dayLabel[0]}
                    </button>
                  );
                })}
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFormDays([1, 2, 3, 4, 5])}
                  style={{
                    flex: 1,
                    padding: '5px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setFormDays([0, 1, 2, 3, 4, 5, 6])}
                  style={{
                    flex: 1,
                    padding: '5px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Everyday
                </button>
                <button
                  type="button"
                  onClick={() => setFormDays([])}
                  style={{
                    flex: 1,
                    padding: '5px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Once
                </button>
              </div>
            </div>

            {/* 4. Synthesized Ringtone Selector with Live Previews */}
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Volume2 size={15} color="var(--accent-violet)" />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: '#FFFFFF', fontWeight: 700 }}>
                  TACTICAL RINGTONE SYNTHESIS
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Tap play to preview the Web Audio polyphonic synthesizer track.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {AVAILABLE_RINGTONES.map((rt) => {
                  const isSelected = formRingtone === rt.id;
                  const isPlaying = playingPreviewId === rt.id;

                  return (
                    <div
                      key={rt.id}
                      onClick={() => setFormRingtone(rt.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: isSelected ? '1px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.06)',
                        background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid var(--accent-violet)' : '2px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-violet)',
                              }}
                            />
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '12.5px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFFFFF' }}>
                            {rt.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {rt.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewRingtone(rt.id);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: isPlaying ? '1px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.15)',
                          background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: isPlaying ? '#EF4444' : 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {isPlaying ? <Square size={13} /> : <Play size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Snooze & Vibration Options */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={15} color="var(--accent-violet)" />
                  <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>Haptic Vibration Pulse</span>
                </div>
                <input
                  type="checkbox"
                  checked={formVibrate}
                  onChange={(e) => setFormVibrate(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>Snooze Duration</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[5, 10, 15].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormSnooze(m)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: formSnooze === m ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: formSnooze === m ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                        color: formSnooze === m ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Save & Delete */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              {editingAlarm && (
                <button
                  type="button"
                  onClick={() => handleDeleteAlarm(editingAlarm.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    fontSize: '13px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAlarm}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                }}
              >
                <Check size={18} />
                <span>SAVE ALARM DIRECTIVE</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* ALARM LIST VIEW */
          /* ========================================================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Next Alarm Banner */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 14px',
                background: nextAlarm
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 22, 35, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: nextAlarm ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BellRing size={16} color={nextAlarm ? '#F59E0B' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontWeight: 700 }}>
                    UPCOMING WAKE PROTOCOL
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    {nextAlarm ? `${formatTime12h(nextAlarm.alarm.time).timeStr} ${formatTime12h(nextAlarm.alarm.time).ampm} (${nextAlarm.formattedRemaining})` : 'No enabled alarms'}
                  </div>
                </div>
              </div>

              {nextAlarm && (
                <span
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    color: '#F59E0B',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  ACTIVE
                </span>
              )}
            </div>

            {/* List of Alarms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alarms.map((alarm) => {
                const { timeStr, ampm } = formatTime12h(alarm.time);

                return (
                  <div
                    key={alarm.id}
                    className="glass-panel"
                    onClick={() => handleOpenEdit(alarm)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: alarm.enabled ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                      background: alarm.enabled
                        ? 'linear-gradient(135deg, rgba(16, 22, 35, 0.95) 0%, rgba(20, 16, 42, 0.9) 100%)'
                        : 'rgba(10, 14, 22, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Big Time */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '28px',
                            fontWeight: 900,
                            color: alarm.enabled ? '#FFFFFF' : 'var(--text-muted)',
                            lineHeight: 1,
                          }}
                        >
                          {timeStr}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            color: alarm.enabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            fontWeight: 800,
                          }}
                        >
                          {ampm}
                        </span>
                      </div>

                      {/* Label & Days */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: alarm.enabled ? '#FFFFFF' : 'var(--text-muted)', marginTop: '4px' }}>
                        {alarm.label}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>{formatDaysSummary(alarm.days)}</span>
                        <span>•</span>
                        <span style={{ color: alarm.enabled ? 'var(--accent-violet)' : 'inherit' }}>
                          🎵 {alarm.ringtone.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={() => {
                          alarmService.toggleAlarm(alarm.id);
                          soundService.playClick();
                          hapticService.light();
                        }}
                        style={{
                          width: '22px',
                          height: '22px',
                          accentColor: 'var(--accent-cyan)',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
