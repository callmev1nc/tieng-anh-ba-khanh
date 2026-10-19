import { useEffect, useState } from 'react'
import type { NumberDrill } from '../../types'
import { SpeakButton } from '../SpeakButton'

interface Props {
  drills: NumberDrill[]
  onDone: (correct: number, total: number) => void
}

/** Hear "two fifty" — tap what it means: 250.000đ, 2.500đ hay 205.000đ? */
export function NumbersStage({ drills, onDone }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const isLast = i + 1 >= drills.length
  const d = drills[i]

  useEffect(() => {
    if (drills.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!d) return null

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === d.answer) setCorrect(c => c + 1)
  }

  const advance = () => {
    if (isLast) {
      onDone(correct, drills.length)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Nghe số {i + 1} / {drills.length}
        </span>
        <span>💰 Số, tiền & giờ</span>
      </div>

      <div className="card p-5 text-center">
        <p className="text-sm font-bold text-inksoft">Khách nói — anh nghe rồi chọn ý:</p>
        <SpeakButton
          text={d.say}
          className="mx-auto mt-4 flex w-28 aspect-square items-center justify-center rounded-full bg-primary text-5xl text-white shadow-lg"
        >
          🔊
        </SpeakButton>
        {d.phon && <p className="mt-3 text-sm font-bold text-primary">{d.phon}</p>}
      </div>

      <div className="mt-4 grid gap-3">
        {d.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="opt"
            className={
              picked === null
                ? 'btn btn-ghost'
                : idx === d.answer
                  ? 'btn border-2 border-ok bg-ok text-white'
                  : idx === picked
                    ? 'btn border-2 border-flag bg-flagsoft text-flag'
                    : 'btn btn-ghost opacity-50'
            }
            onClick={() => pick(idx)}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="font-display text-xl font-extrabold">{opt}</span>
          </button>
        ))}
      </div>

      {picked !== null && (
        <div
          className={`mt-4 rounded-2xl p-4 text-center font-bold ${
            picked === d.answer ? 'bg-oksoft text-ok' : 'bg-flagsoft text-flag'
          }`}
          role="status"
        >
          {picked === d.answer ? '🎉 Đúng rồi!' : `Đáp án: “${d.options[d.answer]}”`}
          <span className="mt-1 block text-sm font-semibold opacity-80">
            “{d.say}” — giờ bấm 🔊 nghe lại, tai mình quen dần từng con số.
          </span>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-big mt-4 w-full"
        onClick={advance}
        disabled={picked === null}
        style={picked === null ? { opacity: 0.45 } : undefined}
      >
        {isLast ? 'Xong luyện nhanh ✓' : 'Tiếp →'}
      </button>
    </div>
  )
}
