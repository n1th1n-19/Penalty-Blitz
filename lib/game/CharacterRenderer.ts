import { Kit } from './types'

export interface CharacterPose {
  // Head
  headY: number
  // Torso
  torsoY: number
  // Left arm
  leftArmAngle: number
  // Right arm
  rightArmAngle: number
  // Left leg
  leftLegAngle: number
  // Right leg
  rightLegAngle: number
  // Kick leg (overrides right leg when kicking)
  kickLegAngle: number
  kickLegExtend: number
  // Whole body lean
  bodyLean: number
  // Vertical offset (for jumps)
  offsetY: number
  // Scale
  scale: number
}

export const POSES = {
  idle: (): CharacterPose => ({
    headY: 0,
    torsoY: 0,
    leftArmAngle: 15,
    rightArmAngle: -15,
    leftLegAngle: 0,
    rightLegAngle: 0,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: 0,
    offsetY: 0,
    scale: 1,
  }),
  runup: (t: number): CharacterPose => ({
    headY: Math.sin(t * 0.15) * 2,
    torsoY: Math.sin(t * 0.15) * 1,
    leftArmAngle: Math.sin(t * 0.2) * 50,
    rightArmAngle: -Math.sin(t * 0.2) * 50,
    leftLegAngle: Math.sin(t * 0.2) * 45,
    rightLegAngle: -Math.sin(t * 0.2) * 45,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: -8,
    offsetY: Math.abs(Math.sin(t * 0.2)) * -4,
    scale: 1,
  }),
  kick: (t: number): CharacterPose => {
    const p = Math.min(t / 20, 1)
    return {
      headY: -4,
      torsoY: -2,
      leftArmAngle: -40 + p * 20,
      rightArmAngle: 60 - p * 30,
      leftLegAngle: 20,
      rightLegAngle: 0,
      kickLegAngle: -60 + p * 120,
      kickLegExtend: p * 0.4,
      bodyLean: -15 + p * 10,
      offsetY: -3,
      scale: 1,
    }
  },
  celebrate: (t: number): CharacterPose => ({
    headY: Math.sin(t * 0.2) * 3,
    torsoY: 0,
    leftArmAngle: -120 + Math.sin(t * 0.15) * 20,
    rightArmAngle: 120 - Math.sin(t * 0.15) * 20,
    leftLegAngle: Math.sin(t * 0.2) * 20,
    rightLegAngle: -Math.sin(t * 0.2) * 20,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: Math.sin(t * 0.1) * 5,
    offsetY: Math.abs(Math.sin(t * 0.15)) * -12,
    scale: 1,
  }),
  sad: (t: number): CharacterPose => ({
    headY: 8,
    torsoY: 6,
    leftArmAngle: 40,
    rightArmAngle: -40,
    leftLegAngle: 5,
    rightLegAngle: -5,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: 10,
    offsetY: 4,
    scale: 1,
  }),
  keeperIdle: (t: number): CharacterPose => ({
    headY: 0,
    torsoY: Math.sin(t * 0.05) * 2,
    leftArmAngle: -60 + Math.sin(t * 0.07) * 10,
    rightArmAngle: 60 - Math.sin(t * 0.07) * 10,
    leftLegAngle: Math.sin(t * 0.05) * 8,
    rightLegAngle: -Math.sin(t * 0.05) * 8,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: 0,
    offsetY: 0,
    scale: 1,
  }),
  diveLeft: (t: number): CharacterPose => {
    const p = Math.min(t / 15, 1)
    return {
      headY: -p * 20,
      torsoY: -p * 10,
      leftArmAngle: -140 * p,
      rightArmAngle: -40 * p,
      leftLegAngle: 30 * p,
      rightLegAngle: -10 * p,
      kickLegAngle: 0,
      kickLegExtend: 0,
      bodyLean: -70 * p,
      offsetY: p * 15,
      scale: 1,
    }
  },
  diveRight: (t: number): CharacterPose => {
    const p = Math.min(t / 15, 1)
    return {
      headY: -p * 20,
      torsoY: -p * 10,
      leftArmAngle: 40 * p,
      rightArmAngle: 140 * p,
      leftLegAngle: 10 * p,
      rightLegAngle: -30 * p,
      kickLegAngle: 0,
      kickLegExtend: 0,
      bodyLean: 70 * p,
      offsetY: p * 15,
      scale: 1,
    }
  },
  keeperCatch: (t: number): CharacterPose => ({
    headY: 0,
    torsoY: 0,
    leftArmAngle: -30,
    rightArmAngle: 30,
    leftLegAngle: 10,
    rightLegAngle: -10,
    kickLegAngle: 0,
    kickLegExtend: 0,
    bodyLean: 0,
    offsetY: 0,
    scale: 1,
  }),
}

