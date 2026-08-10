import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import Navigation from '@/components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mobility Partner Portal',
  description: 'One Account. All Of Mobility. Your fleet, financed, managed, and serviced — all in one place.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-cat-gray min-h-screen`}>
        <UserProvider>
          <Navigation />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}
