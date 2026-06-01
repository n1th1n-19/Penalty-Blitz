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
import { isTouchDevice, isFirstVisitMobile } from '@/lib/game/mobile-controls'
import MobileGameHUD, { type GameSceneBridge } from './MobileGameHUD'

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
  const containerRef   = useRef<HTMLDivElement>(null)
  const gameRef        = useRef<Phaser.Game | null>(null)
  const sceneBridgeRef = useRef<GameSceneBridge | null>(null)

  const [screen, setScreen]               = useState<Screen>(initialKit ? 'difficulty' : 'jersey')
  const [playerKit, setPlayerKit]         = useState<Kit>(initialKit ?? CLUB_KITS[0])
  const [finalScore, setFinalScore]       = useState({ player: 0, cpu: 0 })
  const [difficulty, setDifficulty]       = useState<DifficultyKey>('medium')
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [difficultyConfig, setDifficultyConfig] = useState<DifficultyConfig>(DIFFICULTY['medium'])
  const [xpResult, setXpResult]           = useState<XpResultData | null>(null)
  const [isTouch, setIsTouch]             = useState(false)

  const { data: session } = useSession()
  const tutorialFiredRef  = useRef(false)

  // Detect touch device client-side
  useEffect(() => { setIsTouch(isTouchDevice()) }, [])

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
      sceneBridgeRef.current = null
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
            // Connect bridge ref to the live GameScene
            sceneBridgeRef.current = gameScene as unknown as GameSceneBridge
          }
        }
      }
    })

    game.scene.start('PitchScene')
    gameRef.current = game
  }

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
        sceneBridgeRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (screen !== 'game') return
    if (session?.user?.hasSeenTutorial) return
    if (tutorialFiredRef.current) return
    tutorialFiredRef.current = true

    const mobile = isTouchDevice()
    const timer = setTimeout(() => {
      const t = createTutorial(() => {
        fetch('/api/auth/tutorial-seen', { method: 'PATCH' }).catch(() => {})
      }, mobile)
      t.drive()
    }, 1500)

    return () => clearTimeout(timer)
  }, [screen, session?.user?.hasSeenTutorial])

  const getGameScene = () => gameRef.current?.scene.getScene('GameScene') as any

  return (
    <div style={{ width: '100%', height: '100dvh', background: '#040d06', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          {/* Phaser canvas container */}
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />

          {/* Mobile HUD overlay (touch only) */}
          {isTouch && (
            <MobileGameHUD
              sceneRef={sceneBridgeRef}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          {/* Desktop settings button (hidden on mobile since HUD has one) */}
          {!isTouch && (
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '7px 12px',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              ⚙ SETTINGS
            </button>
          )}

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
              const t = createTutorial(() => {}, isTouchDevice())
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
                sceneBridgeRef.current = null
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
