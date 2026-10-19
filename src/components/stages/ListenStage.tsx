import { useEffect, useState } from 'react'
import type { ListenItem } from '../../lib/exercises'
import { speak, stopSpeaking, ttsAvailable } from '../../lib/speech'
import { AnswerBanner } from '../AnswerBanner'
import { sfxCorrect, sfxWrong } from '../../lib/sfx'
import { SpeakerIcon } from '../icons'

interface Props {
  title: string
  items: ListenItem[]
  onDone: (correct: number, total: number) => void
}

/** Hear a sentence (no text first), then pick what you heard. */
export function ListenStage({ title, items, onDone }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const item = items[i]
  const isLast = i + 1 >= items.length
  const answered = picked !== null
  const isRight = picked === item?.answer

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!item) return null

  const replay = () => {
    speak(item.audio, 0.85)
  }

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === item.answer) {
      setCorrect(c => c + 1)
      sfxCorrect()
    } else {
      sfxWrong()
    }
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
          {title} {i + 1} / {items.length}
        </span>
        <span>👂 Nghe rồi chọn</span>
      </div>

      <div className="card p-5 text-center">
        <p className="text-sm font-semibold text-inksoft">
          Nghe kỹ — chưa hiện chữ, chỉ có tai của anh ✌️
        </p>
        <button
          type="button"
          className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
          onClick={replay}
          disabled={!ttsAvailable}
          aria-label="Nghe lại câu vừa rồi"
        >
          <SpeakerIcon size={44} />
        </button>
        <p className="mt-3 text-sm font-bold text-primary">Bấm để nghe (nghe bao nhiêu lần cũng được)</p>
      </div>

      <div className="mt-4 space-y-3">
        {item.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="opt"
            className={
              !answered
                ? 'btn btn-ghost btn-opt'
                : idx === item.answer
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
            <span className="min-w-0">
              <span className="block font-semibold">{opt.en}</span>
              {opt.phon && <span className="block text-sm font-semibold text-current opacity-70">{opt.phon}</span>}
            </span>
          </button>
        ))}
      </div>

      {answered && (
        <>
          <div className="h-44" aria-hidden />
          <AnswerBanner
            correct={isRight}
            title={isRight ? '🎉 Tai chuẩn đấy!' : `Câu đúng là: “${item.options[item.answer].en}”`}
            detail={item.vi || undefined}
            actionLabel={isLast ? 'Xong nghe ✓' : 'Tiếp câu →'}
            onAction={advance}
          />
        </>
      )}
    </div>
  )
}
