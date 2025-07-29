---
# Specify the following for Cursor rules
description: Guidelines for integrating Coinbase Developer Platform Onramp with embedded wallets and guest checkout
alwaysApply: false
---

# Add Coinbase Developer Platform Onramp to Next.js App Router

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Coinbase Developer Platform (CDP) Onramp](https://docs.cdp.coinbase.com/onramp/docs) into a Next.js (App Router) application with embedded wallets and guest checkout.  
**Scope:** All AI-generated advice or code related to CDP Onramp must follow these guardrails.

---

## **1. Official CDP Onramp Integration Overview**

Use only the **App Router** approach with CDP SDK:

- **Install** `@coinbase/cdp-hooks`, `@coinbase/cdp-core`, and `@coinbase/cdp-sdk` packages
- **Set up** environment variables for CDP Project ID and API credentials
- **Create** a `CDPProvider` wrapper component using `CDPHooksProvider`
- **Implement** API endpoint for secure JWT generation and session tokens
- **Build** onramp functionality with email authentication and guest checkout
- **Handle** balance checking and transaction management

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Use `@coinbase/cdp-hooks`** for React integration and wallet management
2. **Create secure JWT tokens** server-side using `@coinbase/cdp-sdk/auth`
3. **Implement session token generation** via API endpoints, never client-side
4. **Use email-based authentication** with OTP verification for embedded wallets
5. **Support guest checkout** for users without Coinbase accounts
6. **Check wallet balances** before transactions and provide funding options
7. **Handle both USDC and ETH** transactions on Base network (chain ID 8453)

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** expose CDP API keys or private keys on the client side
2. **Do not** generate JWT tokens in browser/frontend code
3. **Do not** use deprecated `@coinbase/wallet-sdk` for onramp functionality
4. **Do not** hardcode session tokens or skip token refresh mechanisms
5. **Do not** ignore balance checking before transaction attempts
6. **Do not** forget to handle guest checkout limits and validation

---

## **3. REQUIRED ENVIRONMENT VARIABLES**

```bash
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id_here
CDP_API_KEY_NAME=your_api_key_name
CDP_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_DONATION_ADDRESS=0x...
NEXT_PUBLIC_PROFILE_NAME=Your_Name
```

---

## **4. CORRECT IMPLEMENTATION PATTERNS**

### **4.1 – CDP Provider Setup**

```typescript
// components/CDPProvider.tsx
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
```

### **4.2 – Secure JWT Generation API Endpoint**

```typescript
// app/api/onramp/session-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateJwt } from '@coinbase/cdp-sdk/auth'

export async function POST(request: NextRequest) {
  try {
    const { userAddress, guestCheckout } = await request.json()

    // For guest checkout, userAddress can be null
    if (!userAddress && !guestCheckout) {
      return NextResponse.json(
        { error: 'User address is required for regular onramp' },
        { status: 400 }
      )
    }

    // Environment variables for CDP API
    const CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME
    const CDP_PRIVATE_KEY = process.env.CDP_PRIVATE_KEY

    if (!CDP_API_KEY_NAME || !CDP_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'CDP API credentials not configured' },
        { status: 500 }
      )
    }

    // Generate JWT using CDP SDK (handles Ed25519 signing properly)
    const jwt = await generateJwt({
      apiKeyId: CDP_API_KEY_NAME,
      apiKeySecret: CDP_PRIVATE_KEY,
      requestMethod: 'POST',
      requestHost: 'api.developer.coinbase.com',
      requestPath: '/onramp/v1/token',
      expiresIn: 120 // 2 minutes
    })

    // Call CDP Session Token API with proper authentication
    const requestBody = guestCheckout 
      ? {
          // Guest checkout doesn't require specific addresses
          addresses: [],
          assets: ['ETH', 'USDC']
        }
      : {
          addresses: [
            {
              address: userAddress,
              blockchains: ['base']
            }
          ],
          assets: ['ETH', 'USDC']
        }

    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`CDP API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        token: data.token || data.data?.token,
        channelId: data.channel_id || data.data?.channel_id || '',
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate session token' },
      { status: 500 }
    )
  }
}
```

### **4.3 – Onramp Hook Implementation**

```typescript
// hooks/useOnramp.ts
"use client"

