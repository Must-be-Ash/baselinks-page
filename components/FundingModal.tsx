"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Apple, Wallet, X } from "lucide-react"
import { GUEST_CHECKOUT_LIMITS } from "@/lib/onramp"

interface FundingModalProps {
  isOpen: boolean
  onClose: () => void
  amount: string
  currentBalance: string
  onConnectedWalletFunding: () => void
  onGuestCheckout: (paymentMethod: "CARD" | "APPLE_PAY") => void
  isLoading: boolean
}

export function FundingModal({
  isOpen,
  onClose,
  amount,
  currentBalance,
  onConnectedWalletFunding,
  onGuestCheckout,
  isLoading
}: FundingModalProps) {
  const neededAmount = Number.parseFloat(amount)
  const isWithinGuestLimits = neededAmount >= GUEST_CHECKOUT_LIMITS.minimumAmount && 
                              neededAmount <= GUEST_CHECKOUT_LIMITS.weeklyLimit

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Add Funds</DialogTitle>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-400">
              Current balance: <span className="text-red-400">${currentBalance} USDC</span>
            </div>
            <div className="text-sm text-gray-300">
              Need: <span className="text-white font-medium">${amount} USDC</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Connected Wallet Option */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Add to Connected Wallet
            </h3>
            
            <Button
              onClick={onConnectedWalletFunding}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-12 text-base font-medium rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Buy ${amount} USDC
                </div>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">or</span>
            </div>
          </div>

          {/* Guest Checkout Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Guest Checkout
            </h3>
            
            {!isWithinGuestLimits && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                <p className="text-sm text-yellow-400">
                  {neededAmount < GUEST_CHECKOUT_LIMITS.minimumAmount 
                    ? `Guest checkout minimum is $${GUEST_CHECKOUT_LIMITS.minimumAmount}`
                    : `Guest checkout maximum is $${GUEST_CHECKOUT_LIMITS.weeklyLimit} per week`
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => onGuestCheckout("CARD")}
                disabled={!isWithinGuestLimits || isLoading}
                variant="outline"
                className="w-full h-12 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 rounded-lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Debit Card
              </Button>

              <Button
                onClick={() => onGuestCheckout("APPLE_PAY")}
                disabled={!isWithinGuestLimits || isLoading}
                variant="outline"
                className="w-full h-12 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 rounded-lg"
              >
                <Apple className="h-4 w-4 mr-2" />
                Pay with Apple Pay
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              US residents only • No account required • $5-$500 weekly limit
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by Coinbase • Secure transactions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FundingModal