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
  { value: 'goals', label: 'Goals' },
  { value: 'bestgame', label: 'Best Game' },
  { value: 'winrate', label: 'Win Rate' },
  { value: 'xp', label: 'XP' },
]

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'alltime', label: 'All Time' },
  { value: 'month', label: 'This Month' },
  { value: 'week', label: 'This Week' },
  { value: 'today', label: 'Today' },
]

function formatPrimaryValue(metric: Metric, value: number): string {
  if (metric === 'goals') return `${value} goals`
  if (metric === 'bestgame') return `${value} / 5`
  if (metric === 'winrate') return `${value}%`
  return `${value} XP`
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-7 rounded bg-yellow-400 text-yellow-900 font-black text-xs">
        GOLD
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-12 h-7 rounded bg-gray-300 text-gray-700 font-black text-xs">
        SILVER
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-14 h-7 rounded bg-amber-600 text-white font-black text-xs">
        BRONZE
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-10 h-7 text-gray-500 font-mono text-sm">
      #{rank}
    </span>
  )
}

function LeaderboardRow({
  row,
  metric,
  isOwn,
  showYouLabel,
}: {
  row: Row
  metric: Metric
  isOwn: boolean
  showYouLabel: boolean
}) {
  const rowClass = isOwn
    ? 'bg-green-50 border border-green-200'
    : 'bg-white border border-gray-100'

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${rowClass}`}>
      <RankBadge rank={row.rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900 truncate">{row.username}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">
            Lv.{row.level}
          </span>
          {showYouLabel && (
            <span className="text-green-700 font-bold text-xs">YOU</span>
          )}
        </div>
        {metric !== 'winrate' && (
          <p className="text-xs text-gray-400 mt-0.5">{row.winRate}% win rate</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="font-black text-green-700 text-sm">
          {formatPrimaryValue(metric, row.primaryValue)}
        </p>
      </div>
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
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiResponse>
      })
      .then((data) => {
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

    return () => {
      cancelled = true
    }
  }, [metric, period])

  const myRowVisibleInList = myRow != null && rows.some((r) => r.userId === myRow.userId)

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap flex-1">
          {METRIC_LABELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMetric(value)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                metric === value
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="px-3 py-1.5 rounded border border-gray-200 bg-white text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Win rate notice */}
      {metric === 'winrate' && (
        <p className="text-xs text-gray-400">
          Win Rate requires at least 10 games to qualify.
        </p>
      )}

      {/* Loading state */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 && (
            <p className="text-center text-gray-400 py-12">No results yet.</p>
          )}

          {rows.map((row) => (
            <LeaderboardRow
              key={row.userId}
              row={row}
              metric={metric}
              isOwn={row.userId === myUserId}
              showYouLabel={row.userId === myUserId}
            />
          ))}

          {/* Neighbourhood pinning */}
          {myRow != null && !myRowVisibleInList && (
            <>
              <p className="text-center text-sm text-gray-300 py-1">...</p>
              <LeaderboardRow
                row={myRow}
                metric={metric}
                isOwn={true}
                showYouLabel={true}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
