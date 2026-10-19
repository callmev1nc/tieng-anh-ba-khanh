import type { WordMeta } from '../data/lessons'
import { allWords, getLesson } from '../data/lessons'
import { shuffled } from './exercises'
import type { DueWord } from './progress'

/* Review drills = forced retrieval. The old self-graded flashcard only told us
 * what the learner *felt*; these drills make him produce or pick the answer. */

export interface WordChoiceDrill {
  kind: 'choice'
  /** vi→en = recall (hard), en→vi = recognition (gentle, new words) */
  dir: 'vi-en' | 'en-vi'
  word: WordMeta
  options: string[]
  answer: number
}

export interface WordListenDrill {
  kind: 'listen'
  word: WordMeta
  options: string[]
  answer: number
}

export interface PairsDrill {
  kind: 'pairs'
  words: WordMeta[]
}

export interface ReviewStep {
  /** word keys the step decides results for */
  keys: string[]
  drill: WordChoiceDrill | WordListenDrill | PairsDrill
}

function otherWords(word: WordMeta, count: number, rand: () => number): WordMeta[] {
  const lessonWords: WordMeta[] =
    getLesson(word.lessonId)?.words
      .filter((w) => w.en !== word.en && w.vi !== word.vi)
      .map((w) => ({ en: w.en, vi: w.vi, note: w.note, lessonId: word.lessonId })) ?? []
  const global = allWords().filter((w) => w.en !== word.en)
  const sameLesson = shuffled(lessonWords, rand)
  const rest = shuffled(global, rand).filter(
    (w) => w.vi !== word.vi && !sameLesson.some((s) => s.en === w.en),
  )
  const pool = [...sameLesson, ...rest]
  const out: WordMeta[] = []
  const seen = new Set<string>()
  for (const w of pool) {
    if (out.length >= count) break
    if (seen.has(w.en) || seen.has(w.vi)) continue
    seen.add(w.en)
    seen.add(w.vi)
    out.push(w)
  }
  return out
}

/** 1 correct + 2 same-topic distractors, shuffled */
export function buildChoiceDrill(
  word: WordMeta,
  dir: 'vi-en' | 'en-vi',
  rand: () => number,
): WordChoiceDrill {
  const dist = otherWords(word, 2, rand)
  const options = shuffled(
    [word, ...dist].map((w) => (dir === 'vi-en' ? w.en : w.vi)),
    rand,
  )
  return {
    kind: 'choice',
    dir,
    word,
    options,
    answer: options.indexOf(dir === 'vi-en' ? word.en : word.vi),
  }
}

export function buildListenDrill(word: WordMeta, rand: () => number): WordListenDrill {
  const dist = otherWords(word, 2, rand)
  const options = shuffled([word, ...dist].map((w) => w.en), rand)
  return {
    kind: 'listen',
    word,
    options,
    answer: options.indexOf(word.en),
  }
}

/** Plan the session: mostly single drills, a tap-pairs puzzle every few words.
 * Box 0 (just failed yesterday) gets the gentle recognition drill; higher
 * boxes get recall & listening. */
export function buildReviewPlan(due: DueWord[], rand: () => number): ReviewStep[] {
  const steps: ReviewStep[] = []
  let i = 0
  while (i < due.length) {
    const remaining = due.length - i
    if (remaining >= 4 && rand() < 0.32) {
      const words: WordMeta[] = due.slice(i, i + 4)
      steps.push({ keys: words.map((w) => w.en), drill: { kind: 'pairs', words } })
      i += 4
      continue
    }
    const d = due[i]
    const box = d.box
    const r = rand()
    const dir: 'vi-en' | 'en-vi' = box === 0 ? 'en-vi' : r < 0.55 ? 'vi-en' : 'en-vi'
    if (box >= 2 && r < 0.4) {
      steps.push({ keys: [d.en], drill: buildListenDrill(d, rand) })
    } else {
      steps.push({ keys: [d.en], drill: buildChoiceDrill(d, dir, rand) })
    }
    i += 1
  }
  return steps
}
