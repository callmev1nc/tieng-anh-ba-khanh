import { useEffect, useRef, useState, type ReactNode } from 'react'
import { speak, speakSlow, stopSpeaking, ttsAvailable } from '../lib/speech'
import { buzz } from '../lib/sfx'
import { SpeakerIcon, TurtleIcon } from './icons'

interface Props {
  text: string
  /** 0.85 = normal, 0.6 or lower = guaranteed-slow playback */
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
  const slow = rate < 0.7

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
    buzz(12)
    // Safety net: some iOS versions never fire onend (slower text = longer window).
    const ms = slow ? text.length * 420 + 5200 : text.length * 140 + 3500
    const started = slow ? speakSlow(text, {
      onStart: () => setPlaying(true),
      onEnd: () => {
        setPlaying(false)
        if (timerRef.current) window.clearTimeout(timerRef.current)
      },
    }) : speak(text, rate, {
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
      className={`${className}${playing ? ' btn-playing' : ''}`}
      onClick={handle}
      aria-label={ariaLabel ?? `Nghe: ${text}`}
      aria-pressed={playing}
    >
      {children ?? (playing ? '⌁ Đang nghe…' : (
        <>
          {slow ? <TurtleIcon size={19} /> : <SpeakerIcon size={19} />} {slow ? 'Chậm' : 'Nghe'}
        </>
      ))}
    </button>
  )
}
