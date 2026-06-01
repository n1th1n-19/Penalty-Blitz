'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * MobileGameHUD
 *
 * A React overlay that renders on top of the Phaser canvas exclusively
 * on touch devices. It provides:
 *
 *  - AIM phase  : draggable crosshair inside a goal-zone overlay
 *  - POWER phase: full-width oscillating power bar; tap anywhere to shoot
 *  - HUD        : round/score pill top-center, settings button top-right
 *
 * Communication with GameScene happens through a lightweight ref bridge:
 *   props.sceneRef — a MutableRefObject pointing to the live GameScene instance
 *
 * The GameScene must expose:
 *   scene.phase                          — 'aim' | 'power' | 'result' | 'idle'
 *   scene.aimNormX, scene.aimNormY      — current aim 0..1 within the goal
 *   scene.powerValue                    — 0..1 oscillating value
 *   scene.roundNumber, scene.goals      — progress stats
 *   scene.setAimFromNormalized(nx, ny)  — moves aim crosshair
 *   scene.confirmAim()                  — locks aim and starts power bar
 *   scene.confirmPower()                — locks power and fires shot
 */

export type GamePhase = 'idle' | 'aim' | 'power' | 'flying' | 'result'

export interface GameSceneBridge {
  phase:      GamePhase
  aimNormX:   number
  aimNormY:   number
  powerValue: number
  roundNumber: number
  goals:      number
  totalRounds: number
  setAimFromNormalized: (nx: number, ny: number) => void
  confirmAim:   () => void
  confirmPower: () => void
}

interface Props {
  sceneRef:      React.MutableRefObject<GameSceneBridge | null>
  onOpenSettings: () => void
}

// ─── Goal zone constants (must match PitchScene ratios) ─────────────────────
const GL = 0.21875
const GR = 0.78125
const GT = 0.25
const GB = 0.53

// ─── Crosshair component ─────────────────────────────────────────────────────
function Crosshair({ x, y, dragging }: { x: number; y: number; dragging: boolean }) {
  const SIZE = 44
  return (
    <div
      style={{
        position: 'absolute',
        left:   x - SIZE / 2,
        top:    y - SIZE / 2,
        width:  SIZE,
        height: SIZE,
        pointerEvents: 'none',
        transition: dragging ? 'none' : 'left 0.08s, top 0.08s',
      }}
    >
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '2px solid rgba(74,222,128,0.8)',
        boxShadow: '0 0 12px rgba(74,222,128,0.4)',
      }} />
      {/* Cross lines */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '20%', right: '20%',
        height: 1.5,
        background: 'rgba(74,222,128,0.9)',
        transform: 'translateY(-50%)',
      }} />
      <div style={{
        position: 'absolute',
        left: '50%', top: '20%', bottom: '20%',
        width: 1.5,
        background: 'rgba(74,222,128,0.9)',
        transform: 'translateX(-50%)',
      }} />
      {/* Center dot */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 5, height: 5,
        background: '#4ade80',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 6px #4ade80',
      }} />
    </div>
  )
}

// ─── Power bar component ─────────────────────────────────────────────────────
function PowerBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  // Sweet spot: 55-80%
  const sweetLow  = 55
  const sweetHigh = 80
  const inSweet = pct >= sweetLow && pct <= sweetHigh

  return (
    <div
      id="mobile-power-bar"
      style={{
        position: 'relative',
        height: 20,
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 99,
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Sweet spot zone */}
      <div style={{
        position: 'absolute',
        left: `${sweetLow}%`,
        width: `${sweetHigh - sweetLow}%`,
        top: 0, bottom: 0,
        background: 'rgba(74,222,128,0.15)',
        borderLeft:  '1px solid rgba(74,222,128,0.5)',
        borderRight: '1px solid rgba(74,222,128,0.5)',
      }} />
      {/* Fill */}
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: inSweet
          ? 'linear-gradient(90deg, #15803d, #4ade80)'
          : pct > sweetHigh
            ? 'linear-gradient(90deg, #b91c1c, #f87171)'
            : 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
        borderRadius: 99,
        boxShadow: inSweet ? '0 0 8px rgba(74,222,128,0.5)' : 'none',
        transition: 'width 0.04s linear',
      }} />
      {/* Marker label */}
      <div style={{
        position: 'absolute',
        right: `${100 - pct}%`,
        top: 0, bottom: 0,
        width: 2,
        background: '#fff',
        borderRadius: 1,
      }} />
    </div>
  )
}

