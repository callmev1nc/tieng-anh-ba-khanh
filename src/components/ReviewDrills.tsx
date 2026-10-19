import { useMemo, useState } from 'react'
import type { WordMeta } from '../data/lessons'
import { shuffled, freshRand } from '../lib/exercises'
import { speak, speakSlow, stopSpeaking, ttsAvailable } from '../lib/speech'
import { sfxCorrect, sfxMatch, sfxWrong, buzz } from '../lib/sfx'
import { AnswerBanner } from './AnswerBanner'
import { SpeakerIcon } from './icons'

/* Drill bodies used by ReviewSession. Every drill reports per-word results. */

export interface DrillProps {
  drill: { dir?: 'vi-en' | 'en-vi'; word: WordMeta; options: string[]; answer: number }
  kind: 'choice' | 'listen'
  isLast: boolean
  /** fired as soon as the learner commits an answer */
  onResolve: (en: string, ok: boolean) => void
  onAdvance: () => void
}

/** EN→VI (recognition) / VI→EN (recall) / listen→word. */
export function WordDrill({ drill, kind, isLast, onResolve, onAdvance }: DrillProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const isRight = picked === drill.answer

  const pick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    onResolve(drill.word.en, idx === drill.answer)
    if (idx === drill.answer) sfxCorrect()
    else sfxWrong()
  }

  return (
    <div>
      <div className="card p-5 text-center">
        {kind === 'listen' ? (
          <>
            <p className="text-sm font-bold text-inksoft">Nghe rồi chọn từ vừa nghe:</p>
            <button
              type="button"
              className="mx-auto mt-4 grid h-24 w-24 place-items-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
              onClick={() => {
                buzz(10)
                speak(drill.word.en, 0.85)
              }}
              disabled={!ttsAvailable}
              aria-label="Nghe từ"
            >
              <SpeakerIcon size={38} />
            </button>
          </>
        ) : drill.dir === 'en-vi' ? (
          <>
            <p className="font-display text-4xl font-extrabold leading-tight">{drill.word.en}</p>
            {drill.word.note && <p className="mt-2 text-sm text-inksoft">{drill.word.note}</p>}
            <p className="mt-3 text-sm font-semibold text-primary">Nghĩa tiếng Việt là gì?</p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-extrabold leading-snug text-primary">
              {drill.word.vi}
            </p>
            <p className="mt-3 text-sm font-semibold text-primary">Từ tiếng Anh cho nghĩa này?</p>
          </>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {drill.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            data-testid="review-opt"
            className={
              !answered
                ? 'btn btn-ghost btn-opt'
                : idx === drill.answer
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
            <span
              className={
                kind === 'choice' && drill.dir === 'vi-en'
                  ? 'font-display text-lg font-extrabold'
                  : 'min-w-0 font-semibold'
              }
            >
              {opt}
            </span>
          </button>
        ))}
      </div>

      {answered && (
        <>
          <div className="h-44" aria-hidden />
          <AnswerBanner
            correct={isRight}
            title={isRight ? '🎉 Nhớ đó!' : `Đáp án: “${drill.options[drill.answer]}”`}
            detail={`“${drill.word.en}” — ${drill.word.vi}`}
            actionLabel={
              isLast ? 'Xong ôn tập ✓' : 'Tiếp từ →'
            }
            onAction={() => {
              if (isRight && kind === 'listen') {
                // extra ear training on the way out — harmless if unmounted
                speakSlow(drill.word.en)
              }
              onAdvance()
            }}
          />
        </>
      )}
    </div>
  )
}

interface Pair {
  en: string
  vi: string
}

/** Tap one card left, one right — match 4 EN↔VI pairs. A word only counts as
 * remembered if it matched without a wrong attempt. */
