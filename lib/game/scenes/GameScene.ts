import * as Phaser from 'phaser'
import { Kit, Zone, Height } from '../types'
import { KeeperAI } from '../ai/KeeperAI'
import { drawCharacter, drawBall, POSES, CharacterPose } from '../CharacterRenderer'

type GamePhase =
  | 'intro'
  | 'player_idle'
  | 'aiming'
  | 'power'
  | 'runup'
  | 'kick'
  | 'ball_flying'
  | 'result'
  | 'cpu_thinking'
  | 'round_end'
  | 'game_over'

export default class GameScene extends Phaser.Scene {
  private playerKit!: Kit
  private keeperKit!: Kit
  private ai!: KeeperAI
  private canvas2d!: HTMLCanvasElement
  private ctx2d!: CanvasRenderingContext2D
  private phaserCanvas!: Phaser.GameObjects.Image

  // All positions proportional to viewport — computed each access
  private get GOAL_LEFT()     { return this.scale.width  * 0.21875 }
  private get GOAL_RIGHT()    { return this.scale.width  * 0.78125 }
  private get GOAL_X()        { return this.scale.width  * 0.5 }
  private get GOAL_Y_TOP()    { return this.scale.height * 0.25 }
  private get GOAL_Y_BOTTOM() { return this.scale.height * 0.53 }
  private get GOAL_POST_W()   { return 8 }
  private get PLAYER_X()      { return this.scale.width  * 0.5 }
  private get KEEPER_X()      { return this.scale.width  * 0.5 }
  private get PLAYER_GROUND() { return this.scale.height * 0.767 }
  private get KEEPER_GROUND() { return this.scale.height * 0.541 }

  private phase: GamePhase = 'intro'
  private tick = 0

  // Aim
  private aimX = 0
  private aimY = 0
  private lockedZone: Zone = 'centre'
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  // Power
  private power = 0
  private powerDir = 1
  private powerSpeed = 1.8
  private lockedPower = 0
  private lockedHeight: Height = 'bottom'

  // Ball
  private ballX = 0
  private ballY = 0
  private ballTargetX = 0
  private ballTargetY = 0
  private ballStartX = 0
  private ballStartY = 0
  private ballT = 0
  private ballRotation = 0

  // Keeper
  private keeperOffset = 0
  private keeperDiveDir: Zone = 'centre'
  private keeperDiveHeight: Height = 'bottom'
  private keeperPose: CharacterPose = POSES.keeperIdle(0)

  // Player
  private playerPose: CharacterPose = POSES.idle()
  private runupTick = 0

  // Scores
  private playerScore = 0
  private round = 1
  private maxRounds = 5

  // Result
  private lastResult: 'goal' | 'saved' | 'missed' = 'goal'
  private resultTick = 0

  // UI text
  private aimIndicator!: Phaser.GameObjects.Graphics
  private powerBarBg!: Phaser.GameObjects.Graphics
  private powerBarFill!: Phaser.GameObjects.Graphics
  private uiText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private roundText!: Phaser.GameObjects.Text
  private instructText!: Phaser.GameObjects.Text
  private aiReadText!: Phaser.GameObjects.Text

