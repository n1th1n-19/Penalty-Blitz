import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function NavBar() {
  const session = await getServerSession(authOptions)

  if (!session) return null

  return (
    <nav className="bg-green-900 text-white px-4 py-2 flex items-center justify-between">
      <Link href="/game" className="font-black tracking-widest text-sm">PENALTY BLITZ</Link>
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/leaderboard" className="hover:text-green-300">Leaderboard</Link>
        <Link href={`/profile/${session.user.username}`} className="hover:text-green-300">
          {session.user.username} Lv.{session.user.level}
        </Link>
      </div>
    </nav>
  )
}