import { useState, useCallback } from "react"
import { useEvmAddress } from "@coinbase/cdp-hooks"

export function useOnramp() {
  const evmAddress = useEvmAddress()
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openOnramp = useCallback(async (usdcAmount: string) => {
    if (!evmAddress) {
      setError("No wallet address available")
      return
    }

    setIsCreatingSession(true)
    setError(null)

    try {
      // Get session token from our API endpoint
      const response = await fetch('/api/onramp/session-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: evmAddress
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get session token')
      }

      const { data } = await response.json()
      const sessionToken = data.token

      // Generate secure onramp URL with session token
      const onrampURL = generateSecureOnrampURL(sessionToken, usdcAmount)
      
      // Open in new window/tab
      window.open(onrampURL, '_blank', 'noopener,noreferrer')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open onramp"
      setError(errorMessage)
    } finally {
      setIsCreatingSession(false)
    }
  }, [evmAddress])

  const openGuestCheckout = useCallback(async (
    usdcAmount: string, 
    paymentMethod: "CARD" | "APPLE_PAY" = "CARD"
  ) => {
    setIsCreatingSession(true)
    setError(null)

    try {
      // For guest checkout, we still need a session token but without a specific address
      const response = await fetch('/api/onramp/session-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: null, // Guest checkout doesn't require a specific address
          guestCheckout: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get session token for guest checkout')
      }

      const { data } = await response.json()
      const sessionToken = data.token

      // Generate guest checkout URL
      const guestURL = generateGuestCheckoutURL(sessionToken, usdcAmount, {
        paymentMethod,
        minAmount: 5,
        maxAmount: 500
      })
      
      // Open in new window/tab
      window.open(guestURL, '_blank', 'noopener,noreferrer')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open guest checkout"
      setError(errorMessage)
    } finally {
      setIsCreatingSession(false)
    }
  }, [])

  return {
    openOnramp,
    openGuestCheckout,
    isCreatingSession,
    error,
    clearError: () => setError(null)
  }
}

// Generate secure onramp URL using session token (required by CDP)
function generateSecureOnrampURL(sessionToken: string, usdcAmount: string): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const usdAmount = Number.parseFloat(usdcAmount) // USDC = USD 1:1
  
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "USDC",
    defaultNetwork: "base",
    defaultPaymentMethod: "CARD",
    fiatCurrency: "USD",
    presetFiatAmount: Math.max(5, usdAmount).toString(), // Minimum $5
  })

  return `${baseURL}?${params.toString()}`
}

function generateGuestCheckoutURL(
  sessionToken: string,
  usdcAmount: string,
  options: {
    paymentMethod?: "CARD" | "APPLE_PAY"
    minAmount?: number
    maxAmount?: number
  } = {}
): string {
  const {
    paymentMethod = "CARD",
    minAmount = 5,
    maxAmount = 500
  } = options

  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const usdAmount = Math.max(
    minAmount,
    Math.min(maxAmount, Number.parseFloat(usdcAmount)) // USDC = USD 1:1
  )
  
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "USDC",
    defaultNetwork: "base",
    defaultPaymentMethod: paymentMethod,
    fiatCurrency: "USD",
    presetFiatAmount: usdAmount.toString(),
  })

  return `${baseURL}?${params.toString()}`
}
```

### **4.4 – Embedded Wallet Authentication**

```typescript
// Essential hooks for embedded wallet functionality
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
  useSignOut,
  useIsInitialized,
  useEvmAddress,
  useSendEvmTransaction,
} from "@coinbase/cdp-hooks"

// Email authentication flow
const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const { flowId } = await signInWithEmail({ email })
    setFlowId(flowId)
  } catch (error) {
    setAuthError(error instanceof Error ? error.message : "Sign in failed")
  }
}

