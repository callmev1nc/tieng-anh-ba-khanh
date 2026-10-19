import { useEffect, useState } from 'react'
import type { NumberDrill } from '../../types'
import { SpeakButton } from '../SpeakButton'
import { SpeakerIcon } from '../icons'
import { AnswerBanner } from '../AnswerBanner'
import { sfxCorrect, sfxWrong } from '../../lib/sfx'

interface Props {
  drills: NumberDrill[]
  onDone: (correct: number, total: number) => void
}

/** Hear "two fifty" — tap what it means: 250.000đ, 2.500đ or 205.000đ? */
export function NumbersStage({ drills, onDone }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const isLast = i + 1 >= drills.length
  const d = drills[i]
  const answered = picked !== null
  const isRight = picked === d?.answer

  useEffect(() => {
    if (drills.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!d) return null

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === d.answer) {
      setCorrect(c => c + 1)
      sfxCorrect()
    } else {
      sfxWrong()
    }
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
        <span>Số, tiền &amp; giờ</span>
      </div>

      <div className="card p-5 text-center">
        <p className="text-sm font-bold text-inksoft">Khách nói — anh nghe rồi chọn ý:</p>
        <SpeakButton
          text={d.say}
          className="mx-auto mt-4 flex w-28 aspect-square items-center justify-center rounded-full bg-primary text-white shadow-lg"
          ariaLabel="Nghe lại"
        >
          <SpeakerIcon size={40} />
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
              !answered
                ? 'btn btn-ghost btn-opt'
                : idx === d.answer
                  ? 'btn btn-opt btn-opt-right'
                  : idx === picked
                    ? 'btn btn-opt btn-opt-wrong'
                    : 'btn btn-ghost btn-opt btn-opt-dim'
            }
            onClick={() => pick(idx)}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink opacity-100">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="font-display text-xl font-extrabold">{opt}</span>
          </button>
        ))}
      </div>

      {answered && (
        <>
          <div className="h-44" aria-hidden />
          <AnswerBanner
            correct={isRight}
            title={isRight ? '🎉 Đúng rồi!' : `Đáp án: “${d.options[d.answer]}”`}
            detail={`“${d.say}” — bấm nút loa nghe lại, tai mình quen dần từng con số.`}
            actionLabel={isLast ? 'Xong luyện nhanh ✓' : 'Tiếp →'}
            onAction={advance}
          />
        </>
      )}
    </div>
  )
}
