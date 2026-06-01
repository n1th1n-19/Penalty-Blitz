import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      {/* Left — branding panel (desktop only) */}
      <div className="auth-brand">
        {/* Decorative goal post lines */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          opacity: 0.06,
          pointerEvents: 'none',
        }}>
          <div style={{ width: '100%', height: 3, background: '#fff' }} />
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ width: 3, height: 80, background: '#fff' }} />
            <div style={{ width: 3, height: 80, background: '#fff' }} />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="label-mono" style={{ marginBottom: 16, color: 'var(--green-accent)' }}>
            The #1 penalty game
          </p>
          <div style={{ marginBottom: 24 }}>
            <span className="title-solid" style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}>PENALTY</span>
            <span className="title-outline" style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}>BLITZ</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            lineHeight: 1.8,
            maxWidth: 280,
          }}>
            Five shots. One keeper.<br />
            An AI that learns your every move.<br />
            Can you outsmart it?
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            {[
              { n: '50K+', l: 'Players' },
              { n: '2M+',  l: 'Shots Fired' },
              { n: '99%',  l: 'Keeper Win Rate' },
            ].map(({ n, l }) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green-accent)' }}>{n}</div>
                <div className="label-mono" style={{ marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to home */}
        <Link href="/" style={{
          position: 'absolute',
          top: 24,
          left: 24,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.2em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'color 0.15s',
        }}>
          &larr; HOME
        </Link>
      </div>

      {/* Right — form panel */}
      <div className="auth-form-panel">
        {/* Mobile brand header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }} className="slide-up">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: '0.06em' }}>
              PENALTY BLITZ
            </span>
          </Link>
        </div>

        <div className="auth-form-inner slide-up-d1">
          {children}
        </div>
      </div>
    </div>
  )
}
