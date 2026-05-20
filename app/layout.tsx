import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Penalty Shootout',
  description: 'Penalty shootout football game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="rotate-prompt">
          <svg viewBox="0 0 24 24" fill="none" stroke="#4a8a4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
          <p>ROTATE DEVICE</p>
        </div>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            screen.orientation.lock('landscape').catch(function(){});
          } catch(e) {}
        `}} />
      </body>
    </html>
  )
}
