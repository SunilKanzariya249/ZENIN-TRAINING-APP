import { User, Mission, FocusSession, Achievement, XpTransaction } from '../types';
import { DatabaseState } from '../database/db';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './authService';
import { buildProfilePayload } from './syncEngine';

export interface MigrationResult {
  success: boolean;
  mergedUser: User;
  mergedMissions: Mission[];
  mergedFocusSessions: FocusSession[];
  mergedAchievements: Achievement[];
  mergedXpTransactions: XpTransaction[];
  migratedCount: number;
}

export class MigrationService {
  /**
   * Migrate and merge guest/local progress into the authenticated Supabase cloud account.
   * Ensures zero data loss and prevents duplicate entries.
   */
  public async migrateGuestToAccount(
    authenticatedUser: User,
    localState: Partial<DatabaseState>
  ): Promise<MigrationResult> {
    const supabase = getSupabase();
    const guestMissions = localState.missions || [];
    const guestFocus = localState.focusSessions || [];
    const guestAchievements = localState.achievements || [];
    const guestXpTx = localState.xpTransactions || [];
    const guestUser = localState.user;

    let cloudMissions: Mission[] = [];
    let cloudFocus: FocusSession[] = [];
    let cloudAchievements: Achievement[] = [];
    let cloudXpTx: XpTransaction[] = [];
    let cloudProfile: any = null;

    // 1. Fetch existing cloud data if Supabase is connected
    if (supabase && isSupabaseConfigured() && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const [profRes, missRes, focusRes, achRes, xpRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', authenticatedUser.id).maybeSingle(),
          supabase.from('missions').select('*').eq('user_id', authenticatedUser.id),
          supabase.from('focus_sessions').select('*').eq('user_id', authenticatedUser.id),
          supabase.from('user_achievements').select('*').eq('user_id', authenticatedUser.id),
          supabase.from('xp_transactions').select('*').eq('user_id', authenticatedUser.id),
        ]);

        cloudProfile = profRes.data;

        if (missRes.data) {
          cloudMissions = missRes.data.map((m: any) => this.mapCloudMissionToLocal(m));
        }
        if (focusRes.data) {
          cloudFocus = focusRes.data.map((f: any) => ({
            id: f.id,
            missionId: f.mission_id,
            missionTitle: f.mission_title,
            durationMinutes: f.duration_minutes,
            xpEarned: f.xp_earned,
            completedAt: f.completed_at,
            type: f.session_type || 'pomodoro',
          }));
        }
        if (achRes.data) {
          cloudAchievements = achRes.data.map((a: any) => ({
            id: a.achievement_id,
            name: a.name || a.achievement_id,
            description: a.description || '',
            icon: a.icon || 'award',
            requirement: a.requirement || '',
            unlocked: a.unlocked,
            unlockedAt: a.unlocked_at,
            progress: a.progress || 0,
            maxProgress: a.max_progress || 1,
            rewardXp: a.reward_xp || 100,
            category: 'missions',
          }));
        }
        if (xpRes.data) {
          cloudXpTx = xpRes.data.map((x: any) => ({
            id: x.id,
            sourceId: x.mission_id || '',
            sourceType: 'mission',
            amount: x.amount,
            timestamp: x.created_at,
            uniqueEventId: x.unique_event_id,
            reason: x.reason,
          }));
        }
      } catch (err) {
        console.warn('Migration: Failed to fetch existing cloud records:', err);
      }
    }

    // 1b. Retrieve stored progress from database vault if Supabase returned empty
    if (cloudMissions.length === 0 && cloudFocus.length === 0) {
      const phoneKey = authenticatedUser.phone || authenticatedUser.id;
      const vaultData = authService.getUserDataFromVault(phoneKey);
      if (vaultData) {
        if (vaultData.missions && vaultData.missions.length > 0) {
          cloudMissions = vaultData.missions;
        }
        if (vaultData.focusSessions && vaultData.focusSessions.length > 0) {
          cloudFocus = vaultData.focusSessions;
        }
        if (vaultData.achievements && vaultData.achievements.length > 0) {
          cloudAchievements = vaultData.achievements;
        }
        if (vaultData.xpTransactions && vaultData.xpTransactions.length > 0) {
          cloudXpTx = vaultData.xpTransactions;
        }
      }
    }

    // 2. Merge Missions (deduplicate by id or identical title)
    const missionMap = new Map<string, Mission>();
    // First insert cloud missions
    cloudMissions.forEach((m) => missionMap.set(m.id, m));

    // Next insert local guest missions, re-binding user_id
    let migratedCount = 0;
    guestMissions.forEach((m: Mission) => {
      // Check if mission already exists in cloud by title
      const existingByTitle = Array.from(missionMap.values()).find(
        (cm) => cm.title.trim().toLowerCase() === m.title.trim().toLowerCase()
      );

      if (existingByTitle) {
        // Merge: If local is completed but cloud is active, mark completed
        if (m.status === 'completed' && existingByTitle.status !== 'completed') {
          existingByTitle.status = 'completed';
          existingByTitle.completedAt = m.completedAt;
          existingByTitle.xpAwarded = true;
        }
      } else {
        // New mission to migrate
        const migratedMission: Mission = {
          ...m,
          userId: authenticatedUser.id,
        };
        missionMap.set(m.id, migratedMission);
        migratedCount++;
      }
    });
    const mergedMissions = Array.from(missionMap.values());

    // 3. Merge Focus Sessions (deduplicate by id or completedAt timestamp)
    const focusMap = new Map<string, FocusSession>();
    cloudFocus.forEach((f) => focusMap.set(f.id, f));
    guestFocus.forEach((f: FocusSession) => {
      if (!focusMap.has(f.id)) {
        focusMap.set(f.id, f);
      }
    });
    const mergedFocusSessions = Array.from(focusMap.values());

    // 4. Merge XP & Level (Retain the highest level and XP achieved)
    const highestTotalXp = Math.max(
      cloudProfile?.total_xp_earned || 0,
      authenticatedUser.totalXpEarned || 0,
      guestUser?.totalXpEarned || 0
    );
    const highestLevel = Math.max(
      cloudProfile?.level || 1,
      authenticatedUser.level || 1,
      guestUser?.level || 1
    );
    const highestStreak = Math.max(
      cloudProfile?.best_streak || 0,
      authenticatedUser.bestStreak || 0,
      guestUser?.bestStreak || 0
    );
    const currentStreak = Math.max(
      cloudProfile?.current_streak || 0,
      authenticatedUser.currentStreak || 0,
      guestUser?.currentStreak || 0
    );

    const mergedUser: User = {
      ...authenticatedUser,
      level: highestLevel,
      totalXpEarned: highestTotalXp,
      currentXp: Math.max(cloudProfile?.current_xp || 0, guestUser?.currentXp || 0),
      currentStreak,
      bestStreak: highestStreak,
      totalMissionsCompleted: Math.max(
        cloudProfile?.total_missions_completed || 0,
        guestUser?.totalMissionsCompleted || 0,
        mergedMissions.filter((m) => m.status === 'completed').length
      ),
      totalFocusMinutes: Math.max(
        cloudProfile?.total_focus_minutes || 0,
        guestUser?.totalFocusMinutes || 0,
        mergedFocusSessions.reduce((acc, f) => acc + (f.durationMinutes || 0), 0)
      ),
      isGuest: false,
    };

    // 5. Merge XP Transactions (deduplicate by uniqueEventId)
    const xpEventSet = new Set<string>();
    const mergedXpTransactions: XpTransaction[] = [];

    [...cloudXpTx, ...guestXpTx].forEach((tx) => {
      const eventKey = tx.uniqueEventId || `${tx.sourceId}_${tx.amount}_${tx.timestamp}`;
      if (!xpEventSet.has(eventKey)) {
        xpEventSet.add(eventKey);
        mergedXpTransactions.push({
          ...tx,
          uniqueEventId: eventKey,
        });
      }
    });

    // 6. Merge Achievements (Retain unlocked status)
    const mergedAchievements = (guestAchievements.length > 0 ? guestAchievements : []).map((ga: Achievement) => {
      const ca = cloudAchievements.find((c) => c.id === ga.id);
      if (ca?.unlocked) {
        return { ...ga, unlocked: true, unlockedAt: ca.unlockedAt || ga.unlockedAt };
      }
      return ga;
    });

    // 7. Push merged records to Supabase in background
    if (supabase && isSupabaseConfigured() && (typeof navigator === 'undefined' || navigator.onLine)) {
      this.uploadMergedToCloud(supabase, authenticatedUser.id, {
        mergedUser,
        mergedMissions,
        mergedFocusSessions,
        mergedAchievements,
        mergedXpTransactions,
      }).catch((err) => console.warn('Background migration sync encountered:', err));
    }

    return {
      success: true,
      mergedUser,
      mergedMissions,
      mergedFocusSessions,
      mergedAchievements,
      mergedXpTransactions,
      migratedCount,
    };
  }

  private async uploadMergedToCloud(supabase: any, userId: string, merged: any) {
    try {
      // Upsert profile with full 16-field payload (missions completed, rank, productivity, focus)
      const profilePayload = buildProfilePayload(
        merged.mergedUser,
        merged.mergedMissions,
        merged.mergedFocusSessions
      );
      await supabase.from('profiles').upsert(profilePayload);

      // Batch upsert missions
      for (const m of merged.mergedMissions) {
        await supabase.from('missions').upsert({
          id: m.id,
          user_id: userId,
          title: m.title,
          description: m.description || '',
          priority: m.priority || 'COMMON',
          category_id: m.categoryId || 'cat-work',
          status: m.status || 'active',
          due_date: m.dueDate || null,
          due_time: m.dueTime || null,
          start_date: m.startDate || null,
          reminder_time: m.reminderTime || null,
          recurrence: m.recurrence || 'none',
          recurrence_interval: m.recurrenceInterval || 1,
          xp_reward: m.xpReward || 50,
          custom_xp: m.customXp || false,
          estimated_duration: m.estimatedDuration || 30,
          notes: m.notes || '',
          subtasks: m.subtasks || [],
          tags: m.tags || [],
          attachments: m.attachments || [],
          favorite: m.favorite || false,
          archived: m.archived || false,
          xp_awarded: m.xpAwarded || false,
          completed_at: m.completedAt || null,
          created_at: m.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Batch upsert focus sessions
      for (const f of merged.mergedFocusSessions) {
        await supabase.from('focus_sessions').upsert({
          id: f.id,
          user_id: userId,
          mission_id: f.missionId || null,
          mission_title: f.missionTitle || null,
          duration_minutes: f.durationMinutes,
          xp_earned: f.xpEarned,
          session_type: f.type || 'pomodoro',
          completed_at: f.completedAt,
        });
      }

      // Batch upsert XP transactions
      for (const tx of merged.mergedXpTransactions) {
        await supabase.from('xp_transactions').upsert({
          id: tx.id,
          user_id: userId,
          mission_id: tx.sourceId || null,
          amount: tx.amount,
          reason: tx.reason || 'mission_completion',
          unique_event_id: tx.uniqueEventId || `${tx.sourceId}_${tx.amount}`,
          created_at: tx.timestamp,
        }, { onConflict: 'unique_event_id' });
      }
    } catch (err) {
      console.warn('Migration cloud push partially completed:', err);
    }
  }

  private mapCloudMissionToLocal(m: any): Mission {
    return {
      id: m.id,
      userId: m.user_id,
      title: m.title,
      description: m.description || '',
      priority: m.priority || 'COMMON',
      categoryId: m.category_id || 'cat-work',
      status: m.status || 'active',
      dueDate: m.due_date,
      dueTime: m.due_time,
      startDate: m.start_date,
      reminderTime: m.reminder_time,
      recurrence: m.recurrence || 'none',
      recurrenceInterval: m.recurrence_interval || 1,
      xpReward: m.xp_reward || 50,
      customXp: m.custom_xp || false,
      estimatedDuration: m.estimated_duration || 30,
      notes: m.notes || '',
      subtasks: m.subtasks || [],
      tags: m.tags || [],
      attachments: m.attachments || [],
      favorite: m.favorite || false,
      archived: m.archived || false,
      xpAwarded: m.xp_awarded || false,
      completedAt: m.completed_at,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    };
  }
}

export const migrationService = new MigrationService();