  private onGameOver?: (playerScore: number, totalRounds: number) => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { playerKit: Kit; keeperKit: Kit; onGameOver?: (p: number, c: number) => void }) {
    this.playerKit = data.playerKit
    this.keeperKit = data.keeperKit
    this.onGameOver = data.onGameOver
    this.ai = new KeeperAI()
    this.playerScore = 0
    this.round = 1
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // Initialise position state now that scale is available
    this.aimX = this.GOAL_X
    this.aimY = (this.GOAL_Y_TOP + this.GOAL_Y_BOTTOM) / 2
    this.ballX = this.PLAYER_X
    this.ballY = this.PLAYER_GROUND - 10
    this.ballTargetX = this.GOAL_X
    this.ballTargetY = this.GOAL_Y_BOTTOM
    this.ballStartX = this.PLAYER_X
    this.ballStartY = this.PLAYER_GROUND - 10

    // Offscreen canvas for 2D character rendering
    this.canvas2d = document.createElement('canvas')
    this.canvas2d.width = W
    this.canvas2d.height = H
    this.ctx2d = this.canvas2d.getContext('2d')!

    // Add as Phaser texture
    this.textures.addCanvas('char_canvas', this.canvas2d)
    this.phaserCanvas = this.add.image(W / 2, H / 2, 'char_canvas')
    this.phaserCanvas.setDepth(5)

    // Aim indicator
    this.aimIndicator = this.add.graphics().setDepth(10)

    // Power bar
    this.powerBarBg = this.add.graphics().setDepth(10)
    this.powerBarFill = this.add.graphics().setDepth(10)

    // Score
    this.scoreText = this.add.text(W / 2, 18, '', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(20)

    // Round
    this.roundText = this.add.text(W / 2, 46, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#CCCCCC',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(20)

    // Result text
    this.resultText = this.add.text(W / 2, H / 2 - 60, '', {
      fontSize: '42px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30).setAlpha(0)

    // Instruction
    this.instructText = this.add.text(W / 2, H - 55, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFFF99',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000088',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(20)

    // AI read text
    this.aiReadText = this.add.text(W - 10, H - 20, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#FF8888',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 1).setDepth(20)

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.input.on('pointerdown', this.handleTap, this)
    this.input.keyboard?.on('keydown-SPACE', this.handleTap, this)

    this.phase = 'player_idle'
    this.updateScoreUI()

    this.time.delayedCall(600, () => {
      this.phase = 'aiming'
      this.instructText.setText('← → to aim  |  SPACE to confirm')
    })
  }

  private handleTap = () => {
    if (this.phase === 'aiming') {
      this.lockAim()
    } else if (this.phase === 'power') {
      this.lockPower()
    }
  }

  private lockAim() {
    const zoneWidth = (this.GOAL_RIGHT - this.GOAL_LEFT) / 3
    const relX = this.aimX - this.GOAL_LEFT
    if (relX < zoneWidth) this.lockedZone = 'left'
    else if (relX < zoneWidth * 2) this.lockedZone = 'centre'
    else this.lockedZone = 'right'

    this.lockedHeight = this.aimY < (this.GOAL_Y_TOP + this.GOAL_Y_BOTTOM) / 2 ? 'top' : 'bottom'

    this.phase = 'power'
    this.power = 0
    this.powerDir = 1
    this.instructText.setText('SPACE to set power!')
  }

  private lockPower() {
    this.lockedPower = this.power

    const prediction = this.ai.predictShot()
    this.keeperDiveDir = prediction.zone
    this.keeperDiveHeight = prediction.height
    this.ai.recordShot(this.lockedZone, this.lockedHeight, this.round, this.lockedPower)

    const zoneWidth = (this.GOAL_RIGHT - this.GOAL_LEFT) / 3
    const zoneX: Record<Zone, number> = {
      left:   this.GOAL_LEFT + zoneWidth * 0.5,
      centre: this.GOAL_LEFT + zoneWidth * 1.5,
      right:  this.GOAL_LEFT + zoneWidth * 2.5,
    }

    this.ballTargetX = zoneX[this.lockedZone] + (Math.random() - 0.5) * 20
    this.ballTargetY = this.lockedHeight === 'top'
      ? this.GOAL_Y_TOP    + 20 + Math.random() * 30
      : this.GOAL_Y_BOTTOM - 20 - Math.random() * 30

    const isMiss = this.lockedPower < 5 || this.lockedPower > 95
    if (isMiss) {
      if (this.lockedPower > 95) {
        this.ballTargetY = this.GOAL_Y_TOP - 40
      } else {
        this.ballTargetX = Math.random() > 0.5 ? this.GOAL_LEFT - 30 : this.GOAL_RIGHT + 30
      }
    }

    this.ballStartX = this.PLAYER_X
    this.ballStartY = this.PLAYER_GROUND - 10
    this.ballT = 0

    this.phase = 'runup'
    this.runupTick = 0
    this.instructText.setText('')
    this.powerBarBg.clear()
    this.powerBarFill.clear()
  }

  private isGoal(): boolean {
    const inX = this.ballTargetX > this.GOAL_LEFT + this.GOAL_POST_W && this.ballTargetX < this.GOAL_RIGHT - this.GOAL_POST_W
    const inY = this.ballTargetY > this.GOAL_Y_TOP && this.ballTargetY < this.GOAL_Y_BOTTOM + 10

    if (!inX || !inY) return false

    const zoneWidth = (this.GOAL_RIGHT - this.GOAL_LEFT) / 3
    const keeperZoneX: Record<Zone, number> = {
      left:   this.GOAL_LEFT + zoneWidth * 0.5,
      centre: this.GOAL_LEFT + zoneWidth * 1.5,
      right:  this.GOAL_LEFT + zoneWidth * 2.5,
    }
    const keeperReach = zoneWidth * 0.7
    const diveX = keeperZoneX[this.keeperDiveDir]
    const dx = Math.abs(diveX - this.ballTargetX)

    if (dx < keeperReach) {
      if (this.keeperDiveHeight === this.lockedHeight && Math.random() > 0.35) {
        return false
      }
      if (Math.random() > 0.55) return false
    }

    return true
  }

  private determineResult(): 'goal' | 'saved' | 'missed' {
    const inX = this.ballTargetX > this.GOAL_LEFT + this.GOAL_POST_W && this.ballTargetX < this.GOAL_RIGHT - this.GOAL_POST_W
    const inY = this.ballTargetY > this.GOAL_Y_TOP && this.ballTargetY < this.GOAL_Y_BOTTOM + 10
    if (!inX || !inY) return 'missed'
    return this.isGoal() ? 'goal' : 'saved'
  }

  private showResult(result: 'goal' | 'saved' | 'missed') {
    this.lastResult = result
    this.resultTick = 0
    this.phase = 'result'

    if (result === 'goal') {
      this.playerScore++
      this.resultText.setText('GOAL!')
      this.resultText.setColor('#00FF88')
    } else if (result === 'saved') {
      this.resultText.setText('SAVED!')
      this.resultText.setColor('#FF4444')
    } else {
      this.resultText.setText('MISSED!')
      this.resultText.setColor('#FF8800')
    }

    this.resultText.setAlpha(1)
    this.updateScoreUI()

    this.time.delayedCall(2200, () => {
      this.resultText.setAlpha(0)
      this.round++

      const gameOver = this.checkGameOver()
      if (gameOver) return

      this.resetForNextRound()
    })
  }

  private checkGameOver(): boolean {
    if (this.round > this.maxRounds) {
      this.phase = 'game_over'
      this.time.delayedCall(500, () => {
        if (this.onGameOver) this.onGameOver(this.playerScore, this.maxRounds)
      })
      return true
    }
    return false
  }

  private resetForNextRound() {
    this.ballX = this.PLAYER_X
    this.ballY = this.PLAYER_GROUND - 10
    this.aimX = this.GOAL_X
    this.aimY = (this.GOAL_Y_TOP + this.GOAL_Y_BOTTOM) / 2
    this.power = 0
    this.keeperOffset = 0
    this.keeperDiveHeight = 'bottom'
    this.playerPose = POSES.idle()
    this.keeperPose = POSES.keeperIdle(0)
    this.phase = 'player_idle'
    this.updateScoreUI()

    this.time.delayedCall(400, () => {
      this.phase = 'aiming'
      this.instructText.setText('← → to aim  |  SPACE to confirm')
    })
  }

  private updateScoreUI() {
    this.scoreText.setText(`GOALS  ${this.playerScore} / ${this.maxRounds}`)
    const roundLabel = `ROUND ${this.round} / ${this.maxRounds}`
    this.roundText.setText(roundLabel)

    if (this.ai.getShotCount() > 0) {
      const w = this.ai.getWeights()
      this.aiReadText.setText(
        `Keeper reads: L ${Math.round(w.left)}%  C ${Math.round(w.centre)}%  R ${Math.round(w.right)}%`
      )
    }
  }

  update(time: number, delta: number) {
    this.tick++
    const W = this.scale.width
    const H = this.scale.height

    if (this.phase === 'aiming') {
      if (this.cursors.left.isDown) {
        this.aimX = Math.max(this.GOAL_LEFT + 10, this.aimX - 4)
      } else if (this.cursors.right.isDown) {
        this.aimX = Math.min(this.GOAL_RIGHT - 10, this.aimX + 4)
      }
      if (this.cursors.up.isDown) {
        this.aimY = Math.max(this.GOAL_Y_TOP + 15, this.aimY - 3)
      } else if (this.cursors.down.isDown) {
        this.aimY = Math.min(this.GOAL_Y_BOTTOM - 15, this.aimY + 3)
      }
    }

    if (this.phase === 'power') {
      this.power += this.powerDir * this.powerSpeed
      if (this.power >= 100) { this.power = 100; this.powerDir = -1 }
      if (this.power <= 0)   { this.power = 0;   this.powerDir =  1 }
    }

    if (this.phase === 'runup') {
      this.runupTick++
      this.playerPose = POSES.runup(this.runupTick)
      if (this.runupTick >= 40) {
        this.phase = 'kick'
        this.tick = 0
      }
    }

    if (this.phase === 'kick') {
      this.playerPose = POSES.kick(this.tick)
      if (this.tick >= 25) {
        this.phase = 'ball_flying'
        this.ballT = 0
        this.lastResult = this.determineResult()
        // Keeper faces player (mirrored), so diveLeft/Right are swapped relative to screen zones
        if (this.keeperDiveDir === 'left') {
          this.keeperPose = POSES.diveRight(0)
        } else if (this.keeperDiveDir === 'right') {
          this.keeperPose = POSES.diveLeft(0)
        }
      }
    }

    if (this.phase === 'ball_flying') {
      this.ballT += 0.038
      const t = Math.min(this.ballT, 1)

      const arc = Math.sin(t * Math.PI) * H * 0.067
      this.ballX = this.ballStartX + (this.ballTargetX - this.ballStartX) * t
      this.ballY = this.ballStartY + (this.ballTargetY - this.ballStartY) * t - arc
      this.ballRotation += 0.18

      const zoneWidth = (this.GOAL_RIGHT - this.GOAL_LEFT) / 3
      const p = Math.min(this.ballT * 3, 1)
      if (this.keeperDiveDir === 'left') {
        const pose = POSES.diveRight(this.ballT * 30)
        pose.offsetY = this.keeperDiveHeight === 'top' ? -p * H * 0.25 : p * 15
        this.keeperPose = pose
        this.keeperOffset = -zoneWidth * p
      } else if (this.keeperDiveDir === 'right') {
        const pose = POSES.diveLeft(this.ballT * 30)
        pose.offsetY = this.keeperDiveHeight === 'top' ? -p * H * 0.25 : p * 15
        this.keeperPose = pose
        this.keeperOffset = zoneWidth * p
      }

      if (t >= 1) {
        this.showResult(this.lastResult)
        if (this.lastResult === 'goal') {
          this.playerPose = POSES.celebrate(0)
        } else {
          this.playerPose = POSES.sad(0)
        }
      }
    }

    if (this.phase === 'result') {
      this.resultTick++
      if (this.lastResult === 'goal') {
        this.playerPose = POSES.celebrate(this.resultTick)
      } else {
        this.playerPose = POSES.sad(this.resultTick)
      }
    }

    if (this.phase === 'player_idle' || this.phase === 'aiming' || this.phase === 'power') {
      this.keeperPose = POSES.keeperIdle(this.tick)
      this.playerPose = POSES.idle()
    }

    this.renderFrame(W, H)
  }

  private renderFrame(W: number, H: number) {
    const ctx = this.ctx2d

    ctx.clearRect(0, 0, W, H)

    drawCharacter(ctx, this.KEEPER_X + this.keeperOffset, this.KEEPER_GROUND, this.keeperKit, this.keeperPose, true, true)

    const showPlayer = this.phase !== 'game_over'
    if (showPlayer) {
      drawCharacter(ctx, this.PLAYER_X, this.PLAYER_GROUND, this.playerKit, this.playerPose, false, false, true)
    }

    const ballVisible = !['player_idle'].includes(this.phase)
    if (ballVisible) {
      const ballR = this.phase === 'ball_flying'
        ? Math.max(4, 10 * (1 - this.ballT * 0.3))
        : 10
      drawBall(ctx, this.ballX, this.ballY, ballR, this.ballRotation)
    }

    this.textures.get('char_canvas').source[0].update()

    // Aim cursor
    this.aimIndicator.clear()
    if (this.phase === 'aiming') {
      this.aimIndicator.lineStyle(2, 0xFFFF00, 0.9)
      this.aimIndicator.strokeCircle(this.aimX, this.aimY, 12)
      this.aimIndicator.lineStyle(1, 0xFFFF00, 0.5)
      this.aimIndicator.lineBetween(this.aimX, this.aimY - 18, this.aimX, this.aimY + 18)
      this.aimIndicator.lineBetween(this.aimX - 18, this.aimY, this.aimX + 18, this.aimY)
    }

    // Power bar
    this.powerBarBg.clear()
    this.powerBarFill.clear()
    if (this.phase === 'power') {
      const bw = W * 0.325
      const bh = Math.max(16, H * 0.037)
      const bx = W / 2 - bw / 2
      const by = H - H * 0.14

      this.powerBarBg.fillStyle(0x222222, 0.85)
      this.powerBarBg.fillRoundedRect(bx, by, bw, bh, 4)
      this.powerBarBg.lineStyle(1, 0x666666, 1)
      this.powerBarBg.strokeRoundedRect(bx, by, bw, bh, 4)

      const dangerX = bx + bw * 0.85
      this.powerBarFill.fillStyle(0x44CC44, 1)
      this.powerBarFill.fillRect(bx + 2, by + 2, Math.min((this.power / 100) * (bw - 4), (bw - 4) * 0.84), bh - 4)
      if (this.power > 85) {
        this.powerBarFill.fillStyle(0xFF3333, 1)
        this.powerBarFill.fillRect(dangerX, by + 2, Math.min(((this.power - 85) / 15) * (bw * 0.15 - 2), bw * 0.15 - 2), bh - 4)
      }
    }
  }

  destroy() {
    this.input.off('pointerdown', this.handleTap, this)
  }
}
