import { lookupWord, lessons, type WordMeta } from '../data/lessons'
import type { Progress } from '../types'

const KEY = 'tk-progress-v1'
/** Days until next review for each box 0..5 */
const INTERVALS = [1, 2, 4, 7, 14, 30]

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return todayISO(date)
}

export function emptyProgress(): Progress {
  return {
    xp: 0,
    streak: 0,
    lastDay: '',
    lessonsDone: {},
    words: {},
    installHintDismissed: false,
  }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<Progress>
    return { ...emptyProgress(), ...parsed }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage full / private mode — ignore, app still works in-memory
  }
}

/** Register a word when the learner sees it. Idempotent: never resets a due date. */
export function learnWord(p: Progress, en: string): void {
  if (p.words[en]) return
  const meta = lookupWord(en)
  p.words[en] = {
    box: 0,
    due: addDaysISO(todayISO(), INTERVALS[0]),
    learned: todayISO(),
    lessonId: meta?.lessonId ?? '',
    lastOk: true,
  }
}

/** Move a word forward on success, back to tomorrow on failure. */
export function reviewWord(p: Progress, en: string, correct: boolean): void {
  const w = p.words[en]
  if (!w) {
    learnWord(p, en)
    return
  }
  if (correct) {
    w.box = Math.min(w.box + 1, INTERVALS.length - 1)
    w.due = addDaysISO(todayISO(), INTERVALS[w.box])
    w.lastOk = true
  } else {
    w.box = 0
    w.due = addDaysISO(todayISO(), INTERVALS[0])
    w.lastOk = false
  }
}

export interface DueWord extends WordMeta {
  box: number
  due: string
}

export function dueWords(p: Progress): DueWord[] {
  const today = todayISO()
  const out: DueWord[] = []
  for (const [en, state] of Object.entries(p.words)) {
    if (state.due > today) continue
    const meta = lookupWord(en)
    if (!meta) continue
    out.push({ ...meta, box: state.box, due: state.due })
  }
  // Words that failed last time come first
  out.sort((a, b) => Number(p.words[a.en].lastOk) - Number(p.words[b.en].lastOk))
  return out
}

export function upcomingWords(p: Progress, count: number): DueWord[] {
  const today = todayISO()
  const out: DueWord[] = []
  for (const [en, state] of Object.entries(p.words)) {
    if (state.due <= today) continue
    const meta = lookupWord(en)
    if (!meta) continue
    out.push({ ...meta, box: state.box, due: state.due })
  }
  out.sort((a, b) => a.due.localeCompare(b.due))
  return out.slice(0, count)
}

export function learnedTodayCount(p: Progress): number {
  const today = todayISO()
  return Object.values(p.words).filter((w) => w.learned === today).length
}

export function totalWords(p: Progress): number {
  return Object.keys(p.words).length
}

/** First lesson that has not been completed yet (the daily "next step"). */
export function nextLessonId(p: Progress): string | null {
  const next = lessons.find((l) => !p.lessonsDone[l.id])
  return next ? next.id : null
}

export function lessonDone(p: Progress, id: string): boolean {
  return Boolean(p.lessonsDone[id])
}

/** Bump the daily streak. Call once per day when a session finishes. */
function touchStreak(p: Progress): void {
  const t = todayISO()
  if (p.lastDay === t) return
  const yesterday = addDaysISO(t, -1)
  p.streak = p.lastDay === yesterday ? p.streak + 1 : 1
  p.lastDay = t
}

/** Finish a lesson: XP + streak. Returns XP gained (0 if replaying). */
export function completeLesson(p: Progress, id: string): number {
  let gained = 0
  if (!p.lessonsDone[id]) {
    gained = 50
    p.xp += 50
    p.lessonsDone[id] = todayISO()
  }
  touchStreak(p)
  return gained
}

/** Finish a review session: XP + streak. */
export function completeReview(p: Progress): number {
  p.xp += 20
  touchStreak(p)
  return 20
}
