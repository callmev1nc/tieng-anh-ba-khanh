import { useEffect, useState } from 'react'
import type { Word } from '../../types'
import { SpeakButton } from '../SpeakButton'

interface Props {
  words: Word[]
  /** learn = lesson flashcards, review = due-words drill */
  mode?: 'learn' | 'review'
  onSeen?: (en: string) => void
  onResult?: (en: string, ok: boolean) => void
  onDone: () => void
}

export function VocabStage({ words, mode = 'learn', onSeen, onResult, onDone }: Props) {
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const w = words[i]

  useEffect(() => {
    if (mode === 'learn') onSeen?.(words[i].en)
    // run once per card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  const advance = () => {
    if (i + 1 >= words.length) {
      onDone()
      return
    }
    setI(i + 1)
    setFlipped(false)
  }

  const answer = (ok: boolean) => {
    onResult?.(w.en, ok)
    advance()
  }

  const isLast = i + 1 >= words.length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          {mode === 'review' ? 'Ôn tập' : 'Từ mới'} {i + 1} / {words.length}
        </span>
        <span>{flipped ? 'Nhớ chưa?' : 'Chạm thẻ để lật'}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className="card w-full p-5 text-left transition-transform active:scale-[0.99]"
        aria-label={flipped ? `Ẩn nghĩa của ${w.en}` : `Xem nghĩa của ${w.en}`}
      >
        {!flipped ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center text-center">
            <span className="text-4xl" aria-hidden>
              👆
            </span>
            <p className="mt-3 font-display text-4xl font-extrabold leading-tight">
              {w.en}
            </p>
            {w.phon && (
              <p className="mt-1 text-lg font-semibold text-inksoft">{w.phon}</p>
            )}
            <p className="mt-4 text-sm font-semibold text-inksoft">
              Chạm để xem nghĩa tiếng Việt
            </p>
          </div>
        ) : (
          <div className="min-h-[190px]">
            <p className="font-display text-2xl font-extrabold text-inksoft">
              {w.en}
            </p>
            {w.phon && (
              <p className="mt-0.5 text-base font-semibold text-inksoft">{w.phon}</p>
            )}
            <p className="mt-2 font-display text-3xl font-extrabold text-primary">
              {w.vi}
            </p>
            {w.note && (
              <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-inksoft">
                💡 {w.note}
              </p>
            )}
          </div>
        )}
      </button>

      <div className="mt-4 flex gap-3">
        <SpeakButton text={w.en} className="btn btn-ghost flex-1">
          🔊 Nghe
        </SpeakButton>
        <SpeakButton text={w.en} rate={0.6} className="btn btn-ghost flex-1">
          🐢 Nghe chậm
        </SpeakButton>
      </div>

      {mode === 'learn' ? (
        <button
          type="button"
          className="btn btn-primary btn-big mt-4 w-full"
          onClick={() => (flipped ? advance() : setFlipped(true))}
        >
          {flipped ? (isLast ? 'Xong từ mới ✓' : 'Tiếp từ →') : 'Xem nghĩa'}
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-ok" onClick={() => answer(true)}>
            ✅ Nhớ rồi
          </button>
          <button
            type="button"
            className="btn border-2 border-flag bg-flagsoft text-flag"
            onClick={() => answer(false)}
          >
            🔁 Chưa nhớ
          </button>
        </div>
      )}
    </div>
  )
}
