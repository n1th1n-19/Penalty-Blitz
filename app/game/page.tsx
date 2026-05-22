import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CLUB_KITS, COUNTRY_KITS } from '@/lib/game/kits'
import GamePageClient from './GamePageClient'

const ALL_KITS = [...CLUB_KITS, ...COUNTRY_KITS]

export default async function GamePage() {
  const session = await getServerSession(authOptions)

  let initialKit = undefined
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarKitId: true },
    })
    initialKit = ALL_KITS.find(k => k.id === user?.avatarKitId) ?? ALL_KITS[0]
  }

  return <GamePageClient initialKit={initialKit} />
}
