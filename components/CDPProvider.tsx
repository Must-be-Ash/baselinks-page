"use client"

import type React from "react"
import { CDPHooksProvider } from "@coinbase/cdp-hooks"
import { useEffect, useState } from "react"

const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID

if (!projectId) {
  throw new Error("NEXT_PUBLIC_CDP_PROJECT_ID environment variable is not set")
}

const cdpConfig = {
  projectId,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
}

export function CDPProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent SSR issues by only rendering the provider on the client
  if (!isMounted) {
    return <div className="loading-container">Loading...</div>
  }

  return <CDPHooksProvider config={cdpConfig}>{children}</CDPHooksProvider>
}