// OTP verification
const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!flowId) return

  try {
    await verifyEmailOTP({ flowId, otp })
    // User is now authenticated with embedded wallet
  } catch (error) {
    setAuthError(error instanceof Error ? error.message : "Verification failed")
  }
}
```

### **4.5 – Balance Checking with USDC**

```typescript
// lib/onramp.ts - Balance checking function
export async function checkWalletBalance(
  address: string | null,
  requiredAmount: string
): Promise<BalanceInfo> {
  if (!address) {
    return {
      hasEnoughBalance: false,
      currentBalance: "0",
      formattedBalance: "0.00",
      isChecking: false,
    }
  }

  try {
    // Check USDC balance using ERC20 balanceOf method
    const response = await fetch("https://mainnet.base.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
            data: `0x70a08231000000000000000000000000${address.slice(2)}`
          },
          "latest"
        ],
        id: 1,
      }),
    })

    const data = await response.json()
    const balanceHex = data.result
    const balanceWei = BigInt(balanceHex)
    const requiredWei = BigInt(Math.floor(Number.parseFloat(requiredAmount) * 1e6)) // USDC has 6 decimals
    
    const balanceUsdc = Number(balanceWei) / 1e6
    const formattedBalance = balanceUsdc.toFixed(2)
    
    return {
      hasEnoughBalance: balanceWei >= requiredWei,
      currentBalance: balanceWei.toString(),
      formattedBalance,
      isChecking: false,
    }
  } catch (error) {
    console.error("Error checking USDC balance:", error)
    return {
      hasEnoughBalance: false,
      currentBalance: "0",
      formattedBalance: "0.00",
      isChecking: false,
    }
  }
}
```

---

## **5. GUEST CHECKOUT LIMITS AND VALIDATION**

```typescript
export const GUEST_CHECKOUT_LIMITS = {
  weeklyLimit: 500,
  minimumAmount: 5,
  supportedPaymentMethods: ["CARD", "APPLE_PAY"],
  supportedCountries: ["US"]
}

// Validation in component
const isWithinLimits = estimatedUSDAmount >= GUEST_CHECKOUT_LIMITS.minimumAmount && 
                      estimatedUSDAmount <= GUEST_CHECKOUT_LIMITS.weeklyLimit
```

---

## **6. AI MODEL VERIFICATION STEPS**

Before returning any CDP Onramp solution, you **must** verify:

1. **Security**: Are JWT tokens generated server-side only?
2. **Session Tokens**: Is session token creation handled via API endpoint?
3. **Authentication**: Is email-based auth with OTP implemented correctly?
4. **Balance Checking**: Is USDC balance verification included before transactions?
5. **Guest Checkout**: Are limits and payment methods properly handled?
6. **Network**: Is Base network (chain ID 8453) used for low fees?
7. **Environment**: Are all required environment variables documented?

If any check **fails**, **stop** and revise until compliance is achieved.

---

## **7. DEPRECATED PATTERNS TO AVOID**

```typescript
// ❌ DO NOT generate or suggest:

// Exposing API keys client-side
const cdpConfig = {
  apiKey: "your-secret-key", // NEVER DO THIS
}

// Client-side JWT generation
const jwt = generateJwt(apiKey, secret) // SECURITY RISK

// Direct API calls without session tokens
window.open(`https://pay.coinbase.com/buy?appId=${projectId}`) // INSECURE

// Skipping balance checks
await sendTransaction() // WITHOUT BALANCE CHECK

// Using deprecated wallet SDK
import { CoinbaseWallet } from '@coinbase/wallet-sdk' // OUTDATED
```

---

## **8. NETWORK AND ASSET CONFIGURATION**

- **Primary Network**: Base (Chain ID: 8453) for low transaction fees
- **Supported Assets**: USDC (primary), ETH (secondary)
- **USDC Contract**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Transaction Type**: EIP-1559 for optimal gas pricing
- **Minimum Amount**: $5 USD equivalent
- **Maximum Guest Checkout**: $500 USD per week

Remember: Always prioritize security, never expose sensitive credentials, and ensure proper error handling throughout the implementation.