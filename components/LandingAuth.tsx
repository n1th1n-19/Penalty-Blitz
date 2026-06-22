'use client'
import { useEffect, useState } from 'react'
import MeWeEmbeddedAuth from '@/components/MeWeEmbeddedAuth'

export default function LandingAuth() {
  const [mode, setMode] = useState<'detecting' | 'embedded' | 'standalone'>('detecting')

  useEffect(() => {
    setMode(window.parent !== window ? 'embedded' : 'standalone')
  }, [])

  if (mode === 'detecting') return null

  if (mode === 'embedded') {
    return <MeWeEmbeddedAuth />
  }

  return (
    <a
      href="/api/auth/mewe/redirect"
      className="pb-btn pb-btn-primary"
      style={{ width: '100%', justifyContent: 'center' }}
    >
      Sign In with MeWe
    </a>
  )
}
