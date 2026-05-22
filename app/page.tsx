import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function MenuPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="menu-root">

      {/* Auth top-right */}
      <div className="menu-auth-bar">
        {session ? (
          <Link href={`/profile/${session.user.username}`} className="menu-auth-link-green">
            {session.user.username} &middot; Lv.{session.user.level}
          </Link>
        ) : (
          <>
            <Link href="/login" className="menu-auth-link">Sign in</Link>
            <span className="menu-divider">/</span>
            <Link href="/register" className="menu-auth-link-green">Register</Link>
          </>
        )}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="title-solid">PENALTY</span>
        <span className="title-outline">BLITZ</span>
        <p className="menu-tagline">Five shots &mdash; one keeper &mdash; no mercy</p>
      </div>

      {/* Nav buttons */}
      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link href="/game" className="nav-btn nav-btn-play">Play Now</Link>
        <Link href="/leaderboard" className="nav-btn">Leaderboard</Link>
        {session ? (
          <Link href={`/profile/${session.user.username}`} className="nav-btn">My Profile</Link>
        ) : (
          <Link href="/login" className="nav-btn">Sign In</Link>
        )}
      </div>

      <p className="menu-copyright">Penalty Blitz &copy; {new Date().getFullYear()}</p>
    </div>
  )
}
