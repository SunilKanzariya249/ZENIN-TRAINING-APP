import { RingtoneId, RingtoneOption } from '../types';

export const AVAILABLE_RINGTONES: RingtoneOption[] = [
  {
    id: 'awakening',
    name: 'Hunter Awakening',
    subtitle: 'Epic pentatonic arpeggio with resonant sub-bass',
    category: 'RPG',
  },
  {
    id: 'cyber_siren',
    name: 'Cyber Siren',
    subtitle: 'High-urgency tactical emergency siren',
    category: 'TACTICAL',
  },
  {
    id: 'shadow_gate',
    name: 'Shadow Gate',
    subtitle: 'Mysterious harmonic minor ambient chime',
    category: 'AMBIENT',
  },
  {
    id: 'pulse_radar',
    name: 'Pulse Radar',
    subtitle: 'High-tech tactical sonar double-ping alert',
    category: 'TACTICAL',
  },
  {
    id: 'apex_fanfare',
    name: 'Apex Fanfare',
    subtitle: 'Heroic triumphant victory brass sequence',
    category: 'RPG',
  },
];

class AlarmAudioService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private loopTimer: NodeJS.Timeout | null = null;
  private previewTimer: NodeJS.Timeout | null = null;
  private activeGainNodes: GainNode[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private currentPlayingId: RingtoneId | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentPlayingId(): RingtoneId | null {
    return this.currentPlayingId;
  }

  /**
   * Continuous looping playback for active alarm ringing.
   */
  public startRingtone(ringtoneId: RingtoneId = 'awakening'): void {
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentPlayingId = ringtoneId;

    const loopDuration = this.getLoopDuration(ringtoneId);
    this.playSequence(ringtoneId);

    this.loopTimer = setInterval(() => {
      if (this.isPlaying) {
        this.playSequence(ringtoneId);
      }
    }, loopDuration);
  }

  /**
   * Plays a preview sample for testing ringtones in settings or alarm modal.
   */
  public previewRingtone(ringtoneId: RingtoneId, durationSeconds?: number): void {
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.currentPlayingId = ringtoneId;
    this.playSequence(ringtoneId);

    const loopDuration = durationSeconds ? durationSeconds * 1000 : Math.min(3000, this.getLoopDuration(ringtoneId));
    this.previewTimer = setTimeout(() => {
      this.stopRingtone();
    }, loopDuration);
  }

  /**
   * Immediately silences and halts all active oscillators and loops.
   */
  public stopRingtone(): void {
    this.isPlaying = false;
    this.currentPlayingId = null;

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }

    // Ramp down all active gains immediately to prevent pops/clicks
    this.activeGainNodes.forEach((gain) => {
      try {
        if (this.ctx) {
          gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
        }
      } catch {}
    });

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });

    this.activeGainNodes = [];
    this.activeOscillators = [];
  }

  private getLoopDuration(id: RingtoneId): number {
    switch (id) {
      case 'awakening':
        return 2200;
      case 'cyber_siren':
        return 1400;
      case 'shadow_gate':
        return 2800;
      case 'pulse_radar':
        return 1600;
      case 'apex_fanfare':
        return 2400;
      default:
        return 2000;
    }
  }

  private playSequence(id: RingtoneId): void {
    const ctx = this.getContext();
    if (!ctx) return;

    switch (id) {
      case 'awakening':
        this.synthAwakening(ctx);
        break;
      case 'cyber_siren':
        this.synthCyberSiren(ctx);
        break;
      case 'shadow_gate':
        this.synthShadowGate(ctx);
        break;
      case 'pulse_radar':
        this.synthPulseRadar(ctx);
        break;
      case 'apex_fanfare':
        this.synthApexFanfare(ctx);
        break;
      default:
        this.synthAwakening(ctx);
    }
  }

  /**
   * 1. Hunter Awakening (Ascending Pentatonic Arpeggio)
   */
  private synthAwakening(ctx: AudioContext): void {
    const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25]; // C4, E4, G4, B4, C5, E5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      const start = now + idx * 0.12;
      const duration = 0.45;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);
    });

    // Deep sub-bass surge
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now); // C2
    subOsc.frequency.exponentialRampToValueAtTime(130.81, now + 0.8);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);
    this.activeOscillators.push(subOsc);
    this.activeGainNodes.push(subGain);
  }

  /**
   * 2. Cyber Siren (Tactical Alternating Alarm)
   */
  private synthCyberSiren(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const pulses = [
      { freq: 880, start: 0, dur: 0.28 },
      { freq: 1174.66, start: 0.3, dur: 0.28 },
      { freq: 880, start: 0.6, dur: 0.28 },
      { freq: 1174.66, start: 0.9, dur: 0.35 },
    ];

    pulses.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(p.freq, now + p.start);

      const s = now + p.start;
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.18, s + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + p.dur);

      // Lowpass filter to smooth harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, s);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(s);
      osc.stop(s + p.dur);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);
    });
  }

  /**
   * 3. Shadow Gate (Mysterious Harmonic Minor Chime)
   */
  private synthShadowGate(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const chord = [146.83, 220.0, 349.23, 440.0, 587.33]; // D3, A3, F4, A4, D5

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      const s = now + i * 0.08;
      const dur = 1.6;

      gain.gain.setValueAtTime(0.0001, s);
      gain.gain.linearRampToValueAtTime(0.15, s + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(s);
      osc.stop(s + dur);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);
    });
  }

  /**
   * 4. Pulse Radar (Bionic Sonar Double-Ping)
   */
  private synthPulseRadar(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const pings = [
      { freq: 1760, start: 0, dur: 0.18 },
      { freq: 2093, start: 0.22, dur: 0.25 },
      { freq: 1760, start: 0.7, dur: 0.18 },
      { freq: 2093, start: 0.92, dur: 0.35 },
    ];

    pings.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now + p.start);
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.85, now + p.start + p.dur);

      const s = now + p.start;
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.2, s + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + p.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(s);
      osc.stop(s + p.dur);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);
    });
  }

  /**
   * 5. Apex Fanfare (Heroic Brass Triumph)
   */
  private synthApexFanfare(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const fanfare = [
      { freq: 392.0, start: 0, dur: 0.16 }, // G4
      { freq: 523.25, start: 0.16, dur: 0.16 }, // C5
      { freq: 659.25, start: 0.32, dur: 0.18 }, // E5
      { freq: 783.99, start: 0.52, dur: 0.75 }, // G5
    ];

    fanfare.forEach((f) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(f.freq, now + f.start);
      osc2.frequency.setValueAtTime(f.freq * 1.002, now + f.start); // slight detune for rich brass

      const s = now + f.start;
      gain.gain.setValueAtTime(0.001, s);
      gain.gain.linearRampToValueAtTime(0.18, s + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, s + f.dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, s);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(s);
      osc2.start(s);
      osc1.stop(s + f.dur);
      osc2.stop(s + f.dur);

      this.activeOscillators.push(osc1, osc2);
      this.activeGainNodes.push(gain);
    });
  }
}

export const alarmAudioService = new AlarmAudioService();
