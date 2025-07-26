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
  useSendEvmTransaction,
} from "@coinbase/cdp-hooks"
import { Heart, Loader2, CreditCard, AlertTriangle, Apple } from "lucide-react"
import { useWalletBalance, useOnramp } from "@/hooks/useOnramp"
import GuestCheckout from "./GuestCheckout"
import FundingModal from "./FundingModal"

// 🎯 Wallet address (where donations go)
const DONATION_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS!
// USDC contract on Base mainnet
const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

function DonationForm() {
  const isInitialized = useIsInitialized()
  const currentUser = useCurrentUser()
  const evmAddress = useEvmAddress()
  const signInWithEmail = useSignInWithEmail()
  const verifyEmailOTP = useVerifyEmailOTP()
  const signOut = useSignOut()
  const sendTransaction = useSendEvmTransaction()

  // Environment variable for profile name
  const PROFILE_NAME = process.env.NEXT_PUBLIC_PROFILE_NAME!

  const [isMounted, setIsMounted] = useState(false)
  const [amount, setAmount] = useState("12")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addressCopied, setAddressCopied] = useState(false)

  // Balance checking and onramp
  const { hasEnoughBalance, formattedBalance, isChecking, recheckBalance } = useWalletBalance(amount)
  const { openOnramp, openGuestCheckout, isCreatingSession, error: onrampError, clearError } = useOnramp()
  
  // Guest checkout state
  const [showGuestCheckout, setShowGuestCheckout] = useState(false)
  
  // Funding modal state
  const [showFundingModal, setShowFundingModal] = useState(false)

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
      <div className="donation-loading">
        <Loader2 className="loading-spinner" />
        <p>Loading donation system...</p>
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
      // Reset form
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
      setTxHash(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign out failed")
    }
  }

  const handleCopyAddress = async () => {
    if (!evmAddress) return
    
    try {
      await navigator.clipboard.writeText(evmAddress)
      setAddressCopied(true)
      setTimeout(() => setAddressCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      // Log error only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy address:', error)
      }
    }
  };

  const handleDonate = async () => {
    if (!evmAddress) return

    // Check balance before attempting transaction
    if (!hasEnoughBalance && !isChecking) {
      setError(`Insufficient balance. You have $${formattedBalance} USDC but need $${amount} USDC.`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const valueInUSDC = BigInt(Math.floor(Number.parseFloat(amount) * 1e6)) // USDC has 6 decimals

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: USDC_CONTRACT_ADDRESS,
          data: `0xa9059cbb000000000000000000000000${DONATION_ADDRESS.slice(2)}${valueInUSDC.toString(16).padStart(64, '0')}`,
          chainId: 8453, // Base mainnet (low fees)
          type: "eip1559",
        },
        network: "base",
      })

      setTxHash(result.transactionHash)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Donation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount)
    // Balance will be rechecked automatically via the useWalletBalance hook
  }

  const handleBuyMoreETH = async () => {
    clearError()
    await openOnramp(amount)
  }

  const handleGuestCheckout = async (paymentMethod: "CARD" | "APPLE_PAY") => {
    clearError()
    await openGuestCheckout(amount, paymentMethod)
  }

  // Success state
  if (txHash) {
    return (
      <div className="donation-success">
        <div className="success-icon">
          <Heart className="success-heart" />
        </div>
        <h3>Thank You for Supporting {PROFILE_NAME}!</h3>
        <p>Your donation of ${amount} USDC was sent successfully!</p>
        {message && <p className="donation-message">"{message}"</p>}
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transaction-link"
        >
          View Transaction
        </a>
        <button
          onClick={() => {
            setTxHash(null)
            setAmount("12")
            setMessage("")
          }}
          className="donate-again-btn"
        >
          Support {PROFILE_NAME} Again
        </button>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    )
  }

  // OTP verification state
  if (flowId) {
    return (
      <div className="donation-signin">
        <div className="support-header">
          <h3>
            <Heart className="support-icon" />
            Enter Verification Code
          </h3>
        </div>
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

  // Authenticated state - show donation form
  if (currentUser && evmAddress) {
    return (
      <div className="donation-form">
        <div className="support-header">
          <h3>
            Support {PROFILE_NAME} <span className="text-xs text-muted-foreground"> 🤍</span>
          </h3>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="amount-selection">
          <label 
            className="text-xs text-muted-foreground"
            style={{ opacity: 0.7, fontSize: '0.85em' }}
          >
            Choose donation amount:
          </label>
          <select value={amount} onChange={(e) => handleAmountChange(e.target.value)} className="amount-select">
            <option value="5">$5 USDC</option>
            <option value="12">$12 USDC</option>
            <option value="25">$25 USDC</option>
            <option value="50">$50 USDC</option>
            <option value="125">$125 USDC</option>
          </select>
        </div>

{/* 
        <div className="message-input">
                      <label>Optional message for {PROFILE_NAME}:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Keep up the great work!"
            className="message-field"
            maxLength={100}
          />
        </div> */}

        <button 
          onClick={hasEnoughBalance ? handleDonate : handleBuyMoreETH} 
          disabled={isLoading || isCreatingSession} 
          className="donate-button mb-4"
        >
          {(isLoading || isCreatingSession) ? (
            <>
              <Loader2 className="loading-icon" />
              {hasEnoughBalance ? "Sending..." : "Opening..."}
            </>
          ) : (
            `Support ${PROFILE_NAME} with $${amount} USDC`
          )}
        </button>

        <div className="donation-info mb-12">
          <p>
            Your wallet: <span 
              onClick={handleCopyAddress}
              className="wallet-address clickabl"
              title="Click to copy full address"
            >
              {addressCopied ? 'Copied!' : `${evmAddress?.slice(0, 6)}...${evmAddress?.slice(-4)}`}
            </span>
          </p>
        </div>

        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>

        {/* Funding Modal */}
        <FundingModal
          isOpen={showFundingModal}
          onClose={() => setShowFundingModal(false)}
          amount={amount}
          currentBalance={formattedBalance}
          onConnectedWalletFunding={handleBuyMoreETH}
          onGuestCheckout={handleGuestCheckout}
          isLoading={isCreatingSession}
        />
      </div>
    )
  }

  // Show guest checkout if requested
  if (showGuestCheckout) {
    const estimatedUSDAmount = Number.parseFloat(amount) // USDC = USD 1:1
    
    return (
      <div className="donation-signin">
        <div className="support-header">
          <h3>
            <Heart className="support-icon" />
            Support Me - Guest Checkout
          </h3>
        </div>
        
        <GuestCheckout
          onStartGuestCheckout={handleGuestCheckout}
          estimatedUSDAmount={estimatedUSDAmount}
          isLoading={isCreatingSession}
        />
        
        {onrampError && (
          <div className="error-message">
            {onrampError}
          </div>
        )}
        
        <button
          onClick={() => setShowGuestCheckout(false)}
          className="back-button mt-4"
        >
          Back to Sign In
        </button>
        
        <p className="powered-by">Powered by Coinbase</p>
      </div>
    )
  }

  // Email sign-in state
  return (
    <div className="donation-signin">
      <div className="support-header">
        <h3>
        Support Me <span className="text-xs text-muted-foreground"> 🤍</span>
        </h3>
      </div>
      <p>Support my work in developer relations and blockchain education</p>

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
{/*       
      <div className="guest-checkout-option">
        <div className="or-divider">
          <span>or</span>
        </div>
        <button
          onClick={() => setShowGuestCheckout(true)}
          className="guest-checkout-btn"
        >
          <CreditCard className="inline w-4 h-4 mr-2" />
          Pay with Debit Card (No Account Needed)
        </button>
        <p className="guest-checkout-info">
          US residents • $5-$500 limit • Debit card or Apple Pay
        </p>
      </div> */}
      
    </div>
  )
}

export default function SupportButton() {
  return <DonationForm />
}
