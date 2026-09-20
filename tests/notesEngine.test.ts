import { describe, it, expect, beforeEach } from 'vitest';
import { storageEngine } from '../src/database/db';
import { exportBackupJson, parseAndValidateBackup } from '../src/database/backup';
import { authService } from '../src/services/authService';
import { migrationService } from '../src/services/migrationService';
import { useAppStore } from '../src/store/useAppStore';
import { Note, User } from '../src/types';

describe('Tactical Notes & Database Vault Persistence Engine', () => {
  beforeEach(() => {
    storageEngine.clearAllData();
    authService.clearMemoryVault();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    useAppStore.setState({
      notes: [],
      notesModalOpen: false,
      editingNote: null,
    });
  });

  it('creates, reads, updates, and deletes tactical notes via AppStore', () => {
    const store = useAppStore.getState();

    // 1. Create Note
    const createdNote = store.addNote({
      title: 'Gate Raid Strategy Alpha',
      content: 'Clear dungeon perimeter first before engaging the Red Monarch.',
      category: 'TACTICAL',
      color: 'cyan',
      pinned: false,
      tags: ['raid', 's-rank', 'boss'],
    });

    expect(createdNote.id).toBeDefined();
    expect(createdNote.title).toBe('Gate Raid Strategy Alpha');
    expect(createdNote.category).toBe('TACTICAL');
    expect(createdNote.pinned).toBe(false);
    expect(useAppStore.getState().notes.length).toBe(1);

    // 2. Update Note
    store.updateNote(createdNote.id, {
      title: 'Gate Raid Strategy Alpha [REVISED]',
      pinned: true,
      color: 'amber',
    });

    const updated = useAppStore.getState().notes.find((n) => n.id === createdNote.id);
    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Gate Raid Strategy Alpha [REVISED]');
    expect(updated?.pinned).toBe(true);
    expect(updated?.color).toBe('amber');

    // 3. Toggle Pin
    store.togglePinNote(createdNote.id);
    expect(useAppStore.getState().notes.find((n) => n.id === createdNote.id)?.pinned).toBe(false);

    store.togglePinNote(createdNote.id);
    expect(useAppStore.getState().notes.find((n) => n.id === createdNote.id)?.pinned).toBe(true);

    // 4. Delete Note
    store.deleteNote(createdNote.id);
    expect(useAppStore.getState().notes.length).toBe(0);
  });

  it('persists notes across StorageEngine reload cycles', () => {
    const note1: Note = {
      id: 'note-test-01',
      userId: 'hunter-01',
      title: 'Solo Leveling Physical Routine',
      content: '100 pushups, 100 situps, 100 squats, 10km run.',
      category: 'TRAINING',
      color: 'emerald',
      pinned: true,
      tags: ['conditioning', 'daily'],
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    };

    const note2: Note = {
      id: 'note-test-02',
      userId: 'hunter-01',
      title: 'Mana Core Frequency',
      content: '7.83 Hz resonance frequency yields 20% faster mana recovery.',
      category: 'INTEL',
      color: 'violet',
      pinned: false,
      tags: ['mana', 'intel'],
      createdAt: '2026-09-20T11:00:00Z',
      updatedAt: '2026-09-20T11:00:00Z',
    };

    const state = storageEngine.getInitialState();
    state.notes = [note1, note2];
    storageEngine.saveState(state);

    const loaded = storageEngine.loadState();
    expect(loaded.notes).toBeDefined();
    expect(loaded.notes.length).toBe(2);
    expect(loaded.notes[0].title).toBe('Solo Leveling Physical Routine');
    expect(loaded.notes[0].pinned).toBe(true);
    expect(loaded.notes[1].color).toBe('violet');
  });

  it('includes notes in backup JSON export and restores them validly', () => {
    const testNote: Note = {
      id: 'note-bk-1',
      userId: 'user-bk',
      title: 'Backup Protocol Memo',
      content: 'Critical offline storage check.',
      category: 'PERSONAL',
      color: 'rose',
      pinned: false,
      tags: ['backup'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const state = storageEngine.getInitialState();
    state.notes = [testNote];

    const json = exportBackupJson(state);
    expect(json).toContain('Backup Protocol Memo');
    expect(json).toContain('note-bk-1');

    const validated = parseAndValidateBackup(json);
    expect(validated.valid).toBe(true);
    expect(validated.state?.notes.length).toBe(1);
    expect(validated.state?.notes[0].title).toBe('Backup Protocol Memo');
  });

  it('preserves and restores notes through the account database vault upon login', async () => {
    const testPhone = '+919123456780';
    const testPass = 'hunterPassword99';

    // 1. Sign up account
    const signup = await authService.signUpWithPhonePassword(testPhone, testPass, 'Shadow Commander');
    expect(signup.success).toBe(true);
    const user = signup.user as User;

    // 2. Add notes to vault for this user
    const userNotes: Note[] = [
      {
        id: 'note-vault-1',
        userId: user.id,
        title: 'Shadow Extraction Ritual',
        content: 'Arise: Must be spoken with clear intention.',
        category: 'TACTICAL',
        color: 'cyan',
        pinned: true,
        tags: ['shadow', 'necromancy'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const currentState = {
      user,
      missions: [],
      focusSessions: [],
      achievements: [],
      xpTransactions: [],
      notes: userNotes,
    };

    // Persist to user's registered vault record
    authService.persistUserDataToVault(testPhone, currentState);

    // Verify vault contains the note
    const vaultData = authService.getUserDataFromVault(testPhone);
    expect(vaultData).toBeDefined();
    expect(vaultData.notes).toBeDefined();
    expect(vaultData.notes.length).toBe(1);
    expect(vaultData.notes[0].title).toBe('Shadow Extraction Ritual');

    // 3. Log in again with mobile number & password
    const loginRes = await authService.loginWithPhonePassword(testPhone, testPass);
    expect(loginRes.success).toBe(true);
    expect(loginRes.savedData).toBeDefined();
    expect(loginRes.savedData.notes).toBeDefined();
    expect(loginRes.savedData.notes.length).toBe(1);
    expect(loginRes.savedData.notes[0].title).toBe('Shadow Extraction Ritual');
  });

  it('merges guest notes into hunter account seamlessly during migration', async () => {
    const authUser: User = {
      id: 'hunter-cloud-99',
      name: 'Sung Jin-Woo',
      email: '9876543210@zenin.app',
      phone: '+919876543210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      level: 10,
      currentXp: 500,
      totalXpEarned: 5000,
      currentStreak: 5,
      bestStreak: 10,
      lastActiveDate: '2026-09-20',
      streakFreezeAvailable: 1,
      totalMissionsCompleted: 20,
      totalFocusMinutes: 300,
      createdAt: '2026-09-01',
      isGuest: false,
    };

    const guestNotes: Note[] = [
      {
        id: 'guest-note-1',
        userId: 'hunter-guest-01',
        title: 'Guest Note Alpha',
        content: 'Created while browsing in guest mode.',
        category: 'PERSONAL',
        color: 'emerald',
        pinned: false,
        tags: ['guest', 'draft'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const localState = {
      user: { ...authUser, isGuest: true, id: 'hunter-guest-01' },
      missions: [],
      focusSessions: [],
      achievements: [],
      xpTransactions: [],
      notes: guestNotes,
    };

    const result = await migrationService.migrateGuestToAccount(authUser, localState);
    expect(result.success).toBe(true);
    expect(result.mergedNotes).toBeDefined();
    expect(result.mergedNotes.length).toBe(1);
    expect(result.mergedNotes[0].id).toBe('guest-note-1');
    expect(result.mergedNotes[0].userId).toBe(authUser.id); // Re-bound to the authenticated user ID
  });
});
