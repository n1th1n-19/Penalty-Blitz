import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function MenuPage() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&display=swap');

        .menu-root {
          min-height: 100dvh;
          background-color: #040d06;
          background-image:
            radial-gradient(ellipse 110% 55% at 50% -8%, #0d3320 0%, transparent 68%),
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 100% 100%, 72px 72px, 72px 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 0 24px;
        }

        .menu-root::before {
          content: '';
          position: absolute;
          bottom: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 50% 50% 0 0;
          pointer-events: none;
        }

        .menu-root::after {
          content: '';
          position: absolute;
          bottom: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 200px;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .title-solid {
          font-family: 'Anton', sans-serif;
          font-size: clamp(64px, 18vw, 128px);
          line-height: 0.9;
          letter-spacing: 0.03em;
          color: #fff;
          display: block;
        }

        .title-outline {
          font-family: 'Anton', sans-serif;
          font-size: clamp(64px, 18vw, 128px);
          line-height: 0.9;
          letter-spacing: 0.03em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
          display: block;
        }

        .tagline {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-top: 14px;
        }

        .nav-btn {
          display: block;
          width: 100%;
          padding: 15px 24px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.8);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.3);
          color: #fff;
        }

        .nav-btn-play {
          background: #15803d;
          border-color: #15803d;
          color: #fff;
          font-size: 13px;
        }
        .nav-btn-play:hover {
          background: #16a34a;
          border-color: #16a34a;
        }

        .auth-bar {
          position: absolute;
          top: 0;
          right: 0;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
        }
        .auth-link {
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .auth-link:hover { color: rgba(255,255,255,0.9); }
        .auth-link-green {
          color: #4ade80;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .auth-link-green:hover { color: #86efac; }

        .divider { color: rgba(255,255,255,0.15); }

        .copyright {
          position: absolute;
          bottom: 16px;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.1);
          text-transform: uppercase;
        }
      `}</style>

      <div className="menu-root">

        {/* Auth top-right */}
        <div className="auth-bar">
          {session ? (
            <>
              <Link href={`/profile/${session.user.username}`} className="auth-link-green">
                {session.user.username} &middot; Lv.{session.user.level}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="auth-link">Sign in</Link>
              <span className="divider">/</span>
              <Link href="/register" className="auth-link-green">Register</Link>
            </>
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="title-solid">PENALTY</span>
          <span className="title-outline">BLITZ</span>
          <p className="tagline">Five shots &mdash; one keeper &mdash; no mercy</p>
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

        <p className="copyright">Penalty Blitz &copy; {new Date().getFullYear()}</p>
      </div>
    </>
  )
}