function hex(color: string): [number, number, number] {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return [r, g, b]
}

function darken(color: string, amount: number): string {
  const [r, g, b] = hex(color)
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`
}

function lighten(color: string, amount: number): string {
  const [r, g, b] = hex(color)
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`
}

// Draw a 3D-looking block (Roblox style)
function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string,
  depth: number = 4
) {
  const face = color
  const top = lighten(color, 40)
  const side = darken(color, 35)

  // Main face
  ctx.fillStyle = face
  ctx.fillRect(x, y, w, h)

  // Top face (lighter)
  ctx.fillStyle = top
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w + depth, y - depth)
  ctx.lineTo(x + depth, y - depth)
  ctx.closePath()
  ctx.fill()

  // Right side face (darker)
  ctx.fillStyle = side
  ctx.beginPath()
  ctx.moveTo(x + w, y)
  ctx.lineTo(x + w + depth, y - depth)
  ctx.lineTo(x + w + depth, y + h - depth)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, w, h)
}

// Draw head
function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, facingAway = false) {
  const hairColor = '#3D2B1F'
  const w = size
  const h = size * 0.95

  if (facingAway) {
    // Show back of head — all hair, no face
    drawBlock(ctx, cx - w / 2, cy - h / 2, w, h, hairColor, 3)
    return
  }

  const skinColor = '#FDBCB4'
  drawBlock(ctx, cx - w / 2, cy - h / 2, w, h, skinColor, 3)

  // Hair on top
  ctx.fillStyle = hairColor
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h * 0.3)

  // Eyes
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(cx - w * 0.25, cy - h * 0.05, w * 0.12, h * 0.12)
  ctx.fillRect(cx + w * 0.13, cy - h * 0.05, w * 0.12, h * 0.12)

  // Mouth
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(cx - w * 0.12, cy + h * 0.2, w * 0.24, h * 0.06)
}

