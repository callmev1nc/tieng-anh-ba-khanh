import { useState } from 'react'
import type { QuizQuestion } from '../../types'

interface Props {
  quiz: QuizQuestion[]
  onDone: (correct: number) => void
}

/** Vietnamese question → pick the English answer. No typing needed. */
export function QuizStage({ quiz, onDone }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const q = quiz[i]
  const isLast = i + 1 >= quiz.length

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === q.answer) setCorrect(correct + 1)
  }

  const advance = () => {
    if (isLast) {
      onDone(correct)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const optionClass = (idx: number) => {
    if (picked === null) return 'btn btn-ghost justify-start text-left'
    if (idx === q.answer) return 'btn justify-start text-left border-2 border-ok bg-ok text-white'
    if (idx === picked)
      return 'btn justify-start text-left border-2 border-flag bg-flagsoft text-flag'
    return 'btn btn-ghost justify-start text-left opacity-50'
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Kiểm tra {i + 1} / {quiz.length}
        </span>
        <span>Chọn đáp án đúng</span>
      </div>

      <div className="card p-5">
        <p className="text-lg font-bold leading-snug">{q.q}</p>
      </div>

      <div className="mt-4 space-y-3">
        {q.options.map((opt, idx) => (
          <button key={idx} type="button" data-testid="opt" className={optionClass(idx)} onClick={() => pick(idx)}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="font-semibold">{opt}</span>
          </button>
        ))}
      </div>

      {picked !== null && (
        <div
          className={`mt-4 rounded-2xl p-4 text-center font-bold ${
            picked === q.answer ? 'bg-oksoft text-ok' : 'bg-flagsoft text-flag'
          }`}
          role="status"
        >
          {picked === q.answer
            ? '🎉 Đúng rồi!'
            : `Chưa đúng — đáp án đúng là: “${q.options[q.answer]}”`}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-big mt-4 w-full"
        onClick={advance}
        style={picked === null ? { opacity: 0.45 } : undefined}
        disabled={picked === null}
      >
        {isLast ? 'Xong bài kiểm tra ✓' : 'Tiếp câu hỏi →'}
      </button>
    </div>
  )
}
