import * as Phaser from 'phaser'

const POST_W = 8
// These must match GameScene getters exactly
const GL  = 0.21875   // GOAL_LEFT  / W
const GR  = 0.78125   // GOAL_RIGHT / W
const GT  = 0.25      // GOAL_Y_TOP    / H
const GB  = 0.53      // GOAL_Y_BOTTOM / H

export default class PitchScene extends Phaser.Scene {
  constructor() { super({ key: 'PitchScene' }) }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const g = this.add.graphics()

    this.drawBackground(g, W, H)
    this.drawCrowd(g, W, H)
    this.drawPitch(g, W, H)
    this.drawPenaltyBox(g, W, H)
    this.drawNet(g, W, H)
    this.drawGoalPosts(g, W, H)
    this.drawAtmosphere(g, W, H)
  }

  // ─── Background ────────────────────────────────────────────────────────────

  private drawBackground(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    g.fillStyle(0x04040f, 1)
    g.fillRect(0, 0, W, H)

    // Upper gradient bands
    const bands = [
      { c: 0x080820, a: 1.0 },
      { c: 0x0c0c28, a: 0.9 },
      { c: 0x101030, a: 0.7 },
    ]
    const bh = H * 0.14
    bands.forEach(({ c, a }, i) => {
      g.fillStyle(c, a)
      g.fillRect(0, i * bh, W, bh)
    })
  }

  // ─── Crowd ─────────────────────────────────────────────────────────────────

  private drawCrowd(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const crowdBot = H * 0.41

    // Tiered stands
    const tiers = [
      { y: 0,        h: H * 0.10, c: 0x0b0b20 },
      { y: H * 0.10, h: H * 0.12, c: 0x0f0f28 },
      { y: H * 0.22, h: H * 0.14, c: 0x131335 },
      { y: H * 0.36, h: H * 0.05, c: 0x18183a },
    ]
    for (const t of tiers) {
      g.fillStyle(t.c, 1)
      g.fillRect(0, t.y, W, t.h)
    }

    // Floodlights — four columns
    const lx = [W * 0.07, W * 0.3, W * 0.7, W * 0.93]
    for (const x of lx) {
      // Pole
      g.fillStyle(0x444455, 1)
      g.fillRect(x - 2, H * 0.02, 4, H * 0.18)
      // Glow halo
      g.fillStyle(0xffffaa, 0.09)
      g.fillCircle(x, H * 0.04, 70)
      g.fillStyle(0xffffcc, 0.20)
      g.fillCircle(x, H * 0.04, 35)
      // Bulb
      g.fillStyle(0xffffff, 1)
      g.fillCircle(x, H * 0.04, 5)
    }

    // Crowd heads
    const kitColors = [0x1a1a3a, 0xcc3333, 0x2244cc, 0x228844, 0xcc8800, 0x882299, 0x336699]
    for (let row = 0; row < 5; row++) {
      const y = crowdBot - row * 20 - 8
      const spacing = 13
      for (let i = 0; i <= Math.floor(W / spacing); i++) {
        const x = i * spacing + (row % 2) * 6
        const sz = [4, 5, 4, 3, 5, 4][i % 6]
        const coloured = (i * 2 + row * 5) % 7 < 2
        const c = coloured ? kitColors[(i + row * 3) % kitColors.length] : 0x141430
        g.fillStyle(c, 0.88)
        g.fillCircle(x, y, sz)
        g.fillStyle(c - 0x0a0a0a, 0.65)
        g.fillRect(x - sz * 0.7, y + sz, sz * 1.4, sz * 1.8)
      }
    }
  }

  // ─── Pitch surface ─────────────────────────────────────────────────────────

  private drawPitch(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const pitchTop = H * 0.41
    g.fillStyle(0x29682a, 1)
    g.fillRect(0, pitchTop, W, H - pitchTop)

    // Horizontal alternating stripes — looks correct from a goal-end camera
    const stripes = 16
    for (let i = 0; i < stripes; i++) {
      if (i % 2 === 0) {
        g.fillStyle(0x245e25, 0.5)
        const sy = pitchTop + (i / stripes) * (H - pitchTop)
        g.fillRect(0, sy, W, (H - pitchTop) / stripes)
      }
    }
  }

  // ─── Penalty box ───────────────────────────────────────────────────────────

  private drawPenaltyBox(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    /*
     * Perspective: lines converge toward the goal.
     * Each horizontal level has its own left/right x values.
     *
     * goalLine  H*0.61  — widest horizontal on-pitch line, at base of goal
     * sixFront  H*0.71  — front of 6-yard box
     * penFront  H*0.83  — front of penalty area
     * spotY     H*0.755 — penalty spot
     */
    const goalLine = H * 0.61
    const sixFront = H * 0.71
    const penFront  = H * 0.83
    const spotY    = H * 0.755

    // Box widths at each depth (perspective: narrower near goal, wider near camera)
    const goalGoalL = W * GL - W * 0.03   // 6-yd at goal line
    const goalGoalR = W * GR + W * 0.03
    const sixFrontL = W * GL - W * 0.07   // 6-yd at front
    const sixFrontR = W * GR + W * 0.07

    const penGoalL  = W * GL - W * 0.14   // penalty area at goal line
    const penGoalR  = W * GR + W * 0.14
    const penFrontL = W * 0.01             // penalty area at front
    const penFrontR = W * 0.99

    g.lineStyle(2, 0xffffff, 0.80)

    // ── Goal line (full pitch width) ──
    g.lineBetween(0, goalLine, W, goalLine)

    // ── 6-yard box ──
    // front line
    g.lineBetween(sixFrontL, sixFront, sixFrontR, sixFront)
    // left side (trapezoid)
    g.lineBetween(goalGoalL, goalLine, sixFrontL, sixFront)
    // right side
    g.lineBetween(goalGoalR, goalLine, sixFrontR, sixFront)

    // ── Penalty area ──
    // front line
    g.lineBetween(penFrontL, penFront, penFrontR, penFront)
    // left side
    g.lineBetween(penGoalL, goalLine, penFrontL, penFront)
    // right side
    g.lineBetween(penGoalR, goalLine, penFrontR, penFront)

    // ── Penalty spot ──
    g.fillStyle(0xffffff, 0.90)
    g.fillCircle(W / 2, spotY, 5)

    // ── Penalty D ──
    // Arc centered at spot; shows only the portion outside (below) the penalty area front.
    // Real ratio: arc-radius / (front-to-spot distance) = 9.15 / 5.5 ≈ 1.664
    const distToFront = penFront - spotY          // pixels from spot to front line
    const arcR = distToFront * 1.664              // D radius in pixels
    const intDY = distToFront                     // dy to intersection point
    const intDX = Math.sqrt(arcR * arcR - intDY * intDY)  // dx to intersection

    // Angles: from center toward each intersection, then arc through the bottom
    const startA = Math.atan2(intDY,  intDX)      // right intersection (~37°)
    const endA   = Math.PI - startA               // left  intersection (~143°)

    g.lineStyle(2, 0xffffff, 0.80)
    g.beginPath()
    g.arc(W / 2, spotY, arcR, startA, endA, false)
    g.strokePath()
  }

  // ─── Net ───────────────────────────────────────────────────────────────────

  private drawNet(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const l = W * GL + POST_W
    const r = W * GR - POST_W
    const t = H * GT + POST_W
    const b = H * GB

    // Back net fill
    g.fillStyle(0x001200, 0.94)
    g.fillRect(l, t, r - l, b - t)

    // Net bulge gradient — darker at back corners
    g.fillStyle(0x000800, 0.4)
    g.fillTriangle(l, t, r, t, W / 2, (t + b) / 2)

    // Horizontal lines
    const rows = 16
    g.lineStyle(0.7, 0xffffff, 0.13)
    for (let i = 0; i <= rows; i++) {
      const ny = t + (i / rows) * (b - t)
      g.lineBetween(l, ny, r, ny)
    }

    // Vertical lines — slight perspective (converge toward centre at top)
    const cols = 30
    g.lineStyle(0.7, 0xffffff, 0.13)
    for (let i = 0; i <= cols; i++) {
      const frac = i / cols
      const xt = l + frac * (r - l)                           // x at top (straight)
      const xb = l + frac * (r - l)                           // x at bottom
      g.lineBetween(xt, t, xb, b)
    }

    // Front net shadow (depth strip below crossbar)
    g.fillStyle(0x000000, 0.30)
    g.fillRect(l, t, r - l, (b - t) * 0.12)
  }

  // ─── Goal posts & crossbar ─────────────────────────────────────────────────

  private drawGoalPosts(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    const gl = W * GL
    const gr = W * GR
    const gt = H * GT
    const gb = H * GB
    const ph = gb - gt      // post height
    const pw = POST_W

    const SHADOW    = 0x888888
    const MID       = 0xdddddd
    const HIGHLIGHT = 0xffffff

    // ── Left post ──
    // shadow face (right side)
    g.fillStyle(SHADOW, 1)
    g.fillRect(gl + pw * 0.55, gt, pw * 0.45, ph)
    // main face
    g.fillStyle(MID, 1)
    g.fillRect(gl, gt, pw * 0.7, ph)
    // highlight stripe
    g.fillStyle(HIGHLIGHT, 1)
    g.fillRect(gl, gt, pw * 0.22, ph)

    // ── Right post ──
    // shadow face (left side, since light comes from left)
    g.fillStyle(SHADOW, 1)
    g.fillRect(gr - pw, gt, pw * 0.45, ph)
    // main face
    g.fillStyle(MID, 1)
    g.fillRect(gr - pw * 0.7, gt, pw * 0.7, ph)
    // highlight stripe
    g.fillStyle(HIGHLIGHT, 1)
    g.fillRect(gr - pw * 0.22, gt, pw * 0.22, ph)

    // ── Crossbar ──
    // bottom shadow
    g.fillStyle(SHADOW, 1)
    g.fillRect(gl, gt + pw * 0.6, gr - gl, pw * 0.4)
    // main face
    g.fillStyle(MID, 1)
    g.fillRect(gl, gt, gr - gl, pw * 0.75)
    // top highlight
    g.fillStyle(HIGHLIGHT, 1)
    g.fillRect(gl, gt, gr - gl, pw * 0.2)

    // ── Post base caps (small squares where posts meet ground line) ──
    g.fillStyle(0xaaaaaa, 1)
    g.fillRect(gl - 1, gb - 4, pw + 2, 5)
    g.fillRect(gr - pw - 1, gb - 4, pw + 2, 5)
  }

  // ─── Atmosphere overlays ───────────────────────────────────────────────────

  private drawAtmosphere(g: Phaser.GameObjects.Graphics, W: number, H: number) {
    // Light cone from each floodlight to pitch
    const coneColor = 0xffffee
    const sources = [W * 0.07, W * 0.3, W * 0.7, W * 0.93]
    const lightY = H * 0.04
    const pitchY = H * 0.42
    for (const sx of sources) {
      g.fillStyle(coneColor, 0.025)
      g.fillTriangle(sx - 20, lightY, sx + 20, lightY, W / 2, pitchY)
    }

    // Subtle vignette on pitch edges
    g.fillStyle(0x000000, 0.25)
    g.fillRect(0, H * 0.41, W * 0.06, H * 0.59)
    g.fillRect(W * 0.94, H * 0.41, W * 0.06, H * 0.59)
  }
}
