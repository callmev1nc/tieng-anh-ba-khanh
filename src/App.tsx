import { useState } from 'react'
import type { Progress, TabId } from './types'
import { TabBar } from './components/TabBar'
import { InstallHint } from './components/InstallHint'
import { Session } from './components/Session'
import { ReviewSession } from './components/ReviewSession'
import { ScissorsIcon, FlameIcon, StarIcon } from './components/icons'
import { HomePage } from './pages/Home'
import { LessonsPage } from './pages/Lessons'
import { ReviewPage } from './pages/Review'
import { WordsPage } from './pages/Words'
import {
  completeLesson,
  completeReview,
  dueWords,
  learnWord,
  loadProgress,
  reviewWord,
  saveProgress,
  type DueWord,
} from './lib/progress'
import { getLesson } from './data/lessons'
import { stopSpeaking } from './lib/speech'

type SessionState =
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'review'; words: DueWord[] }
  | null

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true
  // iPadOS 13+ reports as Mac but can still be touch
  return 'ontouchend' in document && /macintosh/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true
  return window.matchMedia('(display-mode: standalone)').matches
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [tab, setTab] = useState<TabId>('home')
  const [session, setSession] = useState<SessionState>(null)
  const [installOpen, setInstallOpen] = useState(false)

  /** Mutate, persist, re-render — one commit per user action. */
  const commit = (fn: (p: Progress) => void): void => {
    const next: Progress = { ...progress }
    fn(next)
    saveProgress(next)
    setProgress(next)
  }

  const openLesson = (lessonId: string) => {
    stopSpeaking()
    setSession({ kind: 'lesson', lessonId })
  }

  const openReview = () => {
    const due = dueWords(progress)
    if (due.length === 0) return
    stopSpeaking()
    setSession({ kind: 'review', words: due })
  }

  const exitSession = () => {
    stopSpeaking()
    setSession(null)
  }

  const installVisible = detectIOS() && !isStandalone()

  let page: React.ReactNode
  if (session?.kind === 'lesson') {
    const lesson = getLesson(session.lessonId)
    page = lesson ? (
      <Session
        lesson={lesson}
        onWordSeen={(en, ok) => commit((p) => learnWord(p, en, ok))}
        onFinish={(_correct, _total, miniCorrect, miniTotal) => {
          let gained = 0
          commit((p) => {
            gained = completeLesson(p, session.lessonId)
            if (miniTotal >= 3 && miniCorrect === miniTotal) {
              p.xp += 10
              gained += 10
            }
          })
          return gained
        }}
        onExit={exitSession}
      />
    ) : null
  } else if (session?.kind === 'review') {
    page = (
      <ReviewSession
        words={session.words}
        onResult={(en, ok) => commit((p) => reviewWord(p, en, ok))}
        onFinish={() => {
          let gained = 0
          commit((p) => {
            gained = completeReview(p)
          })
          return gained
        }}
        onExit={exitSession}
      />
    )
  } else {
    switch (tab) {
      case 'lessons':
        page = <LessonsPage progress={progress} onOpen={openLesson} />
        break
      case 'review':
        page = <ReviewPage progress={progress} onStart={openReview} />
        break
      case 'words':
        page = <WordsPage progress={progress} />
        break
      default:
        page = (
          <HomePage
            progress={progress}
            installVisible={installVisible}
            onOpenLesson={openLesson}
            onOpenReview={openReview}
            onGoLessons={() => setTab('lessons')}
            onShowInstall={() => setInstallOpen(true)}
            onDismissInstall={() => commit((p) => { p.installHintDismissed = true })}
          />
        )
    }
  }

  const dueCount = session ? 0 : dueWords(progress).length

  return (
    <div className="min-h-dvh">
      {!session && (
        <header className="sticky top-0 z-30">
          <div className="pole h-2" aria-hidden />
          <div className="border-b border-mist bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl text-white"
                  aria-hidden
                >
                  <ScissorsIcon size={22} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-extrabold leading-tight">
                    Tiếng Anh Ba Khanh
                  </p>
                  <p className="text-xs text-inksoft">Tiếng Anh cho thợ tóc &amp; salon</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5 text-sm font-bold">
                <span className="chip bg-flagsoft text-flag">
                  <FlameIcon size={14} />
                  {progress.streak}
                </span>
                <span className="chip bg-[#FEF3C7] text-[#B45309]">
                  <StarIcon size={14} />
                  {progress.xp}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-4">{page}</main>

      {!session && (
        <TabBar
          active={tab}
          dueCount={dueCount}
          onChange={(id) => {
            stopSpeaking()
            setTab(id)
          }}
        />
      )}

      {installOpen && <InstallHint onClose={() => setInstallOpen(false)} />}
    </div>
  )
}
