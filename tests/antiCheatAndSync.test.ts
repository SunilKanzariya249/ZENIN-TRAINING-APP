import { describe, it, expect, beforeEach } from 'vitest';
import { syncEngine } from '../src/services/syncEngine';
import { useAppStore } from '../src/store/useAppStore';

// In-memory mock for Node test environment
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

describe('SyncEngine Offline Queue & Status', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enqueues mutations into persistent offline queue when triggered', () => {
    syncEngine.enqueue('missions', 'upsert', {
      id: 'test-m-1',
      title: 'Defeat Gate Guardian',
      status: 'active',
    });

    const queue = syncEngine.getQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);
    const lastItem = queue[queue.length - 1];
    expect(lastItem.table).toBe('missions');
    expect(lastItem.action).toBe('upsert');
    expect(lastItem.payload.title).toBe('Defeat Gate Guardian');
  });

  it('provides reliable sync status and manual sync triggers', async () => {
    const status = syncEngine.getStatus();
    expect(['synced', 'syncing', 'offline', 'error']).toContain(status);

    const syncRes = await syncEngine.syncNow('test-hunter-id');
    expect(syncRes.success).toBe(true);
    expect(syncEngine.getLastSyncedAt()).not.toBeNull();
  });
});

describe('Anti-Cheat XP Idempotency Ledger', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemoData();
  });

  it('prevents duplicate XP reward when completing an already completed mission', () => {
    const store = useAppStore.getState();

    // Create a new mission
    const testMission = store.addMission({
      title: 'Anti-Cheat Verification Mission',
      categoryId: 'cat-work',
      priority: 'EPIC',
      xpReward: 100,
    });

    const initialXp = useAppStore.getState().user.totalXpEarned;
    const initialTxCount = useAppStore.getState().xpTransactions.length;

    // 1st completion: Should award XP
    useAppStore.getState().completeMission(testMission.id);

    const xpAfterFirst = useAppStore.getState().user.totalXpEarned;
    const txAfterFirst = useAppStore.getState().xpTransactions.length;

    expect(xpAfterFirst).toBe(initialXp + 100);
    expect(txAfterFirst).toBe(initialTxCount + 1);

    // 2nd completion attempt: Must NOT award XP again (Anti-cheat guarantee)
    useAppStore.getState().completeMission(testMission.id);

    const xpAfterSecond = useAppStore.getState().user.totalXpEarned;
    const txAfterSecond = useAppStore.getState().xpTransactions.length;

    expect(xpAfterSecond).toBe(xpAfterFirst);
    expect(txAfterSecond).toBe(txAfterFirst);
  });
});
