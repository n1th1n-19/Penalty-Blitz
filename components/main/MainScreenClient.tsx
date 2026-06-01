'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterCanvas from './CharacterCanvas'
import KitSelectModal from './KitSelectModal'
import type { Kit } from '@/lib/game/types'
import XpBar from '@/components/profile/XpBar'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Props {
  username: string
  level: number
  xp: number
  initialKit: Kit
}

const NAV_ITEMS = [
  { href: '/leaderboard', icon: '◈', label: 'Leaderboard' },
  { href: '', icon: '◉', label: 'Customize', action: 'kit' as const },
  { href: '', icon: '◎', label: 'My Profile', action: 'profile' as const },
  { href: '', icon: '⊘', label: 'Sign Out', action: 'signout' as const },
]

export default function MainScreenClient({ username, level, xp, initialKit }: Props) {
  const router = useRouter()
  const [currentKit, setCurrentKit] = useState<Kit>(initialKit)
  const [kitModalOpen, setKitModalOpen] = useState(false)

  const handleNav = (action?: string) => {
    if (action === 'kit')     setKitModalOpen(true)
    if (action === 'profile') router.push(`/profile/${username}`)
    if (action === 'signout') signOut({ callbackUrl: '/' })
  }

  return (
    <div className="hub-root">
      {/* ── Left — Character panel ────────────────────────────────── */}
      <div className="hub-left slide-up">
        {/* Small brand */}
        <p className="label-mono" style={{ color: 'var(--green-accent)', letterSpacing: '0.4em', marginBottom: 8 }}>
          PENALTY BLITZ
        </p>

        {/* Character */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          {/* Glow disc behind character */}
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
          <CharacterCanvas kit={currentKit} size={180} />
        </div>

        {/* Kit info */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            color: '#fff',
            letterSpacing: '0.05em',
            marginBottom: 4,
          }}>
            {currentKit.name}
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[currentKit.primary, currentKit.secondary, currentKit.shorts, currentKit.socks].map((c, i) => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: 4,
                background: c,
                border: '1px solid rgba(255,255,255,0.15)',
              }} />
            ))}
          </div>
        </div>

        {/* Change kit button */}
        <button
          onClick={() => setKitModalOpen(true)}
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
        <Link href="/game" className="hub-play-card slide-up-d1">
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
        </Link>

        {/* Nav grid */}
        <div className="hub-nav-grid slide-up-d2">
          {NAV_ITEMS.map(({ href, icon, label, action }) => (
            <button
              key={label}
              onClick={() => href ? router.push(href) : handleNav(action)}
              className="hub-nav-item"
              style={{ border: 'none', textAlign: 'left' }}
            >
              <div className="hub-nav-icon">{icon}</div>
              <span className="hub-nav-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <KitSelectModal
        open={kitModalOpen}
        currentKit={currentKit}
        onSave={setCurrentKit}
        onClose={() => setKitModalOpen(false)}
      />
    </div>
  )
}
