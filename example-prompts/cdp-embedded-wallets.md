---
# Specify the following for Cursor rules
description: Guidelines for integrating Coinbase Developer Platform Embedded Wallets with email authentication
alwaysApply: false
---

# Add Coinbase Developer Platform Embedded Wallets to Next.js App Router

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Coinbase Developer Platform (CDP) Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets/docs) into a Next.js (App Router) application.  
**Scope:** All AI-generated advice or code related to CDP Embedded Wallets must follow these guardrails.

---

## **1. Official CDP Embedded Wallets Integration Overview**

Use only the **App Router** approach with CDP SDK:

- **Install** `@coinbase/cdp-hooks` and `@coinbase/cdp-core` packages
- **Set up** CDP Project ID and configure the provider
- **Implement** email-based authentication with OTP verification
- **Handle** wallet address generation and management
- **Support** EVM transactions on Base network
- **Manage** user sessions and authentication state

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Use `@coinbase/cdp-hooks`** for all wallet operations and authentication
2. **Implement email + OTP authentication** - no external wallet connections required
3. **Handle SSR considerations** with proper client-side mounting protection
4. **Check initialization state** before rendering wallet functionality
5. **Provide clear loading states** during authentication and transactions
6. **Handle authentication errors** gracefully with user-friendly messages
7. **Support sign out functionality** to clear wallet sessions

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** use external wallet providers like MetaMask or WalletConnect for embedded wallets
2. **Do not** expose CDP API credentials on the client side
3. **Do not** skip initialization checks - this causes SSR hydration issues
4. **Do not** forget to handle email validation and OTP format restrictions
5. **Do not** ignore error states in authentication flows
6. **Do not** assume wallet address is immediately available after sign-in

---

## **3. REQUIRED ENVIRONMENT VARIABLES**

```bash
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id_here
```

---

## **4. CORRECT IMPLEMENTATION PATTERNS**

### **4.1 – CDP Provider Setup with SSR Protection**

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

### **4.2 – Root Layout Integration**

```typescript
// app/layout.tsx
import { CDPProvider } from '@/components/CDPProvider'

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
        </CDPProvider>
      </body>
    </html>
  )
}
```

### **4.3 – Complete Authentication Component**

```typescript
// components/WalletAuth.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
  useSignOut,
  useIsInitialized,
  useEvmAddress,
} from "@coinbase/cdp-hooks"
import { Loader2 } from "lucide-react"

export function WalletAuth() {
  const isInitialized = useIsInitialized()
  const currentUser = useCurrentUser()
  const evmAddress = useEvmAddress()
  const signInWithEmail = useSignInWithEmail()
  const verifyEmailOTP = useVerifyEmailOTP()
  const signOut = useSignOut()

  const [isMounted, setIsMounted] = useState(false)
  
  // Authentication state
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [flowId, setFlowId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Wait for client-side mounting and SDK initialization
  if (!isMounted || !isInitialized) {
    return (
      <div className="wallet-loading">
        <Loader2 className="loading-spinner" />
        <p>Initializing wallet...</p>
      </div>
    )
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { flowId } = await signInWithEmail({ email })
      setFlowId(flowId)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign in failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flowId) return

    setAuthLoading(true)
    setAuthError(null)

    try {
      await verifyEmailOTP({ flowId, otp })
      // Reset form state
      setFlowId(null)
      setOtp("")
      setEmail("")
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setEmail("")
      setOtp("")
      setFlowId(null)
      setAuthError(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign out failed")
    }
  }

  // OTP verification state
  if (flowId) {
    return (
      <div className="wallet-auth">
        <h3>Enter Verification Code</h3>
        <p>We sent a 6-digit code to {email}</p>

        {authError && <div className="error-message">{authError}</div>}

        <form onSubmit={handleOtpSubmit} className="auth-form">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="otp-input"
            maxLength={6}
            disabled={authLoading}
            required
          />
          <button type="submit" disabled={authLoading || otp.length !== 6} className="auth-button">
            {authLoading ? (
              <>
                <Loader2 className="loading-icon" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setFlowId(null)
              setOtp("")
              setAuthError(null)
            }}
            className="back-button"
          >
            Back to Email
          </button>
        </form>
        <p className="powered-by">Powered by Coinbase • No wallet needed</p>
      </div>
    )
  }

  // Authenticated state - show wallet info
  if (currentUser && evmAddress) {
    return (
      <div className="wallet-dashboard">
        <h3>Wallet Connected</h3>
        <div className="wallet-info">
          <p>Email: {currentUser.email}</p>
          <p>
            Address: 
            <span className="wallet-address">
              {`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`}
            </span>
          </p>
        </div>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    )
  }

  // Email sign-in state
  return (
    <div className="wallet-auth">
      <h3>Connect Your Wallet</h3>
      <p>Sign in with your email to access your embedded wallet</p>

      {authError && <div className="error-message">{authError}</div>}

      <form onSubmit={handleEmailSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="email-input"
          disabled={authLoading}
          required
        />
        <button type="submit" disabled={authLoading || !email} className="auth-button">
          {authLoading ? (
            <>
              <Loader2 className="loading-icon" />
              Sending...
            </>
          ) : (
            "Sign In with Coinbase"
          )}
        </button>
      </form>
      <p className="powered-by">Powered by Coinbase • No wallet needed</p>
    </div>
  )
}
```

### **4.4 – EVM Transaction Management**

