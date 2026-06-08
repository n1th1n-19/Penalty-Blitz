'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CharacterPose, POSES } from '@/lib/game/CharacterRenderer'
import type { Kit } from '@/lib/game/types'

export function CharacterCanvas({ kit, size = 200 }: { kit: Kit; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tickRef   = useRef(0)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // kits.ts omits stripeColor; fall back to secondary so hoops/sash render
    const enrichedKit: Kit = { ...kit, stripeColor: kit.stripeColor ?? kit.secondary }

    const dpr    = window.devicePixelRatio || 1
    // character is ~88px tall at pose.scale=1; scale to fill ~85% of displayed height
    const scale  = (size * 0.85) / 88
    const cssW   = Math.round(size * 0.9)
    const cssH   = size

    canvas.width  = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width  = `${cssW}px`
    canvas.style.height = `${cssH}px`

    // coordinates in draw-units (before ctx scale is applied)
    const cx      = (cssW / 2) / scale
    const groundY = (cssH - cssH * 0.06) / scale

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.save()
      ctx!.scale(dpr * scale, dpr * scale)

      const t = tickRef.current
      const pose: CharacterPose = {
        ...POSES.idle(),
        headY:         Math.sin(t * 0.04) * 1.5,
        torsoY:        Math.sin(t * 0.05) * 2,
        leftArmAngle:  20 + Math.sin(t * 0.07) * 8,
        rightArmAngle: -20 - Math.sin(t * 0.07) * 8,
        offsetY:       Math.abs(Math.sin(t * 0.05)) * -3,
      }

      drawCharacter(ctx!, cx, groundY, enrichedKit, pose, false, false, false)
      ctx!.restore()

      tickRef.current++
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [kit, size])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
