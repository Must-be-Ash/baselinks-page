"use client"

import { useState, useEffect, useCallback } from "react"
import { useEvmAddress } from "@coinbase/cdp-hooks"
import { 
  checkWalletBalance, 
  createSessionToken, 
  generateOneClickBuyURL,
  generateGuestCheckoutURL,
  GUEST_CHECKOUT_LIMITS,
  type BalanceInfo 
} from "@/lib/onramp"

export function useWalletBalance(requiredAmount: string) {
  const evmAddress = useEvmAddress()
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    hasEnoughBalance: false,
    currentBalance: "0",
    formattedBalance: "0.00",
    isChecking: true,
  })

  const checkBalance = useCallback(async () => {
    if (!evmAddress) return
    
    setBalanceInfo(prev => ({ ...prev, isChecking: true }))
    
    try {
      const balance = await checkWalletBalance(evmAddress, requiredAmount)
      setBalanceInfo(balance)
    } catch (error) {
      console.error("Error checking balance:", error)
      setBalanceInfo({
        hasEnoughBalance: false,
        currentBalance: "0",
        formattedBalance: "0.00",
        isChecking: false,
      })
    }
  }, [evmAddress, requiredAmount])

  useEffect(() => {
    checkBalance()
  }, [checkBalance])

  return { ...balanceInfo, recheckBalance: checkBalance }
}

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
      console.error("Onramp error:", err)
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
        minAmount: GUEST_CHECKOUT_LIMITS.minimumAmount,
        maxAmount: GUEST_CHECKOUT_LIMITS.weeklyLimit
      })
      
      // Open in new window/tab
      window.open(guestURL, '_blank', 'noopener,noreferrer')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open guest checkout"
      setError(errorMessage)
      console.error("Guest checkout error:", err)
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

// Legacy function for reference (not used in secure implementation)
function generateDirectOnrampURL(userAddress: string, ethAmount: string): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const estimatedUSDAmount = Number.parseFloat(ethAmount) * 2500 // Rough ETH to USD conversion
  
  const params = new URLSearchParams({
    appId: "03058f87-eb78-4ebc-8bb8-f8aeed57cefa",
    addresses: JSON.stringify({ [userAddress]: ["base"] }),
    defaultAsset: "ETH",
    defaultNetwork: "base",
    defaultPaymentMethod: "CARD",
    fiatCurrency: "USD",
    presetFiatAmount: Math.max(5, estimatedUSDAmount).toString(), // Minimum $5
  })

  return `${baseURL}?${params.toString()}`
}