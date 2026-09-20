import { Capacitor, registerPlugin } from '@capacitor/core';
import { StepMetrics, DailyStepRecord } from '../types';
import { soundService } from './soundService';
import { hapticService } from './hapticService';

export interface StepMilestoneAward {
  percent: number;
  xpReward: number;
  title: string;
}

export interface StepHistoryStats {
  averageSteps: number;
  maxSteps: number;
  bestDate: string;
  totalSteps: number;
  totalDistanceKm: number;
  totalCalories: number;
  goalsMet: number;
  totalDays: number;
}

interface NativeStepCounterPlugin {
  hasHardwareSensor(): Promise<{ supported: boolean; isListening: boolean }>;
  getStepMetrics(): Promise<{
    todaySteps: number;
    hardwareTotalSteps: number;
    baselineDate: string;
    hasHardwareSensor: boolean;
  }>;
  getHistory(): Promise<{ history: { date: string; steps: number }[] }>;
  recordStepOffset(options: { steps: number }): Promise<{ todaySteps: number }>;
}

const NativeStepCounter = registerPlugin<NativeStepCounterPlugin>('NativeStepCounter');

const STEP_STORAGE_PREFIX = 'zenin_steps_';
const MILESTONE_PREFIX = 'zenin_step_milestones_';
const STEP_HISTORY_KEY = 'zenin_step_history';
const LAST_SEEN_DATE_KEY = 'zenin_last_step_date';

// Human walking metrics constants
const STRIDE_LENGTH_METERS = 0.762; // ~2.5 feet per step
const CALORIES_PER_STEP = 0.04; // ~40 kcal per 1,000 steps
const CADENCE_MIN_INTERVAL_MS = 260; // Max ~3.8 steps/second to prevent noise/tremor counting
const PEAK_THRESHOLD_HIGH = 11.8; // Acceleration magnitude peak (m/s²)
const PEAK_THRESHOLD_LOW = 9.2; // Acceleration magnitude reset trough (m/s²)

class StepCounterService {
  private stepsToday = 0;
  private goal = 10000;
  private isSensorActive = false;
  private isNativeHardware = false;
  private lastStepTime = 0;
  private hasCrossedHighThreshold = false;
  private listeners: ((metrics: StepMetrics) => void)[] = [];
  private onMilestoneCallback: ((award: StepMilestoneAward) => void) | null = null;

  constructor() {
    this.checkDateRollover();
    this.initTodayData();
    this.startSensor();
    this.syncNativeHardwareSteps();
    this.attachLifecycleListeners();
  }

