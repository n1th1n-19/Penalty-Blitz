import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import LandscapeEnforcer from '@/components/LandscapeEnforcer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://penaltyblitz.com'
const TITLE = 'Penalty Blitz'
const DESCRIPTION = 'One keeper, one spot, no mercy. Play the ultimate penalty shootout football game. Compete on the global leaderboard and rep your nation.'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#04071a',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${TITLE}`,
  },
  description: DESCRIPTION,
  keywords: ['penalty shootout', 'football game', 'soccer game', 'penalty kick', 'online football', 'sports game', 'multiplayer football'],
  authors: [{ name: 'Penalty Blitz' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: TITLE,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Penalty Blitz — penalty shootout football game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo/logo.png', type: 'image/png' },
    ],
    apple: { url: '/logo/logo.png', sizes: '192x192', type: 'image/png' },
  },
  other: {
    'mobile-web-app-capable':                'yes',
    'apple-mobile-web-app-capable':          'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title':            TITLE,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <LandscapeEnforcer />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
