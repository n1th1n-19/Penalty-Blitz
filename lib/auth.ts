import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'mewe',
      credentials: {
        loginRequestToken: { type: 'text' },
        state:             { type: 'text' },
      },
      async authorize(credentials) {
        const jar = cookies()
        const expected = jar.get('mewe_oauth_state')?.value

        // Reject if cookie missing, state missing, or mismatch (timing-safe)
        if (
          !expected ||
          !credentials?.state ||
          expected.length !== credentials.state.length ||
          !timingSafeEqual(Buffer.from(expected), Buffer.from(credentials.state))
        ) return null

        jar.delete('mewe_oauth_state')

        if (!credentials.loginRequestToken) return null

        const tokenRes = await fetch(
          `https://mewe.com/api/dev/token?loginRequestToken=${credentials.loginRequestToken}`,
          { method: 'GET', headers: { 'X-App-Id': process.env.MEWE_APP_ID!, 'X-Api-Key': process.env.MEWE_API_KEY! } }
        )
        const tokenBody = await tokenRes.text()
        console.log('[mewe] token exchange status:', tokenRes.status, tokenBody)
        if (!tokenRes.ok) return null
        const { apiToken } = JSON.parse(tokenBody)

        const profileRes = await fetch('https://mewe.com/api/dev/me', {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'X-App-Id': process.env.MEWE_APP_ID!,
          },
        })
        const profileBody = await profileRes.text()
        console.log('[mewe] profile status:', profileRes.status, profileBody)
        if (!profileRes.ok) return null
        const profile = JSON.parse(profileBody)
        // profile: { userId, name, firstName, lastName, handle, ... }

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
        token.id             = user.id
        token.username       = user.username
        token.level          = user.level
        token.xp             = user.xp
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
