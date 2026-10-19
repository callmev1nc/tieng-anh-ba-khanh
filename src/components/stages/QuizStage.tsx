import { useState } from 'react'
import type { QuizQuestion } from '../../types'
import { AnswerBanner } from '../AnswerBanner'
import { sfxCorrect, sfxWrong } from '../../lib/sfx'

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
  const answered = picked !== null
  const isRight = picked === q.answer

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === q.answer) {
      setCorrect(correct + 1)
      sfxCorrect()
    } else {
      sfxWrong()
    }
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
    if (!answered) return 'btn btn-ghost btn-opt'
    if (idx === q.answer) return 'btn btn-opt btn-opt-right'
    if (idx === picked) return 'btn btn-opt btn-opt-wrong'
    return 'btn btn-ghost btn-opt btn-opt-dim'
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
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink opacity-100">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="font-semibold">{opt}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className="h-44" aria-hidden />
      )}

      {answered && (
        <AnswerBanner
          correct={isRight}
          title={isRight ? '🎉 Đúng rồi!' : 'Chưa đúng — đáp án đúng là:'}
          detail={isRight ? undefined : `“${q.options[q.answer]}”`}
          actionLabel={isLast ? 'Xong bài kiểm tra ✓' : 'Tiếp câu hỏi →'}
          onAction={advance}
        />
      )}
    </div>
  )
}
