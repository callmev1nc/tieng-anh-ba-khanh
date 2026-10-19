import { useState } from 'react'
import type { VoicePref } from '../types'
import { setVoicePref, stopSpeaking, ttsAvailable } from '../lib/speech'
import { SpeakButton } from './SpeakButton'

const KEY = 'tk-voice-v1'

const OPTIONS: { id: VoicePref; label: string; hint: string }[] = [
  { id: 'auto', label: 'Tự động', hint: 'Máy tự chọn giọng nữ Anh-Anh nếu có' },
  { id: 'gb-f', label: '👩 🇬🇧 Anh-Anh nữ', hint: 'Serena/Kate' },
  { id: 'gb-m', label: '👨 🇬🇧 Anh-Anh nam', hint: 'Daniel' },
  { id: 'us-f', label: '👩 🇺🇸 Anh-Mỹ nữ', hint: 'Samantha/Zira' },
  { id: 'us-m', label: '👨 🇺🇸 Anh-Mỹ nam', hint: 'Alex/David' },
]

function loadPref(): VoicePref {
  try {
    const raw = localStorage.getItem(KEY) as VoicePref | null
    if (raw && OPTIONS.some((o) => o.id === raw)) return raw
  } catch {
    // private mode
  }
  return 'auto'
}

/** Choose how the app speaks English: accent + gender. Saved on the device. */
export function VoicePicker() {
  const [pref, setPref] = useState<VoicePref>(loadPref)

  const choose = (id: VoicePref) => {
    setPref(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {
      // ignore
    }
    setVoicePref(id)
    stopSpeaking()
  }

  const active = OPTIONS.find((o) => o.id === pref)

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold leading-tight">📣 Giọng đọc</p>
          <p className="text-sm text-inksoft">{active?.hint}</p>
        </div>
        <SpeakButton text="Can I help you today?" className="btn btn-ghost min-h-[46px] shrink-0 px-4 py-2 text-sm">
          Nghe thử
        </SpeakButton>
      </div>
      {ttsAvailable ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => choose(o.id)}
              className={`chip ${
                pref === o.id
                  ? 'border-2 border-primary bg-primary text-white'
                  : 'border border-mist bg-white text-ink'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-flag">
          Máy này không hỗ trợ đọc tiếng Anh bằng giọng máy.
        </p>
      )}
    </section>
  )
}
