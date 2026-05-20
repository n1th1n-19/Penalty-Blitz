import * as Phaser from 'phaser'

export default class PitchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PitchScene' })
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const g = this.add.graphics()

    // Sky / stadium bg
    g.fillStyle(0x0a0a18, 1)
    g.fillRect(0, 0, W, H)

    // Stadium lights glow (subtle rectangles at top)
    g.fillStyle(0xffffcc, 0.08)
    g.fillRect(0, 0, W, 60)

    // Crowd silhouette
    this.drawCrowd(g, W, H)

    // Pitch
    g.fillStyle(0x2d6e2d, 1)
    g.fillRect(0, H * 0.42, W, H * 0.58)

    // Pitch stripes
    const stripeW = W / 10
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        g.fillStyle(0x286228, 0.6)
        g.fillRect(i * stripeW, H * 0.42, stripeW, H * 0.58)
      }
    }

    // Penalty spot marking
    g.fillStyle(0xffffff, 0.6)
    g.fillCircle(W / 2, H * 0.82, 4)

    // Penalty arc
    g.lineStyle(1, 0xffffff, 0.3)
    g.strokeCircle(W / 2, H * 0.9, 80)

    // Goal net background
    this.drawNet(g, W, H)

    // Goal posts
    this.drawGoalPosts(g, W, H)

    // Grass edge / line at goal line
    g.lineStyle(2, 0xffffff, 0.5)
    g.lineBetween(0, H * 0.65, W, H * 0.65)
  }

  private drawCrowd(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    // Crowd rows
    const crowdH = H * 0.38
    g.fillStyle(0x111128, 1)
    g.fillRect(0, 0, W, crowdH)

    // Heads silhouettes
    const headSizes = [5, 4, 4, 5, 3, 5, 4]
    for (let row = 0; row < 4; row++) {
      const y = crowdH - row * 28 - 14
      const spacing = 14
      for (let i = 0; i < Math.floor(W / spacing); i++) {
        const x = i * spacing + (row % 2) * 7
        const size = headSizes[i % headSizes.length]
        // Occasional coloured shirt
        const isHighlight = (i + row * 3) % 11 === 0
        g.fillStyle(isHighlight ? 0xcc3333 : 0x1a1a3a, 0.85)
        g.fillCircle(x, y, size)
        // Body
        g.fillStyle(isHighlight ? 0xaa2222 : 0x141430, 0.7)
        g.fillRect(x - size * 0.7, y + size, size * 1.4, size * 2.2)
      }
    }
  }

  private drawNet(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const goalLeft = 175
    const goalRight = 625
    const goalTop = H * 0.25
    const goalBottom = H * 0.53
    const netDepth = 28

    // Net back (dark)
    g.fillStyle(0x001a00, 0.9)
    g.fillRect(goalLeft + GOAL_POST_W, goalTop + GOAL_POST_W, goalRight - goalLeft - GOAL_POST_W * 2, goalBottom - goalTop)

    // Net lines horizontal
    g.lineStyle(0.7, 0xffffff, 0.12)
    const netRows = 12
    for (let i = 0; i <= netRows; i++) {
      const ny = goalTop + GOAL_POST_W + (i / netRows) * (goalBottom - goalTop - GOAL_POST_W)
      g.lineBetween(goalLeft + GOAL_POST_W, ny, goalRight - GOAL_POST_W, ny)
    }

    // Net lines vertical
    const netCols = 24
    for (let i = 0; i <= netCols; i++) {
      const nx = goalLeft + GOAL_POST_W + (i / netCols) * (goalRight - goalLeft - GOAL_POST_W * 2)
      g.lineBetween(nx, goalTop + GOAL_POST_W, nx, goalBottom)
    }
  }

  private drawGoalPosts(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const goalLeft = 175
    const goalRight = 625
    const goalTop = H * 0.25
    const goalBottom = H * 0.53
    const postColor = 0xf0f0f0
    const shadowColor = 0xaaaaaa

    // Left post
    g.fillStyle(shadowColor, 1)
    g.fillRect(goalLeft + 3, goalTop + 3, GOAL_POST_W, goalBottom - goalTop)
    g.fillStyle(postColor, 1)
    g.fillRect(goalLeft, goalTop, GOAL_POST_W, goalBottom - goalTop)

    // Right post
    g.fillStyle(shadowColor, 1)
    g.fillRect(goalRight - GOAL_POST_W + 3, goalTop + 3, GOAL_POST_W, goalBottom - goalTop)
    g.fillStyle(postColor, 1)
    g.fillRect(goalRight - GOAL_POST_W, goalTop, GOAL_POST_W, goalBottom - goalTop)

    // Crossbar
    g.fillStyle(shadowColor, 1)
    g.fillRect(goalLeft + 3, goalTop + 3, goalRight - goalLeft, GOAL_POST_W)
    g.fillStyle(postColor, 1)
    g.fillRect(goalLeft, goalTop, goalRight - goalLeft, GOAL_POST_W)
  }
}

const GOAL_POST_W = 8
