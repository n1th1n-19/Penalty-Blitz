'use client'

import { useEffect, useState } from 'react'

type Metric = 'goals' | 'bestgame' | 'winrate' | 'xp'
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
  xp: number
  gamesPlayed: number
}

interface ApiResponse {
  rows: Row[]
  myRow: Row | null
  metric: Metric
  period: Period
}

interface Props {
  myUserId?: string
}

const METRIC_LABELS: { value: Metric; label: string }[] = [
  { value: 'goals',    label: 'Goals' },
  { value: 'bestgame', label: 'Best' },
  { value: 'winrate',  label: 'Win%' },
  { value: 'xp',       label: 'XP' },
]

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'alltime', label: 'All Time' },
  { value: 'month',   label: 'Month' },
  { value: 'week',    label: 'Week' },
  { value: 'today',   label: 'Today' },
]

function formatPrimaryValue(metric: Metric, value: number): string {
  if (metric === 'goals')    return `${value}`
  if (metric === 'bestgame') return `${value}/5`
  if (metric === 'winrate')  return `${value}%`
  return `${value}`
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  if (medals[rank]) {
    return (
      <span style={{ fontSize: 22, flexShrink: 0, width: 32, textAlign: 'center' }}>
        {medals[rank]}
      </span>
    )
  }
  return (
    <span style={{
      flexShrink: 0,
      width: 32,
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'rgba(255,255,255,0.3)',
      fontWeight: 700,
    }}>
      #{rank}
    </span>
  )
}

function LeaderboardRow({
  row, metric, isOwn, showYouLabel,
}: {
  row: Row
  metric: Metric
  isOwn: boolean
  showYouLabel: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 10,
      background: isOwn ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
      border: isOwn
        ? '1px solid rgba(74,222,128,0.3)'
        : '1px solid rgba(255,255,255,0.08)',
      borderLeft: isOwn ? '3px solid #4ade80' : '1px solid rgba(255,255,255,0.08)',
      transition: 'background 0.15s',
    }}>
      <RankBadge rank={row.rank} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 13,
            color: isOwn ? '#4ade80' : 'rgba(255,255,255,0.9)',
            letterSpacing: '0.05em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {row.username}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.06)',
            padding: '1px 6px',
            borderRadius: 4,
          }}>
            LV.{row.level}
          </span>
          {showYouLabel && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#4ade80',
            }}>
              YOU
            </span>
          )}
        </div>
        {metric !== 'winrate' && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            marginTop: 2,
            letterSpacing: '0.05em',
          }}>
            {row.winRate}% win rate
          </p>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          color: isOwn ? '#4ade80' : 'rgba(255,255,255,0.85)',
          letterSpacing: '0.03em',
          textShadow: isOwn ? '0 0 12px rgba(74,222,128,0.3)' : 'none',
        }}>
          {formatPrimaryValue(metric, row.primaryValue)}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {metric === 'goals' ? 'goals' : metric === 'bestgame' ? 'best' : metric === 'winrate' ? 'win%' : 'xp'}
        </p>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="skeleton" style={{ width: 32, height: 22, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '45%', height: 13, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '30%', height: 10 }} />
      </div>
      <div className="skeleton" style={{ width: 40, height: 20 }} />
    </div>
  )
}

export default function LeaderboardTable({ myUserId }: Props) {
  const [metric, setMetric] = useState<Metric>('goals')
  const [period, setPeriod] = useState<Period>('alltime')
  const [rows, setRows] = useState<Row[]>([])
  const [myRow, setMyRow] = useState<Row | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/leaderboard?metric=${metric}&period=${period}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiResponse>
      })
      .then(data => {
        if (cancelled) return
        setRows(data.rows)
        setMyRow(data.myRow)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load leaderboard. Please try again.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [metric, period])

  const myRowVisibleInList = myRow != null && rows.some(r => r.userId === myRow.userId)

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    border: active ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Metric tabs — scrollable on mobile */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
          {METRIC_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMetric(value)}
              style={btnStyle(metric === value)}
            >
              {label}
            </button>
          ))}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px', alignSelf: 'stretch' }} />
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={btnStyle(period === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Win rate notice */}
      {metric === 'winrate' && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Win Rate requires at least 10 games to qualify.
        </p>
      )}

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : error ? (
          <p style={{ fontFamily: 'var(--font-mono)', color: '#f87171', textAlign: 'center', padding: '32px 0', fontSize: 12 }}>
            {error}
          </p>
        ) : (
          <>
            {rows.length === 0 && (
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0', fontSize: 12, letterSpacing: '0.2em' }}>
                NO RESULTS YET
              </p>
            )}
            {rows.map(row => (
              <LeaderboardRow
                key={row.userId}
                row={row}
                metric={metric}
                isOwn={row.userId === myUserId}
                showYouLabel={row.userId === myUserId}
              />
            ))}
            {myRow != null && !myRowVisibleInList && (
              <>
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textAlign: 'center', fontSize: 12, letterSpacing: '0.2em' }}>
                  · · ·
                </p>
                <LeaderboardRow row={myRow} metric={metric} isOwn={true} showYouLabel={true} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
