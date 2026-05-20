'use client'
import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { Kit } from '../../lib/game/types'
import { CLUB_KITS } from '../../lib/game/kits'
import JerseySelect from './JerseySelect'
import ResultScreen from './ResultScreen'

type Screen = 'jersey' | 'game' | 'result'

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

export default function PenaltyGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [screen, setScreen] = useState<Screen>('jersey')
  const [playerKit, setPlayerKit] = useState<Kit>(CLUB_KITS[0])
  const [finalScore, setFinalScore] = useState({ player: 0, cpu: 0 })

  const startGame = async (kit: Kit) => {
    setPlayerKit(kit)
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
              onGameOver: (p: number, c: number) => {
                setFinalScore({ player: p, cpu: c })
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

  return (
    <div style={{ width: '100%', height: '100dvh', background: '#0a0f0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {screen === 'jersey' && (
        <div style={{ width: '100%', height: '100%' }}>
          <JerseySelect onSelect={startGame} />
        </div>
      )}

      {screen === 'game' && (
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}

      {screen === 'result' && (
        <div style={{ width: '100%', height: '100%' }}>
          <ResultScreen
            playerScore={finalScore.player}
            cpuScore={finalScore.cpu}
            playerKit={playerKit}
            onRestart={() => {
              if (gameRef.current) {
                gameRef.current.destroy(true)
                gameRef.current = null
              }
              setScreen('jersey')
            }}
          />
        </div>
      )}
    </div>
  )
}
