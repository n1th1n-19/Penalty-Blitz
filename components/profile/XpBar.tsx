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
    const timer = setTimeout(() => {
      setWidth(progress * 100)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
        <span>Level {level}</span>
        <span>{xp} / {nextThreshold} XP</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
