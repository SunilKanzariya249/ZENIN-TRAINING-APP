import { Alarm, RingtoneId } from '../types';
import { alarmAudioService } from './alarmAudioService';
import { hapticService } from './hapticService';
import { notificationService } from '../notifications/notificationService';

const ALARMS_STORAGE_KEY = 'zenin_alarms';

export interface NextAlarmInfo {
  alarm: Alarm;
  diffMs: number;
  formattedRemaining: string;
  countdownText: string;
  nextTriggerDate: Date;
}

class AlarmService {
  private alarms: Alarm[] = [];
  private activeAlarm: Alarm | null = null;
  private lastTriggeredKey: string | null = null;
  private checkTimer: NodeJS.Timeout | null = null;
  private hapticTimer: NodeJS.Timeout | null = null;
  private activeAlarmListeners: ((alarm: Alarm | null) => void)[] = [];
  private listListeners: ((alarms: Alarm[]) => void)[] = [];

  constructor() {
    this.loadAlarms();
    this.startScheduler();
  }

  private loadAlarms(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
      if (raw) {
        this.alarms = JSON.parse(raw);
      } else {
        // Seed default template alarm
        this.alarms = [
          {
            id: 'alarm_default_1',
            time: '07:00',
            label: 'Hunter Dawn Protocol',
            enabled: false,
            days: [1, 2, 3, 4, 5], // Mon to Fri
            ringtone: 'awakening',
            snoozeMinutes: 5,
            vibrate: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'alarm_default_2',
            time: '21:30',
            label: 'Twilight Recovery Directive',
            enabled: false,
            days: [], // Once
            ringtone: 'shadow_gate',
            snoozeMinutes: 5,
            vibrate: true,
            createdAt: new Date().toISOString(),
          },
        ];
        this.saveToStorage();
      }
    } catch {
      this.alarms = [];
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(this.alarms));
    } catch (err) {
      console.warn('Failed to save alarms to storage:', err);
    }
  }

  public getAlarms(): Alarm[] {
    return [...this.alarms];
  }

  public getActiveAlarm(): Alarm | null {
    return this.activeAlarm;
  }

  public onActiveAlarmChange(cb: (alarm: Alarm | null) => void): () => void {
    this.activeAlarmListeners.push(cb);
    cb(this.activeAlarm);
    return () => {
      this.activeAlarmListeners = this.activeAlarmListeners.filter((l) => l !== cb);
    };
  }

  public onAlarmsListChange(cb: (alarms: Alarm[]) => void): () => void {
    this.listListeners.push(cb);
    cb(this.getAlarms());
    return () => {
      this.listListeners = this.listListeners.filter((l) => l !== cb);
    };
  }

  private notifyListListeners(): void {
    const list = this.getAlarms();
    this.listListeners.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('Alarm list listener error:', err);
      }
    });
  }

  private notifyActiveAlarmListeners(): void {
    this.activeAlarmListeners.forEach((cb) => {
      try {
        cb(this.activeAlarm);
      } catch (err) {
        console.error('Active alarm listener error:', err);
      }
    });
  }

  public saveAlarm(alarmData: Omit<Alarm, 'id' | 'createdAt'> & { id?: string }): Alarm {
    const id = alarmData.id || `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newAlarm: Alarm = {
      ...alarmData,
      days: alarmData.days || [],
      id,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = this.alarms.findIndex((a) => a.id === id);
    if (existingIdx >= 0) {
      this.alarms[existingIdx] = newAlarm;
    } else {
      this.alarms.push(newAlarm);
    }

    // Sort alarms chronologically by time
    this.alarms.sort((a, b) => a.time.localeCompare(b.time));
    this.saveToStorage();
    this.notifyListListeners();
    return newAlarm;
  }

  public deleteAlarm(id: string): void {
    this.alarms = this.alarms.filter((a) => a.id !== id);
    this.saveToStorage();
    this.notifyListListeners();
    if (this.activeAlarm && this.activeAlarm.id === id) {
      this.dismissActiveAlarm();
    }
  }

  public toggleAlarm(id: string, forceEnabled?: boolean): void {
    const alarm = this.alarms.find((a) => a.id === id);
    if (alarm) {
      alarm.enabled = forceEnabled !== undefined ? forceEnabled : !alarm.enabled;
      this.saveToStorage();
      this.notifyListListeners();
    }
  }

  /**
   * Calculates the next upcoming active alarm and remaining duration.
   */
  public getNextAlarm(): NextAlarmInfo | null {
    const enabledAlarms = this.alarms.filter((a) => a.enabled);
    if (enabledAlarms.length === 0) return null;

    const now = new Date();
    let closestAlarm: Alarm | null = null;
    let shortestDiffMs = Infinity;
    let closestTriggerDate = new Date();

    enabledAlarms.forEach((alarm) => {
      const [targetHour, targetMinute] = alarm.time.split(':').map(Number);

      // Check next 7 calendar days to find next matching day
      for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + dayOffset);
        candidate.setHours(targetHour, targetMinute, 0, 0);

        if (candidate.getTime() <= now.getTime()) {
          continue;
        }

        const candidateDayOfWeek = candidate.getDay(); // 0-6
        const daysList = alarm.days || [];
        const isMatchingDay = daysList.length === 0 || daysList.includes(candidateDayOfWeek);

        if (isMatchingDay) {
          const diff = candidate.getTime() - now.getTime();
          if (diff < shortestDiffMs) {
            shortestDiffMs = diff;
            closestAlarm = alarm;
            closestTriggerDate = candidate;
          }
          break;
        }
      }
    });

    if (!closestAlarm) return null;

    const remainingStr = this.formatRemainingTime(shortestDiffMs);
    return {
      alarm: closestAlarm,
      diffMs: shortestDiffMs,
      formattedRemaining: remainingStr,
      countdownText: remainingStr,
      nextTriggerDate: closestTriggerDate,
    };
  }

  public formatRemainingTime(ms: number): string {
    const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) return 'in less than a minute';
    if (hours === 0) return `in ${minutes}m`;
    if (minutes === 0) return `in ${hours}h`;
    return `in ${hours}h ${minutes}m`;
  }

  /**
   * Continuous 1-second interval scheduler.
   */
  private startScheduler(): void {
    if (typeof window === 'undefined') return;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = setInterval(() => {
      this.evaluateAlarms();
    }, 1000);
  }

  public evaluateAlarms(): void {
    if (this.activeAlarm) return; // Already ringing

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const currentDay = now.getDay();
    const currentMinuteKey = `${now.toISOString().slice(0, 10)}_${currentTimeStr}`;

    if (this.lastTriggeredKey === currentMinuteKey) {
      return; // Already fired for this minute
    }

    const enabledAlarms = this.alarms.filter((a) => a.enabled);

    for (const alarm of enabledAlarms) {
      if (alarm.time === currentTimeStr) {
        const matchesDay = alarm.days.length === 0 || alarm.days.includes(currentDay);
        if (matchesDay) {
          this.lastTriggeredKey = currentMinuteKey;
          this.triggerAlarm(alarm);
          break;
        }
      }
    }
  }

  public triggerAlarm(alarm: Alarm): void {
    this.activeAlarm = alarm;

    // Start audio synthesis
    alarmAudioService.startRingtone(alarm.ringtone);

    // Start haptic vibration cadence
    if (alarm.vibrate) {
      this.startHapticPattern();
    }

    // Send push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ ALARM: ${alarm.label}`, {
          body: `Time: ${alarm.time} • Tap to disarm or snooze.`,
          tag: 'zenin_alarm',
          requireInteraction: true,
        });
      } catch {}
    }

    // If one-time alarm, disable for future
    if ((alarm.days || []).length === 0) {
      alarm.enabled = false;
      this.saveToStorage();
      this.notifyListListeners();
    }

    this.notifyActiveAlarmListeners();
  }

  public triggerAlarmForTesting(alarm: Alarm): void {
    this.triggerAlarm(alarm);
  }

  private startHapticPattern(): void {
    this.stopHapticPattern();
    hapticService.heavy();
    this.hapticTimer = setInterval(() => {
      if (this.activeAlarm) {
        hapticService.heavy();
      } else {
        this.stopHapticPattern();
      }
    }, 1200);
  }

  private stopHapticPattern(): void {
    if (this.hapticTimer) {
      clearInterval(this.hapticTimer);
      this.hapticTimer = null;
    }
  }

  /**
   * Snoozes the ringing alarm for N minutes.
   */
  public snoozeActiveAlarm(minutes = 5): void {
    if (!this.activeAlarm) return;
    const currentAlarm = this.activeAlarm;
    this.dismissActiveAlarm();

    // Schedule temporary snooze alarm
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeHours = String(now.getHours()).padStart(2, '0');
    const snoozeMinutes = String(now.getMinutes()).padStart(2, '0');
    const snoozeTimeStr = `${snoozeHours}:${snoozeMinutes}`;

    this.saveAlarm({
      time: snoozeTimeStr,
      label: `Snooze: ${currentAlarm.label}`,
      enabled: true,
      days: [], // One-time
      ringtone: currentAlarm.ringtone,
      snoozeMinutes: currentAlarm.snoozeMinutes,
      vibrate: currentAlarm.vibrate,
    });
  }

  /**
   * Stops audio and haptics, and dismisses active ringing modal.
   */
  public dismissActiveAlarm(): void {
    alarmAudioService.stopRingtone();
    this.stopHapticPattern();
    this.activeAlarm = null;
    this.notifyActiveAlarmListeners();
  }
}

export const alarmService = new AlarmService();

if (typeof window !== 'undefined') {
  (window as any).alarmService = alarmService;
}
