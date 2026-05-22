import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    const { player_id, x, y, power, scored, prev_x, prev_y } = await req.json()

    await prisma.shot.create({
      data: {
        playerId: player_id,
        userId,
        x,
        y,
        power,
        scored,
        prevX: prev_x ?? null,
        prevY: prev_y ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ shots: [] })

  const shots = await prisma.shot.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take:    25,
    select:  { x: true, y: true, power: true, scored: true, prevX: true, prevY: true },
  })

  return NextResponse.json({ shots })
}
