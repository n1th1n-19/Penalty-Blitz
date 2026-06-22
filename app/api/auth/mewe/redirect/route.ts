import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const state = crypto.randomUUID()
  cookies().set('mewe_oauth_state', state, { httpOnly: true, maxAge: 300, path: '/' })

  const url = new URL('https://mewe.com/login')
  url.searchParams.set('client_id', process.env.MEWE_CLIENT_ID!)
  url.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/mewe-callback`)
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString())
}
