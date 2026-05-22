import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    username:        string
    level:           number
    xp:              number
    hasSeenTutorial: boolean
  }

  interface Session {
    user: {
      id:              string
      email:           string
      username:        string
      level:           number
      xp:              number
      hasSeenTutorial: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:              string
    username:        string
    level:           number
    xp:              number
    hasSeenTutorial: boolean
  }
}
