import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateXp, calculateLevel, type Difficulty } from '@/lib/xp'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goalsScored, difficulty } = await req.json() as {
    goalsScored: number
    difficulty:  Difficulty
  }

  if (typeof goalsScored !== 'number' || !['easy','medium','hard'].includes(difficulty)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const xpEarned = calculateXp(goalsScored, difficulty)

  await prisma.score.create({
    data: {
      userId:     session.user.id,
      goalsScored,
      difficulty,
      xpEarned,
    },
  })

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data:  { xp: { increment: xpEarned } },
    select: { xp: true },
  })

  const newLevel = calculateLevel(user.xp)
  const prevLevel = calculateLevel(user.xp - xpEarned)

  if (newLevel > prevLevel) {
    await prisma.user.update({
      where: { id: session.user.id },
      data:  { level: newLevel },
    })
  }

  return NextResponse.json({
    xpEarned,
    totalXp:   user.xp,
    newLevel,
    leveledUp: newLevel > prevLevel,
  })
}
