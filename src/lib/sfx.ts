/* Tiny WebAudio sound-effect kit. No audio files → stays inside the PWA's
 * offline precache budget. All functions fail silently if audio is blocked. */

const KEY = 'tk-sound-v1'

export function loadSoundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // private mode — session-only
  }
}

let enabled: boolean = typeof window !== 'undefined' ? loadSoundEnabled() : true

export function soundEnabled(): boolean {
  return enabled
}

export function enableSound(on: boolean): void {
  enabled = on
  setSoundEnabled(on)
}

let ctx: AudioContext | null = null

/** Create/resume inside a user gesture — iOS requires it. */
function ac(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface Tone {
  f: number
  t: number // start offset, seconds
  d: number // duration, seconds
  type?: OscillatorType
  g?: number // peak gain
}

function play(tones: Tone[]): void {
  const c = ac()
  if (!c) return
  const now = c.currentTime
  for (const { f, t, d, type = 'triangle', g = 0.09 } of tones) {
    try {
      const osc = c.createOscillator()
      const amp = c.createGain()
      osc.type = type
      osc.frequency.value = f
      const t0 = now + t
      amp.gain.setValueAtTime(0.0001, t0)
      amp.gain.exponentialRampToValueAtTime(g, t0 + 0.012)
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
      osc.connect(amp).connect(c.destination)
      osc.start(t0)
      osc.stop(t0 + d + 0.02)
    } catch {
      // keep going, sound is best-effort
    }
  }
}

// --- Public effects -------------------------------------------------------

/** Soft tap feedback for neutral interactions. */
export function sfxTap(): void {
  play([{ f: 880, t: 0, d: 0.05, g: 0.05 }])
}

/** Answer was right — quick rising triad. */
export function sfxCorrect(): void {
  play([
    { f: 523.25, t: 0, d: 0.12, g: 0.08 },
    { f: 659.25, t: 0.07, d: 0.12, g: 0.08 },
    { f: 783.99, t: 0.14, d: 0.18, g: 0.09 },
  ])
  buzz(18)
}

/** Answer was wrong — low double-buzz, never harsh. */
export function sfxWrong(): void {
  play([
    { f: 233, t: 0, d: 0.14, type: 'sawtooth', g: 0.05 },
    { f: 174.6, t: 0.12, d: 0.2, type: 'sawtooth', g: 0.05 },
  ])
  buzz([14, 40, 14] as unknown as number)
}

/** Pair-tile matched. */
export function sfxMatch(): void {
  play([
    { f: 740, t: 0, d: 0.07, g: 0.06 },
    { f: 1108, t: 0.05, d: 0.1, g: 0.06 },
  ])
  buzz(10)
}

/** Lesson complete — short fanfare. */
export function sfxFanfare(): void {
  play([
    { f: 392, t: 0, d: 0.12, g: 0.08 },
    { f: 523.25, t: 0.11, d: 0.12, g: 0.08 },
    { f: 659.25, t: 0.22, d: 0.12, g: 0.08 },
    { f: 783.99, t: 0.33, d: 0.16, g: 0.09 },
    { f: 1046.5, t: 0.48, d: 0.5, g: 0.1 },
  ])
  buzz([20, 60, 20] as unknown as number)
}

/* --- Haptics (Android/web only; iOS PWA doesn't support navigator.vibrate) --- */

export function buzz(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    // no haptics available
  }
}
