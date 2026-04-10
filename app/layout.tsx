import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shikshasahayak.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ShikshaSahayak – AI Tutor for NCERT Classes 6–12',
    template: '%s | ShikshaSahayak',
  },
  description:
    'Offline-first NCERT AI tutor for Classes 6–12. RAG-powered explanations, voice input, and structured answers for Mathematics, Science, English, and more. Learn smarter.',
  keywords: [
    'NCERT',
    'AI tutor',
    'Classes 6 to 12',
    'offline learning',
    'RAG',
    'education',
    'India',
    'student',
  ],
  authors: [{ name: 'ShikshaSahayak' }],
  creator: 'ShikshaSahayak',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'ShikshaSahayak',
    title: 'ShikshaSahayak – AI Tutor for NCERT Classes 6–12',
    description: 'Offline-first NCERT AI tutor. Clear explanations, voice input, and structured answers for all subjects.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShikshaSahayak – AI Tutor for NCERT Classes 6–12',
    description: 'Offline-first NCERT AI tutor. Learn smarter.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: siteUrl },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F3460' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a5f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ShikshaSahayak',
    description: 'Offline-first NCERT AI tutor for Classes 6–12. RAG-powered explanations and voice input for all subjects.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  }

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen min-h-[100dvh]`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var p=typeof window!=='undefined'&&window.performance;if(!p)return;if(typeof p.clearMarks!=='function'){p.clearMarks=function(){};}if(typeof p.clearMeasures!=='function'){p.clearMeasures=function(){};}})();",
          }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="shiksha-sahayak-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
