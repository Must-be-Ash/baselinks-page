import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from '@vercel/analytics/react'
import "./globals.css"
import { CDPProvider } from "@/components/CDPProvider"

// Environment variables
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!
const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE!
const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION!
const SITE_KEYWORDS = process.env.NEXT_PUBLIC_SITE_KEYWORDS!
const OG_IMAGE = process.env.NEXT_PUBLIC_OG_IMAGE!

export const viewport: Viewport = {
  themeColor: "#0052ff",
}

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS.split(','),
  authors: [{ name: SITE_NAME }],
  generator: 'CDP',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/logo.png' },
    ],
    other: [
      { 
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192'
      },
      { 
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}${OG_IMAGE}`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - DevRel at Coinbase Developer Platform`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}${OG_IMAGE}`],
    creator: "@Must_be_Ash",
  },
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CDPProvider>
          {children}
          <Analytics />
        </CDPProvider>
      </body>
    </html>
  )
}
