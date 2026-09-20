import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { alarmService } from '../src/services/alarmService';
import { alarmAudioService, AVAILABLE_RINGTONES } from '../src/services/alarmAudioService';
import { Alarm } from '../src/types';

// Mock localStorage
if (typeof localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe('Alarm Service and Engine Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Stop any active alarms
    alarmService.dismissActiveAlarm();
  });

  afterEach(() => {
    alarmService.dismissActiveAlarm();
    alarmAudioService.stopRingtone();
  });

  it('initializes with default empty or template alarms', () => {
    const alarms = alarmService.getAlarms();
    expect(Array.isArray(alarms)).toBe(true);
  });

  it('can create, retrieve, update, and delete alarms', () => {
    const newAlarm: Omit<Alarm, 'id' | 'createdAt'> = {
      label: 'Morning Awakening Protocol',
      time: '07:30',
      enabled: true,
      days: [1, 2, 3, 4, 5], // Mon-Fri
      ringtone: 'awakening',
      vibrate: true,
      snoozeMinutes: 5,
    };

    const saved = alarmService.saveAlarm(newAlarm);
    expect(saved.id).toBeDefined();
    expect(saved.label).toBe('Morning Awakening Protocol');
    expect(saved.time).toBe('07:30');
    expect(saved.days).toEqual([1, 2, 3, 4, 5]);

    // Retrieve
    let list = alarmService.getAlarms();
    const found = list.find((a) => a.id === saved.id);
    expect(found).toBeDefined();
    expect(found?.enabled).toBe(true);

    // Toggle off
    alarmService.toggleAlarm(saved.id, false);
    list = alarmService.getAlarms();
    expect(list.find((a) => a.id === saved.id)?.enabled).toBe(false);

    // Update label & ringtone
    alarmService.saveAlarm({
      ...saved,
      enabled: false,
      label: 'Updated Mission Alarm',
      ringtone: 'cyber_siren',
    });
    list = alarmService.getAlarms();
    const updated = list.find((a) => a.id === saved.id);
    expect(updated?.label).toBe('Updated Mission Alarm');
    expect(updated?.ringtone).toBe('cyber_siren');

    // Delete
    alarmService.deleteAlarm(saved.id);
    list = alarmService.getAlarms();
    expect(list.find((a) => a.id === saved.id)).toBeUndefined();
  });

  it('correctly calculates the next upcoming alarm and countdown', () => {
    // Save an alarm set for 23:59
    alarmService.saveAlarm({
      label: 'Late Night Protocol',
      time: '23:59',
      enabled: true,
      days: [], // Everyday
      ringtone: 'pulse_radar',
      vibrate: true,
      snoozeMinutes: 5,
    });

    const next = alarmService.getNextAlarm();
    expect(next).not.toBeNull();
    if (next) {
      expect(next.alarm.label).toBe('Late Night Protocol');
      expect(typeof next.countdownText).toBe('string');
      expect(next.countdownText.length).toBeGreaterThan(0);
    }
  });

  it('correctly handles snooze and rescheduling', () => {
    const alarm = alarmService.saveAlarm({
      label: 'Snooze Test Alarm',
      time: '08:00',
      enabled: true,
      days: [0, 1, 2, 3, 4, 5, 6],
      ringtone: 'apex_fanfare',
      vibrate: true,
      snoozeMinutes: 5,
    });

    // Simulate active alarm triggering
    alarmService.triggerAlarmForTesting(alarm);
    expect(alarmService.getActiveAlarm()?.id).toBe(alarm.id);

    // Snooze by 10 minutes
    alarmService.snoozeActiveAlarm(10);
    expect(alarmService.getActiveAlarm()).toBeNull();

    // Check that a snoozed temporary alarm was queued
    const alarms = alarmService.getAlarms();
    const snoozed = alarms.find((a) => a.label.includes('Snooze'));
    expect(snoozed).toBeDefined();
    expect(snoozed?.enabled).toBe(true);

    // Clean up
    if (snoozed) alarmService.deleteAlarm(snoozed.id);
    alarmService.deleteAlarm(alarm.id);
  });

  it('verifies all 5 ringtone sound signatures are defined and configured', () => {
    expect(AVAILABLE_RINGTONES.length).toBe(5);

    const ids = AVAILABLE_RINGTONES.map((r) => r.id);
    expect(ids).toContain('awakening');
    expect(ids).toContain('cyber_siren');
    expect(ids).toContain('shadow_gate');
    expect(ids).toContain('pulse_radar');
    expect(ids).toContain('apex_fanfare');

    AVAILABLE_RINGTONES.forEach((rt) => {
      expect(rt.name).toBeTruthy();
      expect(rt.subtitle).toBeTruthy();
      expect(rt.category).toBeTruthy();
    });
  });

  it('handles ringtone preview without audio context exceptions in headless mode', () => {
    expect(() => {
      alarmAudioService.previewRingtone('awakening', 1);
      alarmAudioService.stopRingtone();
    }).not.toThrow();
  });
});
