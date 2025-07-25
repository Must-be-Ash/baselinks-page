# Handle Transactions with CDP Embedded Wallets

**Purpose:** Enforce only the **current** and **correct** instructions for handling transactions with [Coinbase Developer Platform (CDP) Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets).  
**Scope:** All AI-generated advice or code related to CDP Embedded Wallets transactions must follow these guardrails.

---

## **1. Official CDP Transaction Handling Overview**

CDP Embedded Wallets support two transaction patterns depending on the target blockchain network:

### **Transaction Approaches:**
1. **Direct Send (Base Networks Only)**: `useSendEvmTransaction` - Signs and broadcasts in one step
2. **Sign + Broadcast (All Networks)**: `useSignEvmTransaction` + external broadcast

### **Supported Networks:**
- **Direct Send**: Base Mainnet (8453), Base Sepolia (84532)
- **Sign + Broadcast**: Any EVM-compatible network (Ethereum, Polygon, Arbitrum, etc.)

### **Key Transaction Hooks:**
- `useSendEvmTransaction` - Send transactions on Base networks
- `useSignEvmTransaction` - Sign transactions for any EVM network
- `useEvmAddress` - Get user's wallet address

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR TRANSACTIONS**

You **MUST** follow these requirements or transactions will **BREAK**:

1. **ALWAYS check network compatibility** - Use correct hook for target network
2. **ALWAYS validate user has wallet address** - Check `useEvmAddress()` first
3. **ALWAYS handle transaction errors** - Network issues, insufficient funds, etc.
4. **ALWAYS use proper value format** - Amount in wei as `bigint` (not string or number)

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - WRONG HOOK FOR NETWORK
const sendTx = useSendEvmTransaction(); 
// Then try to send to Ethereum mainnet (wrong - Base only)

// ❌ NEVER GENERATE THIS - INCORRECT VALUE FORMAT
value: "0.001" // Wrong - should be bigint in wei
value: 0.001   // Wrong - should be bigint in wei

// ❌ NEVER GENERATE THIS - MISSING ADDRESS CHECK
const result = await sendTransaction({ /* no address check */ });

// ❌ NEVER GENERATE THIS - WRONG CHAIN ID
chainId: "84532" // Wrong - should be number, not string
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
"use client";

import { useSendEvmTransaction, useEvmAddress } from "@coinbase/cdp-hooks";

const sendTransaction = useSendEvmTransaction();
const evmAddress = useEvmAddress();

// Always check address first
if (!evmAddress) return;

// Correct value format (bigint in wei)
value: 100000000000000n, // 0.0001 ETH in wei

// Correct chain ID format (number)
chainId: 84532, // Base Sepolia
```

---

## **3. CORRECT TRANSACTION IMPLEMENTATION PATTERNS**

### **3.1 – Base Network Transactions (Direct Send)**

```tsx
"use client";

import { useState } from 'react';
import { useSendEvmTransaction, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";

export default function SendTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useSendEvmTransaction();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const handleSendTransaction = async () => {
    // Always check initialization and address
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: "0xRecipientAddress", // Replace with actual recipient
          value: 100000000000000n, // 0.0001 ETH in wei (bigint)
          chainId: 84532, // Base Sepolia (number, not string)
          type: "eip1559", // Modern transaction type
        },
        network: "base-sepolia", // Must match chainId
      });

      setTxHash(result.transactionHash);
      console.log('Transaction successful:', result.transactionHash);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setError(message);
      console.error('Transaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  if (!evmAddress) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <h3>Send Transaction</h3>
      <p>From: {evmAddress}</p>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      {txHash ? (
        <div>
          <p>✅ Transaction sent!</p>
          <p>Hash: {txHash}</p>
          <a 
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
          <button onClick={() => setTxHash(null)}>Send Another</button>
        </div>
      ) : (
        <button 
          onClick={handleSendTransaction} 
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send 0.0001 ETH'}
        </button>
      )}
    </div>
  );
}
```

### **3.2 – Cross-Chain Transactions (Sign + Broadcast)**

```tsx
"use client";

import { useState } from 'react';
import { useSignEvmTransaction, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export default function CrossChainTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signTransaction = useSignEvmTransaction();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const handleSendTransaction = async () => {
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Sign the transaction with CDP
      const { signedTransaction } = await signTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: "0xRecipientAddress", // Replace with actual recipient
          value: 100000000000000n, // 0.0001 ETH in wei (bigint)
          chainId: 11155111, // Sepolia testnet (number)
          type: "eip1559",
          // Optional gas parameters (will be estimated if omitted)
          gas: 21000n,
          maxFeePerGas: 30000000000n,
          maxPriorityFeePerGas: 1000000000n,
        }
      });

      // Step 2: Broadcast using external client (viem example)
      const client = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      const hash = await client.sendRawTransaction({
        serializedTransaction: signedTransaction
      });

      setTxHash(hash);
      console.log('Cross-chain transaction successful:', hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setError(message);
      console.error('Transaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  if (!evmAddress) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <h3>Send Cross-Chain Transaction</h3>
      <p>From: {evmAddress}</p>
      <p>Network: Ethereum Sepolia</p>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      {txHash ? (
        <div>
          <p>✅ Transaction sent!</p>
          <p>Hash: {txHash}</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
          <button onClick={() => setTxHash(null)}>Send Another</button>
        </div>
      ) : (
        <button 
          onClick={handleSendTransaction} 
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send 0.0001 ETH on Sepolia'}
        </button>
      )}
    </div>
  );
}
```

### **3.3 – Transaction with Dynamic Parameters**

```tsx
"use client";

