import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/main')

  return (
    <div className="pb-stadium landing-root" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Floodlight halos */}
      <div style={{
        position: 'absolute', top: -110, left: -90,
        width: 'clamp(220px,38vw,400px)', height: 'clamp(220px,38vw,400px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,217,199,0.16) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'pb-halo 4.6s ease-in-out infinite',
      }}/>
      <div style={{
        position: 'absolute', top: -110, right: -90,
        width: 'clamp(220px,38vw,400px)', height: 'clamp(220px,38vw,400px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,255,0,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'pb-halo 4.6s ease-in-out infinite 2.3s',
      }}/>

      {/* Pitch strip */}
      <div className="landing-pitch" />
      {/* Rolling ball */}
      <div className="landing-ball" />

      {/* Title */}
      <div className="landing-title-wrap a-slide">
        <span className="title-solid">PENALTY</span>
        <span className="title-outline">BLITZ</span>
        <div className="title-rule" />
        <p className="menu-tagline">One keeper &nbsp;·&nbsp; one spot &nbsp;·&nbsp; no mercy</p>
      </div>

      {/* Action card */}
      <div className="landing-card a-slide-2">
        <Link href="/login" className="pb-btn pb-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Sign In
        </Link>
        <Link href="/register" className="pb-btn pb-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Create Account
        </Link>
      </div>

      <p className="menu-copyright">Penalty Blitz &copy; {new Date().getFullYear()}</p>
    </div>
  )
}
