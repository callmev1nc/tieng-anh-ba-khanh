import { useEffect, useRef, useState } from 'react'
import type { Progress } from '../types'
import { lessonDone, nextLessonId } from '../lib/progress'
import { lessons } from '../data/lessons'
import { CheckIcon, PlayIcon, ScissorsIcon } from '../components/icons'
import { sfxTap } from '../lib/sfx'
import { Mascot } from '../components/Mascot'

interface Props {
  progress: Progress
  onOpen: (id: string) => void
}

const CHAPTERS: { name: string; hint: string; from: number; to: number }[] = [
  { name: 'Xuất phát', hint: 'Chào khách · lọc hẹn · cắt · nhuộm', from: 1, to: 10 },
  { name: 'Lên tay', hint: 'Tóc nữ · uốn duỗi · khuyến mãi · thu tiền', from: 11, to: 20 },
  { name: 'Tiếp khách giỏi', hint: 'Khách vội · khách khó · khiếu nại · small talk', from: 21, to: 30 },
  { name: 'Thành thạo nghề', hint: 'Số tiền · xu hướng · Tết · kể chuyện tiệm', from: 31, to: 40 },
]

/** Winding path of lesson nodes, grouped into 4 chapters — the "map" view. */
export function LessonsPage({ progress, onOpen }: Props) {
  const nextId = nextLessonId(progress)
  const doneCount = lessons.filter((l) => lessonDone(progress, l.id)).length
  const [selected, setSelected] = useState<string | null>(nextId)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  const selectedLesson = selected ? lessons.find((l) => l.id === selected) ?? null : null

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Bài học</h1>
          <p className="text-inksoft">
            40 ngày — đi theo đường, chạm nút để mở bài.
          </p>
          <p className="mt-1 text-sm font-bold text-inksoft">
            Đã xong {doneCount}/{lessons.length} bài
          </p>
        </div>
        <Mascot state={doneCount === 0 ? 'wave' : 'idle'} size={84} className="shrink-0" />
      </div>

      {CHAPTERS.map((c, ci) => {
        const items = lessons.filter((l) => l.order >= c.from && l.order <= c.to)
        const cDone = items.filter((l) => lessonDone(progress, l.id)).length
        return (
          <section key={ci} className="card overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold leading-tight">{c.name}</p>
                <p className="truncate text-xs text-inksoft">{c.hint}</p>
              </div>
              <span
                className={`chip shrink-0 ${
                  cDone === items.length ? 'bg-oksoft text-ok' : ''
                }`}
              >
                {cDone}/{items.length}
              </span>
            </div>

            {/* winding path */}
            <div className="relative px-6 pb-4 pt-3">
              <div
                className="absolute bottom-6 left-1/2 top-0 w-0 border-l-2 border-dashed border-mist"
                aria-hidden
              />
              <div className="relative flex flex-col gap-2.5">
                {items.map((l, idx) => {
                  const done = lessonDone(progress, l.id)
                  const isNext = l.id === nextId
                  const pos = idx % 3
                  return (
                    <div
                      key={l.id}
                      className={`flex ${pos === 0 ? 'justify-start' : pos === 1 ? 'justify-center' : 'justify-end'}`}
                    >
                      <button
                        type="button"
                        data-testid="lesson-node"
                        onClick={() => {
                          sfxTap()
                          setSelected(l.id)
                        }}
                        aria-label={`${l.order}. ${l.title}${done ? ' (đã xong)' : ''}`}
                        className={`group grid place-items-center ${isNext ? 'node-current h-[68px] w-[68px]' : 'h-16 w-16'} rounded-[1.35rem] ${
                          done
                            ? 'bg-ok text-white'
                            : isNext
                              ? 'bg-primary text-white'
                              : 'border-2 border-mist bg-white text-inksoft'
                        }`}
                        style={{
                          boxShadow: done || isNext ? '0 5px 0 rgba(14,27,44,0.28)' : '0 3px 0 var(--color-mist)',
                          transition: 'transform 0.1s ease',
                        }}
                        title={l.title}
                      >
                        <span
                          className={`font-display font-extrabold ${
                            done || isNext ? 'text-white' : 'text-inksoft'
                          }`}
                          aria-hidden
                        >
                          {done ? (
                            <CheckIcon size={26} />
                          ) : isNext ? (
                            <ScissorsIcon size={26} />
                          ) : (
                            String(l.order).padStart(2, '0')
                          )}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* lesson detail card for this chapter */}
            {selectedLesson &&
              selectedLesson.order >= c.from &&
              selectedLesson.order <= c.to && (
                <div ref={cardRef} className="border-t border-mist bg-primarysoft/50 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-base font-extrabold ${
                        lessonDone(progress, selectedLesson.id)
                          ? 'bg-ok text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {lessonDone(progress, selectedLesson.id)
                        ? '✓'
                        : String(selectedLesson.order).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-extrabold leading-tight">
                        {selectedLesson.title}
                      </p>
                      <p className="mt-1 text-sm text-inksoft">{selectedLesson.goal}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="chip bg-white">
                          {selectedLesson.words.length} từ · {selectedLesson.phrases.length} câu
                        </span>
                        <span className="chip bg-white">quiz {selectedLesson.quiz.length} câu</span>
                      </div>
                      <button
                        type="button"
                        data-testid="lesson-start"
                        className="btn btn-primary btn-raise mt-3 w-full"
                        onClick={() => onOpen(selectedLesson.id)}
                      >
                        <PlayIcon size={18} /> Bắt đầu bài học
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </section>
        )
      })}
    </div>
  )
}
