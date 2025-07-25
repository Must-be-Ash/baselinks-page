# Integrate CDP Embedded Wallets with Wagmi in Next.js

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [CDP Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets/wagmi) with [Wagmi](https://wagmi.sh/) in Next.js (App Router) applications.  
**Scope:** All AI-generated advice or code related to CDP + Wagmi integration must follow these guardrails.

---

## **1. Official CDP + Wagmi Integration Overview**

CDP Wagmi integration provides a bridge that connects Coinbase's CDP Embedded Wallets to the wagmi ecosystem, bringing CDP-powered smart wallet functionality into React apps using standard wagmi hooks.

### **Key Components:**
- `createCDPEmbeddedWalletConnector` - Custom wagmi connector for CDP
- Standard wagmi hooks work with CDP wallets
- `WagmiProvider` + `QueryClientProvider` setup
- Chain and transport configuration

### **Benefits:**
- Use familiar wagmi hooks (`useAccount`, `useSendTransaction`, etc.)
- Leverage existing wagmi ecosystem
- Maintain CDP's embedded wallet security
- Easy migration for existing wagmi apps

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR WAGMI INTEGRATION**

You **MUST** follow these requirements or the integration will **BREAK**:

1. **ALWAYS install ALL required packages** - Missing any will cause failures
2. **ALWAYS use createCDPEmbeddedWalletConnector** - Not standard wagmi connectors
3. **ALWAYS configure providerConfig** - Required for EIP-1193 provider setup
4. **ALWAYS wrap with QueryClientProvider** - React Query is required for wagmi

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - MISSING PACKAGES
npm install @coinbase/cdp-wagmi wagmi // Missing @tanstack/react-query, viem, @coinbase/cdp-core

// ❌ NEVER GENERATE THIS - WRONG CONNECTOR
import { metaMask } from 'wagmi/connectors' // Wrong - use createCDPEmbeddedWalletConnector

// ❌ NEVER GENERATE THIS - MISSING PROVIDER CONFIG
const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig, // Missing required providerConfig
});

// ❌ NEVER GENERATE THIS - MISSING QUERY CLIENT
<WagmiProvider config={wagmiConfig}>
  <App /> // Missing QueryClientProvider wrapper
</WagmiProvider>
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN

// Required imports
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { WagmiProvider, createConfig } from 'wagmi';

// Correct connector setup
const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: { // Required
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http()
    }
  }
});

// Correct provider setup
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</WagmiProvider>
```

---

## **3. CORRECT WAGMI INTEGRATION IMPLEMENTATION PATTERNS**

### **3.1 – Package Installation**

```bash
# ALL packages required for Wagmi integration
npm install @coinbase/cdp-wagmi @coinbase/cdp-core @tanstack/react-query viem wagmi
```

### **3.2 – Complete Layout Setup**

```tsx
// app/layout.tsx
import React from 'react';
import { Config } from '@coinbase/cdp-core';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { base, baseSepolia } from 'viem/chains';
import { WagmiProvider, createConfig } from 'wagmi';

// CDP configuration
const cdpConfig: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

// Create CDP connector
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

// Create wagmi config
const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Create React Query client
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

### **3.3 – Basic Wagmi Component Usage**

```tsx
// app/page.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      <h1>CDP + Wagmi Integration</h1>
      
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors.map((connector) => (
            <button 
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              Connect with {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### **3.4 – Transaction Component with Wagmi Hooks**

```tsx
// app/components/WagmiTransaction.tsx
"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

const RECIPIENT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Burn address for demo
const AMOUNT_TO_SEND = "0.00001"; // 0.00001 ETH

