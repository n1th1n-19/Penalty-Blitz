import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/main')

  return (
    <div className="menu-root">
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="title-solid">PENALTY</span>
        <span className="title-outline">BLITZ</span>
        <p className="menu-tagline">Five shots &mdash; one keeper &mdash; no mercy</p>
      </div>

      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link href="/game" className="nav-btn nav-btn-play">Play as Guest</Link>
        <Link href="/login" className="nav-btn">Sign In</Link>
        <Link href="/register" className="nav-btn">Register</Link>
      </div>

      <p className="menu-copyright">Penalty Blitz &copy; {new Date().getFullYear()}</p>
    </div>
  )
}
