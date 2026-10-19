import { useCallback, useEffect, useRef, useState } from 'react'

export interface Recorder {
  supported: boolean
  recording: boolean
  url: string | null
  error: string | null
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

/** Hold-to-record your own voice so you can compare with the model. */
export function useRecorder(): Recorder {
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (!supported) {
      setError('Trình duyệt này không thu âm được — hãy đọc to theo mẫu thôi nhé.')
      return
    }
    try {
      setError(null)
      if (url) {
        URL.revokeObjectURL(url)
        setUrl(null)
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        setUrl(URL.createObjectURL(blob))
        cleanupStream()
      }
      rec.start()
      recRef.current = rec
      setRecording(true)
    } catch {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
      setError(
        isIOS
          ? 'Không mở được mic. Vào Cài đặt > Safari > Mic rồi thử lại.'
          : 'Không mở được mic. Bấm biểu tượng 🔒 hoặc 🚫 bên trái thanh địa chỉ, cho phép Mic cho trang này rồi tải lại trang.',
      )
      setRecording(false)
    }
  }, [supported, url, cleanupStream])

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== 'inactive') {
      recRef.current.stop()
    }
    recRef.current = null
    setRecording(false)
  }, [])

  const reset = useCallback(() => {
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    setError(null)
  }, [url])

  useEffect(() => {
    return () => {
      recRef.current = null
      cleanupStream()
      if (url) URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { supported, recording, url, error, start, stop, reset }
}