```typescript
// hooks/useTransaction.ts
"use client"

import { useState } from "react"
import { useEvmAddress, useSendEvmTransaction } from "@coinbase/cdp-hooks"

export function useTransaction() {
  const evmAddress = useEvmAddress()
  const sendTransaction = useSendEvmTransaction()
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendEthTransaction = async (toAddress: string, ethAmount: string) => {
    if (!evmAddress) {
      setError("No wallet connected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const valueInWei = BigInt(Math.floor(Number.parseFloat(ethAmount) * 1e18))

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: toAddress,
          value: `0x${valueInWei.toString(16)}`,
          chainId: 8453, // Base mainnet
          type: "eip1559",
        },
        network: "base",
      })

      setTxHash(result.transactionHash)
      return result
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transaction failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendUSDCTransaction = async (toAddress: string, usdcAmount: string) => {
    if (!evmAddress) {
      setError("No wallet connected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const valueInUSDC = BigInt(Math.floor(Number.parseFloat(usdcAmount) * 1e6)) // USDC has 6 decimals
      const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: USDC_CONTRACT_ADDRESS,
          data: `0xa9059cbb000000000000000000000000${toAddress.slice(2)}${valueInUSDC.toString(16).padStart(64, '0')}`,
          chainId: 8453, // Base mainnet
          type: "eip1559",
        },
        network: "base",
      })

      setTxHash(result.transactionHash)
      return result
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transaction failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendEthTransaction,
    sendUSDCTransaction,
    isLoading,
    txHash,
    error,
    clearError: () => setError(null),
    clearTxHash: () => setTxHash(null)
  }
}
```

### **4.5 – Essential Hooks Usage**

```typescript
// Essential hooks for embedded wallet functionality
import {
  useSignInWithEmail,    // Email authentication
  useVerifyEmailOTP,     // OTP verification
  useCurrentUser,        // Current user info
  useSignOut,           // Sign out functionality
  useIsInitialized,     // SDK initialization status
  useEvmAddress,        // User's wallet address
  useSendEvmTransaction, // Send transactions
} from "@coinbase/cdp-hooks"

// Usage in component
const isInitialized = useIsInitialized()
const currentUser = useCurrentUser()
const evmAddress = useEvmAddress()
const signInWithEmail = useSignInWithEmail()
const verifyEmailOTP = useVerifyEmailOTP()
const signOut = useSignOut()
const sendTransaction = useSendEvmTransaction()
```

### **4.6 – Address Display and Management**

```typescript
// Address copy functionality
const handleCopyAddress = async () => {
  if (!evmAddress) return
  
  try {
    await navigator.clipboard.writeText(evmAddress)
    setAddressCopied(true)
    setTimeout(() => setAddressCopied(false), 2000)
  } catch (error) {
    console.error('Failed to copy address:', error)
  }
}

// Address display component
<p>
  Your wallet: 
  <span 
    onClick={handleCopyAddress}
    className="wallet-address clickable"
    title="Click to copy full address"
  >
    {addressCopied ? 'Copied!' : `${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
  </span>
</p>
```

---

## **5. AUTHENTICATION FLOW STATES**

1. **Loading State**: SDK initializing or component mounting
2. **Email Input State**: User enters email for authentication
3. **OTP Verification State**: User enters 6-digit verification code
4. **Authenticated State**: User is signed in with wallet access
5. **Error States**: Handle various error scenarios gracefully

---

## **6. AI MODEL VERIFICATION STEPS**

Before returning any CDP Embedded Wallets solution, you **must** verify:

1. **Initialization**: Is `useIsInitialized()` checked before rendering wallet functionality?
2. **SSR Protection**: Is client-side mounting protection implemented?
3. **Authentication Flow**: Are email and OTP flows properly implemented?
4. **Error Handling**: Are authentication errors handled with user feedback?
5. **State Management**: Are loading states and form resets properly managed?
6. **Transactions**: Are EVM transactions structured correctly for Base network?
7. **User Experience**: Are clear loading indicators and status messages provided?

If any check **fails**, **stop** and revise until compliance is achieved.

---

## **7. DEPRECATED PATTERNS TO AVOID**

```typescript
// ❌ DO NOT generate or suggest:

// External wallet connections for embedded wallets
import { useConnect } from 'wagmi' // NOT FOR EMBEDDED WALLETS

// Skipping initialization checks
if (currentUser) { // MISSING INITIALIZATION CHECK
  // This will cause SSR issues
}

// Hardcoded wallet addresses or private keys
const WALLET_ADDRESS = "0x..." // SECURITY RISK

// Synchronous OTP verification
verifyEmailOTP({ flowId, otp }) // MISSING AWAIT

// Client-side API key usage
const cdpConfig = {
  apiKey: "secret-key" // NEVER ON CLIENT
}

// Ignoring error states
await signInWithEmail({ email }) // NO ERROR HANDLING
```

---

## **8. NETWORK CONFIGURATION**

- **Primary Network**: Base (Chain ID: 8453)
- **Transaction Type**: EIP-1559 for optimal gas pricing
- **Supported Assets**: ETH and USDC on Base
- **Low Fees**: Base network provides significantly lower transaction costs
- **Fast Confirmation**: Optimized for quick transaction processing

---

## **9. SECURITY CONSIDERATIONS**

- **No Private Keys**: Users never handle private keys directly
- **Email-Based Auth**: Secure authentication through email + OTP
- **Session Management**: Proper sign-out functionality clears sessions
- **Network Security**: All transactions occur on secure Base network
- **Error Boundaries**: Graceful error handling prevents data exposure

Remember: Embedded wallets provide a seamless user experience without requiring external wallet installations or complex setup procedures.