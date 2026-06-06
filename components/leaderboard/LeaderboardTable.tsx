'use client'
import { useEffect, useState } from 'react'

type Metric = 'goals' | 'bestgame' | 'streak' | 'winrate' | 'xp'
type Period = 'alltime' | 'month' | 'week' | 'today'

interface Row {
  rank: number
  userId: string
  username: string
  level: number
  primaryValue: number
  goals: number
  winRate: number
  bestGame: number
  bestStreak: number
  xp: number
  gamesPlayed: number
}

interface ApiResponse { rows: Row[]; myRow: Row | null; metric: Metric; period: Period }

interface Props { myUserId?: string }

const METRICS: { v: Metric; label: string }[] = [
  { v: 'goals',    label: 'Goals' },
  { v: 'streak',   label: 'Best Streak' },
  { v: 'winrate',  label: 'Win Rate' },
  { v: 'xp',       label: 'XP' },
]
const PERIODS: { v: Period; label: string }[] = [
  { v: 'alltime', label: 'All Time' },
  { v: 'month',   label: 'Month' },
  { v: 'week',    label: 'Week' },
  { v: 'today',   label: 'Today' },
]

function formatValue(metric: Metric, v: number) {
  if (metric === 'streak')  return `${v} 🔥`
  if (metric === 'bestgame') return `${v}`
  if (metric === 'winrate')  return `${v}%`
  return `${v}`
}

function PodiumRow({ row, metric, isOwn }: { row: Row; metric: Metric; isOwn: boolean }) {
  const cls = `podium-row podium-${row.rank}${isOwn ? ' lb-row own' : ''}`
  return (
    <div className={cls}>
      <div className="podium-rank">{row.rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14,
            color: isOwn ? 'var(--green-accent)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {row.username}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.15em', color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.06)',
            padding: '1px 6px', borderRadius: 4,
          }}>LV.{row.level}</span>
          {isOwn && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--green-accent)' }}>YOU</span>}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {row.gamesPlayed} games played
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 24,
          color: isOwn ? 'var(--green-accent)' : 'var(--text-primary)',
          letterSpacing: '0.02em',
        }}>
          {formatValue(metric, row.primaryValue)}
        </p>
      </div>
    </div>
  )
}

function RegularRow({ row, metric, isOwn }: { row: Row; metric: Metric; isOwn: boolean }) {
  return (
    <div className={`lb-row${isOwn ? ' own' : ''}`}>
      <span className="lb-rank-num">#{row.rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
            color: isOwn ? 'var(--green-accent)' : 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{row.username}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>
            LV.{row.level}
          </span>
          {isOwn && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--green-accent)' }}>YOU</span>}
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: isOwn ? 'var(--green-accent)' : 'var(--text-secondary)', flexShrink: 0 }}>
        {formatValue(metric, row.primaryValue)}
      </span>
    </div>
  )
}

function ShimmerRow() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', alignItems: 'center' }}>
      <div className="shimmer" style={{ width: 32, height: 20, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="shimmer" style={{ width: '45%', height: 13, marginBottom: 6 }} />
        <div className="shimmer" style={{ width: '28%', height: 10 }} />
      </div>
      <div className="shimmer" style={{ width: 40, height: 20, flexShrink: 0 }} />
    </div>
  )
}

export default function LeaderboardTable({ myUserId }: Props) {
  const [metric, setMetric] = useState<Metric>('goals')
  const [period, setPeriod] = useState<Period>('alltime')
  const [rows, setRows]     = useState<Row[]>([])
  const [myRow, setMyRow]   = useState<Row | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(null)
    fetch(`/api/leaderboard?metric=${metric}&period=${period}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<ApiResponse> })
      .then(d => { if (cancelled) return; setRows(d.rows); setMyRow(d.myRow); setLoading(false) })
      .catch(() => { if (!cancelled) { setError('Failed to load. Please try again.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [metric, period])

  const myInList = myRow != null && rows.some(r => r.userId === myRow.userId)
  const podium   = rows.filter(r => r.rank <= 3)
  const rest     = rows.filter(r => r.rank > 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Metric tabs */}
      <div className="tabs" style={{ overflowX: 'auto' }}>
        {METRICS.map(({ v, label }) => (
          <button key={v} onClick={() => setMetric(v)} className={`tab-btn${metric === v ? ' active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Period pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {PERIODS.map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setPeriod(v)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              border: period === v ? '1px solid var(--border-accent)' : '1px solid var(--border)',
              background: period === v ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.03)',
              color: period === v ? 'var(--green-accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => <ShimmerRow key={i} />)}
        </div>
      ) : error ? (
        <p style={{ fontFamily: 'var(--font-mono)', color: '#f87171', textAlign: 'center', padding: '32px 0', fontSize: 12 }}>
          {error}
        </p>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--text-dim)', marginBottom: 12 }}>◎</div>
          <p className="label-mono" style={{ letterSpacing: '0.3em' }}>No results yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Podium — top 3 */}
          {podium.map(row => (
            <PodiumRow key={row.userId} row={row} metric={metric} isOwn={row.userId === myUserId} />
          ))}

          {/* Divider after podium */}
          {rest.length > 0 && (
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          )}

          {/* Regular rows */}
          {rest.map(row => (
            <RegularRow key={row.userId} row={row} metric={metric} isOwn={row.userId === myUserId} />
          ))}

          {/* My row pinned at bottom if not in list */}
          {myRow && !myInList && (
            <>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '0.2em' }}>
                . . .
              </p>
              <RegularRow row={myRow} metric={metric} isOwn={true} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
