import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateUsername, USERNAME_ERROR_MESSAGES } from '@/lib/username-filter'

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json()

  if (!email || !username || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const usernameResult = validateUsername(username)
  if (!usernameResult.ok) {
    return NextResponse.json(
      { error: USERNAME_ERROR_MESSAGES[usernameResult.error] },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: { equals: username, mode: 'insensitive' } },
      ],
    },
  })

  if (existing?.email === email.toLowerCase()) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email:    email.toLowerCase(),
      username,
      passwordHash,
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
