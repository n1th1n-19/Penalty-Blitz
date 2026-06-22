import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()
  cookies().set('mewe_auth_nonce', `${state}:embedded`, {
    httpOnly: true,
    maxAge: 300,
    path: '/',
    sameSite: 'lax',
  })
  return NextResponse.json({ state })
}