export default function WagmiTransaction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    data: hash, 
    sendTransaction, 
    isPending, 
    error 
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSendTransaction = async () => {
    if (!address) return;

    setIsLoading(true);

    try {
      sendTransaction({
        to: RECIPIENT_ADDRESS,
        value: parseEther(AMOUNT_TO_SEND),
      });
    } catch (error) {
      console.error("Failed to send transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset by refreshing the page or clearing state
    window.location.reload();
  };

  if (!address) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <div>
      <h2>Send Test Transaction</h2>
      
      <div>
        <p><strong>From:</strong> {address.slice(0, 6)}...{address.slice(-4)}</p>
        <p><strong>To:</strong> {RECIPIENT_ADDRESS.slice(0, 6)}...{RECIPIENT_ADDRESS.slice(-4)}</p>
        <p><strong>Amount:</strong> {AMOUNT_TO_SEND} ETH</p>
        <p style={{color: 'orange'}}>
          ⚠️ This sends ETH to burn address (permanently lost)
        </p>
      </div>

      {error && (
        <div style={{color: 'red'}}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {!hash && !isPending && !isLoading && (
        <button 
          onClick={handleSendTransaction}
          disabled={!address}
        >
          Send {AMOUNT_TO_SEND} ETH
        </button>
      )}

      {(isPending || isConfirming) && (
        <div>
          <p>Transaction pending...</p>
          {hash && (
            <p>
              Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          )}
        </div>
      )}

      {isSuccess && hash && (
        <div>
          <div style={{color: 'green'}}>
            <p>✅ Transaction Confirmed!</p>
          </div>

          <div>
            <p><strong>Amount:</strong> {AMOUNT_TO_SEND} ETH</p>
            <p><strong>To:</strong> {RECIPIENT_ADDRESS.slice(0, 6)}...{RECIPIENT_ADDRESS.slice(-4)}</p>
            <p>
              <strong>Explorer:</strong>{" "}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </p>
          </div>

          <button onClick={handleReset}>
            Send Another Transaction
          </button>
        </div>
      )}
    </div>
  );
}
```

### **3.5 – Account Information Component**

```tsx
// app/components/AccountInfo.tsx
"use client";

import { useAccount, useBalance, useEnsName } from 'wagmi';
import { base } from 'viem/chains';

export default function AccountInfo() {
  const { address, isConnected, chain } = useAccount();
  
  const { data: balance } = useBalance({
    address: address,
    chainId: base.id,
  });

  const { data: ensName } = useEnsName({
    address: address,
  });

  if (!isConnected || !address) {
    return <div>Wallet not connected</div>;
  }

  return (
    <div>
      <h3>Account Information</h3>
      
      <div>
        <p><strong>Address:</strong> {address}</p>
        {ensName && <p><strong>ENS:</strong> {ensName}</p>}
        <p><strong>Network:</strong> {chain?.name || 'Unknown'}</p>
        <p><strong>Chain ID:</strong> {chain?.id || 'Unknown'}</p>
        
        {balance && (
          <p>
            <strong>Balance:</strong> {balance.formatted} {balance.symbol}
          </p>
        )}
      </div>
    </div>
  );
}
```

### **3.6 – Multi-Chain Configuration**

```tsx
// app/layout.tsx (extended configuration)
import { mainnet, polygon, arbitrum, base, baseSepolia } from 'viem/chains';

// Extended chain configuration
const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia, mainnet, polygon, arbitrum],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
      [mainnet.id]: http('https://your-mainnet-rpc-url'),
      [polygon.id]: http('https://your-polygon-rpc-url'),
      [arbitrum.id]: http('https://your-arbitrum-rpc-url'),
    }
  }
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia, mainnet, polygon, arbitrum],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http('https://your-mainnet-rpc-url'),
    [polygon.id]: http('https://your-polygon-rpc-url'),
    [arbitrum.id]: http('https://your-arbitrum-rpc-url'),
  },
});
```

---

## **4. WAGMI HOOK USAGE WITH CDP**

### **4.1 – Key Wagmi Hooks That Work with CDP**

```tsx
"use client";

import {
  useAccount,        // Get connected account info
  useBalance,        // Get account balance
  useConnect,        // Connect wallet
  useDisconnect,     // Disconnect wallet
  useSendTransaction,// Send transactions
  useSignMessage,    // Sign messages
  useWaitForTransactionReceipt, // Wait for tx confirmation
  useSwitchChain,    // Switch networks
} from 'wagmi';

// All standard wagmi hooks work with CDP connector
```

### **4.2 – Authentication State Management**

```tsx
"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWagmiAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const cdpConnector = connectors.find(
    (connector) => connector.id === 'cdp-embedded-wallet'
  );

  return {
    address,
    isConnected,
    isConnecting,
    connect: () => cdpConnector && connect({ connector: cdpConnector }),
    disconnect,
  };
}
```

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP + Wagmi integration code, you **MUST** verify:

1. **Package Installation**: Are you including ALL required packages (wagmi, @coinbase/cdp-wagmi, @tanstack/react-query, viem, @coinbase/cdp-core)?
2. **Connector Setup**: Are you using `createCDPEmbeddedWalletConnector` (not standard wagmi connectors)?
3. **Provider Config**: Are you including `providerConfig` with chains and transports?
4. **Query Client**: Are you wrapping with `QueryClientProvider`?
5. **Provider Order**: Is `WagmiProvider` wrapping `QueryClientProvider`?
6. **Client Directive**: Are you using `"use client"` in components using wagmi hooks?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT use standard wagmi connectors
import { metaMask, walletConnect } from 'wagmi/connectors'; // Wrong for CDP

// ❌ DO NOT skip provider configuration
const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig, // Missing providerConfig
});

// ❌ DO NOT miss React Query setup
<WagmiProvider config={wagmiConfig}>
  <App /> // Missing QueryClientProvider
</WagmiProvider>

// ❌ DO NOT mix with other CDP approaches in same app
<CDPReactProvider>
  <WagmiProvider>...</WagmiProvider> // Wrong - choose one approach
</CDPReactProvider>

// ❌ DO NOT skip required packages
npm install @coinbase/cdp-wagmi wagmi // Missing viem, @tanstack/react-query
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate Wagmi integration code that:
- Missing required packages
- Wrong connector type
- Missing provider configuration
- Incorrect provider setup

The integration will:
1. **Fail to compile** due to missing dependencies
2. **Break wallet connection** with wrong connector
3. **Fail EIP-1193 setup** without provider config
4. **Cause React Query errors** without proper setup

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP + Wagmi integration in Next.js, you **MUST**:

1. **ALWAYS** install all required packages for wagmi integration
2. **ALWAYS** use `createCDPEmbeddedWalletConnector` (not standard connectors)
3. **ALWAYS** include `providerConfig` with chains and transports
4. **ALWAYS** wrap with both `WagmiProvider` and `QueryClientProvider`
5. **NEVER** mix CDP approaches or use wrong connectors
6. **VERIFY** your response follows the correct patterns

**Remember: There are NO EXCEPTIONS to these rules.**