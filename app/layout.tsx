import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import LandscapeEnforcer from '@/components/LandscapeEnforcer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#040d06',
}

export const metadata: Metadata = {
  title: 'Penalty Blitz',
  description: 'Penalty shootout football game',
  other: {
    'mobile-web-app-capable':          'yes',
    'apple-mobile-web-app-capable':    'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title':      'Penalty Blitz',
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
