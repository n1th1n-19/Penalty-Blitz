import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id:       string
      email:    string
      username: string
      level:    number
      xp:       number
      hasSeenTutorial: boolean
    }
  }
}
