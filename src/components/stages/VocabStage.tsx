import { useMemo, useState } from 'react'
import type { Word } from '../../types'
import { shuffled, freshRand } from '../../lib/exercises'
import { SpeakButton } from '../SpeakButton'
import { CheckIcon, XIcon } from '../icons'
import { sfxCorrect, sfxWrong, sfxTap } from '../../lib/sfx'

interface Props {
  words: Word[]
  /** learn = lesson flashcards with a meaning gate, review = self-check drill */
  mode?: 'learn' | 'review'
  /** Word answered its meaning gate (registered in SRS with pass/fail) */
  onSeen?: (en: string, ok: boolean) => void
  onResult?: (en: string, ok: boolean) => void
  onDone: () => void
}

/** Flashcards — but "learn" mode makes you pick the meaning before you see it. */
export function VocabStage({ words, mode = 'learn', onSeen, onResult, onDone }: Props) {
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [gatePick, setGatePick] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const w = words[i]

  const gateOptions = useMemo(() => {
    if (mode !== 'learn') return null
    const others = words.filter((x) => x.en !== w.en && x.vi && x.vi !== w.vi)
    if (others.length < 2 || !w.vi) return null
    return shuffled([w.vi, ...shuffled(others, freshRand()).slice(0, 2).map((x) => x.vi)], freshRand())
  }, [i, mode, words, w.vi, w.en])

  const advance = () => {
    if (i + 1 >= words.length) {
      onDone()
      return
    }
    setI(i + 1)
    setFlipped(false)
    setGateOpen(false)
    setGatePick(null)
  }

  const answer = (ok: boolean) => {
    onResult?.(w.en, ok)
    advance()
  }

  /** Meaning gate resolved → register + flip. */
  const resolveGate = (ok: boolean) => {
    if (ok) sfxCorrect()
    else {
      sfxWrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 400)
    }
    onSeen?.(w.en, ok)
    window.setTimeout(() => setFlipped(true), ok ? 60 : 650)
  }

  const isLast = i + 1 >= words.length

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          {mode === 'review' ? 'Ôn tập' : 'Từ mới'} {i + 1} / {words.length}
        </span>
        <span>
          {mode === 'review' ? 'Nhớ chưa?' : flipped ? 'Xong — tiếp nào' : 'Nghĩa là gì nhỉ?'}
        </span>
      </div>

      <div className={`flip-wrap ${shake ? 'animate-shake' : ''}`}>
        <div className={`flip-card h-[252px] ${flipped ? 'is-back' : ''}`}>
          {/* Front */}
          <button
            type="button"
            onClick={() => {
              if (mode === 'review') setFlipped(true)
            }}
            aria-label={mode === 'review' ? `Xem nghĩa của ${w.en}` : `Từ ${w.en} — chọn nghĩa`}
            className={`card flip-face absolute inset-0 flex w-full flex-col items-center justify-center p-5 text-center ${mode === 'review' ? 'transition-transform active:scale-[0.99]' : ''}`}
          >
            <p className="font-display text-4xl font-extrabold leading-tight">{w.en}</p>
            {w.phon && <p className="mt-1 text-lg font-semibold text-inksoft">{w.phon}</p>}
            <p className="mt-3 text-sm font-semibold text-inksoft">
              {mode === 'review' ? 'Chạm thẻ để xem nghĩa' : 'Chọn nghĩa tiếng Việt bên dưới'}
            </p>
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => {
              if (mode === 'review') setFlipped(false)
            }}
            aria-label={mode === 'review' ? `Quay lại mặt từ ${w.en}` : `Nghĩa của ${w.en}`}
            className="card flip-face flip-back absolute inset-0 flex w-full flex-col justify-center p-5 text-left"
          >
            {mode === 'learn' && gatePick !== null && (
              <span
                className={`absolute right-4 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  gatePick >= 0 && gateOptions && gateOptions[gatePick] === w.vi
                    ? 'bg-oksoft text-ok'
                    : 'bg-flagsoft text-flag'
                }`}
              >
                {gatePick >= 0 && gateOptions && gateOptions[gatePick] === w.vi ? (
                  <>
                    <CheckIcon size={13} /> Chính xác
                  </>
                ) : (
                  <>
                    <XIcon size={13} /> Đáp án đúng
                  </>
                )}
              </span>
            )}
            <p className="font-display text-2xl font-extrabold text-inksoft">{w.en}</p>
            {w.phon && <p className="mt-0.5 text-base font-semibold text-inksoft">{w.phon}</p>}
            <p className="mt-2 font-display text-3xl font-extrabold text-primary">{w.vi}</p>
            {w.note && (
              <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-inksoft">💡 {w.note}</p>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <SpeakButton text={w.en} className="btn btn-ghost flex-1" />
        <SpeakButton text={w.en} rate={0.6} className="btn btn-ghost flex-1" />
      </div>

      {mode === 'learn' ? (
        <>
          {/* Meaning gate — the pick that registers the word */}
          {!flipped && !gateOpen && (
            <button
              type="button"
              className="btn btn-primary btn-raise btn-big mt-4 w-full"
              onClick={() => {
                sfxTap()
                if (gateOptions) setGateOpen(true)
                else {
                  onSeen?.(w.en, true)
                  setFlipped(true)
                }
              }}
              data-testid="gate-open"
            >
              {gateOptions ? 'Chọn nghĩa →' : 'Xem nghĩa'}
            </button>
          )}

          {!flipped && gateOpen && gateOptions && (
            <div className="mt-4 space-y-3" data-testid="gate-options">
              {gateOptions.map((vi, idx) => {
                const chosen = gatePick === idx
                const isAnswer = vi === w.vi
                const resolved = gatePick !== null
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid="vocab-opt"
                    disabled={resolved}
                    className={
                      !resolved
                        ? 'btn btn-ghost btn-opt'
                        : isAnswer
                          ? 'btn btn-opt btn-opt-right'
                          : chosen
                            ? 'btn btn-opt btn-opt-wrong'
                            : 'btn btn-ghost btn-opt btn-opt-dim'
                    }
                    onClick={() => {
                      if (resolved) return
                      setGatePick(idx)
                      resolveGate(isAnswer)
                    }}
                  >
                    <span className="font-semibold">{vi}</span>
                  </button>
                )
              })}
            </div>
          )}

          {flipped && (
            <button
              type="button"
              className="btn btn-primary btn-raise btn-big mt-4 w-full"
              onClick={advance}
            >
              {isLast ? 'Xong từ mới ✓' : 'Tiếp từ →'}
            </button>
          )}
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" className="btn btn-ok btn-raise" onClick={() => answer(true)}>
            <CheckIcon size={19} /> Nhớ rồi
          </button>
          <button type="button" className="btn btn-red btn-raise" onClick={() => answer(false)}>
            <XIcon size={19} /> Chưa nhớ
          </button>
        </div>
      )}
    </div>
  )
}
