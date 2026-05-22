import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { kitId } = await req.json()
  if (typeof kitId !== 'string' || kitId.length > 64) {
    return NextResponse.json({ error: 'Invalid kitId' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarKitId: kitId },
  })

  return NextResponse.json({ ok: true })
}
