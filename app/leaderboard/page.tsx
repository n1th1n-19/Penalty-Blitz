import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <main style={{
      minHeight: '100dvh',
      background: '#040d06',
      backgroundImage: 'radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(20px,4vw,36px) 20px clamp(40px,6vw,60px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 7vw, 42px)',
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            LEADERBOARD
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href="/game"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#4ade80',
                textDecoration: 'none',
                padding: '8px 14px',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 8,
                background: 'rgba(74,222,128,0.08)',
                transition: 'background 0.15s',
              }}
            >
              ▶ PLAY
            </Link>
            <Link
              href="/main"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                padding: '8px 14px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                transition: 'background 0.15s',
              }}
            >
              ← BACK
            </Link>
          </div>
        </div>

        <LeaderboardTable myUserId={session?.user?.id} />
      </div>
    </main>
  )
}
