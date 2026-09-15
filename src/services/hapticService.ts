class HapticEngine {
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public light() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore vibration error
    }
  }

  public medium() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([35, 20, 35]);
    } catch {
      // Ignore vibration error
    }
  }

  public levelUp() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([50, 40, 70, 40, 100]);
    } catch {
      // Ignore vibration error
    }
  }

  public achievement() {
    if (!this.enabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([40, 30, 40, 30, 60]);
    } catch {
      // Ignore vibration error
    }
  }
}

export const hapticService = new HapticEngine();
