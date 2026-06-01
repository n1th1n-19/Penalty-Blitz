'use client'
import { useEffect, useState } from 'react'
import { xpForNextLevel } from '@/lib/xp'

interface Props { xp: number; level: number }

export default function XpBar({ xp, level }: Props) {
  const next  = xpForNextLevel(level)
  const prev  = level <= 1 ? 0 : xpForNextLevel(level - 1)
  const denom = next - prev
  const ratio = denom > 0 ? Math.max(0, Math.min(1, (xp - prev) / denom)) : 0

  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(ratio * 100), 120); return () => clearTimeout(t) }, [ratio])

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 6,
      }}>
        <span>LV.{level}</span>
        <span>{xp.toLocaleString()} / {next.toLocaleString()} XP</span>
      </div>
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 99, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
          borderRadius: 99,
          transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 0 10px rgba(34,197,94,0.35)',
        }} />
      </div>
    </div>
  )
}