// Draw jersey torso with kit pattern
function drawTorso(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number,
  kit: Kit,
  facingAway = false
) {
  const x = cx - w / 2
  const y = cy - h / 2

  // Base torso
  drawBlock(ctx, x, y, w, h, kit.primary, 4)

  // Pattern overlay
  if (kit.pattern === 'stripes' && kit.stripeColor) {
    const stripeW = w / 5
    for (let i = 0; i < 5; i += 2) {
      ctx.fillStyle = kit.stripeColor
      ctx.fillRect(x + i * stripeW, y, stripeW, h)
    }
  } else if (kit.pattern === 'hoops' && kit.stripeColor) {
    const hoopH = h / 4
    for (let i = 0; i < 4; i += 2) {
      ctx.fillStyle = kit.stripeColor
      ctx.fillRect(x, y + i * hoopH, w, hoopH)
    }
  } else if (kit.pattern === 'sash' && kit.stripeColor) {
    ctx.fillStyle = kit.stripeColor
    ctx.beginPath()
    ctx.moveTo(x + w * 0.2, y)
    ctx.lineTo(x + w * 0.6, y)
    ctx.lineTo(x + w * 0.4, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.fill()
  } else if (kit.pattern === 'half' && kit.stripeColor) {
    ctx.fillStyle = kit.stripeColor
    ctx.fillRect(x + w / 2, y, w / 2, h)
  } else if (kit.pattern === 'diagonal' && kit.stripeColor) {
    ctx.fillStyle = kit.stripeColor
    ctx.beginPath()
    ctx.moveTo(x + w * 0.3, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w * 0.7, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.fill()
  }

  if (!facingAway) {
    // Collar
    ctx.fillStyle = kit.collarColor || kit.secondary
    ctx.fillRect(cx - w * 0.2, y, w * 0.4, h * 0.12)

    // Number
    ctx.fillStyle = kit.numberColor
    ctx.font = `bold ${h * 0.32}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('10', cx, cy + h * 0.1)
  } else {
    // Back number
    ctx.fillStyle = kit.numberColor
    ctx.font = `bold ${h * 0.32}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('10', cx, cy + h * 0.05)
  }

  // Re-outline
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, w, h)
}

// Draw arm
function drawArm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  angle: number,
  kit: Kit
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)
  drawBlock(ctx, -w / 2, 0, w, h, kit.primary, 2)
  // Hand
  ctx.fillStyle = '#FDBCB4'
  ctx.beginPath()
  ctx.arc(0, h + w / 2, w / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Draw leg
function drawLeg(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  angle: number,
  kit: Kit,
  isKick: boolean = false,
  kickExtend: number = 0
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)

  // Upper leg (shorts)
  const upperH = h * 0.45
  drawBlock(ctx, -w / 2, 0, w, upperH, kit.shorts, 2)

  // Lower leg (sock)
  const lowerH = h * 0.45
  drawBlock(ctx, -w / 2, upperH + 2, w, lowerH, kit.socks, 2)

  // Boot
  const bootColor = '#2C2C2C'
  const bootW = w * 1.4
  const bootH = w * 0.7
  if (isKick) {
    // Kick - boot extends forward
    drawBlock(ctx, -w / 2 - w * 0.1, upperH + lowerH + 2, bootW + kickExtend * 8, bootH, bootColor, 2)
  } else {
    drawBlock(ctx, -w / 2 - w * 0.1, upperH + lowerH + 2, bootW, bootH, bootColor, 2)
  }

  ctx.restore()
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  kit: Kit,
  pose: CharacterPose,
  facingLeft: boolean = false,
  isKeeper: boolean = false,
  facingAway: boolean = false
) {
  const s = pose.scale
  const headSize = 22 * s
  const torsoW = 26 * s
  const torsoH = 28 * s
  const armW = 10 * s
  const armH = 22 * s
  const legW = 11 * s
  const legH = 38 * s

  // Total height for ground alignment
  const totalH = headSize + torsoH + legH
  const baseY = groundY - totalH + pose.offsetY

  ctx.save()

  if (facingLeft) {
    ctx.scale(-1, 1)
    cx = -cx
  }

  // Lean
  ctx.translate(cx, baseY + totalH / 2)
  ctx.rotate((pose.bodyLean * Math.PI) / 180)
  ctx.translate(-cx, -(baseY + totalH / 2))

  // Shadow
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(cx, groundY + 3, torsoW * 1.0, 5 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Legs (behind torso)
  const legTopY = baseY + headSize + torsoH - 2

  // Left leg
  drawLeg(
    ctx,
    cx - legW * 0.6,
    legTopY,
    legW, legH,
    pose.leftLegAngle,
    kit,
    false
  )

  // Right leg / kick leg
  const isKicking = Math.abs(pose.kickLegAngle) > 1
  drawLeg(
    ctx,
    cx + legW * 0.6,
    legTopY,
    legW, legH,
    isKicking ? pose.kickLegAngle : pose.rightLegAngle,
    kit,
    isKicking,
    pose.kickLegExtend
  )

  // Left arm (behind torso)
  drawArm(
    ctx,
    cx - torsoW / 2 + armW / 2,
    baseY + headSize + 2,
    armW, armH,
    pose.leftArmAngle,
    kit
  )

  // Torso
  const torsoY = baseY + headSize
  drawTorso(ctx, cx, torsoY + torsoH / 2, torsoW, torsoH, kit, facingAway)

  // Right arm (in front of torso)
  drawArm(
    ctx,
    cx + torsoW / 2 - armW / 2,
    baseY + headSize + 2,
    armW, armH,
    pose.rightArmAngle,
    kit
  )

  // Head
  const headY = baseY + headSize / 2 + pose.headY
  drawHead(ctx, cx, headY, headSize, facingAway)

  ctx.restore()
}

// Draw the ball with rotation
export function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // Ball base
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 1
  ctx.stroke()

  // Pentagon pattern (simplified)
  ctx.fillStyle = '#1A1A1A'
  const pentSize = radius * 0.35
  // Center pentagon
  drawPentagon(ctx, 0, 0, pentSize)
  // Surrounding pentagons
  const dist = radius * 0.62
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    drawPentagon(ctx, Math.cos(angle) * dist, Math.sin(angle) * dist, pentSize * 0.9)
  }

  ctx.restore()
}

function drawPentagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

// Mini character for jersey selection screen
export function drawMiniCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  kit: Kit
) {
  drawCharacter(ctx, cx, groundY, kit, POSES.idle(), false, false)
}
