export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#040d06',
      backgroundImage: 'radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: 'clamp(24px,5vw,36px)',
      }}>
        <h1 style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 32,
          color: '#fff',
          letterSpacing: '0.06em',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          PENALTY BLITZ
        </h1>
        {children}
      </div>
    </div>
  )
}
