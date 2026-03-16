import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
