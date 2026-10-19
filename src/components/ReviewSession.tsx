import { useState } from 'react'
import type { DueWord } from '../lib/progress'
import { stopSpeaking } from '../lib/speech'
import { VocabStage } from './stages/VocabStage'

interface Props {
  words: DueWord[]
  onResult: (en: string, ok: boolean) => void
  /** Finish the session; returns XP earned */
  onFinish: () => number
  onExit: () => void
}

/** Drill the words whose review date has arrived. */
export function ReviewSession({ words, onResult, onFinish, onExit }: Props) {
  const [done, setDone] = useState(false)
  const [score, setScore] = useState({ ok: 0, bad: 0 })
  const [xp, setXp] = useState(0)

  const handleResult = (en: string, ok: boolean) => {
    onResult(en, ok)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) }))
  }

  const handleDone = () => {
    setXp(onFinish())
    setDone(true)
  }

  const exit = () => {
    stopSpeaking()
    onExit()
  }

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
            >
              ✕ Thoát
            </button>
            <div className="text-center">
              <p className="font-display text-base font-extrabold">Ôn tập từ đã học</p>
              <p className="text-xs font-bold text-inksoft">
                {done ? 'Hoàn thành' : `${words.length} từ đến hạn`}
              </p>
            </div>
            <span className="w-[68px]" aria-hidden />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 py-5 pb-12">
          {!done ? (
            <VocabStage words={words} mode="review" onResult={handleResult} onDone={handleDone} />
          ) : (
            <div className="flex flex-col items-center pt-6 text-center">
              <div className="text-6xl" aria-hidden>
                🧠
              </div>
              <h2 className="mt-4 font-display text-2xl font-extrabold">Ôn tập xong!</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="chip bg-[#FEF3C7] text-[#B45309]">⭐ +{xp} XP</span>
                <span className="chip bg-oksoft text-ok">✅ Nhớ {score.ok} từ</span>
                {score.bad > 0 && (
                  <span className="chip bg-flagsoft text-flag">🔁 Chưa nhớ {score.bad} từ</span>
                )}
              </div>
              <p className="mt-4 max-w-sm text-inksoft">
                Từ chưa nhớ sẽ quay lại ôn ngày mai. Từ nhớ rồi sẽ giãn ra 2, 4, 7… ngày.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-big mt-8 w-full"
                onClick={exit}
              >
                🏠 Về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
