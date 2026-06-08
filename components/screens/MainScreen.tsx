'use client'
import { useState, useEffect } from 'react'
import { audio } from '@/lib/game/audio'
import { useSystemStore } from '@/store/systemStore'
import { signOut } from 'next-auth/react'
import { XpBar, Icon, StatCard } from '@/components/ui/PbUi'
import { CharacterCanvas } from '@/components/ui/CharacterCanvas'
import SettingsModal from '@/components/game/SettingsModal'

export default function MainScreen() {
  const { user, navigate } = useSystemStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    audio.play('menuMusic')
    return () => { audio.stop('menuMusic') }
  }, [])

  if (!user) return null
  const { username, level, xp, kit } = user

  const accuracy = Math.round(
    ((user as any).totalGoals ?? 0) /
    Math.max(1, (user as any).totalShots ?? 1) * 100
  )

  const navItems = [
    { id: 'leaderboard', icon: 'trophy',  label: 'Leaderboard', action: () => navigate({ screen: 'leaderboard' }) },
    { id: 'kit',         icon: 'shirt',   label: 'Customize',   action: () => navigate({ screen: 'kit-select' }) },
    { id: 'profile',     icon: 'user',    label: 'My Profile',  action: () => navigate({ screen: 'profile', username }) },
    { id: 'settings',    icon: 'gear',    label: 'Settings',    action: () => setSettingsOpen(true) },
  ]

  return (
    <>
      <div className="pb-stadium hub-root">
        <style>{`
          @media(min-width:820px){
            .pb-hub-left{border-right:1px solid var(--bd);border-bottom:none!important;height:100dvh;}
            .pb-hub-right{height:100dvh;overflow-y:auto;}
          }
        `}</style>

        {/* Left — character */}
        <div className="hub-left pb-hub-left a-slide">
          <p className="mono-label" style={{ color: 'var(--lime)', letterSpacing: '0.42em' }}>Penalty Blitz</p>
          <CharacterCanvas kit={kit} size={210} />
          <button
            onClick={() => navigate({ screen: 'kit-select' })}
            className="pb-btn pb-btn-ghost"
            style={{ maxWidth: 210, fontSize: 10 }}
          >
            <Icon name="shirt" size={14} /> Change Kit
          </button>
        </div>

        {/* Right — nav */}
        <div className="hub-right pb-hub-right" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User card */}
          <div className="pb-card a-slide" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p className="mono-label" style={{ marginBottom: 5 }}>Player</p>
                <h2 className="display" style={{ fontSize: 'clamp(22px,5vw,32px)', color: '#fff' }}>{username}</h2>
              </div>
              <span className="pb-pill" style={{ background: 'rgba(200,255,0,0.12)', border: '1px solid var(--bd-lime)', color: 'var(--lime)', fontSize: 13, padding: '7px 15px' }}>
                LV.{level}
              </span>
            </div>
            <XpBar xp={xp} />
          </div>

          {/* Play card */}
          <button
            onClick={() => navigate({ screen: 'game' })}
            className="a-slide-1"
            style={{
              width: '100%', textAlign: 'left', border: '1px solid var(--bd-lime)',
              cursor: 'pointer', borderRadius: 'var(--r-card)',
              padding: 'clamp(22px,3vw,30px) clamp(20px,3vw,26px)',
              background: 'linear-gradient(135deg, #0a1206 0%, #18300a 55%, var(--lime) 240%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              transition: 'box-shadow .2s, transform .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 36px rgba(200,255,0,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            <div>
              <p className="mono-label" style={{ color: 'rgba(200,255,0,0.7)', marginBottom: 8 }}>Ready to compete?</p>
              <p className="display" style={{ fontSize: 'clamp(28px,6vw,46px)', color: '#fff' }}>PLAY NOW</p>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--lime)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#020402', boxShadow: '0 0 24px var(--lime-glow)',
            }}>
              <Icon name="play" size={20} />
            </div>
          </button>

          {/* Quick stats */}
          <div className="a-slide-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <StatCard value={(user as any).bestStreak ?? 0} label="Best Streak" color="var(--lime)" />
            <StatCard value={(user as any).totalGoals ?? 0} label="Goals" color="var(--cyan)" />
            <StatCard value={accuracy + '%'} label="Accuracy" color="var(--gold)" />
          </div>

          {/* Nav grid */}
          <div className="a-slide-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {navItems.map(n => (
              <button
                key={n.id}
                onClick={n.action}
                style={{
                  background: 'rgba(255,255,255,0.025)', border: '1px solid var(--bd)',
                  borderRadius: 'var(--r-card)', padding: 'clamp(15px,2vw,20px)',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 11, minHeight: 84,
                  transition: 'background .15s, border-color .15s, transform .1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(200,255,0,0.08)', border: '1px solid var(--bd-lime)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)',
                }}>
                  <Icon name={n.icon} size={18} />
                </div>
                <span className="mono-label" style={{ fontSize: 11, color: 'var(--txt-2)' }}>{n.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="pb-btn pb-btn-ghost a-slide-4"
            style={{ width: '100%', borderColor: 'transparent', color: 'var(--txt-3)', fontSize: 10, marginTop: 2 }}
          >
            <Icon name="signout" size={14} /> Sign Out
          </button>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal open onClose={() => setSettingsOpen(false)} />
      )}
    </>
  )
}
