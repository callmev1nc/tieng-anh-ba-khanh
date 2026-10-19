/* Canvas confetti — one 2.5s burst in the app palette, auto-cleans itself.
 * Pure DOM/canvas, no dependency, transform-only-friendly (single animation). */

const COLORS = ['#2563eb', '#22c55e', '#ef4444', '#fbbf24', '#ffffff', '#60a5fa']

let active: HTMLCanvasElement | null = null

export function fireConfetti(): void {
  if (typeof document === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  try {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight

    if (active) active.remove()
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '90',
    } satisfies Partial<CSSStyleDeclaration>)
    document.body.appendChild(canvas)
    active = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    interface P {
      x: number
      y: number
      vx: number
      vy: number
      rot: number
      vr: number
      w: number
      h: number
      color: string
    }
    const parts: P[] = []
    // Two side cannons aimed inward — classic Duolingo celebration.
    for (const [x, y, vx, vy, n] of [
      [0, h * 0.35, 9, -14, 60],
      [w, h * 0.35, -9, -14, 60],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const spread = (Math.random() - 0.5) * 10
        parts.push({
          x,
          y,
          vx: vx + spread,
          vy: vy + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          w: 7 + Math.random() * 6,
          h: 4 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
    }

    const g = 0.55
    const start = performance.now()
    const DURATION = 2400

    const frame = (now: number): void => {
      const t = now - start
      if (!canvas.isConnected) return
      ctx!.clearRect(0, 0, w, h)
      ctx!.globalAlpha = Math.max(0, Math.min(1, (DURATION - t) / 600))
      let alive = false
      for (const p of parts) {
        p.vy += g
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        if (p.y < h - 24) alive = true
        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rot)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx!.restore()
      }
      if (t < DURATION && alive) {
        requestAnimationFrame(frame)
      } else {
        canvas.remove()
        if (active === canvas) active = null
      }
    }
    requestAnimationFrame(frame)
  } catch {
    // confetti is decoration — never blocks anything
  }
}
