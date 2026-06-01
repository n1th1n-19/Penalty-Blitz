import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/main')

  return (
    <div className="landing-root">
      {/* Pitch strip */}
      <div className="landing-pitch" />
      {/* Rolling ball */}
      <div className="landing-ball" />

      {/* Title */}
      <div className="landing-title-wrap slide-up">
        <span className="title-solid">PENALTY</span>
        <span className="title-outline">BLITZ</span>
        <div className="title-rule" />
        <p className="menu-tagline">Five shots &mdash; one keeper &mdash; no mercy</p>
      </div>

      {/* Action card */}
      <div className="landing-card slide-up-d2">
        <Link href="/game" className="nav-btn nav-btn-play" style={{ borderRadius: 10 }}>
          Play as Guest
        </Link>
        <Link href="/login" className="nav-btn" style={{ borderRadius: 10 }}>
          Sign In
        </Link>
        <Link href="/register" className="nav-btn" style={{ borderRadius: 10 }}>
          Register
        </Link>
      </div>

      <p className="menu-copyright">Penalty Blitz &copy; {new Date().getFullYear()}</p>
    </div>
  )
}
