import { useState } from 'react'
import { SpeakButton } from '../SpeakButton'
import { useRecorder } from '../../lib/record'

interface Props {
  /** Prompt in Vietnamese — English must come from the head, not from the screen. */
  vi: string
  en: string
  phon?: string
  when?: string
  /** Short header, e.g. "Tự nói" */
  label?: string
  onDone: (correct: boolean) => void
}

/** Say it yourself first; only then reveal the model sentence and self-grade. */
export function SelfSpeakStage({ vi, en, phon, when, label = 'Tự nói', onDone }: Props) {
  const [revealed, setRevealed] = useState(false)
  const rec = useRecorder()

  const playRecording = () => {
    if (!rec.url) return
    const audio = new Audio(rec.url)
    void audio.play()
  }

  const grade = (ok: boolean) => {
    rec.reset()
    onDone(ok)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>{label}</span>
        <span>🗣 Nói trước, xem sau</span>
      </div>

      <div className="card p-5">
        {when && <span className="chip">💡 {when}</span>}
        <p className="mt-3 text-sm font-bold text-inksoft">Nói câu này bằng tiếng Anh:</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-primary leading-snug">{vi}</p>
        {revealed ? (
          <>
            <p className="mt-4 font-display text-3xl font-extrabold leading-snug">{en}</p>
            {phon && <p className="mt-1 text-base font-semibold text-inksoft">{phon}</p>}
          </>
        ) : (
          <p className="mt-4 text-sm font-semibold text-inksoft">
            Lần đầu nói chưa khớp cũng bình thường — gợi ý phiên âm sẽ hiện sau khi anh
            thử.
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => setRevealed(true)}
        >
          {revealed ? '🙈 Đã mở' : '🔊 Thử nói rồi xem đáp án'}
        </button>
      </div>

      {revealed && (
        <>
          <div className="mt-3 flex gap-3">
            <SpeakButton text={en} className="btn btn-ghost flex-1">
              🔊 Nghe mẫu
            </SpeakButton>
            <SpeakButton text={en} rate={0.6} className="btn btn-ghost flex-1">
              🐢 Chậm
            </SpeakButton>
          </div>

          <div className="card mt-4 p-4">
            {rec.error && (
              <p className="mb-3 rounded-xl bg-flagsoft p-3 text-sm font-semibold text-flag">
                {rec.error}
              </p>
            )}
            {!rec.error && rec.url && !rec.recording && (
              <button type="button" className="btn btn-ghost mb-3 w-full" onClick={playRecording}>
                ▶️ Nghe lại giọng của mình
              </button>
            )}
            <button
              type="button"
              className={`btn btn-big w-full ${rec.recording ? 'bg-flag text-white' : 'btn-ghost'}`}
              onClick={() => (rec.recording ? rec.stop() : void rec.start())}
            >
              {rec.recording ? '⏹ Dừng thu âm' : '🎤 Thu giọng mình đọc'}
            </button>
          </div>

          <p className="mt-4 text-center text-sm font-bold text-inksoft">Nghe xong, tự chấm mình:</p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="btn btn-ok flex-1"
              onClick={() => grade(true)}
              data-testid="grade-ok"
            >
              ✅ Nói được rồi
            </button>
            <button
              type="button"
              className="btn flex-1 border-2 border-flag bg-flagsoft text-flag"
              onClick={() => grade(false)}
            >
              🔁 Cần luyện thêm
            </button>
          </div>
        </>
      )}
    </div>
  )
}
