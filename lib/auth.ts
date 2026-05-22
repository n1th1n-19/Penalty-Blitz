import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:       user.id,
          email:    user.email,
          name:     user.username,
          username: user.username,
          level:    user.level,
          xp:       user.xp,
          hasSeenTutorial: user.hasSeenTutorial,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.username = (user as any).username
        token.level    = (user as any).level
        token.xp       = (user as any).xp
        token.hasSeenTutorial = (user as any).hasSeenTutorial
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id as string
        session.user.username = token.username as string
        session.user.level    = token.level as number
        session.user.xp       = token.xp as number
        session.user.hasSeenTutorial = token.hasSeenTutorial as boolean
      }
      return session
    },
  },
}
