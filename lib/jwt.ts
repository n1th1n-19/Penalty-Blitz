import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  id:              string
  email:           string
  username:        string
  level:           number
  xp:              number
  hasSeenTutorial: boolean
}

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
const ALG    = 'HS256'
const EXPIRY = '7d'

export async function signToken(payload: JWTPayload): Promise<{ token: string; expiresAt: string }> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret)
  return { token, expiresAt }
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] })
  return payload as unknown as JWTPayload
}
