export interface Word {
  en: string
  vi: string
  /** Vietnamese sound hint, e.g. "hê-lô" */
  phon?: string
  /** Extra tip in Vietnamese (how to use it in the shop) */
  note?: string
}

export interface Phrase {
  en: string
  vi: string
  /** Vietnamese sound hint, e.g. "hao a diu" */
  phon?: string
  /** When to say it (Vietnamese context) */
  when?: string
}

export interface DialogueLine {
  who: 'barber' | 'client'
  en: string
  vi: string
  /** Vietnamese sound hint */
  phon?: string
}

export interface QuizQuestion {
  /** Question shown in Vietnamese */
  q: string
  options: string[]
  /** Index of the correct option */
  answer: number
}

export interface SituationOption {
  en: string
  /** Vietnamese sound hint */
  phon?: string
}

/** "Client says X — which reply is best?" exercise. */
export interface Situation {
  /** What the customer said */
  client: { en: string; vi?: string; phon?: string }
  /** Vietnamese hint about the moment to use it */
  hint?: string
  options: SituationOption[]
  /** Index of the best reply */
  answer: number
  /** Vietnamese explanation why this reply is the best one */
  explain?: string
}

/** "Hear a number/time/price → pick what it means" exercise. */
export interface NumberDrill {
  /** English text for TTS, e.g. "two fifty" */
  say: string
  /** Vietnamese sound hint for the spoken text */
  phon?: string
  options: string[]
  /** Index of the correct option */
  answer: number
}

export interface Lesson {
  id: string
  /** Sort order, also used for the "01" badge */
  order: number
  /** Vietnamese title */
  title: string
  /** Vietnamese goal sentence */
  goal: string
  words: Word[]
  phrases: Phrase[]
  dialogue: {
    title: string
    lines: DialogueLine[]
  }
  quiz: QuizQuestion[]
  /** "Client says → best reply" items (>= 3 recommended) */
  situations?: Situation[]
  /** Hearing drills for numbers, money, time */
  numbers?: NumberDrill[]
}

export interface WordState {
  /** Spaced-repetition box 0..5 (higher = remembered longer) */
  box: number
  /** Next review date, YYYY-MM-DD */
  due: string
  /** Date the word was first learned, YYYY-MM-DD */
  learned: string
  lessonId: string
  lastOk: boolean
}

export interface Progress {
  xp: number
  streak: number
  /** Last active day, YYYY-MM-DD */
  lastDay: string
  /** lessonId -> completed date YYYY-MM-DD */
  lessonsDone: Record<string, string>
  words: Record<string, WordState>
  installHintDismissed: boolean
}

export type TabId = 'home' | 'lessons' | 'review' | 'words'

/** Vietnamese voice preference, saved in localStorage */
export type VoicePref = 'auto' | 'gb-f' | 'gb-m' | 'us-f' | 'us-m'
