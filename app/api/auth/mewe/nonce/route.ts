import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()
  const prod = process.env.NODE_ENV === 'production'
  cookies().set('mewe_auth_nonce', `${state}:embedded`, {
    httpOnly: true,
    maxAge: 300,
    path: '/',
    sameSite: prod ? 'none' : 'lax',
    secure: prod,
  })
  return NextResponse.json({ state })
}
