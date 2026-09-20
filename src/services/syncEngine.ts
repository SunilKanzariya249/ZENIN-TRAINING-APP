import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { SyncStatus, User, Mission, FocusSession } from '../types';
import { getRankForLevel } from '../constants/ranks';
import { calculateProductivityScore } from './productivityScore';

export interface OfflineMutation {
  id: string;
  table: 'profiles' | 'missions' | 'focus_sessions' | 'user_achievements' | 'xp_transactions' | 'user_settings' | 'notes';
  action: 'upsert' | 'delete';
  payload: any;
  timestamp: number;
  retryCount: number;
}

type SyncStatusListener = (status: SyncStatus, lastSyncedAt: string | null) => void;

class SyncEngine {
  private queueKey = 'zenin_offline_sync_queue';
  private lastSyncKey = 'zenin_last_sync_timestamp';
  private status: SyncStatus = 'synced';
  private lastSyncedAt: string | null = null;
  private listeners: Set<SyncStatusListener> = new Set();
  private isProcessing = false;

  constructor() {
    this.lastSyncedAt = this.loadLastSyncTimestamp();
    this.status = !this.isOnline() ? 'offline' : 'synced';
    this.setupNetworkListeners();
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    if (typeof navigator.onLine === 'boolean') return navigator.onLine;
    return true;
  }

  private getStorage(): Storage | null {
    if (typeof localStorage !== 'undefined') return localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    return null;
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.setStatus('synced');
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.setStatus('offline');
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isOnline()) {
          this.flushQueue();
        }
      });
    }
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getLastSyncedAt(): string | null {
    return this.lastSyncedAt;
  }

  public onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.lastSyncedAt);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.status = status;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.status, this.lastSyncedAt));
  }

  private loadLastSyncTimestamp(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(this.lastSyncKey);
    } catch {
      return null;
    }
  }

  private setLastSyncTimestamp(isoString: string) {
    this.lastSyncedAt = isoString;
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(this.lastSyncKey, isoString);
      } catch {
        // Ignored
      }
    }
    this.notifyListeners();
  }

  public getQueue(): OfflineMutation[] {
    const storage = this.getStorage();
    if (!storage) return [];
    try {
      const raw = storage.getItem(this.queueKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: OfflineMutation[]) {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      storage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (err) {
      console.warn('SyncEngine: Failed to save offline queue:', err);
    }
  }

  /**
   * Enqueue a local mutation (upsert or delete) to be synchronized with the cloud
   */
  public enqueue(
    table: OfflineMutation['table'],
    action: OfflineMutation['action'],
    payload: any
  ) {
    const queue = this.getQueue();
    const mutation: OfflineMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      table,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    queue.push(mutation);
    this.saveQueue(queue);

    // If online and Supabase is ready, attempt to flush
    if (this.isOnline()) {
      this.flushQueue();
    } else {
      this.setStatus('offline');
    }
  }

  /**
   * Process all queued offline mutations and upload them to Supabase
   */
  public async flushQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!this.isOnline()) {
      this.setStatus('offline');
      return;
    }

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      // Supabase is not yet configured with valid credentials; keep mutations stored
      return;
    }

    // Only attempt cloud sync if there is an active authenticated cloud session
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return;
      }
    } catch {
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      this.setStatus('synced');
      return;
    }

    this.isProcessing = true;
    this.setStatus('syncing');

    const remainingQueue: OfflineMutation[] = [];

    for (const mutation of queue) {
      try {
        if (mutation.action === 'upsert') {
          const { error } = await supabase
            .from(mutation.table)
            .upsert(mutation.payload);

          if (error) throw error;
        } else if (mutation.action === 'delete') {
          const { error } = await supabase
            .from(mutation.table)
            .delete()
            .eq('id', mutation.payload.id);

          if (error) throw error;
        }
      } catch (err) {
        console.warn(`SyncEngine: Mutation ${mutation.id} failed:`, err);
        mutation.retryCount += 1;
        // Keep in queue if retry count is under 5
        if (mutation.retryCount < 5) {
          remainingQueue.push(mutation);
        }
      }
    }

    this.saveQueue(remainingQueue);
    this.isProcessing = false;

    if (remainingQueue.length > 0) {
      this.setStatus('error');
    } else {
      this.setStatus('synced');
      this.setLastSyncTimestamp(new Date().toISOString());
    }
  }

  /**
   * Manual trigger for UI "SYNC NOW" button
   */
  public async syncNow(
    userId?: string,
    user?: User,
    missions?: Mission[],
    focusSessions?: FocusSession[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isOnline()) {
      this.setStatus('offline');
      return { success: false, error: 'Network link offline. Reconnect to sync.' };
    }

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      // If dev mode / unconfigured, simulate instant successful sync
      this.setStatus('syncing');
      await new Promise((r) => setTimeout(r, 200));
      this.setStatus('synced');
      this.setLastSyncTimestamp(new Date().toISOString());
      return { success: true };
    }

    try {
      this.setStatus('syncing');
      await this.flushQueue();

      // Only attempt cloud profile sync if authenticated in Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        if (user) {
          const payload = buildProfilePayload(user, missions, focusSessions);
          await supabase.from('profiles').upsert(payload);
        } else if (userId) {
          await supabase
            .from('profiles')
            .update({ last_active_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() })
            .eq('id', userId);
        }
      }

      this.setStatus('synced');
      this.setLastSyncTimestamp(new Date().toISOString());
      return { success: true };
    } catch (err: any) {
      this.setStatus('error');
      return { success: false, error: err.message || 'Synchronization failed.' };
    }
  }
}

/**
 * Builds the complete 16-field profile payload for Supabase public.profiles
 */
export function buildProfilePayload(
  user: User,
  missions: Mission[] = [],
  focusSessions: FocusSession[] = []
) {
  const completedMissionsCount = Math.max(
    user.totalMissionsCompleted || 0,
    missions.filter((m) => m.status === 'completed').length
  );
  const totalFocusMin = Math.max(
    user.totalFocusMinutes || 0,
    focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  );
  const prodBreakdown = calculateProductivityScore(missions, focusSessions, user.currentStreak);

  return {
    id: user.id,
    phone: user.phone || null,
    display_name: user.name,
    avatar_url: user.avatar,
    level: user.level,
    rank: getRankForLevel(user.level).title,
    current_xp: user.currentXp,
    total_xp_earned: user.totalXpEarned,
    current_streak: user.currentStreak,
    best_streak: user.bestStreak,
    productivity_score: prodBreakdown.score,
    streak_freeze_available: user.streakFreezeAvailable ?? 1,
    total_missions_completed: completedMissionsCount,
    total_focus_minutes: totalFocusMin,
    last_active_date: user.lastActiveDate || new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };
}

export const syncEngine = new SyncEngine();