import { useState } from 'react';
import { useSendEvmTransaction, useEvmAddress } from "@coinbase/cdp-hooks";

export default function DynamicTransaction() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useSendEvmTransaction();
  const evmAddress = useEvmAddress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evmAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert ETH amount to wei (multiply by 10^18)
      const valueInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: recipient,
          value: valueInWei,
          chainId: 84532, // Base Sepolia
          type: "eip1559",
        },
        network: "base-sepolia",
      });

      console.log('Transaction sent:', result.transactionHash);
      // Reset form
      setRecipient('');
      setAmount('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Send Custom Transaction</h3>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <div>
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          disabled={isLoading}
          required
        />
      </div>
      
      <div>
        <label>Amount (ETH):</label>
        <input
          type="number"
          step="0.0001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          disabled={isLoading}
          required
        />
      </div>
      
      <button type="submit" disabled={isLoading || !evmAddress}>
        {isLoading ? 'Sending...' : 'Send Transaction'}
      </button>
    </form>
  );
}
```

---

## **4. NETWORK AND CHAIN ID REFERENCE**

### **4.1 – Supported Networks with Chain IDs**

```tsx
// Base Networks (Direct Send with useSendEvmTransaction)
const BASE_NETWORKS = {
  "base": { chainId: 8453, explorer: "https://basescan.org" },
  "base-sepolia": { chainId: 84532, explorer: "https://sepolia.basescan.org" }
};

// Other EVM Networks (Sign + Broadcast with useSignEvmTransaction)
const OTHER_NETWORKS = {
  ethereum: { chainId: 1, explorer: "https://etherscan.io" },
  sepolia: { chainId: 11155111, explorer: "https://sepolia.etherscan.io" },
  polygon: { chainId: 137, explorer: "https://polygonscan.com" },
  arbitrum: { chainId: 42161, explorer: "https://arbiscan.io" }
};
```

### **4.2 – Network Selection Logic**

```tsx
"use client";

const getTransactionMethod = (chainId: number) => {
  const baseNetworks = [8453, 84532]; // Base mainnet and sepolia
  
  if (baseNetworks.includes(chainId)) {
    return 'direct-send'; // Use useSendEvmTransaction
  } else {
    return 'sign-broadcast'; // Use useSignEvmTransaction + external broadcast
  }
};
```

---

## **5. TRANSACTION ERROR HANDLING**

### **5.1 – Common Error Scenarios**

```tsx
"use client";

const handleTransactionError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient balance for this transaction';
    }
    if (error.message.includes('gas')) {
      return 'Transaction failed due to gas estimation issues';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection';
    }
    if (error.message.includes('rejected')) {
      return 'Transaction was rejected';
    }
  }
  return 'Transaction failed. Please try again.';
};

// Usage in transaction handlers
try {
  await sendTransaction(params);
} catch (error) {
  const userFriendlyMessage = handleTransactionError(error);
  setError(userFriendlyMessage);
}
```

---

## **6. AI MODEL VERIFICATION STEPS**

Before generating any CDP transaction code, you **MUST** verify:

1. **Network Compatibility**: Are you using the correct hook for the target network?
2. **Address Check**: Are you verifying `evmAddress` exists before sending?
3. **Value Format**: Are you using `bigint` in wei for transaction values?
4. **Chain ID Format**: Are you using `number` (not string) for chainId?
5. **Error Handling**: Are you wrapping transaction calls in try/catch?
6. **Loading States**: Are you handling loading states during transactions?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **7. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT use wrong value formats
value: "0.001" // Wrong - should be bigint in wei
value: 0.001   // Wrong - should be bigint in wei

// ❌ DO NOT use string chain IDs
chainId: "84532" // Wrong - should be number

// ❌ DO NOT skip address validation
await sendTransaction({ transaction: { /* ... */ } }); // Missing evmAccount

// ❌ DO NOT use useSendEvmTransaction for non-Base networks
// Trying to send to Ethereum mainnet with useSendEvmTransaction

// ❌ DO NOT mix transaction patterns
const signed = await useSignEvmTransaction(/* ... */);
const result = await useSendEvmTransaction(/* ... */); // Wrong - choose one approach
```

---

## **8. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate transaction code that:
- Uses wrong hooks for networks
- Incorrect value or chainId formats
- Missing address validation
- Lacks error handling

The transactions will:
1. **Fail silently** or with cryptic errors
2. **Send to wrong networks** with incorrect routing
3. **Fail validation** due to format issues
4. **Provide poor UX** without proper error feedback

---

## **9. AI MODEL RESPONSE TEMPLATE**

When implementing CDP Embedded Wallets transactions, you **MUST**:

1. **ALWAYS** use correct hook for target network (Base vs. others)
2. **ALWAYS** validate wallet address exists before sending
3. **ALWAYS** use `bigint` in wei for transaction values
4. **ALWAYS** use `number` format for chain IDs
5. **NEVER** skip error handling or loading states
6. **VERIFY** your response follows the correct patterns

**Remember: There are NO EXCEPTIONS to these rules.**