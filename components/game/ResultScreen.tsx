'use client'
import { useEffect, useState } from 'react'
import { Kit } from '../../lib/game/types'
import XpBar from '@/components/profile/XpBar'

interface XpResultData {
  goalXp: number
  bonusXp: number
  totalXp: number
  multiplier: number
  xpEarned: number
  newTotalXp: number
  newLevel: number
  leveledUp: boolean
}

interface Props {
  playerScore: number
  cpuScore: number
  playerKit: Kit
  xpResult?: XpResultData | null
  onRestart: () => void
  onMainMenu: () => void
}

export default function ResultScreen({ playerScore, cpuScore: totalShots, playerKit, xpResult, onRestart, onMainMenu }: Props) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  const rating =
    playerScore >= 10 ? 'LEGENDARY' :
    playerScore >= 6  ? 'EXCELLENT' :
    playerScore >= 3  ? 'GOOD' :
    playerScore >= 1  ? 'DECENT' : 'ROUGH DAY'

  const ratingColor =
    playerScore >= 10 ? 'var(--gold)' :
    playerScore >= 6  ? 'var(--green-accent)' :
    playerScore >= 3  ? '#60a5fa' :
    playerScore >= 1  ? '#f59e0b' : '#f87171'

  const comment =
    playerScore >= 10 ? 'Unstoppable. The keeper had no answer.' :
    playerScore >= 6  ? 'Excellent shooting. Mix it up and they never read you.' :
    playerScore >= 3  ? 'Solid technique. A few more and you\'re elite.' :
    playerScore >= 1  ? 'Mixed bag. Aim for the corners next time.' :
    'The keeper read every shot. Change your pattern.'

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-base)',
      backgroundImage: 'var(--stadium-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(10px,2vw,40px) 20px max(16px, calc(env(safe-area-inset-bottom) + 12px))',
      gap: 0,
      overflowY: 'auto',
    }}>

      {/* ── Scoreboard card ──────────────────────────────────── */}
      <div className="card slide-up" style={{
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        marginBottom: 'clamp(8px,1.5vh,14px)',
      }}>
        {/* Green header band */}
        <div style={{
          background: playerScore >= 10
            ? 'linear-gradient(90deg, #7c3200, #92400e, #7c3200)'
            : 'linear-gradient(90deg, #0f3320, #14532d, #0f3320)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span className="label-mono" style={{ color: playerScore >= 10 ? 'var(--gold)' : 'var(--green-accent)', letterSpacing: '0.4em' }}>
            STREAK OVER
          </span>
          <span className="label-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
          </span>
        </div>

        <div style={{ padding: 'clamp(12px,2vh,24px) 20px clamp(10px,2vh,20px)' }}>
          {/* Rating */}
          {visible && (
            <div className="pop-in" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px,9vw,54px)',
              color: ratingColor,
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: 'clamp(4px,1vh,8px)',
              textShadow: `0 0 32px ${ratingColor}44`,
            }}>
              {rating}
            </div>
          )}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 'clamp(10px,2vh,20px)' }}>
            {comment}
          </p>

          {/* Score row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: 'clamp(10px,2vh,20px)',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <div style={{ flex: 1, padding: 'clamp(8px,1.5vh,14px) 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
              <p className="label-mono" style={{ marginBottom: 4 }}>STREAK</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vh,48px)', color: ratingColor, lineHeight: 1 }}>
                {playerScore}
              </p>
            </div>
            <div style={{ flex: 1, padding: 'clamp(8px,1.5vh,14px) 16px', textAlign: 'center' }}>
              <p className="label-mono" style={{ marginBottom: 4 }}>SHOTS</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vh,48px)', color: 'var(--text-muted)', lineHeight: 1 }}>
                {totalShots}
              </p>
            </div>
          </div>

          {/* Shot dots — cap at 10 visible */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(totalShots, 10) }).map((_, i) => (
              <div
                key={i}
                className={`shot-dot${i < playerScore ? ' scored' : ' missed'}`}
                style={{ width: 16, height: 16 }}
              />
            ))}
            {totalShots > 10 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                +{totalShots - 10}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── XP panel ─────────────────────────────────────────── */}
      {xpResult && (
        <div className="card slide-up-d1" style={{
          width: '100%',
          maxWidth: 480,
          padding: 'clamp(10px,2vh,18px) 20px',
          marginBottom: 'clamp(8px,1.5vh,14px)',
          borderLeft: playerScore >= 10 ? '3px solid var(--gold)' : '3px solid var(--green-accent)',
        }}>
          <p className="label-mono" style={{ color: 'var(--green-accent)', marginBottom: 14 }}>XP EARNED</p>

          {[
            { label: `${playerScore} goals × ${xpResult.multiplier}`, value: `+${xpResult.goalXp}` },
            ...(xpResult.bonusXp > 0 ? [{ label: 'Streak milestone bonus', value: `+${xpResult.bonusXp}`, gold: true }] : []),
          ].map(({ label, value, gold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: gold ? 'var(--gold)' : 'var(--text-muted)' }}>
                {label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: gold ? 'var(--gold)' : 'var(--text-secondary)' }}>
                {value} XP
              </span>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4,
          }}>
            <span className="label-mono">Total</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              color: 'var(--green-accent)',
              textShadow: '0 0 16px rgba(34,197,94,0.3)',
            }}>
              +{xpResult.totalXp} XP
            </span>
          </div>

          {xpResult.leveledUp && (
            <div className="level-up-anim" style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8,
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              color: 'var(--gold)',
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}>
              LEVEL {xpResult.newLevel} REACHED
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <XpBar xp={xpResult.newTotalXp} level={xpResult.newLevel} />
          </div>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="slide-up-d2" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onRestart} className="btn-primary">Play Again</button>
        <button onClick={onMainMenu} className="btn-ghost">Main Menu</button>
      </div>
    </div>
  )
}
