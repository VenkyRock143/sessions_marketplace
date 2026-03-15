import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sessions Marketplace',
  description: 'Book expert-led sessions on any topic',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
