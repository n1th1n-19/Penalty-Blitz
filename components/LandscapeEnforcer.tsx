'use client'
import { useEffect } from 'react'

export default function LandscapeEnforcer() {
  useEffect(() => {
    const tryLock = async () => {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        await window.screen.orientation.lock('landscape')
      } catch {}
    }

    document.addEventListener('click', tryLock, { once: true })
    document.addEventListener('touchstart', tryLock, { once: true })

    return () => {
      document.removeEventListener('click', tryLock)
      document.removeEventListener('touchstart', tryLock)
    }
  }, [])

  return null
}
