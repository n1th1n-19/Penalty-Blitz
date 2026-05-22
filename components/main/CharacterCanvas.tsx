'use client'
import { useEffect, useRef } from 'react'
import type { Kit } from '@/lib/game/types'

interface Props {
  kit: Kit
  size?: number
}

export default function CharacterCanvas({ kit, size = 120 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size, size)
    import('@/lib/game/CharacterRenderer').then(({ drawMiniCharacter }) => {
      drawMiniCharacter(ctx, size / 2, size * 0.88, kit)
    })
  }, [kit, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
