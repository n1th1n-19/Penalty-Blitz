import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Metric = 'goals' | 'bestgame' | 'winrate' | 'xp'
type Period = 'alltime' | 'month' | 'week' | 'today'

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 7); return d
  }
  if (period === 'month') {
    const d = new Date(now); d.setMonth(d.getMonth() - 1); return d
  }
  return null
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const metric = (searchParams.get('metric') ?? 'goals') as Metric
  const period = (searchParams.get('period') ?? 'alltime') as Period

  const periodStart = getPeriodStart(period)
  const dateFilter = periodStart ? { createdAt: { gte: periodStart } } : {}

  const users = await prisma.user.findMany({
    select: {
      id: true, username: true, level: true, xp: true,
      scores: {
        where: dateFilter,
        select: { goalsScored: true, totalShots: true, xpEarned: true },
      },
    },
  })

  type Row = {
    userId: string; username: string; level: number
    primaryValue: number; goals: number; winRate: number; bestGame: number; xp: number
    gamesPlayed: number
  }

  const rows: Row[] = users
    .filter(u => u.scores.length > 0)
    .map(u => {
      const goals    = u.scores.reduce((s, sc) => s + sc.goalsScored, 0)
      const shots    = u.scores.reduce((s, sc) => s + sc.totalShots,  0)
      const bestGame = Math.max(...u.scores.map(sc => sc.goalsScored))
      const winRate  = shots > 0 ? Math.round((goals / shots) * 100) : 0
      const xpTotal  = u.scores.reduce((s, sc) => s + sc.xpEarned, 0)

      const primaryValue =
        metric === 'goals'    ? goals    :
        metric === 'bestgame' ? bestGame :
        metric === 'winrate'  ? (u.scores.length >= 10 ? winRate : -1) :
        xpTotal

      return {
        userId: u.id, username: u.username, level: u.level,
        primaryValue, goals, winRate, bestGame, xp: xpTotal,
        gamesPlayed: u.scores.length,
      }
    })
    .filter(r => r.primaryValue >= 0)
    .sort((a, b) => b.primaryValue - a.primaryValue)

  const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))

  const myRow = session?.user?.id
    ? ranked.find(r => r.userId === session.user.id) ?? null
    : null

  return NextResponse.json({ rows: ranked.slice(0, 100), myRow, metric, period })
}
