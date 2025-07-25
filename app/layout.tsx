import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CDPProvider } from "@/components/CDPProvider"

export const metadata: Metadata = {
  title: "Ash Nouruzi - Linktree",
  description: "DevRel at Coinbase Developer Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CDPProvider>{children}</CDPProvider>
      </body>
    </html>
  )
}
