'use client'
import { useEffect, useRef, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { useSession } from 'next-auth/react'
import { DIFFICULTY } from '@/lib/game/difficulty'
import { xpBreakdown } from '@/lib/xp'
import { getKit } from '@/lib/game/kits'
import type { NeonKit } from '@/components/ui/PbUi'
import Keeper, { type KeeperDive } from '@/components/game/Keeper'
import Shooter from '@/components/game/Shooter'
import ResultScreen from '@/components/game/ResultScreen'
import SettingsModal from '@/components/game/SettingsModal'

// Scene geometry (% of viewport w/h)
const GOAL = { l: 18, r: 82, t: 12, b: 50 }
const SPOT = { x: 50, y: 83 }
const DIFF = DIFFICULTY.hard

export type ShotRecord = { result: 'goal' | 'saved' | 'post'; tx: number; ty: number }
type Phase = 'aiming' | 'charging' | 'flying' | 'shotResult' | 'over'

function qBez(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, t: number) {
  const m = 1 - t
  return { x: m*m*p0x + 2*m*t*p1x + t*t*p2x, y: m*m*p0y + 2*m*t*p1y + t*t*p2y }
}

function shotCol(tx: number): 0 | 1 | 2 {
  const rel = (tx - GOAL.l) / (GOAL.r - GOAL.l)
  return rel < 0.35 ? 0 : rel < 0.65 ? 1 : 2
}

function keeperRead(col: 0 | 1 | 2): 0 | 1 | 2 {
  if (Math.random() < DIFF.aiWeight) return col
  const others = ([0, 1, 2] as const).filter(c => c !== col)
  return others[Math.floor(Math.random() * 2)]
}

function resolveShot(power: number, tx: number, ty: number, kc: 0 | 1 | 2): 'goal' | 'saved' | 'post' {
  if (tx < GOAL.l - 6 || tx > GOAL.r + 6 || ty < GOAL.t - 7 || ty > GOAL.b + 5) return 'post'
  if (power < 0.18) return 'saved'
  if (power > 0.9 && Math.random() < 0.55) return 'post'
  if (tx < GOAL.l || tx > GOAL.r || ty < GOAL.t || ty > GOAL.b) return 'post'
  const col = shotCol(tx)
  if (kc === col) {
    if (col === 1) return 'saved'
    const edge = col === 0 ? (tx - GOAL.l) : (GOAL.r - tx)
    if (edge > 8) return 'saved'
  }
  return 'goal'
}

export default function GameScreen() {
  const { user, back, updateUser } = useSystemStore()
  const { data: session } = useSession()
  const kit = getKit(user?.kit
    ? (typeof user.kit === 'string' ? user.kit : (user.kit as any).id)
    : 'lime')

  // Scene + ball DOM refs (no re-render during flight)
  const sceneRef = useRef<HTMLDivElement>(null)
  const ballRef  = useRef<HTMLDivElement>(null)

  // rAF + mutable game state refs
  const powerRafRef    = useRef<number>()
  const chargeStartRef = useRef(0)
  const powerRef       = useRef(0)
  const streakRef      = useRef(0)
  const shotsRef       = useRef(0)
  const phaseRef       = useRef<Phase>('aiming')
  const targetRef      = useRef({ x: 50, y: (GOAL.t + GOAL.b) / 2 })

  // React display state
  const [phase, _setPhase]         = useState<Phase>('aiming')
  const [streak, _setStreak]       = useState(0)
  const [shots, _setShotsState]    = useState(0)
  const [target, _setTarget]       = useState({ x: 50, y: (GOAL.t + GOAL.b) / 2 })
  const [displayPower, setDisplayPower] = useState(0)
  const [keeperDive, setKeeperDive]     = useState<KeeperDive>(null)
  const [kicking, setKicking]           = useState(false)
  const [lastResult, setLastResult]     = useState<'goal' | 'saved' | 'post' | null>(null)
  const [shotHistory, setShotHistory]   = useState<ShotRecord[]>([])
  const [xpData, setXpData]             = useState<any>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Sync helpers (update ref + state together)
  const setPhase  = (p: Phase) => { phaseRef.current = p; _setPhase(p) }
  const setStreak = (v: number) => { streakRef.current = v; _setStreak(v) }
  const setShots  = (v: number) => { shotsRef.current = v; _setShotsState(v) }
  const setTarget = (t: { x: number; y: number }) => { targetRef.current = t; _setTarget(t) }

  const clampTarget = (x: number, y: number) => {
    const M = 8
    setTarget({
      x: Math.max(GOAL.l - M, Math.min(GOAL.r + M, x)),
      y: Math.max(GOAL.t - M, Math.min(GOAL.b + M, y)),
    })
  }

  // Power bar
  const startCharging = () => {
    chargeStartRef.current = performance.now()
    const period = 1800 / DIFF.powerSpeed
    const tick = (ts: number) => {
      const p = Math.abs(Math.sin(Math.PI * (ts - chargeStartRef.current) / period))
      powerRef.current = p
      setDisplayPower(p)
      powerRafRef.current = requestAnimationFrame(tick)
    }
    powerRafRef.current = requestAnimationFrame(tick)
  }

  const stopCharging = (): number => {
    if (powerRafRef.current) cancelAnimationFrame(powerRafRef.current)
    setDisplayPower(0)
    return powerRef.current
  }

  // Ball flight (DOM-direct, no React state per frame)
  const flyBall = (tx: number, ty: number, onDone: () => void) => {
    const ctrl = { x: (SPOT.x + tx) / 2, y: Math.min(SPOT.y, ty) - 24 }
    const DURATION = 660
    const t0 = performance.now()
    const raf = (ts: number) => {
      const t = Math.min(1, (ts - t0) / DURATION)
      const pos = qBez(SPOT.x, SPOT.y, ctrl.x, ctrl.y, tx, ty, t)
      const s = Math.max(0.3, 1 - 0.72 * t)
      if (ballRef.current) {
        ballRef.current.style.left      = `${pos.x}%`
        ballRef.current.style.top       = `${pos.y}%`
        ballRef.current.style.transform = `translate(-50%,-50%) scale(${s})`
      }
      if (t < 1) requestAnimationFrame(raf)
      else onDone()
    }
    requestAnimationFrame(raf)
  }

  const resetBall = () => {
    if (ballRef.current) {
      ballRef.current.style.left      = `${SPOT.x}%`
      ballRef.current.style.top       = `${SPOT.y}%`
      ballRef.current.style.transform = 'translate(-50%,-50%) scale(1)'
    }
  }

  const handleShoot = () => {
    const power = stopCharging()
    const { x: tx, y: ty } = targetRef.current
    const col  = shotCol(tx)
    const kc   = keeperRead(col)
    const result = resolveShot(power, tx, ty, kc)
    const diveDir: KeeperDive = kc === 0 ? 'left' : kc === 2 ? 'right' : 'center'

    setPhase('flying')
    setKicking(true)
    const diveTimer = setTimeout(() => setKeeperDive(diveDir), DIFF.keeperDelay)

    flyBall(tx, ty, () => {
      setTimeout(() => {
        clearTimeout(diveTimer)
        setLastResult(result)
        setShotHistory(h => [...h, { result, tx, ty }])
        setPhase('shotResult')
        setKicking(false)
        const newShots = shotsRef.current + 1
        setShots(newShots)

        if (result === 'goal') {
          setStreak(streakRef.current + 1)
          setTimeout(() => {
            resetBall()
            setKeeperDive(null)
            setLastResult(null)
            setPhase('aiming')
          }, 1350)
        } else {
          const finalStreak = streakRef.current
          setTimeout(async () => {
            let xpResult = null
            if (session?.user?.id) {
              try {
                const res = await fetch('/api/scores', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ goalsScored: finalStreak, difficulty: 'hard' }),
                })
                if (res.ok) {
                  const api = await res.json()
                  const bd  = xpBreakdown(finalStreak, 'hard')
                  xpResult  = {
                    ...bd,
                    xpEarned:   api.xpEarned,
                    newTotalXp: api.totalXp,
                    newLevel:   api.newLevel,
                    leveledUp:  api.leveledUp,
                  }
                  updateUser({ xp: api.totalXp, level: api.newLevel })
                }
              } catch { /* offline / auth failure */ }
            }
            setXpData(xpResult)
            setPhase('over')
          }, 1400)
        }
      }, 80)
    })
  }

  const handleAct = () => {
    const p = phaseRef.current
    if (p === 'aiming') {
      setPhase('charging')
      startCharging()
    } else if (p === 'charging') {
      handleShoot()
    }
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (phaseRef.current !== 'aiming') return
    const rect = sceneRef.current?.getBoundingClientRect()
    if (!rect) return
    clampTarget(
      ((clientX - rect.left) / rect.width) * 100,
      ((clientY - rect.top) / rect.height) * 100,
    )
  }

  // Keyboard control
  useEffect(() => {
    const STEP = 1.6
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current
      if (p === 'aiming') {
        if (e.key === 'ArrowLeft')  clampTarget(targetRef.current.x - STEP, targetRef.current.y)
        if (e.key === 'ArrowRight') clampTarget(targetRef.current.x + STEP, targetRef.current.y)
        if (e.key === 'ArrowUp')    clampTarget(targetRef.current.x, targetRef.current.y - STEP)
        if (e.key === 'ArrowDown')  clampTarget(targetRef.current.x, targetRef.current.y + STEP)
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleAct() }
      } else if (p === 'charging') {
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleAct() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup power rAF
  useEffect(() => () => { if (powerRafRef.current) cancelAnimationFrame(powerRafRef.current) }, [])

  const restart = () => {
    setStreak(0)
    setShots(0)
    setShotHistory([])
    setXpData(null)
    setLastResult(null)
    setKeeperDive(null)
    setKicking(false)
    setDisplayPower(0)
    resetBall()
    setPhase('aiming')
  }

  if (phase === 'over') {
    return (
      <ResultScreen
        streak={streak}
        shots={shots}
        shotHistory={shotHistory}
        xpResult={xpData}
        kit={kit as NeonKit}
        onRestart={restart}
        onMainMenu={back}
      />
    )
  }

  const pwrLabel = displayPower < 0.25 ? 'WEAK'
    : displayPower > 0.82 ? 'TOO HOT'
    : displayPower > 0.45 ? 'SWEET SPOT'
    : 'OK'
  const pwrColor = displayPower < 0.25 ? 'var(--txt-3)'
    : displayPower > 0.82 ? 'var(--danger)'
    : displayPower > 0.45 ? 'var(--lime)'
    : 'var(--cyan)'

  return (
    <div
      ref={sceneRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 20,
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #0c2210 0%, #030303 65%)',
        cursor: 'none', userSelect: 'none', overflow: 'hidden', touchAction: 'none',
      }}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseDown={e => { if (e.button === 0) handleAct() }}
      onTouchMove={e => { const t = e.touches[0]; handleMove(t.clientX, t.clientY) }}
      onTouchEnd={e => { e.preventDefault(); handleAct() }}
    >
      {/* Floodlight halos */}
      <div aria-hidden style={{ position:'absolute', top:-80, left:-100, width:'55vw', height:'55vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(0,217,199,0.09) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', top:-80, right:-100, width:'55vw', height:'55vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* ── HUD top ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:30, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:52, color:'var(--lime)', lineHeight:1, textShadow:'0 0 26px rgba(200,255,0,0.5)' }}>{streak}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.28em', color:'var(--txt-3)' }}>STREAK</span>
        </div>
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {shotHistory.slice(-12).map((s, i) => (
            <div key={i} style={{ width:9, height:9, borderRadius:'50%', background: s.result==='goal' ? 'var(--lime)' : 'var(--danger)', boxShadow: s.result==='goal' ? '0 0 5px rgba(200,255,0,0.8)' : '0 0 5px rgba(255,77,77,0.8)' }} />
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); setSettingsOpen(true) }}
          style={{ pointerEvents:'all', background:'rgba(0,0,0,0.5)', border:'1px solid var(--bd)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'var(--txt-3)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.15em' }}
        >
          ⚙
        </button>
      </div>

      {/* Penalty arc */}
      <div aria-hidden style={{ position:'absolute', left:'50%', top:'76%', transform:'translate(-50%,-50%)', width:'22vw', height:'10vw', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'50%', pointerEvents:'none' }} />

      {/* ── Goal frame ── */}
      <div style={{ position:'absolute', left:`${GOAL.l}%`, top:`${GOAL.t}%`, width:`${GOAL.r-GOAL.l}%`, height:`${GOAL.b-GOAL.t}%`, pointerEvents:'none' }}>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize:'9% 11%', borderRadius:'2px 2px 0 0' }} />
        <div style={{ position:'absolute', left:-3, top:0, bottom:0, width:6, background:'rgba(255,255,255,0.88)', borderRadius:3 }} />
        <div style={{ position:'absolute', right:-3, top:0, bottom:0, width:6, background:'rgba(255,255,255,0.88)', borderRadius:3 }} />
        <div style={{ position:'absolute', top:-3, left:-3, right:-3, height:6, background:'rgba(255,255,255,0.88)', borderRadius:3 }} />
        <div style={{ position:'absolute', bottom:-2, left:0, right:0, height:3, background:'rgba(255,255,255,0.65)' }} />
      </div>

      {/* Keeper */}
      <div style={{ position:'absolute', left:'50%', top:`${GOAL.t + (GOAL.b - GOAL.t) * 0.52}%`, transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:5 }}>
        <Keeper size={110} dive={keeperDive} />
      </div>

      {/* Pitch surface */}
      <div aria-hidden style={{ position:'absolute', left:0, right:0, top:`${GOAL.b}%`, bottom:0, background:'linear-gradient(#0a1f09 0%, #0d2811 100%)', pointerEvents:'none' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position:'absolute', left:`${i*16.67}%`, top:0, bottom:0, width:'8.33%', background:'rgba(255,255,255,0.012)' }} />
        ))}
        {/* Penalty spot */}
        <div style={{ position:'absolute', left:`${SPOT.x}%`, top:`${((SPOT.y - GOAL.b) / (100 - GOAL.b)) * 100}%`, transform:'translate(-50%,-50%)', width:8, height:8, borderRadius:'50%', background:'rgba(255,255,255,0.5)' }} />
      </div>

      {/* Ball */}
      <div
        ref={ballRef}
        style={{
          position:'absolute', left:`${SPOT.x}%`, top:`${SPOT.y}%`,
          transform:'translate(-50%,-50%) scale(1)',
          width:28, height:28, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%, #fff 0%, #ddd 45%, #bbb 100%)',
          boxShadow:'0 2px 10px rgba(0,0,0,0.65)', pointerEvents:'none', zIndex:10,
        }}
      >
        <div style={{ position:'absolute', inset:3, borderRadius:'50%', border:'1.5px solid rgba(0,0,0,0.22)' }} />
      </div>

      {/* Reticle */}
      {(phase === 'aiming' || phase === 'charging') && (
        <div style={{ position:'absolute', left:`${target.x}%`, top:`${target.y}%`, transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:15 }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation:'pb-halo 1.6s ease-in-out infinite' }}>
            <circle cx="22" cy="22" r="16" stroke="rgba(200,255,0,0.75)" strokeWidth="1.5" fill="none" />
            <line x1="22" y1="2"  x2="22" y2="11" stroke="var(--lime)" strokeWidth="1.5" />
            <line x1="22" y1="33" x2="22" y2="42" stroke="var(--lime)" strokeWidth="1.5" />
            <line x1="2"  y1="22" x2="11" y2="22" stroke="var(--lime)" strokeWidth="1.5" />
            <line x1="33" y1="22" x2="42" y2="22" stroke="var(--lime)" strokeWidth="1.5" />
            <circle cx="22" cy="22" r="2.5" fill="var(--lime)" />
          </svg>
        </div>
      )}

      {/* Shooter */}
      <div style={{ position:'absolute', left:'50%', bottom:'-3%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:8 }}>
        <Shooter kit={kit as NeonKit} size={148} kicking={kicking} />
      </div>

      {/* Power meter */}
      {phase === 'charging' && (
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, pointerEvents:'none', zIndex:20 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.14em', color:pwrColor, textAlign:'center', whiteSpace:'nowrap' }}>{pwrLabel}</span>
          <div style={{ width:20, height:190, background:'rgba(0,0,0,0.55)', borderRadius:10, border:'1px solid var(--bd)', overflow:'hidden', position:'relative', flexShrink:0 }}>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${displayPower*100}%`, background:'linear-gradient(to top, var(--danger) 0%, var(--lime) 55%, var(--cyan) 100%)', borderRadius:'0 0 10px 10px' }} />
            <div style={{ position:'absolute', bottom:'44%', left:0, right:0, height:1, background:'rgba(200,255,0,0.35)' }} />
            <div style={{ position:'absolute', bottom:'82%', left:0, right:0, height:1, background:'rgba(255,77,77,0.35)' }} />
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--txt-3)', textAlign:'center', maxWidth:52 }}>CLICK TO SHOOT</span>
        </div>
      )}

      {/* Instruction */}
      {phase === 'aiming' && (
        <div style={{ position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.22em', color:'var(--txt-3)', pointerEvents:'none', zIndex:20, whiteSpace:'nowrap', animation:'pb-pulse 2s ease-in-out infinite' }}>
          {shots === 0 ? 'AIM · CLICK TO LOCK' : 'AIM YOUR SHOT'}
        </div>
      )}

      {/* Shot result overlay */}
      {phase === 'shotResult' && lastResult && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:40 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px,12vw,96px)',
            letterSpacing: '0.06em',
            color: lastResult === 'goal' ? 'var(--lime)' : 'var(--danger)',
            textShadow: lastResult === 'goal'
              ? '0 0 40px rgba(200,255,0,0.65), 0 0 80px rgba(200,255,0,0.3)'
              : '0 0 40px rgba(255,77,77,0.6)',
            animation: 'pb-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {lastResult === 'goal' ? 'GOAL!' : lastResult === 'saved' ? 'SAVED' : 'POST!'}
          </span>
        </div>
      )}

      {settingsOpen && (
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onReplayTutorial={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
