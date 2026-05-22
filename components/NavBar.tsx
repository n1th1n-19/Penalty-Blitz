import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function NavBar() {
  const session = await getServerSession(authOptions)

  return (
    <nav className="bg-green-900 text-white px-4 py-2 flex items-center justify-between">
      <Link href="/" className="font-black tracking-widest text-sm">PENALTY BLITZ</Link>
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/leaderboard" className="hover:text-green-300">Leaderboard</Link>
        {session ? (
          <Link href={`/profile/${session.user.username}`} className="hover:text-green-300">
            {session.user.username} Lv.{session.user.level}
          </Link>
        ) : (
          <>
            <Link href="/login" className="hover:text-green-300">Sign In</Link>
            <Link href="/register" className="bg-white text-green-900 font-black text-xs px-3 py-1 rounded hover:bg-green-100">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
