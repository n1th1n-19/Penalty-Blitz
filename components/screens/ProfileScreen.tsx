'use client'
import { useEffect, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'
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

export default function ProfileScreen({ username }: { username: string }) {
  const { back } = useSystemStore()
  const [data, setData] = useState<ProfileData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setData(null)
    setError(false)
    fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
  }, [username])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      backgroundImage: 'var(--stadium-bg), var(--stadium-grid)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(20px,4vw,40px) 20px 60px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <button
          onClick={back}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '0.2em', alignSelf: 'flex-start',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}
        >
          &larr; BACK
        </button>

        {error && (
          <div className="card" style={{ padding: '24px 22px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            Profile not found.
          </div>
        )}

        {!error && !data && (
          <div className="card" style={{ padding: '24px 22px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            Loading...
          </div>
        )}

        {data && (
          <>
            {/* Hero card */}
            <div className="card slide-up" style={{ padding: '24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p className="label-mono" style={{ marginBottom: 6 }}>Player</p>
                  <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(26px,7vw,40px)',
                    color: '#fff',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}>
                    {data.username}
                  </h1>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(34,197,94,0.10)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 20,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--green-accent)',
                  letterSpacing: '0.2em',
                  flexShrink: 0,
                }}>
                  LV.{data.level}
                </div>
              </div>
              <XpBar xp={data.xp} level={data.level} />
            </div>

            {/* Stats grid */}
            <div className="slide-up-d1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Goals',  value: data.totalGoals.toLocaleString() },
                { label: 'Games Played', value: data.gamesPlayed.toLocaleString() },
                { label: 'Best Game',    value: `${data.bestGame}/5` },
                { label: 'Win Rate',     value: `${data.winRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="stat-card">
                  <div className="stat-card-value">{value}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <div className="card slide-up-d2" style={{ padding: '20px' }}>
              <p className="label-mono" style={{ marginBottom: 14 }}>Shot Heatmap</p>
              <ShotHeatmap heatmap={data.heatmap} />
            </div>

            {/* Recent games */}
            <div className="card slide-up-d3" style={{ padding: '20px' }}>
              <p className="label-mono" style={{ marginBottom: 16 }}>Recent Games</p>
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{
                  position: 'absolute', left: 6, top: 0, bottom: 0,
                  width: 1, background: 'var(--border)',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {data.recentGames.map((g, i) => {
                    const ratio = g.goalsScored / g.totalShots
                    const dotColor = ratio >= 0.8 ? 'var(--green-accent)' : ratio >= 0.5 ? 'var(--gold)' : '#f87171'
                    const diffKey = g.difficulty.toLowerCase()
                    return (
                      <div key={g.createdAt} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        paddingBottom: i < data.recentGames.length - 1 ? 16 : 0,
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', left: -14, top: 6,
                          width: 9, height: 9, borderRadius: '50%',
                          background: dotColor, border: `1px solid ${dotColor}44`,
                          flexShrink: 0, boxShadow: `0 0 6px ${dotColor}55`,
                        }} />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                {g.goalsScored}/{g.totalShots}
                              </span>
                              <span className={`diff-pill diff-pill-${diffKey}`}>{g.difficulty}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                              {new Date(g.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                            color: 'var(--green-accent)', letterSpacing: '0.1em', flexShrink: 0,
                          }}>
                            +{g.xpEarned} XP
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
