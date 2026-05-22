export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/main', '/main/:path*', '/leaderboard', '/profile/:path*'],
}
