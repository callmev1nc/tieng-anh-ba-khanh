import { useEffect, useState } from 'react'
import type { Lesson, Situation } from '../../types'
import { SpeakButton } from '../SpeakButton'

interface Props {
  lesson: Lesson
  /** Limit the number of situations played this round (keep flow short) */
  max?: number
  onDone: (correct: number, total: number) => void
}

/** The client says something — pick the best barber reply. */
export function ReplyStage({ lesson, max = 3, onDone }: Props) {
  const all = lesson.situations ?? []
  const items: Situation[] = all.slice(0, max)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const isLast = i + 1 >= items.length

  useEffect(() => {
    if (items.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (items.length === 0) {
    return null
  }
  const s = items[i]

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === s.answer) setCorrect(c => c + 1)
  }

  const advance = () => {
    if (isLast) {
      onDone(correct, items.length)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Đáp lại {i + 1} / {items.length}
        </span>
        <span>🧑 Khách nói → ☎️ Mình đáp</span>
      </div>

      <div className="card p-5">
        {s.hint && <span className="chip">💡 {s.hint}</span>}
        <p className="mt-3 text-sm font-bold text-inksoft">🧑 Khách nói:</p>
        <p className="font-display text-2xl font-extrabold leading-snug">{s.client.en}</p>
        {s.client.phon && (
          <p className="mt-1 text-base font-semibold text-inksoft">{s.client.phon}</p>
        )}
        {s.client.vi && <p className="mt-2 text-lg text-inksoft">“{s.client.vi}”</p>}
        <SpeakButton
          text={s.client.en}
          className="btn btn-ghost mt-3 min-h-[42px] w-full py-1.5 text-sm"
        >
          🔊 Nghe giọng khách
        </SpeakButton>
      </div>

      <p className="mt-4 text-sm font-bold text-primary">✂️ Mình đáp thế nào là khéo nhất?</p>
      <div className="mt-2 space-y-3">
        {s.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="opt"
            className={
              picked === null
                ? 'btn btn-ghost justify-start text-left'
                : idx === s.answer
                  ? 'btn justify-start text-left border-2 border-ok bg-ok text-white'
                  : idx === picked
                    ? 'btn justify-start text-left border-2 border-flag bg-flagsoft text-flag'
                    : 'btn btn-ghost justify-start text-left opacity-50'
            }
            onClick={() => pick(idx)}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{opt.en}</span>
              {opt.phon && <span className="block text-sm font-semibold text-current opacity-70">{opt.phon}</span>}
            </span>
          </button>
        ))}
      </div>

      {picked !== null && (
        <div
          className={`mt-4 rounded-2xl p-4 font-bold ${
            picked === s.answer ? 'bg-oksoft text-ok' : 'bg-flagsoft text-flag'
          }`}
          role="status"
        >
          {picked === s.answer ? '🎉 Chuẩn mực luôn!' : `Câu khéo hơn: “${s.options[s.answer].en}”`}
          {s.explain && <span className="mt-1 block text-sm font-semibold opacity-90">💡 {s.explain}</span>}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-big mt-4 w-full"
        onClick={advance}
        disabled={picked === null}
        style={picked === null ? { opacity: 0.45 } : undefined}
      >
        {isLast ? 'Xong đáp lại ✓' : 'Tình huống tiếp →'}
      </button>
    </div>
  )
}
