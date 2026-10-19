import { useEffect, useMemo, useRef, useState } from 'react'
import { XIcon } from './icons'
import type { Lesson } from '../types'
import { PoleBar } from './PoleBar'
import { Mascot } from './Mascot'
import { stopSpeaking } from '../lib/speech'
import { fireConfetti } from '../lib/confetti'
import { sfxFanfare } from '../lib/sfx'
import {
  StarIcon,
  TrophyIcon,
  ScissorsIcon,
} from './icons'
import {
  buildListenItems,
  lessonPhrasePool,
  lessonRand,
  reviewWarmupItems,
} from '../lib/exercises'
import { VocabStage } from './stages/VocabStage'
import { ListenStage } from './stages/ListenStage'
import { SpeakStage } from './stages/SpeakStage'
import { DialogueStage } from './stages/DialogueStage'
import { ReplyStage } from './stages/ReplyStage'
import { NumbersStage } from './stages/NumbersStage'
import { QuizStage } from './stages/QuizStage'
import { MiniTestStage } from './stages/MiniTestStage'

const STAGE_LABEL: Record<string, string> = {
  warmup: 'Nghe tổng hợp',
  vocab: 'Từ mới',
  listen: 'Nghe & chọn',
  speak: 'Luyện nói',
  dialogue: 'Hội thoại',
  reply: 'Chọn câu trả lời',
  numbers: 'Số & tiền',
  quiz: 'Kiểm tra',
  mini: 'Mini test 🎯',
}

interface Props {
  lesson: Lesson
  /** Word passed (or failed) its meaning gate — register in SRS */
  onWordSeen: (en: string, ok: boolean) => void
  /** Lesson complete: quiz correct/total + mini-test result. Returns XP earned. */
  onFinish: (correct: number, total: number, miniCorrect: number, miniTotal: number) => number
  onExit: () => void
}

