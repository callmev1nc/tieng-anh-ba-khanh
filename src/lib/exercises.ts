import type { Lesson, NumberDrill, Situation } from '../types'
import { lessons } from '../data/lessons'

/* =============== Deterministic PRNG (stable order within one day) =============== */

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffled<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Same order all day, fresh tomorrow — good for lesson stages. */
export function lessonRand(lessonId: string): () => number {
  return mulberry32(hash(lessonId + '::' + todayKey()))
}

/** New shuffle every mount — good for the mini test replays. */
export function freshRand(): () => number {
  return mulberry32(hash(todayKey() + '::' + Math.floor(Math.random() * 2 ** 31)))
}

/* =============== Listen & choose: hear first, see the text later =============== */

export interface PhraseLike {
  en: string
  phon?: string
  vi?: string
}

export interface ListenItem {
  /** English text for TTS (never shown before answering) */
  audio: string
  options: PhraseLike[]
  answer: number
  /** Vietnamese meaning of the correct answer, shown after answering */
  vi: string
}

const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

function overlapRatio(a: Set<string>, b: Set<string>): number {
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  return inter / Math.max(a.size, b.size, 1)
}

/** Build one item: target + 1 similar-sounding + 1 clearly different distractor. */
function buildListenItem(target: PhraseLike, pool: PhraseLike[], rand: () => number): ListenItem | null {
  const t = new Set(tokenize(target.en))
  const near: PhraseLike[] = []
  const far: PhraseLike[] = []
  for (const c of pool) {
    if (c.en === target.en) continue
    const ratio = overlapRatio(t, new Set(tokenize(c.en)))
    if (ratio >= 0.85) continue // basically the same sentence
    if (ratio >= 0.4) near.push(c)
    else far.push(c)
  }
  const nearSh = shuffled(near, rand)
  const farSh = shuffled(far, rand)
  const dist1 = nearSh[0] ?? farSh[0]
  if (!dist1) return null
  const rest = dist1 === nearSh[0] ? farSh : nearSh
  const dist2 = rest[0] ?? shuffled(pool.filter((c) => c.en !== target.en && c.en !== dist1.en), rand)[0]
  if (!dist2) return null
  const options = shuffled([target, dist1, dist2], rand)
  return {
    audio: target.en,
    options,
    answer: options.findIndex((o) => o.en === target.en),
    vi: target.vi ?? '',
  }
}

export function buildListenItems(
  pool: PhraseLike[],
  rand: () => number,
  count: number,
): ListenItem[] {
  const targets = shuffled(pool, rand)
  const items: ListenItem[] = []
  for (const t of targets) {
    if (items.length >= count) break
    if (items.some((i) => i.audio === t.en)) continue
    const item = buildListenItem(t, pool, rand)
    if (item) items.push(item)
  }
  return items
}

export function lessonPhrasePool(lesson: Lesson): PhraseLike[] {
  return [...lesson.phrases, ...lesson.dialogue.lines]
}

/* =============== Review-day warm-up: listening across the week =============== */

/** Collect phrases & dialogue lines from every non-review lesson after the
 * previous review day (or from the start), excluding the review lesson itself. */
export function reviewWarmupItems(lesson: Lesson): ListenItem[] {
  const reviewOrders = lessons
    .filter((l) => /on-tap/.test(l.id))
    .map((l) => l.order)
    .filter((d) => d < lesson.order)
  const since = reviewOrders.length ? Math.max(...reviewOrders) : 0
  const pool: PhraseLike[] = []
  for (const l of lessons) {
    if (l.order <= since || l.order >= lesson.order) continue
    if (/on-tap/.test(l.id)) continue
    pool.push(...lessonPhrasePool(l))
  }
  if (pool.length < 4) pool.push(...lessonPhrasePool(lesson))
  return buildListenItems(pool, lessonRand(lesson.id + '::warmup'), 6)
}

/* =============== Build sentence: tap words in the right order =============== */

export interface BuildItem {
  phrase: string
  phon?: string
  vi: string
  /** Pre-shuffled word tokens (pollution-free: same words, mixed order) */
  tokens: string[]
}

export function buildBuildItems(lesson: Lesson, rand: () => number, count: number): BuildItem[] {
  const cands = shuffled(lesson.phrases, rand).filter((p) => {
    const n = p.en.trim().split(/\s+/).length
    return n >= 4 && n <= 8
  })
  const items: BuildItem[] = []
  for (const p of cands) {
    if (items.length >= count) break
    const tokens = p.en.trim().split(/\s+/)
    let mixed = shuffled(tokens, rand)
    let tries = 0
    while (mixed.join(' ') === tokens.join(' ') && tries < 5) {
      mixed = shuffled(tokens, rand)
      tries++
    }
    if (mixed.join(' ') === tokens.join(' ')) continue // refuse degenerate order
    items.push({ phrase: p.en, phon: p.phon, vi: p.vi, tokens: mixed })
  }
  return items
}

/* =============== Mini test: 5 mixed items =============== */

export type MiniItem =
  | { kind: 'listen'; item: ListenItem }
  | { kind: 'reply'; situation: Situation }
  | { kind: 'build'; item: BuildItem }
  | { kind: 'numbers'; drill: NumberDrill }
  | { kind: 'selfspeak'; en: string; vi: string; phon?: string }

/** 2× listen + 1 reply + 1 build/numbers + 1 self-speak, with fallbacks so any
 * lesson (even one without situations/numbers data) gets a full 5-item test. */
export function buildMiniTest(lesson: Lesson, rand: () => number): MiniItem[] {
  const pool = lessonPhrasePool(lesson)
  const listens = buildListenItems(pool, rand, 2)
  const builds = buildBuildItems(lesson, rand, 3)
  const used = new Set<string>()
  const takeBuild = (): BuildItem | null => {
    const b = builds.shift()
    if (b) {
      used.add(b.phrase)
      return b
    }
    return null
  }

  const items: MiniItem[] = []

  // 1. Listen
  if (listens[0]) items.push({ kind: 'listen', item: listens[0] })
  else {
    const b = takeBuild()
    if (b) items.push({ kind: 'build', item: b })
  }

  // 2. Reply to the client (or build)
  const sit = lesson.situations?.length ? shuffled(lesson.situations, rand)[0] : null
  if (sit) items.push({ kind: 'reply', situation: sit })
  else {
    const b = takeBuild()
    if (b) items.push({ kind: 'build', item: b })
  }

  // 3. Numbers drill (or build)
  const drill = lesson.numbers?.length ? shuffled(lesson.numbers, rand)[0] : null
  if (drill) items.push({ kind: 'numbers', drill })
  else {
    const b = takeBuild()
    if (b) items.push({ kind: 'build', item: b })
  }

  // 4. Second listen (or build)
  const l2 = listens[1]
  if (l2 && l2.audio !== listens[0]?.audio) items.push({ kind: 'listen', item: l2 })
  else {
    const b = takeBuild()
    if (b) items.push({ kind: 'build', item: b })
  }

  // 5. Self-speak a phrase not used above
  const self = shuffled(lesson.phrases, rand).find((p) => !used.has(p.en))
  if (self) {
    items.push({ kind: 'selfspeak', en: self.en, vi: self.vi, phon: self.phon })
  } else {
    const b = takeBuild()
    if (b) items.push({ kind: 'build', item: b })
  }

  return items
}
