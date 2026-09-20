import { create } from 'zustand';
import { format } from 'date-fns';
import {
  User,
  Mission,
  Category,
  Achievement,
  FocusSession,
  UserSettings,
  XpTransaction,
  SystemNotification,
} from '../types';
import { storageEngine, DatabaseState } from '../database/db';
import { awardUserXp } from '../services/xpEngine';
import { recordUserActivity } from '../services/streakEngine';
import { evaluateAchievements } from '../services/achievementEngine';
import { createNextRecurringMission } from '../services/recurrenceEngine';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { notificationService } from '../notifications/notificationService';
import { syncEngine, buildProfilePayload } from '../services/syncEngine';
import { authService } from '../services/authService';
import { stepCounterService } from '../services/stepCounterService';

export type NavTab = 'home' | 'missions' | 'calendar' | 'statistics' | 'profile';

interface AppStoreState extends DatabaseState {
  activeTab: NavTab;
  systemModal: SystemNotification | null;
  createMissionOpen: boolean;
  editingMissionId: string | null;
  inspectingMissionId: string | null;
  activeFocusMissionId: string | null;
  dailyBriefingOpen: boolean;
  eveningReviewOpen: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';

  // Actions
  setActiveTab: (tab: NavTab) => void;
  setSystemModal: (modal: SystemNotification | null) => void;
  setCreateMissionOpen: (open: boolean, editingId?: string | null) => void;
  setInspectingMissionId: (id: string | null) => void;
  setActiveFocusMissionId: (id: string | null) => void;
  setDailyBriefingOpen: (open: boolean) => void;
  setEveningReviewOpen: (open: boolean) => void;
  setAuthModal: (open: boolean, mode?: 'login' | 'signup') => void;

  // Auth & Onboarding
  loginUser: (user: User) => void;
  logoutUser: () => void;
  completeOnboarding: (preferences?: Partial<UserSettings>) => void;

  // Mission CRUD
  addMission: (missionData: Partial<Mission> & { title: string; categoryId: string }) => Mission;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  archiveMission: (id: string) => void;
  restoreMission: (id: string) => void;
  duplicateMission: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // Subtasks
  toggleSubtask: (missionId: string, subtaskId: string) => void;
  addSubtask: (missionId: string, title: string) => void;
  deleteSubtask: (missionId: string, subtaskId: string) => void;

  // Core RPG Mission Completion
  completeMission: (id: string) => void;
  uncompleteMission: (id: string) => void;

  // Focus Sessions
  completeFocusSession: (durationMinutes: number, missionId?: string, type?: FocusSession['type']) => void;

  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Settings & Storage
  updateSettings: (partial: Partial<UserSettings>) => void;
  clearCompletedMissions: () => void;
  resetToDemoData: () => void;
  importDatabaseState: (state: DatabaseState) => void;
}

const loadedState = storageEngine.loadState();
soundService.setConfig(loadedState.settings.soundEnabled, loadedState.settings.soundVolume);
hapticService.setEnabled(loadedState.settings.hapticsEnabled);
stepCounterService.setDailyGoal(loadedState.settings.dailyStepGoal || 10000);

