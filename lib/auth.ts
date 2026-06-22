import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const prod = process.env.NODE_ENV === 'production'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  // SameSite=None required so cookies are sent when the app runs inside the
  // MeWe iframe (cross-site context). Falls back to Lax on http localhost.
  cookies: prod ? {
    csrfToken: {
      name: '__Host-next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
    callbackUrl: {
      name: '__Secure-next-auth.callback-url',
      options: { sameSite: 'none', path: '/', secure: true },
    },
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
  } : undefined,
  providers: [
    CredentialsProvider({
      name: 'mewe',
      credentials: {
        loginRequestToken: { type: 'text' },
        state:             { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.loginRequestToken) return null

        // Nonce cookie format: "<state>:<appType>" — set server-side, never trusted from client
        const jar = cookies()
        const nonce = jar.get('mewe_auth_nonce')?.value
        if (!nonce) return null

        const colonIdx = nonce.lastIndexOf(':')
        if (colonIdx === -1) return null
        const expected = nonce.slice(0, colonIdx)
        const appType  = nonce.slice(colonIdx + 1) // 'standalone' | 'embedded'

        if (appType !== 'standalone' && appType !== 'embedded') return null

        // Validate state (both flows — embedded nonce also requires matching)
        if (
          !credentials.state ||
          expected.length !== credentials.state.length ||
          !timingSafeEqual(Buffer.from(expected), Buffer.from(credentials.state))
        ) return null

        jar.delete('mewe_auth_nonce')

        const appId  = appType === 'embedded' ? process.env.MEWE_EMBEDDED_APP_ID!  : process.env.MEWE_APP_ID!
        const apiKey = appType === 'embedded' ? process.env.MEWE_EMBEDDED_API_KEY! : process.env.MEWE_API_KEY!

        const tokenRes = await fetch(
          `https://mewe.com/api/dev/token?loginRequestToken=${credentials.loginRequestToken}`,
          { method: 'GET', headers: { 'X-App-Id': appId, 'X-Api-Key': apiKey } }
        )
        if (!tokenRes.ok) return null
        const { apiToken } = await tokenRes.json()

        const profileRes = await fetch('https://mewe.com/api/dev/me', {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-App-Id': appId,
          },
        })
        if (!profileRes.ok) return null
        const profile = await profileRes.json()

        const user = await prisma.user.upsert({
          where:  { meweId: profile.userId },
          update: { username: profile.handle },
          create: { meweId: profile.userId, username: profile.handle },
        })

        return {
          id:              user.id,
          email:           user.email ?? '',
          name:            user.username,
          username:        user.username,
          level:           user.level,
          xp:              user.xp,
          hasSeenTutorial: user.hasSeenTutorial,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }
      if (user) {
        token.id              = user.id
        token.username        = user.username
        token.level           = user.level
        token.xp              = user.xp
        token.hasSeenTutorial = user.hasSeenTutorial
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id              = token.id
        session.user.username        = token.username
        session.user.level           = token.level
        session.user.xp              = token.xp
        session.user.hasSeenTutorial = token.hasSeenTutorial
      }
      return session
    },
  },
}
