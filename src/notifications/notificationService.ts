import { Mission, UserSettings } from '../types';

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
}

class NotificationEngine {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
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

  public checkMissionReminders(missions: Mission[], settings: UserSettings): string[] {
    if (!settings.notificationsEnabled) return [];
    const triggered: string[] = [];
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    missions.forEach((m) => {
      if (m.status === 'active' && m.reminderTime && m.reminderTime === currentTimeStr) {
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
    });

    return triggered;
  }
}

export const notificationService = new NotificationEngine();