export const useAppStore = create<AppStoreState>((set, get) => ({
  ...loadedState,
  activeTab: 'home',
  systemModal: null,
  createMissionOpen: false,
  editingMissionId: null,
  inspectingMissionId: null,
  activeFocusMissionId: null,
  dailyBriefingOpen: false,
  eveningReviewOpen: false,
  authModalOpen: false,
  authModalMode: 'login',

  setActiveTab: (tab) => {
    soundService.playClick();
    hapticService.light();
    set({ activeTab: tab });
  },

  setSystemModal: (modal) => set({ systemModal: modal }),
  setCreateMissionOpen: (open, editingId = null) => {
    soundService.playClick();
    set({ createMissionOpen: open, editingMissionId: editingId });
  },
  setInspectingMissionId: (id) => {
    soundService.playClick();
    set({ inspectingMissionId: id });
  },
  setActiveFocusMissionId: (id) => set({ activeFocusMissionId: id }),
  setDailyBriefingOpen: (open) => set({ dailyBriefingOpen: open }),
  setEveningReviewOpen: (open) => set({ eveningReviewOpen: open }),
  setAuthModal: (open, mode = 'login') => {
    soundService.playClick();
    set({ authModalOpen: open, authModalMode: mode });
  },

  loginUser: (user) => {
    const updated = { ...get(), user, isAuthenticated: true };
    storageEngine.saveState(updated);
    set({ user, isAuthenticated: true });
    // Trigger background cloud sync
    syncEngine.syncNow(user.id);
  },

  logoutUser: () => {
    const guestUser = authService.createGuestUser();
    const updated = { ...get(), user: guestUser, isAuthenticated: false };
    storageEngine.saveState(updated);
    set({ user: guestUser, isAuthenticated: false });
  },

  completeOnboarding: (preferences) => {
    const newSettings = { ...get().settings, ...(preferences || {}) };
    const updated = { ...get(), hasOnboarded: true, settings: newSettings };
    storageEngine.saveState(updated);
    set({ hasOnboarded: true, settings: newSettings });
  },

  addMission: (missionData) => {
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const newMission: Mission = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: get().user.id,
      title: missionData.title.trim(),
      description: missionData.description || '',
      priority: missionData.priority || 'COMMON',
      categoryId: missionData.categoryId,
      status: 'active',
      dueDate: missionData.dueDate || format(new Date(), 'yyyy-MM-dd'),
      dueTime: missionData.dueTime || '18:00',
      startDate: missionData.startDate,
      reminderTime: missionData.reminderTime,
      recurrence: missionData.recurrence || 'none',
      recurrenceInterval: missionData.recurrenceInterval || 1,
      tags: missionData.tags || [],
      subtasks: missionData.subtasks || [],
      estimatedDuration: missionData.estimatedDuration || 30,
      xpReward: missionData.xpReward || 50,
      customXp: missionData.customXp || false,
      createdAt: now,
      updatedAt: now,
      notes: missionData.notes || '',
      attachments: missionData.attachments || [],
      favorite: missionData.favorite || false,
      archived: false,
      xpAwarded: false,
    };

    const newMissions = [newMission, ...get().missions];
    set({ missions: newMissions, createMissionOpen: false, editingMissionId: null });
    storageEngine.saveState({ ...get(), missions: newMissions });

    // Enqueue cloud sync mutation
    syncEngine.enqueue('missions', 'upsert', {
      id: newMission.id,
      user_id: newMission.userId,
      title: newMission.title,
      description: newMission.description,
      priority: newMission.priority,
      category_id: newMission.categoryId,
      status: newMission.status,
      due_date: newMission.dueDate || null,
      due_time: newMission.dueTime || null,
      start_date: newMission.startDate || null,
      reminder_time: newMission.reminderTime || null,
      recurrence: newMission.recurrence,
      recurrence_interval: newMission.recurrenceInterval || 1,
      xp_reward: newMission.xpReward,
      custom_xp: newMission.customXp || false,
      estimated_duration: newMission.estimatedDuration,
      notes: newMission.notes,
      subtasks: newMission.subtasks,
      tags: newMission.tags,
      attachments: newMission.attachments,
      favorite: newMission.favorite,
      archived: newMission.archived,
      xp_awarded: newMission.xpAwarded,
      created_at: newMission.createdAt,
      updated_at: newMission.updatedAt,
    });

    soundService.playClick();
    hapticService.light();

    // Trigger local reminder registration if due time exists
    if (newMission.reminderTime) {
      notificationService.checkMissionReminders([newMission], get().settings);
    }

    return newMission;
  },

  updateMission: (id, updates) => {
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const newMissions = get().missions.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: now } : m
    );
    set({ missions: newMissions, createMissionOpen: false, editingMissionId: null });
    storageEngine.saveState({ ...get(), missions: newMissions });

    const updated = newMissions.find((m) => m.id === id);
    if (updated) {
      syncEngine.enqueue('missions', 'upsert', {
        id: updated.id,
        user_id: updated.userId,
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        category_id: updated.categoryId,
        status: updated.status,
        due_date: updated.dueDate || null,
        due_time: updated.dueTime || null,
        start_date: updated.startDate || null,
        reminder_time: updated.reminderTime || null,
        recurrence: updated.recurrence,
        recurrence_interval: updated.recurrenceInterval || 1,
        xp_reward: updated.xpReward,
        custom_xp: updated.customXp || false,
        estimated_duration: updated.estimatedDuration,
        notes: updated.notes,
        subtasks: updated.subtasks,
        tags: updated.tags,
        attachments: updated.attachments,
        favorite: updated.favorite,
        archived: updated.archived,
        xp_awarded: updated.xpAwarded,
        completed_at: updated.completedAt || null,
        updated_at: updated.updatedAt,
      });
    }

    soundService.playClick();
  },

  deleteMission: (id) => {
    const newMissions = get().missions.filter((m) => m.id !== id);
    set({
      missions: newMissions,
      inspectingMissionId: get().inspectingMissionId === id ? null : get().inspectingMissionId,
    });
    storageEngine.saveState({ ...get(), missions: newMissions });
    syncEngine.enqueue('missions', 'delete', { id });
    soundService.playClick();
  },

  archiveMission: (id) => {
    const newMissions = get().missions.map((m) =>
      m.id === id ? { ...m, archived: true, updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') } : m
    );
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
  },

  restoreMission: (id) => {
    const newMissions = get().missions.map((m) =>
      m.id === id ? { ...m, archived: false, updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss') } : m
    );
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
  },

  duplicateMission: (id) => {
    const target = get().missions.find((m) => m.id === id);
    if (!target) return;
    const duplicated: Mission = {
      ...target,
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copy)`,
      status: 'active',
      completedAt: undefined,
      xpAwarded: false,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      subtasks: target.subtasks.map((st) => ({
        ...st,
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        completed: false,
      })),
    };
    const newMissions = [duplicated, ...get().missions];
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
    soundService.playClick();
  },

  toggleFavorite: (id) => {
    const newMissions = get().missions.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m));
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
    soundService.playClick();
  },

  toggleSubtask: (missionId, subtaskId) => {
    const newMissions = get().missions.map((m) => {
      if (m.id !== missionId) return m;
      const updatedSubtasks = m.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      return { ...m, subtasks: updatedSubtasks };
    });
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
    soundService.playClick();
  },

  addSubtask: (missionId, title) => {
    if (!title.trim()) return;
    const newMissions = get().missions.map((m) => {
      if (m.id !== missionId) return m;
      const newSubtask = {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        completed: false,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
      };
      return { ...m, subtasks: [...m.subtasks, newSubtask] };
    });
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
  },

  deleteSubtask: (missionId, subtaskId) => {
    const newMissions = get().missions.map((m) => {
      if (m.id !== missionId) return m;
      return { ...m, subtasks: m.subtasks.filter((st) => st.id !== subtaskId) };
    });
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
  },

  // ──────────────────────────────────────────────
  // CORE RPG MISSION COMPLETION (ANTI-CHEAT IDEMPOTENT)
  // ──────────────────────────────────────────────
  completeMission: (id) => {
    const state = get();
    const mission = state.missions.find((m) => m.id === id);
    if (!mission || mission.status === 'completed') return;

    const completedTimestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const uniqueEventId = `mission_complete_${mission.id}`;

    // Anti-cheat verification: ensure XP cannot be awarded multiple times for the same mission
    const alreadyLogged = state.xpTransactions.some(
      (tx) => tx.uniqueEventId === uniqueEventId || (tx.sourceId === mission.id && tx.sourceType === 'mission')
    );
    const xpToAdd = (mission.xpAwarded || alreadyLogged) ? 0 : mission.xpReward;

    // 1. Calculate XP & Level Progression
    const xpResult = awardUserXp(state.user, xpToAdd);
    let updatedUser = xpResult.updatedUser;

    // 2. Update Streak
    const streakResult = recordUserActivity(updatedUser);
    updatedUser = streakResult.updatedUser;
    updatedUser.totalMissionsCompleted += 1;

    // 3. Mark Mission Completed
    let updatedMissions = state.missions.map((m) =>
      m.id === id
        ? {
            ...m,
            status: 'completed' as const,
            completedAt: completedTimestamp,
            xpAwarded: true,
            updatedAt: completedTimestamp,
          }
        : m
    );

    // 4. Handle Recurrence
    const nextRecurrence = createNextRecurringMission(mission);
    if (nextRecurrence) {
      updatedMissions = [nextRecurrence, ...updatedMissions];
    }

    // 5. XP Transaction Log
    const newTxList = [...state.xpTransactions];
    if (xpToAdd > 0) {
      const txRecord: XpTransaction = {
        id: `tx-${Date.now()}`,
        sourceId: mission.id,
        sourceType: 'mission',
        amount: xpToAdd,
        timestamp: completedTimestamp,
        uniqueEventId,
        reason: 'mission_completion',
      };
      newTxList.push(txRecord);

      // Enqueue XP transaction sync
      syncEngine.enqueue('xp_transactions', 'upsert', {
        id: txRecord.id,
        user_id: updatedUser.id,
        mission_id: mission.id,
        amount: xpToAdd,
        reason: 'mission_completion',
        unique_event_id: uniqueEventId,
        created_at: completedTimestamp,
      });
    }

    // 6. Enqueue Mission status sync
    syncEngine.enqueue('missions', 'upsert', {
      id: mission.id,
      user_id: updatedUser.id,
      title: mission.title,
      status: 'completed',
      xp_awarded: true,
      completed_at: completedTimestamp,
      updated_at: completedTimestamp,
    });

    // 7. Enqueue User Profile sync with full 16-field payload (missions completed, rank, productivity, focus)
    syncEngine.enqueue('profiles', 'upsert', buildProfilePayload(updatedUser, updatedMissions, state.focusSessions));

    // 8. Achievements Evaluation
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
      updatedUser,
      updatedMissions,
      state.focusSessions,
      state.achievements
    );

    // Sensory Sound & Haptics
    soundService.playMissionClear();
    hapticService.success();

    let modal: SystemNotification | null = null;
    if (xpResult.leveledUp) {
      modal = {
        id: `modal-${Date.now()}`,
        type: 'level_up',
        title: 'SYSTEM OVERDRIVE: LEVEL UP',
        subtitle: `HUNTER ADVANCEMENT DETECTED`,
        message: `You have breached Level ${xpResult.newLevel}! Rank status elevated to ${xpResult.newRank}.`,
        xp: xpToAdd,
        newLevel: xpResult.newLevel,
        newRank: xpResult.newRank,
        timestamp: completedTimestamp,
      };
    } else {
      modal = {
        id: `modal-${Date.now()}`,
        type: 'mission_cleared',
        title: 'MISSION CLEARED',
        subtitle: mission.title,
        message: `System objective successfully executed. Progression synchronized.`,
        xp: xpToAdd,
        timestamp: completedTimestamp,
      };
    }

    if (newlyUnlocked.length > 0) {
      soundService.playAchievement();
      hapticService.achievement();
    }

    // Update state and persist
    const nextState = {
      ...state,
      user: updatedUser,
      missions: updatedMissions,
      achievements: updatedAchievements,
      xpTransactions: newTxList,
      systemModal: modal,
    };

    set({
      user: updatedUser,
      missions: updatedMissions,
      achievements: updatedAchievements,
      xpTransactions: newTxList,
      systemModal: modal,
    });
    storageEngine.saveState(nextState);
  },

  uncompleteMission: (id) => {
    const state = get();
    const newMissions = state.missions.map((m) =>
      m.id === id ? { ...m, status: 'active' as const, completedAt: undefined } : m
    );
    set({ missions: newMissions });
    storageEngine.saveState({ ...state, missions: newMissions });
    soundService.playClick();
  },

  completeFocusSession: (durationMinutes, missionId, type = 'pomodoro') => {
    const state = get();
    const completedAt = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const xpReward = Math.round(durationMinutes * 2); // 2 XP per minute of deep focus

    const xpResult = awardUserXp(state.user, xpReward);
    let updatedUser = xpResult.updatedUser;
    updatedUser.totalFocusMinutes += durationMinutes;

    const streakResult = recordUserActivity(updatedUser);
    updatedUser = streakResult.updatedUser;

    const mission = missionId ? state.missions.find((m) => m.id === missionId) : undefined;

    const newSession: FocusSession = {
      id: `f-${Date.now()}`,
      missionId,
      missionTitle: mission ? mission.title : 'Deep Focus Session',
      durationMinutes,
      xpEarned: xpReward,
      completedAt,
      type,
    };

    const newSessions = [newSession, ...state.focusSessions];
    const newTxList = [
      ...state.xpTransactions,
      {
        id: `tx-${Date.now()}`,
        sourceId: newSession.id,
        sourceType: 'focus' as const,
        amount: xpReward,
        timestamp: completedAt,
        uniqueEventId: `focus_session_${newSession.id}`,
        reason: 'focus_session',
      },
    ];

    // Enqueue Focus Session sync
    syncEngine.enqueue('focus_sessions', 'upsert', {
      id: newSession.id,
      user_id: updatedUser.id,
      mission_id: newSession.missionId || null,
      mission_title: newSession.missionTitle || null,
      duration_minutes: newSession.durationMinutes,
      xp_earned: newSession.xpEarned,
      session_type: newSession.type,
      completed_at: newSession.completedAt,
    });

    // Enqueue profile sync with full 16-field payload (missions completed, rank, productivity, focus)
    syncEngine.enqueue('profiles', 'upsert', buildProfilePayload(updatedUser, state.missions, newSessions));

    const { updatedAchievements } = evaluateAchievements(
      updatedUser,
      state.missions,
      newSessions,
      state.achievements
    );

    soundService.playTimerComplete();
    hapticService.achievement();

    const modal: SystemNotification = {
      id: `modal-${Date.now()}`,
      type: 'mission_cleared',
      title: 'FOCUS PROTOCOL COMPLETE',
      subtitle: `${durationMinutes} Minutes Immersed`,
      message: `Deep focus neural link completed. Mental stamina verified.`,
      xp: xpReward,
      timestamp: completedAt,
    };

    const nextState = {
      ...state,
      user: updatedUser,
      focusSessions: newSessions,
      achievements: updatedAchievements,
      xpTransactions: newTxList,
      systemModal: modal,
    };

    set({
      user: updatedUser,
      focusSessions: newSessions,
      achievements: updatedAchievements,
      xpTransactions: newTxList,
      systemModal: modal,
    });
    storageEngine.saveState(nextState);
  },

  addCategory: (catData) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    const newCategories = [...get().categories, newCat];
    set({ categories: newCategories });
    storageEngine.saveState({ ...get(), categories: newCategories });
  },

  deleteCategory: (id) => {
    const newCategories = get().categories.filter((c) => c.id !== id);
    set({ categories: newCategories });
    storageEngine.saveState({ ...get(), categories: newCategories });
  },

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    soundService.setConfig(updated.soundEnabled, updated.soundVolume);
    hapticService.setEnabled(updated.hapticsEnabled);
    if (partial.dailyStepGoal) {
      stepCounterService.setDailyGoal(partial.dailyStepGoal);
    }
    set({ settings: updated });
    storageEngine.saveState({ ...get(), settings: updated });
  },

  clearCompletedMissions: () => {
    const newMissions = get().missions.filter((m) => m.status !== 'completed');
    set({ missions: newMissions });
    storageEngine.saveState({ ...get(), missions: newMissions });
  },

  resetToDemoData: () => {
    storageEngine.clearAllData();
    const fresh = storageEngine.getInitialState();
    storageEngine.saveState(fresh);
    set({
      ...fresh,
      activeTab: 'home',
      systemModal: null,
      createMissionOpen: false,
      editingMissionId: null,
      inspectingMissionId: null,
    });
  },

  importDatabaseState: (imported) => {
    storageEngine.saveState(imported);
    set({
      ...imported,
      systemModal: null,
    });
  },
}));

// Wire Pedometer Step Milestones into RPG progression
stepCounterService.setOnMilestoneAwarded((award) => {
  const store = useAppStore.getState();
  const xpRes = awardUserXp(store.user, award.xpReward);
  const updatedUser = xpRes.updatedUser;
  const newTx: XpTransaction = {
    id: `xp-step-${Date.now()}`,
    sourceId: `milestone-${award.percent}`,
    sourceType: 'streak_bonus',
    amount: award.xpReward,
    timestamp: new Date().toISOString(),
    reason: award.title,
  };
  const nextState = {
    ...store,
    user: updatedUser,
    xpTransactions: [newTx, ...store.xpTransactions],
  };
  storageEngine.saveState(nextState);
  useAppStore.setState({
    user: updatedUser,
    xpTransactions: nextState.xpTransactions,
    systemModal: {
      id: `step-modal-${Date.now()}`,
      type: xpRes.leveledUp ? 'level_up' : 'system_alert',
      title: 'PHYSICAL CONDITIONING CLEAR',
      subtitle: award.title,
      message: `Physical conditioning objective reached (${award.percent}% of daily step target). +${award.xpReward} XP awarded!`,
      xp: award.xpReward,
      newLevel: xpRes.leveledUp ? xpRes.newLevel : undefined,
      newRank: xpRes.leveledUp ? xpRes.newRank : undefined,
      timestamp: new Date().toISOString(),
    },
  });
});
