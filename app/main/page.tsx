import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getKit, DEFAULT_KIT_ID } from '@/lib/game/kits'
import AppShell from '@/components/shell/AppShell'

export default async function MainPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarKitId: true, playerName: true, playerNumber: true },
    }),
    prisma.score.aggregate({
      where: { userId: session.user.id },
      _sum: { goalsScored: true, totalShots: true },
      _max: { goalsScored: true },
    }),
  ])

  const kit = {
    ...getKit(user?.avatarKitId ?? DEFAULT_KIT_ID),
    ...(user?.playerName   != null && { playerName:   user.playerName }),
    ...(user?.playerNumber != null && { playerNumber: user.playerNumber }),
  }

  return (
    <AppShell
      initialUser={{
        id: session.user.id,
        username: session.user.username,
        level: session.user.level,
        xp: session.user.xp,
        kit,
        totalGoals:  stats._sum.goalsScored ?? 0,
        totalShots:  stats._sum.totalShots  ?? 0,
        bestStreak:  stats._max.goalsScored ?? 0,
      }}
    />
  )
}
