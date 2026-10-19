import { useEffect, useRef, useState, type ReactNode } from 'react'
import { speak, stopSpeaking, ttsAvailable } from '../lib/speech'

interface Props {
  text: string
  /** 0.85 = normal, 0.6 = slow for beginners */
  rate?: number
  className?: string
  children?: ReactNode
  ariaLabel?: string
}

/** Big tappable "hear it" button with playing state. */
export function SpeakButton({
  text,
  rate = 0.85,
  className = 'btn btn-ghost',
  children,
  ariaLabel,
}: Props) {
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handle = () => {
    if (!ttsAvailable) return
    if (playing) {
      stopSpeaking()
      setPlaying(false)
      return
    }
    // Safety net: some iOS versions never fire onend.
    const ms = text.length * 140 + 3500
    const started = speak(text, rate, {
      onStart: () => setPlaying(true),
      onEnd: () => {
        setPlaying(false)
        if (timerRef.current) window.clearTimeout(timerRef.current)
      },
    })
    if (started) {
      setPlaying(true)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setPlaying(false), ms)
    }
  }

  return (
    <button
      type="button"
      className={`${className}${playing ? ' bg-primary text-white border-primary' : ''}`}
      onClick={handle}
      aria-label={ariaLabel ?? `Nghe: ${text}`}
    >
      {children ?? (playing ? '⏹ Đang nghe…' : '🔊 Nghe')}
    </button>
  )
}
