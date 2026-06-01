import { notFound } from 'next/navigation'
import Link from 'next/link'
import XpBar from '@/components/profile/XpBar'
import ShotHeatmap from '@/components/profile/ShotHeatmap'

interface ProfileData {
  username: string
  level: number
  xp: number
  avatarKitId: string | null
  totalGoals: number
  totalShots: number
  bestGame: number
  winRate: number
  gamesPlayed: number
  heatmap: Record<string, number>
  recentGames: {
    goalsScored: number
    totalShots: number
    difficulty: string
    xpEarned: number
    createdAt: string
  }[]
}

interface PageProps {
  params: { username: string }
}

function DiffPill({ difficulty }: { difficulty: string }) {
  const cls = `diff-pill diff-pill-${difficulty.toLowerCase()}`
  return <span className={cls}>{difficulty}</span>
}

export default async function ProfilePage({ params }: PageProps) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(
    `${baseUrl}/api/profile/${encodeURIComponent(params.username)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) notFound()

  const data: ProfileData = await res.json()

  const statCards = [
    { label: 'Total Goals', value: data.totalGoals },
    { label: 'Games Played', value: data.gamesPlayed },
    { label: 'Best Game', value: `${data.bestGame}/5` },
    { label: 'Win Rate', value: `${data.winRate}%` },
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#040d06',
      backgroundImage: 'radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(20px,4vw,40px) 20px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Back nav */}
        <Link
          href="/main"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '0.2em',
            alignSelf: 'flex-start',
          }}
        >
          ← BACK
        </Link>

        {/* Header card */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px,6vw,32px)',
              color: '#fff',
              letterSpacing: '0.04em',
            }}>
              {data.username}
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#4ade80',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              padding: '3px 10px',
              borderRadius: 20,
            }}>
              LV.{data.level}
            </span>
          </div>
          <XpBar xp={data.xp} level={data.level} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {statCards.map(({ label, value }) => (
            <div
              key={label}
              className="card"
              style={{ padding: '16px 14px', textAlign: 'center' }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                color: '#4ade80',
                letterSpacing: '0.03em',
                lineHeight: 1,
                textShadow: '0 0 16px rgba(74,222,128,0.25)',
              }}>
                {value}
              </p>
              <p className="label-mono" style={{ marginTop: 6, fontSize: 9 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="card" style={{ padding: '20px' }}>
          <p className="label-mono" style={{ marginBottom: 14 }}>SHOT HEATMAP</p>
          <ShotHeatmap heatmap={data.heatmap} />
        </div>

        {/* Recent games */}
        <div className="card" style={{ padding: '20px' }}>
          <p className="label-mono" style={{ marginBottom: 14 }}>RECENT GAMES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.recentGames.map((g, i) => (
              <div
                key={g.createdAt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < data.recentGames.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                {/* Score dot */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: g.goalsScored >= 4 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  border: g.goalsScored >= 4 ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  color: g.goalsScored >= 4 ? '#4ade80' : 'rgba(255,255,255,0.7)',
                  flexShrink: 0,
                }}>
                  {g.goalsScored}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
                      {g.goalsScored}/{g.totalShots}
                    </span>
                    <DiffPill difficulty={g.difficulty} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#4ade80',
                  letterSpacing: '0.1em',
                  flexShrink: 0,
                }}>
                  +{g.xpEarned}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
