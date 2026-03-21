import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Influencer Growth Suite',
  description: 'AI-powered tools to help you review your content, grow your audience, and monetize your influence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark">
      <body className="bg-gray-950 text-white antialiased">
        <Navigation />
        <main className="pt-14">
          {children}
        </main>
      </body>
    </html>
  )
}
