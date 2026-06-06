'use client'
import { useSystemStore } from '@/store/systemStore'
import CharacterCanvas from '@/components/main/CharacterCanvas'
import XpBar from '@/components/profile/XpBar'
import { signOut } from 'next-auth/react'

export default function MainScreen() {
  const { user, navigate } = useSystemStore()

  if (!user) return null

  const { username, level, xp, kit } = user

  return (
    <div className="hub-root">
      {/* ── Left — Character panel ────────────────────────────────── */}
      <div className="hub-left slide-up">
        <p className="label-mono" style={{ color: 'var(--green-accent)', letterSpacing: '0.4em', marginBottom: 8 }}>
          PENALTY BLITZ
        </p>

        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          <div style={{
            position: 'absolute',
            bottom: 20,
            width: 140,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }} />
          <CharacterCanvas kit={kit} size={180} />
        </div>

        <button
          onClick={() => navigate({ screen: 'kit-select' })}
          className="btn-ghost"
          style={{ maxWidth: 200, fontSize: 10 }}
        >
          Change Kit
        </button>
      </div>

      {/* ── Right — Nav panel ──────────────────────────────────────── */}
      <div className="hub-right">
        {/* User card */}
        <div className="card slide-up" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p className="label-mono" style={{ marginBottom: 4 }}>Player</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 5vw, 30px)',
                color: '#fff',
                letterSpacing: '0.04em',
              }}>
                {username}
              </h2>
            </div>
            <div style={{
              padding: '6px 14px',
              background: 'rgba(34,197,94,0.10)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 20,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--green-accent)',
              letterSpacing: '0.2em',
            }}>
              LV.{level}
            </div>
          </div>
          <XpBar xp={xp} level={level} />
        </div>

        {/* Play card */}
        <button
          onClick={() => navigate({ screen: 'game' })}
          className="hub-play-card slide-up-d1"
          style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}
        >
          <div>
            <p className="label-mono" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
              Ready to compete?
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 6vw, 38px)',
              color: '#fff',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}>
              PLAY NOW
            </p>
          </div>
          <div className="hub-play-arrow">&#9658;</div>
        </button>

        {/* Nav grid */}
        <div className="hub-nav-grid slide-up-d2">
          <button
            onClick={() => navigate({ screen: 'leaderboard' })}
            className="hub-nav-item"
            style={{ border: 'none', textAlign: 'left' }}
          >
            <div className="hub-nav-icon">◈</div>
            <span className="hub-nav-label">Leaderboard</span>
          </button>

          <button
            onClick={() => navigate({ screen: 'kit-select' })}
            className="hub-nav-item"
            style={{ border: 'none', textAlign: 'left' }}
          >
            <div className="hub-nav-icon">◉</div>
            <span className="hub-nav-label">Customize</span>
          </button>

          <button
            onClick={() => navigate({ screen: 'profile', username })}
            className="hub-nav-item"
            style={{ border: 'none', textAlign: 'left' }}
          >
            <div className="hub-nav-icon">◎</div>
            <span className="hub-nav-label">My Profile</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="hub-nav-item"
            style={{ border: 'none', textAlign: 'left' }}
          >
            <div className="hub-nav-icon">⊘</div>
            <span className="hub-nav-label">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