// ─── Main HUD ────────────────────────────────────────────────────────────────
export default function MobileGameHUD({ sceneRef, onOpenSettings }: Props) {
  const [phase,       setPhase]       = useState<GamePhase>('idle')
  const [aimNormX,    setAimNormX]    = useState(0.5)
  const [aimNormY,    setAimNormY]    = useState(0.5)
  const [power,       setPower]       = useState(0)
  const [round,       setRound]       = useState(1)
  const [goals,       setGoals]       = useState(0)
  const [totalRounds, setTotalRounds] = useState(5)
  const [dragging,    setDragging]    = useState(false)
  const goalZoneRef = useRef<HTMLDivElement>(null)
  const rafRef      = useRef<number>(0)

  // ── Poll GameScene state via rAF ──────────────────────────────────────────
  useEffect(() => {
    const poll = () => {
      const s = sceneRef.current
      if (s) {
        setPhase(s.phase)
        setAimNormX(s.aimNormX)
        setAimNormY(s.aimNormY)
        setPower(s.powerValue)
        setRound(s.roundNumber)
        setGoals(s.goals)
        setTotalRounds(s.totalRounds)
      }
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(rafRef.current)
  }, [sceneRef])

  // ── Goal zone pixel coords ────────────────────────────────────────────────
  const getGoalZoneRect = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      left:   GL * vw,
      right:  GR * vw,
      top:    GT * vh,
      bottom: GB * vh,
      width:  (GR - GL) * vw,
      height: (GB - GT) * vh,
    }
  }, [])

  // ── Touch handlers for crosshair drag ────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (phase !== 'aim') return
    setDragging(true)
    moveCrosshair(e.touches[0].clientX, e.touches[0].clientY)
  }, [phase])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (phase !== 'aim' || !dragging) return
    e.preventDefault()
    moveCrosshair(e.touches[0].clientX, e.touches[0].clientY)
  }, [phase, dragging])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    setDragging(false)
    if (phase === 'aim') {
      // Brief pause then confirm
      setTimeout(() => sceneRef.current?.confirmAim(), 80)
    } else if (phase === 'power') {
      sceneRef.current?.confirmPower()
    }
  }, [phase, sceneRef])

  const moveCrosshair = (cx: number, cy: number) => {
    const z = getGoalZoneRect()
    const nx = Math.max(0, Math.min(1, (cx - z.left)  / z.width))
    const ny = Math.max(0, Math.min(1, (cy - z.top)   / z.height))
    setAimNormX(nx)
    setAimNormY(ny)
    sceneRef.current?.setAimFromNormalized(nx, ny)
  }

  // Crosshair pixel position within viewport
  const gz = typeof window !== 'undefined' ? getGoalZoneRect() : { left: 0, top: 0, width: 0, height: 0 }
  const crossX = gz.left + aimNormX * gz.width
  const crossY = gz.top  + aimNormY * gz.height

  // ── Power phase: tap anywhere fires shot ─────────────────────────────────
  const handleGlobalTap = useCallback(() => {
    if (phase === 'power') sceneRef.current?.confirmPower()
  }, [phase, sceneRef])

  // Dots for goals
  const goalDots = Array.from({ length: totalRounds }, (_, i) => i < goals)

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'idle' || phase === 'flying') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        pointerEvents: phase === 'power' ? 'all' : 'none',
      }}
      onTouchStart={phase === 'power' ? handleGlobalTap as any : undefined}
    >
      {/* ── Top HUD bar ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 'max(12px, env(safe-area-inset-top))',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        pointerEvents: 'all',
        zIndex: 10,
      }}>
        {/* Score dots */}
        <div className="mobile-hud-pill" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {goalDots.map((scored, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: scored ? '#4ade80' : 'rgba(255,255,255,0.2)',
              boxShadow: scored ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
            }} />
          ))}
        </div>

        {/* Round counter */}
        <div className="mobile-hud-pill" id="score-display">
          {goals} / {totalRounds} &nbsp;·&nbsp; RD {round}
        </div>

        {/* Settings */}
        <button className="mobile-hud-btn" onClick={onOpenSettings}>⚙️</button>
      </div>

      {/* ── AIM phase overlays ───────────────────────────────────────────── */}
      {phase === 'aim' && (
        <>
          {/* Goal zone touch area */}
          <div
            id="mobile-aim-zone"
            ref={goalZoneRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              position: 'absolute',
              left:   `${GL * 100}%`,
              top:    `${GT * 100}%`,
              width:  `${(GR - GL) * 100}%`,
              height: `${(GB - GT) * 100}%`,
              background: 'rgba(74,222,128,0.06)',
              border: '1px dashed rgba(74,222,128,0.35)',
              borderRadius: 4,
              pointerEvents: 'all',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          />

          {/* Crosshair (rendered in viewport coords) */}
          <Crosshair x={crossX} y={crossY} dragging={dragging} />

          {/* Confirm pill */}
          <div
            className="confirm-pulse"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 'calc(52% - 10px)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            <div className="mobile-hud-pill" style={{ fontSize: 11, letterSpacing: '0.3em' }}>
              TAP TO CONFIRM AIM
            </div>
          </div>
        </>
      )}

      {/* ── POWER phase overlays ─────────────────────────────────────────── */}
      {phase === 'power' && (
        <>
          {/* Tap anywhere hint */}
          <div style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}>
            <div
              className="confirm-pulse mobile-hud-pill"
              style={{ fontSize: 11, letterSpacing: '0.3em' }}
            >
              TAP ANYWHERE TO SHOOT
            </div>
          </div>

          {/* Power bar */}
          <div style={{
            position: 'absolute',
            bottom: 'max(24px, env(safe-area-inset-bottom))',
            left: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'none',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.5)',
            }}>
              <span>POWER</span>
              <span>AIM FOR GREEN ZONE</span>
            </div>
            <PowerBar value={power} />
          </div>
        </>
      )}
    </div>
  )
}
