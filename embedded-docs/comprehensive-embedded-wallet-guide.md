# Complete Guide to Coinbase Embedded Wallets

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Integration Approaches](#integration-approaches)
5. [Authentication Flow](#authentication-flow)
6. [Transaction Management](#transaction-management)
7. [Advanced Features](#advanced-features)
8. [Security Configuration](#security-configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

## Introduction

Coinbase Developer Platform (CDP) Embedded Wallets provide a seamless way to integrate secure, user-friendly crypto wallets directly into your application. Unlike traditional wallets that require browser extensions or seed phrase management, embedded wallets enable users to interact with Web3 through familiar authentication methods like email and social logins.

### Key Benefits
- **User-custodied security**: Users maintain control of their assets
- **Easy onboarding**: Email OTP, Google, Apple login instead of seed phrases
- **Complete customization**: Full control over UI/UX
- **Enterprise-grade infrastructure**: Fast wallet creation powered by CDP's Trusted Execution Environment (TEE)
- **Built-in features**: Onramp/offramp, balances, transfers, swaps, staking
- **USDC Rewards**: 4.1% rewards on aggregated USDC balances

### Use Cases
- Gaming platforms with in-game purchases and NFT ownership
- Social applications with tipping and collecting features
- Marketplaces with crypto payments and NFT trading
- DeFi applications for lending, borrowing, yield farming
- Creator platforms with token and NFT monetization

## Prerequisites

### Development Environment
- **Node.js**: Version 20 or 22 (Node.js 21 is not supported)
- **Package Manager**: npm, pnpm, or yarn
- **Framework**: React with TypeScript (recommended)

### Coinbase Developer Platform Setup
1. Create a free account at [CDP Portal](https://portal.cdp.coinbase.com)
2. Create a new project or select existing project
3. Copy your **Project ID** from project settings
4. Configure CORS origins for your domains

## Project Setup

### Quick Start with Scaffolding Tool

The fastest way to get started is using CDP's scaffolding tool:

```bash
# Create new demo app
npm create @coinbase/create-cdp-app
# or
pnpm create @coinbase/create-cdp-app
# or
yarn create @coinbase/create-cdp-app
```

Follow the prompts:
- Project name: Your app name
- Template: Select "React Components"
- CDP Project ID: Paste your Project ID
- Confirm CORS whitelist setup

### Manual Installation

For existing projects, install the required packages:

```bash
# Core packages (always required)
npm install @coinbase/cdp-core

# Choose your integration approach:
# Option 1: React Components (easiest)
npm install @coinbase/cdp-react @coinbase/cdp-hooks

# Option 2: React Hooks (custom UI)
npm install @coinbase/cdp-hooks

# Option 3: Wagmi Integration (existing wagmi apps)
npm install @coinbase/cdp-wagmi @tanstack/react-query viem wagmi
```

## Integration Approaches

### Approach 1: React Components (Recommended for New Projects)

Pre-built, customizable UI components for common wallet operations.

#### Setup

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';
import App from './App';

const cdpConfig = {
  projectId: "your-project-id",
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

const appConfig = {
  name: "My App",
  logoUrl: "https://your-logo-url.com/logo.png",
};

const themeOverrides: Partial<Theme> = {
  "colors-background": "#ffffff",
  "colors-text": "#1a1a1a",
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CDPReactProvider config={cdpConfig} app={appConfig} theme={themeOverrides}>
      <App />
    </CDPReactProvider>
  </React.StrictMode>
);
```

#### Basic App Component

```tsx
// App.tsx
import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react";
import WalletDashboard from "./WalletDashboard";

function App() {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <h1>My Web3 App</h1>
      <AuthButton />
      {isSignedIn && <WalletDashboard />}
    </div>
  );
}

export default App;
```

### Approach 2: React Hooks (Custom UI)

Lower-level hooks for building custom interfaces.

#### Setup

```tsx
// main.tsx
import { CDPHooksProvider } from "@coinbase/cdp-hooks";
import App from "./App";

const cdpConfig = {
  projectId: "your-project-id",
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

function Root() {
  return (
    <CDPHooksProvider config={cdpConfig}>
      <App />
    </CDPHooksProvider>
  );
}
```

#### Custom Authentication Component

```tsx
// CustomAuth.tsx
import { useState } from "react";
import { useSignInWithEmail, useVerifyEmailOTP, useCurrentUser, useSignOut } from "@coinbase/cdp-hooks";

export default function CustomAuth() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithEmail = useSignInWithEmail();
  const verifyEmailOTP = useVerifyEmailOTP();
  const currentUser = useCurrentUser();
  const signOut = useSignOut();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { flowId } = await signInWithEmail({ email });
      setFlowId(flowId);
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId) return;
    
    setIsLoading(true);
    
    try {
      const { user, isNewUser } = await verifyEmailOTP({ flowId, otp });
      console.log("Signed in:", user, "New user:", isNewUser);
      setFlowId(null);
      setOtp("");
    } catch (error) {
      console.error("OTP verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setEmail("");
      setOtp("");
      setFlowId(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (currentUser) {
    return (
      <div>
        <h2>Welcome!</h2>
        <p>User ID: {currentUser.userId}</p>
        <p>Wallet: {currentUser.evmAccounts[0]}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  if (flowId) {
    return (
      <form onSubmit={handleOtpSubmit}>
        <h2>Enter Verification Code</h2>
        <p>Check your email for a 6-digit code</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          maxLength={6}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || otp.length !== 6}>
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit}>
      <h2>Sign In</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={isLoading}
        required
      />
      <button type="submit" disabled={isLoading || !email}>
        {isLoading ? "Sending..." : "Sign In with Email"}
      </button>
    </form>
  );
}
```

### Approach 3: Wagmi Integration

For applications already using the wagmi ecosystem.

#### Setup

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Config } from '@coinbase/cdp-core';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { base, baseSepolia } from 'viem/chains';
import { WagmiProvider, createConfig } from 'wagmi';
import App from './App';

const cdpConfig: Config = {
  projectId: "your-project-id",
};

const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http()
    }
  }
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
```

#### Wagmi Transaction Component

```tsx
// WagmiTransaction.tsx
import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

const BURN_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const AMOUNT_TO_SEND = "0.00001";

export default function WagmiTransaction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSendTransaction = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      sendTransaction({
        to: BURN_ADDRESS,
        value: parseEther(AMOUNT_TO_SEND),
      });
    } catch (error) {
      console.error("Failed to send transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Send Test Transaction</h3>
      <p>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      
      {error && <div style={{color: 'red'}}>Error: {error.message}</div>}

      {!hash && !isPending && (
        <button disabled={!address || isLoading} onClick={handleSendTransaction}>
          Send {AMOUNT_TO_SEND} ETH
        </button>
      )}

      {(isPending || isConfirming) && (
        <div>
          <p>Transaction pending...</p>
          {hash && <p>Hash: {hash.slice(0, 10)}...{hash.slice(-8)}</p>}
        </div>
      )}

      {isSuccess && hash && (
        <div>
          <p>✅ Transaction confirmed!</p>
          <a 
            href={`https://sepolia.basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
}
```

## Authentication Flow

The CDP embedded wallet uses a two-step authentication process:

### 1. Email OTP Flow

```tsx
// Step 1: Send OTP to email
const { flowId } = await signInWithEmail({ email: "user@example.com" });

// Step 2: Verify OTP code
const { user, isNewUser } = await verifyEmailOTP({
  flowId,
  otp: "123456"
});
```

### 2. Social Login (Future)
OAuth providers like Google and Apple will be supported for streamlined authentication.

### 3. User Object Structure

```typescript
interface User {
  userId: string;
  evmAccounts: string[]; // Array of wallet addresses
  // Additional user properties
}
```

## Transaction Management

### Sending Transactions on Base Networks

For Base and Base Sepolia, use the direct send approach:

```tsx
import { useSendEvmTransaction, useEvmAddress } from "@coinbase/cdp-hooks";

function SendTransaction() {
  const sendTransaction = useSendEvmTransaction();
  const evmAddress = useEvmAddress();

  const handleSend = async () => {
    if (!evmAddress) return;

    try {
      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: "0xRecipientAddress",
          value: 100000000000000n, // 0.0001 ETH in wei
          chainId: 84532, // Base Sepolia
          type: "eip1559",
        },
        network: "base-sepolia",
      });

      console.log("Transaction hash:", result.transactionHash);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onClick={handleSend}>Send Transaction</button>;
}
```

### Cross-Chain Transactions

For non-Base networks, sign the transaction and broadcast externally:

```tsx
import { useSignEvmTransaction, useEvmAddress } from "@coinbase/cdp-hooks";
import { http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";

function CrossChainTransaction() {
  const signTransaction = useSignEvmTransaction();
  const evmAddress = useEvmAddress();

  const handleSend = async () => {
    if (!evmAddress) return;

    try {
      // Sign the transaction
      const { signedTransaction } = await signTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: "0xRecipientAddress",
          value: 100000000000000n,
          chainId: 11155111, // Sepolia
          type: "eip1559",
        }
      });

      // Broadcast using external client
      const client = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      const hash = await client.sendRawTransaction({
        serializedTransaction: signedTransaction
      });

      console.log("Transaction hash:", hash);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return <button onClick={handleSend}>Send Cross-Chain Transaction</button>;
}
```

### Transaction Parameters Explained

```typescript
interface Transaction {
  to: string;           // Recipient address
  value: bigint;        // Amount in wei (1 ETH = 10^18 wei)
  chainId: number;      // Network identifier
  type: "eip1559";      // Modern gas fee structure
  gas?: bigint;         // Gas limit (auto-calculated if omitted)
  maxFeePerGas?: bigint;        // Maximum gas price
  maxPriorityFeePerGas?: bigint; // Miner tip
  nonce?: number;       // Transaction sequence number
}
```

## Advanced Features

### Message Signing

```tsx
import { useSignEvmMessage, useEvmAddress } from "@coinbase/cdp-hooks";

function MessageSigner() {
  const signMessage = useSignEvmMessage();
  const evmAddress = useEvmAddress();

  const handleSignMessage = async () => {
    if (!evmAddress) return;

    const result = await signMessage({
      evmAccount: evmAddress,
      message: "Hello, Web3 world!"
    });

    console.log("Message signature:", result.signature);
  };

  return <button onClick={handleSignMessage}>Sign Message</button>;
}
```

### Typed Data Signing (EIP-712)

```tsx
import { useSignEvmTypedData, useEvmAddress } from "@coinbase/cdp-hooks";

function TypedDataSigner() {
  const signTypedData = useSignEvmTypedData();
  const evmAddress = useEvmAddress();

  const handleSignTypedData = async () => {
    if (!evmAddress) return;

    const result = await signTypedData({
      evmAccount: evmAddress,
      typedData: {
        domain: {
          name: "My DApp",
          version: "1",
          chainId: 84532,
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" }
          ]
        },
        primaryType: "Person",
        message: {
          name: "Alice",
          wallet: evmAddress
        }
      }
    });

    console.log("Typed data signature:", result.signature);
  };

  return <button onClick={handleSignTypedData}>Sign Typed Data</button>;
}
```

### Private Key Export

```tsx
import { useExportEvmAccount, useEvmAddress } from "@coinbase/cdp-hooks";

function KeyExporter() {
  const exportAccount = useExportEvmAccount();
  const evmAddress = useEvmAddress();

  const handleExport = async () => {
    if (!evmAddress) return;

    try {
      const { privateKey } = await exportAccount({
        evmAccount: evmAddress
      });

      // Handle with extreme care!
      console.log("Private Key:", privateKey);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <button onClick={handleExport}>
      Export Private Key (Use with Caution!)
    </button>
  );
}
```

## Security Configuration

### CORS Setup

Cross-Origin Resource Sharing (CORS) must be configured to protect your application:

1. Visit [CORS Configuration](https://portal.cdp.coinbase.com/products/embedded-wallets/cors)
2. Click "Add origin"
3. Enter your domain (e.g., `https://yourdapp.com`, `http://localhost:3000`)
4. Save changes (takes effect immediately)

#### CORS Format Requirements
- Format: `<scheme>://<host>:<port>`
- Schemes: `http` or `https`
- Port optional for 80 (http) and 443 (https)
- Maximum 50 origins per project

#### Development vs Production
```
Development: http://localhost:3000
Staging:     https://staging.yourdapp.com
Production:  https://yourdapp.com
```

### Security Best Practices

1. **Never expose Project IDs in client-side code** - use environment variables
2. **Always validate CORS origins** - only include domains you control
3. **Use HTTPS in production** - never use HTTP for live applications
4. **Handle private keys securely** - never log or expose them
5. **Implement proper error handling** - don't expose sensitive error details

## Best Practices

### State Management

```tsx
// Create a wallet context for global state
import { createContext, useContext, ReactNode } from 'react';
import { useCurrentUser, useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';

interface WalletContextType {
  user: any;
  address: string | null;
  isSignedIn: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const address = useEvmAddress();
  const isSignedIn = useIsSignedIn();

  return (
    <WalletContext.Provider value={{ user, address, isSignedIn }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
```

### Error Handling

```tsx
import { useState } from 'react';

function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (operation: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Operation failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
```

### Loading States

```tsx
import { useIsInitialized, useIsSignedIn } from '@coinbase/cdp-hooks';

function AppLoadingWrapper({ children }: { children: ReactNode }) {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Initializing wallet...</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Gas Fee Estimation

```tsx
// Utility for gas estimation
export const estimateGasFees = async (chainId: number) => {
  // Implementation depends on your gas estimation service
  // This is a simplified example
  const baseGasFees = {
    8453: { // Base mainnet
      maxFeePerGas: 30000000000n,
      maxPriorityFeePerGas: 1000000000n,
    },
    84532: { // Base Sepolia
      maxFeePerGas: 20000000000n,
      maxPriorityFeePerGas: 1000000000n,
    }
  };

  return baseGasFees[chainId] || baseGasFees[84532];
};
```

## Troubleshooting

### Common Issues

#### 1. "createContext is not a function" Error
**Problem**: Using CDP components in Next.js without client-side directive
**Solution**: Add `"use client"` at the top of files using CDP functionality

```tsx
"use client"; // Must be first line

import { useSignInWithEmail } from "@coinbase/cdp-hooks";
```

#### 2. CORS Errors
**Problem**: Domain not allowlisted in CDP Portal
**Solution**: Add your domain to CORS configuration
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

#### 3. Transaction Failures
**Problem**: Insufficient gas or network issues
**Solution**: 
- Check gas estimates
- Verify network connectivity
- Ensure sufficient balance

```tsx
// Add better error handling
try {
  const result = await sendTransaction(txParams);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Handle insufficient balance
  } else if (error.message.includes('gas')) {
    // Handle gas estimation issues
  }
  // Handle other errors
}
```

#### 4. Node.js Version Issues
**Problem**: Using unsupported Node.js version
**Solution**: Use Node.js 20 or 22 (not 21)

```bash
# Check version
node --version

# Use nvm to switch versions
nvm use 20
# or
nvm use 22
```

### Debug Mode

Enable debugging to see API requests and responses:

```tsx
const cdpConfig = {
  projectId: "your-project-id",
  debugging: true, // Enable debug logs
  useMock: false,
};
```

### Network Issues

```tsx
// Check network connectivity
const checkNetworkHealth = async () => {
  try {
    const response = await fetch('https://api.cdp.coinbase.com/platform/health');
    return response.ok;
  } catch {
    return false;
  }
};
```

## Production Deployment

### Environment Configuration

```bash
# .env.production
VITE_CDP_PROJECT_ID=your-production-project-id
VITE_APP_ENV=production

# .env.development  
VITE_CDP_PROJECT_ID=your-development-project-id
VITE_APP_ENV=development
```

### Build Configuration

```tsx
// config.ts
const cdpConfig = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: import.meta.env.VITE_APP_ENV === 'development',
  debugging: import.meta.env.VITE_APP_ENV === 'development',
};
```

### Deployment Checklist

- [ ] CORS origins configured for production domain
- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Gas estimation configured
- [ ] Transaction confirmation flows tested
- [ ] User authentication flows tested
- [ ] Performance optimized

### Performance Optimization

```tsx
// Lazy load components
import { lazy, Suspense } from 'react';

const WalletDashboard = lazy(() => import('./WalletDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletDashboard />
    </Suspense>
  );
}
```

### Monitoring

```tsx
// Add error tracking
const trackError = (error: Error, context: string) => {
  // Send to your monitoring service
  console.error(`Error in ${context}:`, error);
};

// Usage in components
try {
  await sendTransaction(params);
} catch (error) {
  trackError(error, 'sendTransaction');
  throw error;
}
```

## Conclusion

This comprehensive guide covers everything needed to integrate Coinbase embedded wallets into your application. Choose the integration approach that best fits your needs:

- **React Components**: For rapid development with pre-built UI
- **React Hooks**: For custom UI implementations
- **Wagmi Integration**: For existing wagmi-based applications

Remember to prioritize security, implement proper error handling, and test thoroughly before deploying to production.

For additional support and updates, visit the [CDP Portal](https://portal.cdp.coinbase.com) and refer to the individual documentation files in this repository.