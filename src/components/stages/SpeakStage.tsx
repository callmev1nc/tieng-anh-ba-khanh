import { useState } from 'react'
import type { Phrase } from '../../types'
import { SpeakButton } from '../SpeakButton'
import { useRecorder } from '../../lib/record'

interface Props {
  phrases: Phrase[]
  onDone: () => void
}

/** Listen-and-repeat practice with optional own-voice recording. */
export function SpeakStage({ phrases, onDone }: Props) {
  const [i, setI] = useState(0)
  const rec = useRecorder()
  const p = phrases[i]
  const isLast = i + 1 >= phrases.length

  const advance = () => {
    rec.reset()
    if (isLast) {
      onDone()
      return
    }
    setI(i + 1)
  }

  const playRecording = () => {
    if (!rec.url) return
    const audio = new Audio(rec.url)
    void audio.play()
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-inksoft">
        <span>
          Luyện nói {i + 1} / {phrases.length}
        </span>
        <span>📣 Đọc theo mẫu</span>
      </div>

      <div className="card p-5">
        {p.when && <span className="chip">💡 {p.when}</span>}
        <p className="mt-3 font-display text-3xl font-extrabold leading-snug">
          {p.en}
        </p>
        {p.phon && <p className="mt-1 text-base font-semibold text-inksoft">{p.phon}</p>}
        <p className="mt-2 text-lg text-inksoft">{p.vi}</p>
        <p className="mt-3 text-sm font-semibold text-primary">
          Nghe kỹ rồi đọc to theo mẫu 👇
        </p>
      </div>

      <div className="mt-3 flex gap-3">
        <SpeakButton text={p.en} className="btn btn-ghost flex-1">
          🔊 Nghe
        </SpeakButton>
        <SpeakButton text={p.en} rate={0.6} className="btn btn-ghost flex-1">
          🐢 Nghe chậm
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
          className={`btn btn-big w-full ${
            rec.recording ? 'bg-flag text-white' : 'btn-primary'
          }`}
          onClick={() => (rec.recording ? rec.stop() : void rec.start())}
        >
          {rec.recording ? '⏹ Dừng thu âm' : '🎤 Bấm để nói theo mẫu'}
        </button>
        <p className="mt-2 text-center text-xs text-inksoft">
          Bấm một lần để bắt đầu, bấm nữa để dừng. Không bật mic được cũng không sao —
          cứ đọc thành tiếng.
        </p>
      </div>

      <button type="button" className="btn btn-primary btn-big mt-4 w-full" onClick={advance}>
        {isLast ? 'Xong luyện nói ✓' : 'Tiếp câu →'}
      </button>
    </div>
  )
}
