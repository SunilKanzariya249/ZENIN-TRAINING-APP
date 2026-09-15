import { DatabaseState } from './db';

export function exportBackupJson(state: DatabaseState): string {
  const exportPayload = {
    appName: 'ZENIN',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: state,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function downloadBackupFile(state: DatabaseState): void {
  const jsonString = exportBackupJson(state);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zenin_hunter_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackup(jsonString: string): { valid: boolean; state?: DatabaseState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Corrupted or invalid JSON data' };
    }

    const data = parsed.data || parsed;
    if (!data.user || !Array.isArray(data.missions) || !Array.isArray(data.categories)) {
      return { valid: false, error: 'Incomplete backup structure: missing user or missions' };
    }

    return { valid: true, state: data as DatabaseState };
  } catch (err) {
    return { valid: false, error: `JSON Parse error: ${(err as Error).message}` };
  }
}
