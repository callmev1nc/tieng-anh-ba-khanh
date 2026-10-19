import { useEffect, useRef, useState } from 'react'
import type { ListenItem } from '../../lib/exercises'
import { speak, stopSpeaking, ttsAvailable } from '../../lib/speech'

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
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) onDone(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!item) return null

  const replay = () => {
    const ms = item.audio.length * 140 + 4000
    speak(item.audio, 0.85, {
      onEnd: () => {
        if (timerRef.current) window.clearTimeout(timerRef.current)
      },
    })
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {}, ms)
  }

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === item.answer) setCorrect(c => c + 1)
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
          className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full bg-primary text-5xl text-white shadow-lg transition-transform active:scale-95"
          onClick={replay}
          disabled={!ttsAvailable}
          aria-label="Nghe lại câu vừa rồi"
        >
          🔊
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
              picked === null
                ? 'btn btn-ghost justify-start text-left'
                : idx === item.answer
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
          className={`mt-4 rounded-2xl p-4 text-center font-bold ${
            picked === item.answer ? 'bg-oksoft text-ok' : 'bg-flagsoft text-flag'
          }`}
          role="status"
        >
          {picked === item.answer ? '🎉 Tai chuẩn đấy!' : `Câu đúng là: “${item.options[item.answer].en}”`}
          <span className="mt-1 block text-sm font-semibold opacity-80">{item.vi}</span>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-big mt-4 w-full"
        onClick={advance}
        disabled={picked === null}
        style={picked === null ? { opacity: 0.45 } : undefined}
      >
        {isLast ? 'Xong nghe ✓' : 'Tiếp câu →'}
      </button>
    </div>
  )
}