/** Full-screen lesson flow. Receptive skills first, production later. */
export function Session({ lesson, onWordSeen, onFinish, onExit }: Props) {
  const isReview = /on-tap/.test(lesson.id)

  const warmup = useMemo(
    () => (isReview ? reviewWarmupItems(lesson) : []),
    [isReview, lesson],
  )
  const listenItems = useMemo(
    () => buildListenItems(lessonPhrasePool(lesson), lessonRand(lesson.id + '::listen'), 3),
    [lesson],
  )

  type StageKey = keyof typeof STAGE_LABEL
  const stages: StageKey[] = []
  if (warmup.length) stages.push('warmup')
  stages.push('vocab')
  if (listenItems.length && !isReview) stages.push('listen')
  stages.push('speak', 'dialogue')
  if (lesson.situations && lesson.situations.length > 0) stages.push('reply')
  if (lesson.numbers && lesson.numbers.length > 0) stages.push('numbers')
  stages.push('quiz', 'mini')

  const last = stages.length // done screen index
  const [stage, setStage] = useState(0)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: lesson.quiz.length })
  const [miniScore, setMiniScore] = useState({ correct: -1, total: 0 })
  const [result, setResult] = useState<{ xp: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [stage])

  // Lesson-complete celebration: fires once, when the result screen mounts.
  useEffect(() => {
    if (result) {
      fireConfetti()
      sfxFanfare()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const exit = () => {
    stopSpeaking()
    onExit()
  }

  const currentStage = () => {
    const key = stages[stage]
    switch (key) {
      case 'warmup':
        return (
          <ListenStage
            title="Ôn nhanh tai"
            items={warmup}
            onDone={() => setStage(stage + 1)}
          />
        )
      case 'vocab':
        return (
          <VocabStage
            words={lesson.words}
            mode={isReview ? 'review' : 'learn'}
            onSeen={isReview ? undefined : onWordSeen}
            onDone={() => setStage(stage + 1)}
          />
        )
      case 'listen':
        return (
          <ListenStage
            title="Nghe & chọn"
            items={listenItems}
            onDone={() => setStage(stage + 1)}
          />
        )
      case 'speak':
        return <SpeakStage phrases={lesson.phrases} onDone={() => setStage(stage + 1)} />
      case 'dialogue':
        return <DialogueStage dialogue={lesson.dialogue} onDone={() => setStage(stage + 1)} />
      case 'reply':
        return <ReplyStage lesson={lesson} onDone={() => setStage(stage + 1)} />
      case 'numbers':
        return <NumbersStage drills={lesson.numbers ?? []} onDone={() => setStage(stage + 1)} />
      case 'quiz':
        return (
          <QuizStage
            quiz={lesson.quiz}
            onDone={(correct) => {
              setQuizScore({ correct, total: lesson.quiz.length })
              setStage(stage + 1)
            }}
          />
        )
      case 'mini':
        return (
          <MiniTestStage
            lesson={lesson}
            onDone={(miniCorrect, miniTotal) => {
              const xp = onFinish(quizScore.correct, quizScore.total, miniCorrect, miniTotal)
              setMiniScore({ correct: miniCorrect, total: miniTotal })
              setResult({ xp })
              setStage(last)
            }}
          />
        )
    }
  }

  const value = stage >= last ? 1 : (stage + 1) / (stages.length + 1)
  const step = `${Math.min(stage + 1, stages.length)}/${stages.length}`

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
              className="btn btn-ghost min-h-[42px] shrink-0 whitespace-nowrap px-4 py-1.5 text-sm"
              onClick={exit}
              aria-label="Thoát bài học"
            >
              <XIcon size={16} /> Thoát
            </button>
            <div className="min-w-0 text-center">
              <p className="truncate font-display text-base font-extrabold">
                {lesson.title}
              </p>
              <p className="text-xs font-bold text-inksoft">
                {stage >= last
                  ? 'Hoàn thành!'
                  : `Bước ${step} · ${STAGE_LABEL[stages[stage]]}`}
              </p>
            </div>
            <span className="grid h-[42px] w-[54px] shrink-0 place-items-center rounded-xl bg-primarysoft text-primary" aria-hidden>
              <ScissorsIcon size={20} />
            </span>
          </div>
          <div className="mt-3">
            <PoleBar value={value} label="Tiến độ bài học" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-xl px-4 py-5 pb-12">
          <div key={stage} className="stage-in">
            {stage >= last && result ? (
              <div className="flex flex-col items-center pt-2 text-center">
                <div className="relative">
                  <Mascot state="celebrate" size={150} />
                  <span className="float-up absolute -right-6 top-6 rounded-full bg-[#FEF3C7] px-3 py-1 text-sm font-extrabold text-[#B45309] shadow">
                    +{result.xp} XP
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-extrabold">
                  {lesson.order >= 40
                    ? 'Tốt nghiệp 40 ngày!'
                    : `Xong bài “${lesson.title}”!`}
                </h2>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="chip pop-in bg-[#FEF3C7] text-[#B45309]">
                    <StarIcon size={14} /> +{result.xp} XP
                  </span>
                  <span
                    className="chip pop-in bg-oksoft text-ok"
                    style={{ animationDelay: '80ms' }}
                  >
                    Quiz đúng {quizScore.correct}/{quizScore.total}
                  </span>
                  {miniScore.total > 0 && (
                    <span
                      className={`chip pop-in ${
                        miniScore.correct === miniScore.total
                          ? 'bg-oksoft text-ok'
                          : 'bg-mist text-ink'
                      }`}
                      style={{ animationDelay: '160ms' }}
                    >
                      🎯 Mini test {Math.max(miniScore.correct, 0)}/{miniScore.total}
                    </span>
                  )}
                  {lesson.order >= 40 && (
                    <span
                      className="chip pop-in bg-[#FCE7F3] text-[#BE185D]"
                      style={{ animationDelay: '240ms' }}
                    >
                      <TrophyIcon size={14} /> Chứng nhận 40 ngày học
                    </span>
                  )}
                </div>
                <p className="mt-4 max-w-sm text-inksoft">
                  Các từ hôm nay sẽ tự đến hạn ôn sau 1, 2, 4, 7… ngày. Ôn đúng hạn thì nhớ
                  lâu.
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
              currentStage()
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
