import type { Lesson } from '../types'

const modules = import.meta.glob<Lesson>('../lessons/*.json', {
  eager: true,
  import: 'default',
})

export const lessons: Lesson[] = Object.values(modules).sort(
  (a, b) => a.order - b.order,
)

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export interface WordMeta {
  en: string
  vi: string
  note?: string
  lessonId: string
}

const wordIndex: Map<string, WordMeta> = new Map()
for (const lesson of lessons) {
  for (const w of lesson.words) {
    if (!wordIndex.has(w.en)) {
      wordIndex.set(w.en, {
        en: w.en,
        vi: w.vi,
        note: w.note,
        lessonId: lesson.id,
      })
    }
  }
}

export function lookupWord(en: string): WordMeta | undefined {
  return wordIndex.get(en)
}

export function allWords(): WordMeta[] {
  return [...wordIndex.values()]
}
