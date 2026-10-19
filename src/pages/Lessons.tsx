import type { Progress } from '../types'
import { lessonDone, nextLessonId } from '../lib/progress'
import { lessons } from '../data/lessons'

interface Props {
  progress: Progress
  onOpen: (id: string) => void
}

export function LessonsPage({ progress, onOpen }: Props) {
  const nextId = nextLessonId(progress)
  const doneCount = lessons.filter((l) => lessonDone(progress, l.id)).length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Bài học</h1>
        <p className="text-inksoft">
          Học theo thứ tự để dễ nhất — hoặc chọn lại bài nào muốn ôn.
        </p>
        <p className="mt-1 text-sm font-bold text-inksoft">
          Đã xong {doneCount}/{lessons.length} bài ({lessons.length} ngày)
        </p>
      </div>

      {lessons.map((l) => {
        const done = lessonDone(progress, l.id)
        const isNext = l.id === nextId
        return (
          <button
            key={l.id}
            type="button"
            className="card flex w-full items-start gap-3 p-4 text-left transition-transform active:scale-[0.99]"
            onClick={() => onOpen(l.id)}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold ${
                done ? 'bg-oksoft text-ok' : 'bg-primarysoft text-primary'
              }`}
            >
              {done ? '✓' : String(l.order).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-extrabold leading-tight">
                  {l.title}
                </span>
                {isNext && <span className="chip bg-[#FEF3C7] text-[#B45309]">▶ Học tiếp</span>}
                {done && (
                  <span className="text-xs font-bold text-inksoft">
                    đã học {progress.lessonsDone[l.id]?.split('-').reverse().join('/') ?? ''}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm text-inksoft">{l.goal}</span>
              <span className="mt-2 flex flex-wrap gap-2">
                <span className="chip">
                  {l.words.length} từ · {l.phrases.length} câu nói · quiz {l.quiz.length} câu
                </span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
