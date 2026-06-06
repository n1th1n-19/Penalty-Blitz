import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CLUB_KITS, COUNTRY_KITS } from '@/lib/game/kits'
import AppShell from '@/components/shell/AppShell'

const ALL_KITS = [...CLUB_KITS, ...COUNTRY_KITS]

export default async function MainPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarKitId: true, playerName: true, playerNumber: true },
  })

  const baseKit = ALL_KITS.find(k => k.id === user?.avatarKitId) ?? ALL_KITS[0]
  const kit = {
    ...baseKit,
    ...(user?.playerName   && { playerName:   user.playerName }),
    ...(user?.playerNumber && { playerNumber: user.playerNumber }),
  }

  return (
    <AppShell
      initialUser={{
        id: session.user.id,
        username: session.user.username,
        level: session.user.level,
        xp: session.user.xp,
        kit,
      }}
    />
  )
}
