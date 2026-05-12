import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kickbox',
  description: 'Le tracker de matchs de football. Note, commente, partage.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
