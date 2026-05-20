import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { player_id, x, y, power, scored, prev_x, prev_y } = await req.json()

    await prisma.shot.create({
      data: {
        playerId: player_id,
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
