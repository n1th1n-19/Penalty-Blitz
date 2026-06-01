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

export default function ResultScreen({ playerScore, cpuScore: totalRounds, playerKit, xpResult, onRestart, onMainMenu }: Props) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t) }, [])

  const ratio = playerScore / totalRounds
  const isPerfect = ratio === 1

  const rating =
    isPerfect ? 'PERFECT' :
    ratio >= 0.8 ? 'EXCELLENT' :
    ratio >= 0.6 ? 'GOOD' :
    ratio >= 0.4 ? 'DECENT' : 'ROUGH DAY'

  const ratingColor =
    isPerfect ? 'var(--gold)' :
    ratio >= 0.8 ? 'var(--green-accent)' :
    ratio >= 0.6 ? '#60a5fa' :
    ratio >= 0.4 ? '#f59e0b' : '#f87171'

  const comment =
    isPerfect ? 'Flawless. The keeper never stood a chance.' :
    ratio >= 0.8 ? 'Excellent shooting. Mix it up and they never read you.' :
    ratio >= 0.6 ? 'Solid technique. A couple slipped away.' :
    ratio >= 0.4 ? 'Mixed bag. Aim for the corners next time.' :
    'The keeper read every shot. Change your pattern.'

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      backgroundImage: 'var(--stadium-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px,4vw,40px) 20px max(32px, calc(env(safe-area-inset-bottom) + 24px))',
      gap: 0,
      overflowY: 'auto',
    }}>

      {/* ── Scoreboard card ──────────────────────────────────── */}
      <div className="card slide-up" style={{
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {/* Green header band */}
        <div style={{
          background: isPerfect
            ? 'linear-gradient(90deg, #7c3200, #92400e, #7c3200)'
            : 'linear-gradient(90deg, #0f3320, #14532d, #0f3320)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span className="label-mono" style={{ color: isPerfect ? 'var(--gold)' : 'var(--green-accent)', letterSpacing: '0.4em' }}>
            FULL TIME
          </span>
          <span className="label-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
          </span>
        </div>

        <div style={{ padding: '24px 20px 20px' }}>
          {/* Rating */}
          {visible && (
            <div className="pop-in" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px,10vw,60px)',
              color: ratingColor,
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: 8,
              textShadow: `0 0 32px ${ratingColor}44`,
            }}>
              {rating}
            </div>
          )}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 20 }}>
            {comment}
          </p>

          {/* Score row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: 20,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
              <p className="label-mono" style={{ marginBottom: 4 }}>{playerKit.shortName}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: ratingColor, lineHeight: 1 }}>
                {playerScore}
              </p>
            </div>
            <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
              <p className="label-mono" style={{ marginBottom: 4 }}>SHOTS</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--text-muted)', lineHeight: 1 }}>
                {totalRounds}
              </p>
            </div>
          </div>

          {/* Shot dots */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`shot-dot${i < playerScore ? ' scored' : ' missed'}`}
                style={{ width: 16, height: 16 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── XP panel ─────────────────────────────────────────── */}
      {xpResult && (
        <div className="card slide-up-d1" style={{
          width: '100%',
          maxWidth: 480,
          padding: '18px 20px',
          marginBottom: 14,
          borderLeft: isPerfect ? '3px solid var(--gold)' : '3px solid var(--green-accent)',
        }}>
          <p className="label-mono" style={{ color: 'var(--green-accent)', marginBottom: 14 }}>XP EARNED</p>

          {[
            { label: `${playerScore} goals × ${xpResult.multiplier}`, value: `+${xpResult.goalXp}` },
            ...(xpResult.bonusXp > 0 ? [{ label: 'Perfect game bonus', value: `+${xpResult.bonusXp}`, gold: true }] : []),
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
