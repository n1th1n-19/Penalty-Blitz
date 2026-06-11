'use client'
import { useEffect, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { Icon, Jersey } from '@/components/ui/PbUi'
import { getKit, DEFAULT_KIT_ID } from '@/lib/game/kits'
import type { NeonKit } from '@/components/ui/PbUi'
import XpBar from '@/components/profile/XpBar'
import ShotHeatmap from '@/components/profile/ShotHeatmap'

interface ProfileData {
  username: string
  level: number
  xp: number
  avatarKitId: string | null
  playerNumber: number
  playerName: string | null
  totalGoals: number
  totalShots: number
  bestGame: number
  bestStreak: number
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
    setData(null); setError(false)
    fetch(`/api/profile/${encodeURIComponent(username)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setError(true))
  }, [username])

  const kit = getKit(data?.avatarKitId ?? DEFAULT_KIT_ID)

  return (
    <div className="pb-stadium" style={{ height: '100dvh', overflowY: 'auto' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(20px,4vw,40px) 20px 60px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <button onClick={back} className="pb-btn pb-btn-ghost" style={{ padding: '10px 16px', alignSelf: 'flex-start' }}>
          <Icon name="back" size={14} /> Back
        </button>

        {error && (
          <div className="pb-card a-slide" style={{ padding: '24px 22px' }}>
            <p className="mono-label" style={{ color: 'var(--danger)' }}>Profile not found.</p>
          </div>
        )}

        {!error && !data && (
          <div className="pb-card a-slide" style={{ padding: '24px 22px' }}>
            <p className="mono-label" style={{ animation: 'pb-pulse 1.5s ease-in-out infinite' }}>LOADING...</p>
          </div>
        )}

        {data && (
          <>
            {/* Hero card */}
            <div className="pb-card a-slide" style={{ padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flexShrink: 0 }}>
                <Jersey kit={kit as NeonKit} size={80} glow={false} num={data.playerNumber} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p className="mono-label" style={{ marginBottom: 5 }}>Player</p>
                    <h1 className="display" style={{ fontSize: 'clamp(24px,6vw,38px)', color: '#fff', lineHeight: 1 }}>{data.username}</h1>
                  </div>
                  <span className="pb-pill" style={{ background: 'rgba(200,255,0,0.1)', border: '1px solid var(--bd-lime)', color: 'var(--lime)', fontSize: 12, padding: '6px 14px', flexShrink: 0 }}>
                    LV.{data.level}
                  </span>
                </div>
                <XpBar xp={data.xp} level={data.level} />
              </div>
            </div>

            {/* Stats grid */}
            <div className="a-slide-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Best Streak', value: data.bestStreak ?? 0, color: 'var(--lime)' },
                { label: 'Total Goals',  value: data.totalGoals,    color: 'var(--cyan)' },
                { label: 'Games Played', value: data.gamesPlayed,   color: 'var(--gold)' },
                { label: 'Win Rate',     value: `${data.winRate}%`, color: 'var(--txt-2)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="stat-card" style={{ borderLeft: `2px solid ${color}22` }}>
                  <div className="stat-card-value" style={{ color }}>{value}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Bottom two-col on desktop */}
            <div
              className="a-slide-2"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}
            >
              {/* Shot heatmap */}
              <div className="pb-card" style={{ padding: '20px 22px' }}>
                <p className="mono-label" style={{ marginBottom: 14 }}>Shot Heatmap</p>
                <ShotHeatmap heatmap={data.heatmap} />
              </div>

              {/* Recent runs */}
              <div className="pb-card" style={{ padding: '20px 22px' }}>
                <p className="mono-label" style={{ marginBottom: 16 }}>Recent Runs</p>
                {data.recentGames.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--txt-3)' }}>No games yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.recentGames.map((g, i) => {
                      const diffKey = g.difficulty.toLowerCase()
                      return (
                        <div key={g.createdAt + i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff' }}>{g.goalsScored}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--txt-3)' }}>streak</span>
                              <span className={`diff-pill diff-pill-${diffKey}`}>{g.difficulty}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--txt-3)', letterSpacing: '0.1em' }}>
                              {new Date(g.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--lime)', flexShrink: 0 }}>
                            +{g.xpEarned} XP
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
