import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Kanexa',
    default: 'Kanexa | Freight Agency',
  },
  description:
    'Kanexa is a licensed and bonded freight agency moving FTL, LTL, intermodal, specialized, expedited, and government freight across all 48 states.',
  metadataBase: new URL('https://kanexagroup.com'),
  openGraph: {
    title: 'Kanexa | Freight Agency',
    description:
      'Reliable, transparent freight brokerage for manufacturers, enterprise shippers, and government contractors.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col pb-20 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
