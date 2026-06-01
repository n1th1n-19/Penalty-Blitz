'use client'
import { useEffect, useState } from 'react'
import { isTouchDevice } from '@/lib/game/mobile-controls'

function isPortrait() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(orientation: portrait)').matches
}

export default function LandscapeEnforcer() {
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    // Only enforce on touch devices
    if (!isTouchDevice()) return

    const update = () => setShowGate(isPortrait())
    update()

    const mql = window.matchMedia('(orientation: portrait)')
    mql.addEventListener('change', update)

    // Attempt fullscreen + orientation lock on first interaction
    const tryLock = async () => {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        await (window.screen.orientation as any).lock('landscape')
      } catch {}
    }
    document.addEventListener('click',      tryLock, { once: true })
    document.addEventListener('touchstart', tryLock, { once: true })

    return () => {
      mql.removeEventListener('change', update)
      document.removeEventListener('click',      tryLock)
      document.removeEventListener('touchstart', tryLock)
    }
  }, [])

  if (!showGate) return null

  return (
    <div className="orient-gate">
      <span className="orient-gate-icon">📱</span>
      <p className="orient-gate-title">ROTATE TO PLAY</p>
      <p className="orient-gate-sub">This game plays best in landscape</p>
    </div>
  )
}
