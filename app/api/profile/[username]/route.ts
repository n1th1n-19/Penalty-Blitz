import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { username: string } }

const ZONES = [
  'left-top',
  'centre-top',
  'right-top',
  'left-bottom',
  'centre-bottom',
  'right-bottom',
] as const

type Zone = (typeof ZONES)[number]

function getZone(x: number, y: number): Zone {
  const col = x < 0.333 ? 'left' : x < 0.667 ? 'centre' : 'right'
  const row = y < 0.5 ? 'top' : 'bottom'
  return `${col}-${row}` as Zone
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await prisma.user.findFirst({
    where: { username: { equals: params.username, mode: 'insensitive' } },
    select: {
      id: true,
      username: true,
      level: true,
      xp: true,
      avatarKitId: true,
      createdAt: true,
      scores: {
        select: { goalsScored: true, totalShots: true },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const allScores = user.scores

  const recentScores = await prisma.score.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      goalsScored: true,
      totalShots: true,
      difficulty: true,
      xpEarned: true,
      createdAt: true,
    },
  })

  const recentShots = await prisma.shot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { x: true, y: true, scored: true },
  })

  const totalGoals = allScores.reduce((sum, s) => sum + s.goalsScored, 0)
  const totalShots = allScores.reduce((sum, s) => sum + s.totalShots, 0)
  const bestGame = allScores.length > 0 ? Math.max(...allScores.map(s => s.goalsScored)) : 0
  const winRate = totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0
  const gamesPlayed = allScores.length

  const counts: Record<Zone, number> = {
    'left-top': 0,
    'centre-top': 0,
    'right-top': 0,
    'left-bottom': 0,
    'centre-bottom': 0,
    'right-bottom': 0,
  }

  for (const shot of recentShots) {
    counts[getZone(shot.x, shot.y)]++
  }

  const maxCount = Math.max(1, ...Object.values(counts))
  const heatmap: Record<string, number> = {}
  for (const zone of ZONES) {
    heatmap[zone] = Math.round((counts[zone] / maxCount) * 100) / 100
  }

  return NextResponse.json({
    username: user.username,
    level: user.level,
    xp: user.xp,
    avatarKitId: user.avatarKitId ?? null,
    totalGoals,
    totalShots,
    bestGame,
    winRate,
    gamesPlayed,
    heatmap,
    recentGames: recentScores,
  })
}
