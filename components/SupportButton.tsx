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
import { Heart, Loader2 } from "lucide-react"

// 🎯 Ash Nouruzi's wallet address (where donations go)
const DONATION_ADDRESS = "0xeDeE7Ee27e99953ee3E99acE79a6fbc037E31C0D"

function DonationForm() {
  const isInitialized = useIsInitialized()
  const currentUser = useCurrentUser()
  const evmAddress = useEvmAddress()
  const signInWithEmail = useSignInWithEmail()
  const verifyEmailOTP = useVerifyEmailOTP()
  const signOut = useSignOut()
  const sendTransaction = useSendEvmTransaction()

  const [isMounted, setIsMounted] = useState(false)
  const [amount, setAmount] = useState("0.005")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleDonate = async () => {
    if (!evmAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const valueInWei = BigInt(Math.floor(Number.parseFloat(amount) * 1e18))

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: DONATION_ADDRESS,
          value: valueInWei,
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

  // Success state
  if (txHash) {
    return (
      <div className="donation-success">
        <div className="success-icon">
          <Heart className="success-heart" />
        </div>
        <h3>Thank You for Supporting Ash Nouruzi!</h3>
        <p>Your donation of {amount} ETH was sent successfully!</p>
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
            setAmount("0.005")
            setMessage("")
          }}
          className="donate-again-btn"
        >
          Support Ash Nouruzi Again
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
            <Heart className="support-icon" />
            Support Ash Nouruzi
          </h3>
          <p className="creator-bio">DevRel at Coinbase Developer Platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="amount-selection">
          <label>Choose donation amount:</label>
          <select value={amount} onChange={(e) => setAmount(e.target.value)} className="amount-select">
            <option value="0.002">0.002 ETH (~$5)</option>
            <option value="0.005">0.005 ETH (~$12)</option>
            <option value="0.01">0.01 ETH (~$25)</option>
            <option value="0.02">0.02 ETH (~$50)</option>
            <option value="0.05">0.05 ETH (~$125)</option>
          </select>
        </div>

        <div className="message-input">
          <label>Optional message for Ash Nouruzi:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Keep up the great work!"
            className="message-field"
            maxLength={100}
          />
        </div>

        <button onClick={handleDonate} disabled={isLoading} className="donate-button">
          {isLoading ? (
            <>
              <Loader2 className="loading-icon" />
              Sending...
            </>
          ) : (
            `Support Ash Nouruzi with ${amount} ETH`
          )}
        </button>

        <div className="donation-info">
          <p>Sent on Base network • Low fees</p>
          <p>
            Your wallet: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
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
    <div className="donation-signin">
      <div className="support-header">
        <h3>
          <Heart className="support-icon" />
          Support Me
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
            "Sign In"
          )}
        </button>
      </form>
      <p className="powered-by">Powered by Coinbase • No wallet needed</p>
    </div>
  )
}

export default function SupportButton() {
  return <DonationForm />
}
