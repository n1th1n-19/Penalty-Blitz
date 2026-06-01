'use client'

import { useState, useEffect } from 'react'
import { xpForNextLevel } from '@/lib/xp'

interface XpBarProps {
  xp: number
  level: number
}

export default function XpBar({ xp, level }: XpBarProps) {
  const nextThreshold = xpForNextLevel(level)
  const prevThreshold = level <= 1 ? 0 : xpForNextLevel(level - 1)
  const denom = nextThreshold - prevThreshold
  const progress = denom > 0 ? Math.max(0, Math.min(1, (xp - prevThreshold) / denom)) : 0

  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(progress * 100), 120)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: 'var(--text-muted)',
        marginBottom: 6,
      }}>
        <span>LV.{level}</span>
        <span>{xp} / {nextThreshold} XP</span>
      </div>
      <div style={{
        height: 6,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 99,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: 'linear-gradient(90deg, #15803d, #4ade80)',
            borderRadius: 99,
            transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
            boxShadow: '0 0 8px rgba(74,222,128,0.4)',
          }}
        />
      </div>
    </div>
  )
}
