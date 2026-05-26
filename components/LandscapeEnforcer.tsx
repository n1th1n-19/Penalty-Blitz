'use client'
import { useEffect, useState } from 'react'

export default function LandscapeEnforcer() {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const tryLock = async () => {
      try { await window.screen.orientation.lock('landscape') }
      catch { /* iOS Safari, desktop — ignore */ }
    }
    tryLock()

    const mq = window.matchMedia('(orientation: portrait) and (max-width: 1024px)')
    setIsPortrait(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [])

  if (!isPortrait) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#040d06',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.7 }}>
        <rect x="16" y="4" width="24" height="40" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
        <path d="M10 28 A18 18 0 0 1 28 10" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <polyline points="24,6 28,10 24,14" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11, letterSpacing: '0.25em',
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase', margin: 0,
      }}>
        ROTATE TO PLAY
      </p>
    </div>
  )
}
