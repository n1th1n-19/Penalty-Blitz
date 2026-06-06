'use client'
import { useSystemStore } from '@/store/systemStore'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'

export default function LeaderboardScreen() {
  const { user, back } = useSystemStore()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      backgroundImage: 'var(--stadium-bg), var(--stadium-grid)',
      backgroundSize: '100% 100%, 72px 72px, 72px 72px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(24px,4vw,48px) 20px 60px' }}>

        <button
          onClick={back}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', background: 'none',
            border: 'none', cursor: 'pointer',
            letterSpacing: '0.2em', display: 'inline-flex',
            alignItems: 'center', gap: 6, marginBottom: 28,
            transition: 'color 0.15s', padding: 0,
          }}
        >
          &larr; BACK
        </button>

        <div style={{ marginBottom: 32 }}>
          <p className="label-mono" style={{ marginBottom: 8 }}>Global Rankings</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 9vw, 60px)',
            color: '#fff',
            letterSpacing: '0.04em',
            lineHeight: 1,
            marginBottom: 16,
          }}>
            LEADERBOARD
          </h1>
          <div className="section-divider">
            <div className="section-divider-dot" />
          </div>
        </div>

        <LeaderboardTable myUserId={user?.id} />
      </div>
    </div>
  )
}
