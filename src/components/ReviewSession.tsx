import { useEffect, useMemo, useState } from 'react'
import type { DueWord } from '../lib/progress'
import { stopSpeaking } from '../lib/speech'
import { freshRand } from '../lib/exercises'
import { buildReviewPlan, type ReviewStep } from '../lib/reviewDrills'
import { fireConfetti } from '../lib/confetti'
import { sfxFanfare } from '../lib/sfx'
import { PoleBar } from './PoleBar'
import { Mascot } from './Mascot'
import { XIcon, StarIcon, CheckIcon } from './icons'
import { WordDrill, PairsDrillView } from './ReviewDrills'

interface Props {
  words: DueWord[]
  onResult: (en: string, ok: boolean) => void
  /** Finish the session; returns XP earned */
  onFinish: () => number
  onExit: () => void
}

/** Drill the due words with forced-retrieval exercises. */
export function ReviewSession({ words, onResult, onFinish, onExit }: Props) {
  const plan = useMemo<ReviewStep[]>(() => buildReviewPlan(words, freshRand()), [words])
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState({ ok: 0, bad: 0 })
  const [xp, setXp] = useState(0)

  useEffect(() => {
    if (done) {
      fireConfetti()
      sfxFanfare()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const step = plan[stepIdx]
  const isLast = stepIdx + 1 >= plan.length

  const commitResult = (key: string, ok: boolean): void => {
    onResult(key, ok)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) }))
  }

  const advance = () => {
    if (stepIdx + 1 >= plan.length) {
      setXp(onFinish())
      setDone(true)
      return
    }
    setStepIdx((n) => n + 1)
  }

  const exit = () => {
    stopSpeaking()
    onExit()
  }

  const progress = plan.length === 0 ? 1 : stepIdx / plan.length

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <header className="border-b border-mist bg-white">
        <div
          className="mx-auto max-w-xl px-4 pb-3"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn btn-ghost min-h-[42px] px-4 py-1.5 text-sm"
              onClick={exit}
              aria-label="Thoát ôn tập"
            >
              <XIcon size={16} /> Thoát
            </button>
            <div className="text-center">
              <p className="font-display text-base font-extrabold">Ôn tập — trắc nghiệm nhanh</p>
              <p className="text-xs font-bold text-inksoft">
                {done ? 'Hoàn thành' : `${words.length} từ đến hạn`}
              </p>
            </div>
            <span className="w-[68px]" aria-hidden />
          </div>
          {!done && (
            <div className="mt-3">
              <PoleBar value={progress} label="Tiến độ ôn tập" />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 py-5 pb-12">
          {plan.length === 0 && !done ? (
            <p className="text-center text-inksoft">Không có từ nào để ôn.</p>
          ) : done ? (
            <div key="done" className="stage-in flex flex-col items-center pt-2 text-center">
              <Mascot state="happy" size={140} />
              <h2 className="mt-2 font-display text-2xl font-extrabold">Ôn tập xong!</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="chip pop-in bg-[#FEF3C7] text-[#B45309]">
                  <StarIcon size={14} /> +{xp} XP
                </span>
                <span
                  className="chip pop-in bg-oksoft text-ok"
                  style={{ animationDelay: '80ms' }}
                >
                  <CheckIcon size={14} /> Nhớ {score.ok} từ
                </span>
                {score.bad > 0 && (
                  <span
                    className="chip pop-in bg-flagsoft text-flag"
                    style={{ animationDelay: '160ms' }}
                  >
                    Chưa nhớ {score.bad} từ
                  </span>
                )}
              </div>
              <p className="mt-4 max-w-sm text-inksoft">
                Từ chưa nhớ sẽ quay lại ôn ngày mai. Từ nhớ rồi sẽ giãn ra 2, 4, 7… ngày.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-raise btn-big mt-8 w-full"
                onClick={exit}
                data-testid="done-home"
              >
                Về trang chủ
              </button>
            </div>
          ) : (
            <div key={stepIdx} className="stage-in">
              {step.drill.kind === 'pairs' ? (
                <PairsDrillView
                  drill={step.drill}
                  onResolve={(results) => {
                    for (const [en, ok] of Object.entries(results)) commitResult(en, ok)
                  }}
                  onAdvance={advance}
                />
              ) : step.drill.kind === 'listen' ? (
                <WordDrill
                  drill={step.drill}
                  kind="listen"
                  isLast={isLast}
                  onResolve={commitResult}
                  onAdvance={advance}
                />
              ) : (
                <WordDrill
                  drill={step.drill}
                  kind="choice"
                  isLast={isLast}
                  onResolve={commitResult}
                  onAdvance={advance}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
