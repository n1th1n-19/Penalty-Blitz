import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell pb-stadium" style={{ height: '100dvh' }}>
      {/* Left — branding panel (desktop only) */}
      <div className="auth-brand pb-stadium">
        {/* Floodlight halos */}
        <div style={{
          position: 'absolute', top: -110, left: -90,
          width: 'clamp(200px,34vw,360px)', height: 'clamp(200px,34vw,360px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,199,0.14) 0%, transparent 70%)',
          pointerEvents: 'none', animation: 'pb-halo 4.6s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', top: -110, right: -90,
          width: 'clamp(200px,34vw,360px)', height: 'clamp(200px,34vw,360px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,255,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', animation: 'pb-halo 4.6s ease-in-out infinite 2.3s',
        }}/>

        <Link href="/" style={{
          position: 'absolute', top: 24, left: 24,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--txt-3)', textDecoration: 'none',
          letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'color .15s', zIndex: 2,
        }}>
          ← HOME
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="mono-label" style={{ color: 'var(--lime)', letterSpacing: '0.4em', marginBottom: 14 }}>
            Penalty Blitz
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(40px,5vw,72px)', color: '#fff', lineHeight: 0.92, marginBottom: 18 }}>
            STEP UP<br />TO THE<br /><span style={{ color: 'var(--lime)' }}>SPOT.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--txt-2)', maxWidth: 340, lineHeight: 1.6 }}>
            Read the keeper. Pick your corner. Stack the longest streak on the planet.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="auth-form-panel pb-stadium">
        {/* Mobile brand header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }} className="a-slide">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="display" style={{ fontSize: 28, color: '#fff', letterSpacing: '0.06em' }}>
              PENALTY BLITZ
            </span>
          </Link>
        </div>

        <div className="auth-form-inner a-slide-1">
          {children}
        </div>
      </div>
    </div>
  )
}
