import type { VoicePref } from '../types'

let cached: SpeechSynthesisVoice | null = null
let ready = false
let pref: VoicePref = 'auto'

export const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

const FEMALE_RE =
  /female|serena|kate|moira|tessa|fiona|samantha|zira|susan|hazel|google uk english female|google us english/i
const MALE_RE = /male|daniel|alex|fred|david|george|oliver|arthur/i

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  const en = voices.filter((v) => /^en[-_]/i.test(v.lang))
  if (en.length === 0) return null

  const byLang = (lang: string) =>
    en.filter((v) => new RegExp(`^${lang.replace('-', '[-_]')}$`, 'i').test(v.lang))

  const pickFrom = (list: SpeechSynthesisVoice[], wantMale: boolean): SpeechSynthesisVoice | null =>
    list.find((v) => (wantMale ? MALE_RE : FEMALE_RE).test(v.name)) ??
    list[0] ??
    null

  if (pref === 'gb-f' || pref === 'gb-m') {
    const gb = byLang('en-GB')
    if (gb.length) return pickFrom(gb, pref.endsWith('-m'))
  }
  if (pref === 'us-f' || pref === 'us-m') {
    const us = byLang('en-US')
    if (us.length) return pickFrom(us, pref.endsWith('-m'))
  }
  // 'auto': UK female → US female → anything English
  const gb = byLang('en-GB')
  const us = byLang('en-US')
  return pickFrom(gb, false) ?? pickFrom(us, false) ?? en[0]
}

/** Switch voice preference at runtime (from settings). Returns false when the
 * device has no matching voice — caller can leave 'auto' then. */
export function setVoicePref(p: VoicePref): boolean {
  if (!ttsAvailable) return false
  pref = p
  if (!ready) {
    cached = pickVoice()
    ready = true
  }
  cached = pickVoice()
  return cached !== null
}

/** Speak a short phrase in a different voice (male) without changing the saved
 * preference — used by "bác trucker" second-voice drills. */
export function speakAlt(text: string, cb?: SpeakCallbacks): boolean {
  if (!ttsAvailable) return false
  const voices = window.speechSynthesis.getVoices()
    .filter((v) => /^en[-_]/i.test(v.lang))
  const alt =
    voices.find((v) => MALE_RE.test(v.name) && !FEMALE_RE.test(v.name)) ??
    voices.find((v) => !cached || v.name !== cached.name) ??
    null
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = pref === 'us-f' || pref === 'us-m' ? 'en-US' : 'en-GB'
    u.rate = 0.85
    if (alt) u.voice = alt
    u.onstart = () => cb?.onStart?.()
    u.onend = () => cb?.onEnd?.()
    u.onerror = () => cb?.onEnd?.()
    window.speechSynthesis.speak(u)
    return true
  } catch {
    cb?.onEnd?.()
    return false
  }
}

if (ttsAvailable) {
  // Warm up the voice list; iOS fills it asynchronously.
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    cached = pickVoice()
    ready = true
  }
}

export interface SpeakCallbacks {
  onStart?: () => void
  onEnd?: () => void
}

/** Speak English text out loud. Call from a user gesture (button tap). */
export function speak(text: string, rate = 0.85, cb?: SpeakCallbacks): boolean {
  if (!ttsAvailable) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = pref === 'us-f' || pref === 'us-m' ? 'en-US' : 'en-GB'
    u.rate = rate
    u.pitch = 1
    if (!ready) {
      cached = pickVoice()
      ready = true
    }
    if (cached) u.voice = cached
    if (cb) {
      u.onstart = () => cb.onStart?.()
      const finish = () => cb.onEnd?.()
      u.onend = finish
      u.onerror = finish
    }
    window.speechSynthesis.speak(u)
    return true
  } catch {
    cb?.onEnd?.()
    return false
  }
}

export function stopSpeaking(): void {
  if (ttsAvailable) window.speechSynthesis.cancel()
}
