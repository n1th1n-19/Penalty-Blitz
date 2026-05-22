import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import NavBar from '@/components/NavBar'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Penalty Blitz',
  description: 'Penalty shootout football game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
