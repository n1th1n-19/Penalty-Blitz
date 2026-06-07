import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getKit, DEFAULT_KIT_ID } from '@/lib/game/kits'
import AppShell from '@/components/shell/AppShell'

export default async function MainPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarKitId: true },
  })

  const kit = getKit(user?.avatarKitId ?? DEFAULT_KIT_ID)

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
