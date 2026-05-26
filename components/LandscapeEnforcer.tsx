'use client'
import { useEffect } from 'react'

export default function LandscapeEnforcer() {
  useEffect(() => {
    window.screen.orientation.lock('landscape').catch(() => {})
  }, [])

  return null
}
