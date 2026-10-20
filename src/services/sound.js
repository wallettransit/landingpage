/**
 * Audio Controller using Web Audio API:
 * 1. Warm, upbeat ambient background track (synthesized rhythmic Afro-chill vibe: smooth bassline, pentatonic marimba chord pulses, shaker cadence).
 * 2. High-fidelity UI sound effects:
 *    - sfx.click(): Subtle tactile click
 *    - sfx.tap(): Warm pill/tab switch tone
 *    - sfx.scan(): Uplifting payment success chime
 *    - sfx.coin(): Metallic arcade coin chime
 *
 * Zero external audio file download dependencies, instant playback, zero network latency, zero broken asset URLs on Vercel.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgGain = null;
    this.step = 0;
    this.listeners = new Set();
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.bgGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn({ isPlaying: this.isPlaying, isMuted: this.isMuted }));
  }

  // Play a soft synth note
  playSynthNote(freq, type = 'sine', duration = 0.3, gainValue = 0.2, dest = this.bgGain) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // Ignored
    }
  }

  // Background Ambient Afrobeat Chords + Percussion loop
  startMusic() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.notify();

    // Key of G / C warm pentatonic scale notes (Hz)
    // C3, E3, G3, A3, C4, D4, E4, G4, A4
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C maj
      [220.00, 261.63, 329.63, 440.00], // A min
      [174.61, 220.00, 261.63, 349.23], // F maj
      [196.00, 246.94, 293.66, 392.00], // G maj
    ];

    const bassNotes = [130.81, 110.00, 87.31, 98.00]; // C2, A1, F1, G1

    const bpm = 104;
    const stepDurationMs = (60 / bpm / 2) * 1000; // 8th notes

    this.step = 0;
    this.musicTimer = setInterval(() => {
      if (!this.isPlaying || this.isMuted || !this.ctx) return;

      const bar = Math.floor(this.step / 8) % chords.length;
      const beat = this.step % 8;

      // Bassline on beats 0, 3, 5
      if (beat === 0 || beat === 3 || beat === 5) {
        this.playSynthNote(bassNotes[bar], 'triangle', 0.28, 0.22, this.bgGain);
      }

      // Marimba/Electric Piano chords arpeggio
      if (beat === 0 || beat === 2 || beat === 4 || beat === 6) {
        const chord = chords[bar];
        const note = chord[beat / 2 % chord.length];
        this.playSynthNote(note, 'sine', 0.22, 0.12, this.bgGain);
        this.playSynthNote(note * 1.5, 'sine', 0.16, 0.04, this.bgGain);
      }

      // Shaker / Hi-hat cadence on offbeats
      if (beat % 2 === 1) {
        this.playNoiseShaker(0.04, 0.035);
      }

      this.step++;
    }, stepDurationMs);
  }

  playNoiseShaker(duration = 0.04, gainValue = 0.03) {
    if (!this.ctx || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgGain);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      // Ignored
    }
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    this.notify();
  }

  // UI Sound Effects
  playClick() {
    this.ensureContext();
    this.playSynthNote(800, 'sine', 0.04, 0.12, this.sfxGain);
  }

  playTap() {
    this.ensureContext();
    this.playSynthNote(520, 'sine', 0.08, 0.15, this.sfxGain);
  }

  playSuccess() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => {
        this.playSynthNote(freq, 'triangle', 0.25, 0.14, this.sfxGain);
      }, idx * 65);
    });
  }

  playCoin() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    this.playSynthNote(987.77, 'sine', 0.12, 0.18, this.sfxGain);
    setTimeout(() => {
      this.playSynthNote(1318.51, 'sine', 0.22, 0.16, this.sfxGain);
    }, 70);
  }
}

export const sound = new SoundSystem();