  public getTodayDateStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private attachLifecycleListeners(): void {
    if (typeof window === 'undefined') return;

    const handleResume = () => {
      this.checkDateRollover();
      this.syncNativeHardwareSteps();
    };

    window.addEventListener('focus', handleResume);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleResume();
        }
      });
    }
  }

  private checkDateRollover(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const today = this.getTodayDateStr();
      const lastSeen = localStorage.getItem(LAST_SEEN_DATE_KEY);

      if (lastSeen && lastSeen !== today) {
        // Rollover occurred - record final steps for previous day if not recorded
        const prevSteps = parseInt(localStorage.getItem(`${STEP_STORAGE_PREFIX}${lastSeen}`) || '0', 10);
        if (prevSteps > 0) {
          this.recordDailyToHistory(lastSeen, prevSteps, this.goal);
        }
      }

      localStorage.setItem(LAST_SEEN_DATE_KEY, today);
    } catch (err) {
      console.warn('Date rollover check error:', err);
    }
  }

  private initTodayData(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const todayKey = `${STEP_STORAGE_PREFIX}${this.getTodayDateStr()}`;
      const savedSteps = localStorage.getItem(todayKey);
      this.stepsToday = savedSteps ? parseInt(savedSteps, 10) || 0 : 0;
      this.syncHistoryEntry(this.getTodayDateStr(), this.stepsToday);
    } catch {
      this.stepsToday = 0;
    }
  }

  private saveTodaySteps(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const today = this.getTodayDateStr();
      const todayKey = `${STEP_STORAGE_PREFIX}${today}`;
      localStorage.setItem(todayKey, this.stepsToday.toString());
      this.syncHistoryEntry(today, this.stepsToday);
    } catch (err) {
      console.warn('Error saving steps:', err);
    }
  }

  /**
   * Syncs hardware steps from the native Android Capacitor plugin.
   * This retrieves background steps accumulated while the app was closed.
   */
  public async syncNativeHardwareSteps(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const res = await NativeStepCounter.getStepMetrics();
      if (res && typeof res.todaySteps === 'number') {
        this.isNativeHardware = res.hasHardwareSensor;
        if (res.todaySteps > this.stepsToday) {
          this.stepsToday = res.todaySteps;
          this.saveTodaySteps();
          this.checkMilestones();
          this.notify();
        }
      }

      // Sync historical days from native storage
      const histRes = await NativeStepCounter.getHistory();
      if (histRes && histRes.history && histRes.history.length > 0) {
        histRes.history.forEach((h) => {
          if (h.date !== this.getTodayDateStr() && h.steps > 0) {
            this.recordDailyToHistory(h.date, h.steps, this.goal);
          }
        });
      }
    } catch (err) {
      console.log('Native step sync bypassed or unsupported:', err);
    }
  }

  public setDailyGoal(newGoal: number): void {
    this.goal = Math.max(1000, newGoal);
    this.syncHistoryEntry(this.getTodayDateStr(), this.stepsToday);
    this.notify();
  }

  public getDailyGoal(): number {
    return this.goal;
  }

  public setOnMilestoneAwarded(callback: (award: StepMilestoneAward) => void): void {
    this.onMilestoneCallback = callback;
  }

  public getMetrics(): StepMetrics {
    const distanceKm = parseFloat(((this.stepsToday * STRIDE_LENGTH_METERS) / 1000).toFixed(2));
    const caloriesBurned = Math.round(this.stepsToday * CALORIES_PER_STEP);
    const activeMinutes = Math.round(this.stepsToday / 100);

    return {
      steps: this.stepsToday,
      goal: this.goal,
      distanceKm,
      caloriesBurned,
      activeMinutes,
      isSensorActive: this.isSensorActive,
      lastStepTimestamp: this.lastStepTime,
      isNativeHardware: this.isNativeHardware,
      historicalDays: this.getHistory(7),
    };
  }

  public onMetricsChange(cb: (metrics: StepMetrics) => void): () => void {
    this.listeners.push(cb);
    cb(this.getMetrics());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    const metrics = this.getMetrics();
    this.listeners.forEach((cb) => {
      try {
        cb(metrics);
      } catch (err) {
        console.error('Step listener error:', err);
      }
    });
  }

  /**
   * Initializes DeviceMotion accelerometer listener for active app sessions.
   */
  public async startSensor(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // iOS 13+ permission flow
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          console.log('DeviceMotion permission not granted.');
          return false;
        }
      } catch (err) {
        console.warn('DeviceMotion permission request error:', err);
        return false;
      }
    }

    if ('DeviceMotionEvent' in window) {
      window.removeEventListener('devicemotion', this.handleMotion);
      window.addEventListener('devicemotion', this.handleMotion, false);
      this.isSensorActive = true;
      this.notify();
      return true;
    }

    return false;
  }

  public stopSensor(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion);
    }
    this.isSensorActive = false;
    this.notify();
  }

  /**
   * Accelerometer 3-Axis Vector Magnitude Peak Detection.
   */
  private handleMotion = (event: DeviceMotionEvent) => {
    const accel = event.accelerationIncludingGravity || event.acceleration;
    if (!accel) return;

    const x = accel.x || 0;
    const y = accel.y || 0;
    const z = accel.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    if (magnitude > PEAK_THRESHOLD_HIGH) {
      this.hasCrossedHighThreshold = true;
    } else if (magnitude < PEAK_THRESHOLD_LOW && this.hasCrossedHighThreshold) {
      if (now - this.lastStepTime > CADENCE_MIN_INTERVAL_MS) {
        this.registerStep(now);
      }
      this.hasCrossedHighThreshold = false;
    }
  };

  /**
   * Registers a single step, increments count, checks goals and awards Hunter XP.
   */
  public registerStep(timestamp = Date.now()): void {
    this.stepsToday += 1;
    this.lastStepTime = timestamp;
    this.saveTodaySteps();
    this.checkMilestones();
    this.notify();

    if (Capacitor.isNativePlatform()) {
      NativeStepCounter.recordStepOffset({ steps: 1 }).catch(() => {});
    }
  }

  /**
   * Manual step incrementation (for testing, calibration or simulated activity).
   */
  public addManualSteps(count: number): void {
    if (count <= 0) return;
    this.stepsToday += count;
    this.lastStepTime = Date.now();
    this.saveTodaySteps();
    this.checkMilestones();
    this.notify();

    if (Capacitor.isNativePlatform()) {
      NativeStepCounter.recordStepOffset({ steps: count }).catch(() => {});
    }
  }

  /**
   * Evaluates if user reached 25%, 50%, 75%, 100% of daily step goal.
   */
  private checkMilestones(): void {
    if (typeof localStorage === 'undefined') return;

    const todayDateStr = this.getTodayDateStr();
    const milestoneStorageKey = `${MILESTONE_PREFIX}${todayDateStr}`;
    let awardedMilestones: number[] = [];

    try {
      const raw = localStorage.getItem(milestoneStorageKey);
      if (raw) awardedMilestones = JSON.parse(raw);
    } catch {
      awardedMilestones = [];
    }

    const currentPercent = (this.stepsToday / this.goal) * 100;

    const milestones: StepMilestoneAward[] = [
      { percent: 25, xpReward: 50, title: 'Hunter Reconnaissance (25% Steps)' },
      { percent: 50, xpReward: 100, title: 'Agility Conditioning (50% Steps)' },
      { percent: 75, xpReward: 150, title: 'Endurance Awakening (75% Steps)' },
      { percent: 100, xpReward: 300, title: 'Hunter Apex Conditioning (100% Steps Complete)' },
    ];

    milestones.forEach((m) => {
      if (currentPercent >= m.percent && !awardedMilestones.includes(m.percent)) {
        awardedMilestones.push(m.percent);
        try {
          localStorage.setItem(milestoneStorageKey, JSON.stringify(awardedMilestones));
        } catch {}

        soundService.playMissionClear();
        hapticService.success();

        if (this.onMilestoneCallback) {
          this.onMilestoneCallback(m);
        }
      }
    });
  }

  /**
   * Multi-Day Step History Management
   */
  private loadAllHistory(): Record<string, DailyStepRecord> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STEP_HISTORY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveAllHistory(historyMap: Record<string, DailyStepRecord>): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STEP_HISTORY_KEY, JSON.stringify(historyMap));
    } catch (err) {
      console.warn('Error saving step history:', err);
    }
  }

  public recordDailyToHistory(date: string, steps: number, goal: number = this.goal): void {
    const historyMap = this.loadAllHistory();
    const distanceKm = parseFloat(((steps * STRIDE_LENGTH_METERS) / 1000).toFixed(2));
    const caloriesBurned = Math.round(steps * CALORIES_PER_STEP);
    const activeMinutes = Math.round(steps / 100);

    historyMap[date] = {
      date,
      steps,
      distanceKm,
      caloriesBurned,
      activeMinutes,
      goal,
      goalReached: steps >= goal,
    };

    this.saveAllHistory(historyMap);
  }

  private syncHistoryEntry(date: string, steps: number): void {
    this.recordDailyToHistory(date, steps, this.goal);
  }

  /**
   * Retrieves step history for the last N calendar days in chronological order.
   */
  public getHistory(days = 7): DailyStepRecord[] {
    const historyMap = this.loadAllHistory();
    const result: DailyStepRecord[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      if (dateStr === this.getTodayDateStr()) {
        const distanceKm = parseFloat(((this.stepsToday * STRIDE_LENGTH_METERS) / 1000).toFixed(2));
        const caloriesBurned = Math.round(this.stepsToday * CALORIES_PER_STEP);
        const activeMinutes = Math.round(this.stepsToday / 100);

        result.push({
          date: dateStr,
          steps: this.stepsToday,
          distanceKm,
          caloriesBurned,
          activeMinutes,
          goal: this.goal,
          goalReached: this.stepsToday >= this.goal,
        });
      } else if (historyMap[dateStr]) {
        result.push(historyMap[dateStr]);
      } else {
        result.push({
          date: dateStr,
          steps: 0,
          distanceKm: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
          goal: this.goal,
          goalReached: false,
        });
      }
    }

    return result;
  }

  /**
   * Calculates comprehensive multi-day performance statistics.
   */
  public getHistoryStats(days = 7): StepHistoryStats {
    const history = this.getHistory(days);
    if (history.length === 0) {
      return {
        averageSteps: 0,
        maxSteps: 0,
        bestDate: this.getTodayDateStr(),
        totalSteps: 0,
        totalDistanceKm: 0,
        totalCalories: 0,
        goalsMet: 0,
        totalDays: days,
      };
    }

    let totalSteps = 0;
    let totalDistanceKm = 0;
    let totalCalories = 0;
    let maxSteps = 0;
    let bestDate = history[0].date;
    let goalsMet = 0;

    history.forEach((day) => {
      totalSteps += day.steps;
      totalDistanceKm += day.distanceKm;
      totalCalories += day.caloriesBurned;
      if (day.steps > maxSteps) {
        maxSteps = day.steps;
        bestDate = day.date;
      }
      if (day.goalReached) {
        goalsMet += 1;
      }
    });

    const averageSteps = Math.round(totalSteps / history.length);

    return {
      averageSteps,
      maxSteps,
      bestDate,
      totalSteps,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      totalCalories,
      goalsMet,
      totalDays: history.length,
    };
  }

  public resetTodaySteps(): void {
    this.stepsToday = 0;
    this.saveTodaySteps();
    this.notify();
  }
}

export const stepCounterService = new StepCounterService();

if (typeof window !== 'undefined') {
  (window as any).stepCounterService = stepCounterService;
}
