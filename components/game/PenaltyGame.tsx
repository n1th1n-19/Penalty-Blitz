'use client'
import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS } from '../../lib/game/kits'
import JerseySelect from './JerseySelect'
import ResultScreen from './ResultScreen'
import DifficultySelect from './DifficultySelect'
import SettingsModal from './SettingsModal'
import { DifficultyKey, DifficultyConfig, DIFFICULTY } from '@/lib/game/difficulty'
import { useSession } from 'next-auth/react'
import { createTutorial } from '@/lib/game/tutorial'
import { xpBreakdown, type Difficulty } from '@/lib/xp'

type Screen = 'jersey' | 'difficulty' | 'game' | 'result'

interface XpResultData {
  goalXp: number
  bonusXp: number
  totalXp: number
  multiplier: number
  xpEarned: number
  newTotalXp: number
  newLevel: number
  leveledUp: boolean
}

// Auto-generate a contrasting keeper kit
function getKeeperKit(playerKit: Kit): Kit {
  // Find a kit with a very different primary colour (just pick a fixed neon green keeper kit)
  return {
    id: 'keeper',
    name: 'Keeper',
    shortName: 'GK',
    type: 'club',
    badge: 'GK',
    primary: '#FF6B00',
    secondary: '#1A1A1A',
    accent: '#FFFFFF',
    shorts: '#1A1A1A',
    socks: '#FF6B00',
    pattern: 'solid',
    collarColor: '#1A1A1A',
    numberColor: '#FFFFFF',
  }
}

interface PenaltyGameProps {
  initialKit?: Kit
}

export default function PenaltyGame({ initialKit }: PenaltyGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [screen, setScreen] = useState<Screen>(initialKit ? 'difficulty' : 'jersey')
  const [playerKit, setPlayerKit] = useState<Kit>(initialKit ?? CLUB_KITS[0])
  const [finalScore, setFinalScore] = useState({ player: 0, cpu: 0 })
  const [difficulty, setDifficulty] = useState<DifficultyKey>('medium')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [difficultyConfig, setDifficultyConfig] = useState<DifficultyConfig>(DIFFICULTY['medium'])
  const [xpResult, setXpResult] = useState<XpResultData | null>(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const { data: session } = useSession()
  const tutorialFiredRef = useRef(false)

  const startGame = async (kit: Kit) => {
    setPlayerKit(kit)
    setScreen('difficulty')
  }

  const handleDifficultySelect = async (key: DifficultyKey) => {
    const config = DIFFICULTY[key]
    setDifficulty(key)
    setDifficultyConfig(config)
    setScreen('game')

    // Dynamically import Phaser (client only)
    const Phaser = await import('phaser')
    const GameScene = (await import('../../lib/game/scenes/GameScene')).default
    const PitchScene = (await import('../../lib/game/scenes/PitchScene')).default

    if (!containerRef.current) return

    // Destroy existing game
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }

    const W = window.innerWidth
    const H = window.innerHeight

    const kit = playerKit
    const keeperKit = getKeeperKit(kit)

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: W,
      height: H,
      parent: containerRef.current,
      backgroundColor: '#0a0a18',
      scene: [PitchScene, GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      callbacks: {
        postBoot: (game) => {
          const gameScene = game.scene.getScene('GameScene') as any
          if (gameScene) {
            gameScene.scene.start('GameScene', {
              playerKit: kit,
              keeperKit,
              difficulty: key,
              difficultyConfig: config,
              onGameOver: async (p: number, c: number) => {
                setFinalScore({ player: p, cpu: c })

                if (session?.user?.id) {
                  try {
                    const res = await fetch('/api/scores', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ goalsScored: p, difficulty: key }),
                    })
                    if (res.ok) {
                      const apiData = await res.json()
                      const breakdown = xpBreakdown(p, key as Difficulty)
                      setXpResult({
                        ...breakdown,
                        xpEarned:   apiData.xpEarned,
                        newTotalXp: apiData.totalXp,
                        newLevel:   apiData.newLevel,
                        leveledUp:  apiData.leveledUp,
                      })
                    } else {
                      setXpResult(null)
                    }
                  } catch {
                    setXpResult(null)
                  }
                } else {
                  setXpResult(null)
                }

                setTimeout(() => setScreen('result'), 1000)
              },
            })
          }
        }
      }
    })

    // Start PitchScene first (background), GameScene on top
    game.scene.start('PitchScene')

    gameRef.current = game
  }

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (screen !== 'game') return

    const tryLock = async () => {
      try { await window.screen.orientation.lock('landscape') }
      catch { /* iOS Safari, desktop — ignore */ }
    }
    tryLock()

    const mq = window.matchMedia('(orientation: portrait) and (max-width: 1024px)')
    setIsPortrait(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)

    return () => {
      mq.removeEventListener('change', handler)
      try { window.screen.orientation.unlock() } catch { /* ignore */ }
      setIsPortrait(false)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'game') return
    if (session?.user?.hasSeenTutorial) return
    if (tutorialFiredRef.current) return
    tutorialFiredRef.current = true

    const timer = setTimeout(() => {
      const t = createTutorial(() => {
        fetch('/api/auth/tutorial-seen', { method: 'PATCH' }).catch(() => {})
      })
      t.drive()
    }, 1500)

    return () => clearTimeout(timer)
  }, [screen, session?.user?.hasSeenTutorial])

  const getGameScene = () => gameRef.current?.scene.getScene('GameScene') as any

  return (
    <div style={{ width: '100%', height: '100dvh', background: '#0a0f0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {screen === 'jersey' && (
        <div style={{ width: '100%', height: '100%' }}>
          <JerseySelect onSelect={startGame} />
        </div>
      )}

      {screen === 'difficulty' && (
        <div style={{ width: '100%', height: '100%' }}>
          <DifficultySelect onSelect={handleDifficultySelect} />
        </div>
      )}

      {screen === 'game' && (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {isPortrait && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 100,
              background: '#040d06',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20,
            }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.7 }}>
                <rect x="16" y="4" width="24" height="40" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
                <path d="M10 28 A18 18 0 0 1 28 10" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <polyline points="24,6 28,10 24,14" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <p style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase', margin: 0,
              }}>
                ROTATE TO PLAY
              </p>
            </div>
          )}
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="absolute top-3 right-3 z-10 bg-white bg-opacity-20 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-opacity-30"
          >
            SETTINGS
          </button>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            defaultDifficulty={difficulty}
            onDifficultyChange={(k) => {
                setDifficulty(k)
                getGameScene()?.setDifficultyConfig(DIFFICULTY[k])
              }}
              onControlsChange={(s) => {
                getGameScene()?.setControlScheme(s)
              }}
            onReplayTutorial={() => {
              setSettingsOpen(false)
              const t = createTutorial(() => {})
              t.drive()
            }}
          />
        </div>
      )}

      {screen === 'result' && (
        <div style={{ width: '100%', height: '100%' }}>
          <ResultScreen
            playerScore={finalScore.player}
            cpuScore={finalScore.cpu}
            playerKit={playerKit}
            xpResult={xpResult}
            onRestart={() => {
              if (gameRef.current) {
                gameRef.current.destroy(true)
                gameRef.current = null
              }
              setXpResult(null)
              setScreen(initialKit ? 'difficulty' : 'jersey')
            }}
          />
        </div>
      )}
    </div>
  )
}