export function PairsDrillView({
  drill,
  onResolve,
  onAdvance,
}: {
  drill: { words: WordMeta[] }
  onResolve: (results: Record<string, boolean>) => void
  onAdvance: () => void
}) {
  const rand = useMemo(() => freshRand(), [])
  const ens = useMemo(
    () => shuffled(drill.words.map((w) => ({ en: w.en, vi: w.vi })), rand),
    [drill, rand],
  )
  const vis = useMemo(
    () => shuffled(drill.words.map((w) => ({ en: w.en, vi: w.vi })), rand),
    [drill, rand],
  )
  const [selEn, setSelEn] = useState<string | null>(null)
  const [selVi, setSelVi] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const [wrongOnce, setWrongOnce] = useState<string[]>([])
  const done = matched.length === drill.words.length

  const resolveWords = (): Record<string, boolean> =>
    Object.fromEntries(drill.words.map((w) => [w.en, !wrongOnce.includes(w.en)]))

  const tryPair = (en: string, vi: string): void => {
    if (en === vi) {
      sfxMatch()
      setMatched((m) => [...m, en])
      setSelEn(null)
      setSelVi(null)
      return
    }
    sfxWrong()
    if (!wrongOnce.includes(en)) setWrongOnce((w) => [...w, en, vi])
    setWrongPair([en, vi])
    window.setTimeout(() => {
      setWrongPair(null)
      setSelEn(null)
      setSelVi(null)
    }, 550)
  }

  const tapEn = (p: Pair): void => {
    if (matched.includes(p.en) || done || wrongPair) return
    stopSpeaking()
    speak(p.en, 0.85) // hearing the word while pairing doubles the exposure
    const next = selEn === p.en ? null : p.en
    setSelEn(next)
    if (next && selVi) tryPair(next, selVi)
  }

  const tapVi = (p: Pair): void => {
    if (matched.includes(p.en) || done || wrongPair) return
    const next = selVi === p.en ? null : p.en
    setSelVi(next)
    if (next && selEn) tryPair(selEn, next)
  }

  const cellCls = (p: Pair, side: 'en' | 'vi'): string => {
    if (matched.includes(p.en)) return 'btn h-14 w-full justify-center px-3 border-2 border-ok bg-oksoft text-ok'
    const isWrong = wrongPair !== null && wrongPair[side === 'en' ? 0 : 1] === p.en
    if (isWrong) return 'btn animate-shake h-14 w-full justify-center px-3 border-2 border-flag bg-flagsoft text-flag'
    const isSel = (side === 'en' ? selEn : selVi) === p.en
    if (isSel) return 'btn h-14 w-full justify-center px-3 border-2 border-primary bg-primarysoft text-primary'
    return 'btn h-14 w-full justify-center px-3 border-2 border-mist bg-white'
  }

  return (
    <div>
      <p className="text-sm font-bold text-inksoft">
        Ghép 4 cặp — chạm từ tiếng Anh rồi chạm nghĩa tiếng Việt.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ens.map((p) => (
          <button
            key={`en-${p.en}`}
            type="button"
            data-testid="pair"
            disabled={matched.includes(p.en)}
            className={cellCls(p, 'en')}
            onClick={() => tapEn(p)}
          >
            <span className="min-w-0 truncate font-display font-extrabold">{p.en}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {vis.map((p) => (
          <button
            key={`vi-${p.vi}`}
            type="button"
            data-testid="pair"
            disabled={matched.includes(p.en)}
            className={cellCls(p, 'vi')}
            onClick={() => tapVi(p)}
          >
            <span className="min-w-0 font-semibold">{p.vi}</span>
          </button>
        ))}
      </div>

      {done && (
        <>
          <div className="h-44" aria-hidden />
          <AnswerBanner
            correct
            title="🎉 Đủ 4 cặp!"
            detail={
              wrongOnce.length > 0
                ? 'Cặp nào từng ghép nhầm sẽ về ôn sớm hơn.'
                : 'Cả 4 cặp sạch sẽ — nhớ chắc lắm đấy!'
            }
            actionLabel="Tiếp tục →"
            onAction={() => {
              onResolve(resolveWords())
              onAdvance()
            }}
          />
        </>
      )}
    </div>
  )
}
