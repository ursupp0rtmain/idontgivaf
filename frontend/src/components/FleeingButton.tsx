import { useCallback, useEffect, useRef } from 'react'
import { recordAttempt } from '../api'
import { useStats } from '../statsContext'

interface Props {
  onEasterEgg: () => void
  disabled: boolean
}

export default function FleeingButton({ onEasterEgg, disabled }: Props) {
  const btnRef  = useRef<HTMLButtonElement>(null)
  const cooling = useRef(false)
  const { onSessionAttempt } = useStats()

  const flee = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const pw = btn.offsetWidth  + 24
    const ph = btn.offsetHeight + 24
    const x  = 24 + Math.random() * Math.max(40, window.innerWidth  - pw - 48)
    const y  = 24 + Math.random() * Math.max(40, window.innerHeight - ph - 48)
    btn.style.left = `${x}px`
    btn.style.top  = `${y}px`
    onSessionAttempt()
    recordAttempt() // throttled intern
  }, [onSessionAttempt])

  // Place the button on the first render.
  useEffect(() => {
    flee()
  }, [flee])

  // Move away when the pointer gets too close.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cooling.current || disabled) return
      const btn = btnRef.current
      if (!btn) return
      const r  = btn.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      const d  = Math.hypot(e.clientX - cx, e.clientY - cy)
      if (d < 140) {
        flee()
        cooling.current = true
        setTimeout(() => { cooling.current = false }, 40)
      }
    }

    const onTouch = (e: TouchEvent) => {
      if (disabled) return
      const t  = e.touches[0]
      const btn = btnRef.current
      if (!btn) return
      const r  = btn.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      if (Math.hypot(t.clientX - cx, t.clientY - cy) < 70) flee()
    }

    const onResize = () => flee()

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
    }
  }, [flee, disabled])

  return (
    <button
      ref={btnRef}
      className="flee-btn"
      onClick={disabled ? undefined : onEasterEgg}
      aria-label="Give a f*ck"
    >
      give a f*ck
    </button>
  )
}
