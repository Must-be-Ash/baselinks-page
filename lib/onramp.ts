import { EvmAddress } from "@coinbase/cdp-core"

const ONRAMP_API_BASE = "https://api.developer.coinbase.com/onramp/v1"
const BASE_RPC_URL = "https://mainnet.base.org"

export interface BalanceInfo {
  hasEnoughBalance: boolean
  currentBalance: string
  formattedBalance: string
  isChecking: boolean
}

export interface OnrampSessionToken {
  token: string
  channelId: string
}

export interface CreateSessionTokenRequest {
  addresses: Array<{
    address: string
    blockchains: string[]
  }>
  assets?: string[]
}

export async function checkWalletBalance(
  address: EvmAddress | null,
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
    const response = await fetch(BASE_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const balanceWei = BigInt(data.result)
    const requiredWei = BigInt(Math.floor(Number.parseFloat(requiredAmount) * 1e18))
    
    const balanceEth = Number(balanceWei) / 1e18
    const formattedBalance = balanceEth.toFixed(4)
    
    return {
      hasEnoughBalance: balanceWei >= requiredWei,
      currentBalance: balanceWei.toString(),
      formattedBalance,
      isChecking: false,
    }
  } catch (error) {
    console.error("Error checking balance:", error)
    return {
      hasEnoughBalance: false,
      currentBalance: "0",
      formattedBalance: "0.00",
      isChecking: false,
    }
  }
}

export async function createSessionToken(
  addresses: Array<{ address: string; blockchains: string[] }>,
  assets: string[] = ["ETH", "USDC"]
): Promise<OnrampSessionToken> {
  const CDP_PROJECT_ID = "03058f87-eb78-4ebc-8bb8-f8aeed57cefa"
  
  const response = await fetch(`${ONRAMP_API_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CDP_PROJECT_ID}`,
    },
    body: JSON.stringify({
      addresses,
      assets,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create session token: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    token: data.data.token,
    channelId: data.data.channel_id || "",
  }
}

export function generateOnrampURL(
  sessionToken: string,
  userAddress: string,
  presetAmount?: string
): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "ETH",
    defaultNetwork: "base",
    fiatCurrency: "USD",
    defaultPaymentMethod: "CARD",
  })
  
  if (presetAmount) {
    params.append("presetFiatAmount", (Number.parseFloat(presetAmount) * 25).toString()) // Convert ETH to USD estimate
  }

  return `${baseURL}?${params.toString()}`
}

export function generateOneClickBuyURL(
  sessionToken: string,
  userAddress: string,
  ethAmount: string
): string {
  const baseURL = "https://pay.coinbase.com/buy/select-asset"
  const estimatedUSDAmount = Number.parseFloat(ethAmount) * 2500 // Rough ETH to USD conversion
  
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: "ETH",
    defaultNetwork: "base",
    defaultPaymentMethod: "CARD",
    fiatCurrency: "USD",
    presetFiatAmount: estimatedUSDAmount.toString(),
  })

  return `${baseURL}?${params.toString()}`
}