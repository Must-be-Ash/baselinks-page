"use client"

import type React from "react"
import { CDPHooksProvider } from "@coinbase/cdp-hooks"
import { useEffect, useState } from "react"

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "",
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
}

export function CDPProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Validate environment variable on client side
    if (!process.env.NEXT_PUBLIC_CDP_PROJECT_ID) {
      console.error("NEXT_PUBLIC_CDP_PROJECT_ID environment variable is not set")
    }
  }, [])

  // Prevent SSR issues by only rendering the provider on the client
  if (!isMounted) {
    return <div className="loading-container">Loading...</div>
  }

  return <CDPHooksProvider config={cdpConfig}>{children}</CDPHooksProvider>
}
