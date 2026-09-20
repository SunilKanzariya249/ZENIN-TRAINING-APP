import { Mission, UserSettings } from '../types';

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
}

const NOTIFIED_DEADLINES_KEY = 'zenin_notified_deadlines';

class NotificationEngine {
  private permission: NotificationPermission = 'default';
  private notifiedKeys: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
    this.loadNotifiedKeys();
  }

  private loadNotifiedKeys(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(NOTIFIED_DEADLINES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.notifiedKeys = new Set(parsed);
        }
      }
    } catch {
      this.notifiedKeys = new Set();
    }
  }

  private saveNotifiedKeys(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(NOTIFIED_DEADLINES_KEY, JSON.stringify(Array.from(this.notifiedKeys)));
    } catch {}
  }

  public clearNotifiedKeys(): void {
    this.notifiedKeys.clear();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(NOTIFIED_DEADLINES_KEY);
      } catch {}
    }
  }

  public getNotifiedKeys(): string[] {
    return Array.from(this.notifiedKeys);
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const res = await Notification.requestPermission();
      this.permission = res;
      return res === 'granted';
    } catch {
      return false;
    }
  }

  public isQuietHours(settings: UserSettings): boolean {
    if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes < endTotal;
    } else {
      // Over midnight: e.g. 22:00 to 07:00
      return currentMinutes >= startTotal || currentMinutes < endTotal;
    }
  }

  public scheduleLocalNotification(payload: NotificationPayload, settings: UserSettings): boolean {
    if (!settings.notificationsEnabled) return false;
    if (this.isQuietHours(settings)) {
      console.log('[ZENIN System Alert] Notification silenced due to Quiet Hours:', payload.title);
      return false;
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag || 'zenin-alert',
        });
        return true;
      } catch (err) {
        console.warn('Notification trigger error:', err);
      }
    }
    return false;
  }

  /**
   * Checks both upcoming reminders and uncompleted mission deadlines.
   * If a mission is NOT completed and reaches its deadline time, immediately fires a notification.
   */
  public checkMissionReminders(
    missions: Mission[],
    settings: UserSettings,
    onDeadlineAlert?: (mission: Mission) => void
  ): string[] {
    if (!settings.notificationsEnabled) return [];
    const triggered: string[] = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDate = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${currentMonth}-${currentDate}`;

    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMin = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    missions.forEach((m) => {
      // Must be active (NOT completed, NOT archived)
      if (m.status !== 'active' || m.archived) {
        return;
      }

      // 1. Advance Reminder Check (if reminderTime set e.g. 10m before)
      if (m.reminderTime && m.reminderTime === currentTimeStr) {
        const remKey = `rem_${m.id}_${todayStr}_${currentTimeStr}`;
        if (!this.notifiedKeys.has(remKey)) {
          this.notifiedKeys.add(remKey);
          this.saveNotifiedKeys();

          this.scheduleLocalNotification(
            {
              title: `SYSTEM ALERT: Mission Due Soon`,
              body: `Objective: "${m.title}" (${m.priority} • +${m.xpReward} XP)`,
              tag: `rem-${m.id}`,
            },
            settings
          );
          triggered.push(m.id);
        }
      }

      // 2. Mission Deadline Reached Check (Core User Request)
      if (settings.missionDeadlineAlertsEnabled !== false) {
        const deadlineDateStr = m.dueDate || todayStr;
        const deadlineTimeStr = m.dueTime || '18:00';

        const [y, mon, d] = deadlineDateStr.split('-').map(Number);
        const [h, min] = deadlineTimeStr.split(':').map(Number);

        if (!isNaN(y) && !isNaN(mon) && !isNaN(d) && !isNaN(h) && !isNaN(min)) {
          const deadlineDateObj = new Date(y, mon - 1, d, h, min, 0, 0);
          const timeDiffMs = now.getTime() - deadlineDateObj.getTime();

          // Deadline is reached: current time is >= deadline, and within past 24h
          if (timeDiffMs >= 0 && timeDiffMs <= 24 * 60 * 60 * 1000) {
            const deadlineKey = `deadline_${m.id}_${deadlineDateStr}_${deadlineTimeStr}`;
            if (!this.notifiedKeys.has(deadlineKey)) {
              this.notifiedKeys.add(deadlineKey);
              this.saveNotifiedKeys();

              this.scheduleLocalNotification(
                {
                  title: `⚠️ MISSION DEADLINE REACHED: Complete Mission Now!`,
                  body: `Directive "${m.title}" deadline has arrived (${deadlineTimeStr})! Complete this mission now to claim +${m.xpReward} XP.`,
                  tag: `deadline-${m.id}`,
                },
                settings
              );

              // Trigger foreground in-app alert callback if user is in app
              if (onDeadlineAlert) {
                onDeadlineAlert(m);
              }

              triggered.push(m.id);
            }
          }
        }
      }
    });

    return triggered;
  }
}

export const notificationService = new NotificationEngine();
