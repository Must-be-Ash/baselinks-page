# Add CDP Embedded Wallets to Your Existing App

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [CDP Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets) into existing applications for crypto payments functionality.  
**Scope:** All AI-generated advice for adding embedded wallet functionality must follow these guardrails.

---

## **1. Embedded Wallets Integration Overview**

This prompt helps you add comprehensive crypto wallet functionality to any existing application. Users can send/receive crypto without needing their own wallets - they just sign in with email and get a secure, non-custodial wallet.

### **What You'll Get:**
- Email-based wallet creation (no seed phrases)
- Send/receive crypto transactions
- Multiple network support (Base, Ethereum, Polygon)
- Mobile-friendly wallet interface
- Secure, non-custodial wallet infrastructure
- Custom branding and theming

### **Use Cases:**
- E-commerce crypto payments
- P2P payment apps
- Creator economy platforms
- DeFi application integration
- Gaming asset transfers
- Subscription payments
- Marketplace transactions

### **Two Implementation Approaches:**
1. **React Components** (Recommended) - Pre-built UI, fastest setup
2. **React Hooks** - Custom UI, full control over design

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR WALLET INTEGRATION**

You **MUST** follow these requirements or the implementation will **BREAK**:

1. **ALWAYS configure CORS first** - Wallets fail without proper CORS setup  
2. **ALWAYS use Base network for payments** - Lowest fees for users
3. **ALWAYS install all required packages** - Missing dependencies cause failures
4. **ALWAYS check useIsInitialized** - Prevents race conditions
5. **ALWAYS add proper error handling** - Transactions can fail

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - MISSING CORS SETUP
// Implementing without instructing user to configure CORS first

// ❌ NEVER GENERATE THIS - EXPENSIVE NETWORK
chainId: 1, // Ethereum mainnet - too expensive for most payments

// ❌ NEVER GENERATE THIS - MISSING CLIENT DIRECTIVE
import { useEvmAddress } from "@coinbase/cdp-hooks"; // Missing "use client"

// ❌ NEVER GENERATE THIS - WRONG PROVIDER TYPE
import { CDPReactProvider } from '@coinbase/cdp-react'; // Wrong for hooks-only

// ❌ NEVER GENERATE THIS - USING HOOKS BEFORE INITIALIZATION
const address = useEvmAddress(); // Should check useIsInitialized first

// ❌ NEVER GENERATE THIS - MISSING ERROR HANDLING
await sendTransaction({ ... }); // No try/catch
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN

// 1. CORS setup instruction first
// 2. Base network for low fees
chainId: 8453, // Base mainnet (low fees)

// 3. Proper initialization check
const isInitialized = useIsInitialized();
if (!isInitialized) {
  return <div>Loading wallet...</div>;
}

// 4. Client directive for hooks
"use client";
import { useEvmAddress } from "@coinbase/cdp-hooks";

// 5. Error handling for transactions
try {
  const result = await sendTransaction({ ... });
} catch (error) {
  setError(error instanceof Error ? error.message : 'Transaction failed');
}
```

---

## **3. SETUP PREREQUISITES**

### **3.1 – CDP Portal Configuration**

**Step 1: Create CDP Project**
```bash
# 1. Create account at https://portal.cdp.coinbase.com
# 2. Create new project for your app
# 3. Copy your Project ID from project settings
# 4. Go to https://portal.cdp.coinbase.com/products/embedded-wallets/cors
# 5. Add your app domains (e.g., https://yourapp.com, http://localhost:3000)
```

**Step 2: Environment Setup**
```typescript
// .env.local
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id-from-cdp-portal
```

---

## **4. APPROACH 1: REACT COMPONENTS (RECOMMENDED)**

### **4.1 – Package Installation**

```bash
# Both packages required for React Components approach
npm install @coinbase/cdp-react @coinbase/cdp-core @coinbase/cdp-hooks
```

### **4.2 – Layout Provider Setup**

```tsx
// app/layout.tsx
import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false, // Set to true for development
};

const appConfig = {
  name: "Your App Name",
  logoUrl: "https://yourapp.com/logo.png", // Optional
};

// Optional theme customization
const themeOverrides: Partial<Theme> = {
  "colors-background": "#ffffff",
  "colors-text": "#1a1a1a",
  "colors-primary": "#0052ff",
  "spacing-md": "16px",
  "borderRadius-md": "8px",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CDPReactProvider 
          config={cdpConfig} 
          app={appConfig}
          theme={themeOverrides}
        >
          {children}
        </CDPReactProvider>
      </body>
    </html>
  );
}
```

### **4.3 – Basic Wallet Integration**

```tsx
// app/wallet/page.tsx
"use client";

import { AuthButton } from '@coinbase/cdp-react';
import { 
  useIsInitialized, 
  useIsSignedIn, 
  useCurrentUser, 
  useEvmAddress 
} from '@coinbase/cdp-hooks';

export default function WalletPage() {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();
  const user = useCurrentUser();
  const evmAddress = useEvmAddress();

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="wallet-container">
      <h1>Your Wallet</h1>
      
      {/* Pre-built authentication button */}
      <AuthButton />
      
      {/* Show wallet info when signed in */}
      {isSignedIn && user && (
        <div className="wallet-info">
          <h2>Wallet Details</h2>
          <p><strong>Address:</strong> {evmAddress}</p>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Status:</strong> Connected</p>
        </div>
      )}
    </div>
  );
}
```

### **4.4 – Payment Component**

```tsx
// components/PaymentForm.tsx
"use client";

import { useState } from 'react';
import { AuthButton } from '@coinbase/cdp-react';
import { 
  useSendEvmTransaction, 
  useEvmAddress, 
  useIsSignedIn, 
  useIsInitialized 
} from '@coinbase/cdp-hooks';

interface PaymentFormProps {
  recipientAddress: string;
  amount: string;
  description?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({ 
  recipientAddress, 
  amount, 
  description,
  onSuccess,
  onError 
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useSendEvmTransaction();
  const evmAddress = useEvmAddress();
  const isSignedIn = useIsSignedIn();
  const isInitialized = useIsInitialized();

  const handlePayment = async () => {
    if (!evmAddress || !recipientAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert ETH to wei
      const valueInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: recipientAddress,
          value: valueInWei,
          chainId: 8453, // Base mainnet (low fees)
          type: "eip1559",
        },
        network: "base",
      });

      setTxHash(result.transactionHash);
      onSuccess?.(result.transactionHash);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading payment system...</div>;
  }

  if (txHash) {
    return (
      <div className="payment-success">
        <h3>✅ Payment Successful!</h3>
        <p>Amount: {amount} ETH</p>
        <p>To: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
        {description && <p>"{description}"</p>}
        <a 
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-link"
        >
          View Transaction
        </a>
        <button 
          onClick={() => {
            setTxHash(null);
            setError(null);
          }}
          className="reset-button"
        >
          Make Another Payment
        </button>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="payment-signin">
        <h3>💳 Make Payment</h3>
        <p>Amount: {amount} ETH</p>
        <p>To: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
        {description && <p>For: {description}</p>}
        <p>Sign in with email to complete payment</p>
        <AuthButton />
        <p className="powered-by">Powered by Coinbase • No wallet needed</p>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h3>💳 Confirm Payment</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="payment-details">
        <div className="detail-row">
          <span>Amount:</span>
          <span>{amount} ETH</span>
        </div>
        <div className="detail-row">
          <span>To:</span>
          <span>{recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</span>
        </div>
        {description && (
          <div className="detail-row">
            <span>Description:</span>
            <span>{description}</span>
          </div>
        )}
        <div className="detail-row">
          <span>Network:</span>
          <span>Base (Low fees)</span>
        </div>
        <div className="detail-row">
          <span>From:</span>
          <span>{evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="pay-button"
      >
        {isLoading ? 'Processing...' : `Pay ${amount} ETH`}
      </button>
    </div>
  );
}
```

---

## **5. APPROACH 2: REACT HOOKS (CUSTOM UI)**

### **5.1 – Package Installation**

```bash
# Hooks approach - only these packages needed
npm install @coinbase/cdp-hooks @coinbase/cdp-core
```

### **5.2 – Layout Provider Setup**

```tsx
// app/layout.tsx
import { CDPHooksProvider } from '@coinbase/cdp-hooks';

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CDPHooksProvider config={cdpConfig}>
          {children}
        </CDPHooksProvider>
      </body>
    </html>
  );
}
```

### **5.3 – Custom Authentication Component**

```tsx
// components/CustomWalletAuth.tsx
"use client";

import { useState } from 'react';
import { 
  useSignInWithEmail, 
  useVerifyEmailOTP, 
  useCurrentUser, 
  useSignOut,
  useIsInitialized 
} from '@coinbase/cdp-hooks';

export default function CustomWalletAuth() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [flowId, setFlowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitialized = useIsInitialized();
  const signInWithEmail = useSignInWithEmail();
  const verifyEmailOTP = useVerifyEmailOTP();
  const currentUser = useCurrentUser();
  const signOut = useSignOut();

  // Wait for SDK initialization
  if (!isInitialized) {
    return <div className="loading">Initializing wallet...</div>;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { flowId } = await signInWithEmail({ email });
      setFlowId(flowId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { user, isNewUser } = await verifyEmailOTP({ flowId, otp });
      console.log('Wallet created:', user, 'New user:', isNewUser);
      setFlowId(null);
      setOtp('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setEmail('');
      setOtp('');
      setFlowId(null);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  // Authenticated state
  if (currentUser) {
    return (
      <div className="wallet-connected">
        <h2>🎉 Wallet Connected</h2>
        <div className="wallet-details">
          <p><strong>Address:</strong> {currentUser.evmAccounts[0]}</p>
          <p><strong>User ID:</strong> {currentUser.userId}</p>
        </div>
        <button onClick={handleSignOut} className="signout-button">
          Sign Out
        </button>
      </div>
    );
  }

  // OTP verification state
  if (flowId) {
    return (
      <form onSubmit={handleOtpSubmit} className="otp-form">
        <h2>Enter Verification Code</h2>
        <p>Check your email for a 6-digit code</p>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="000000"
          maxLength={6}
          disabled={isLoading}
          className="otp-input"
          required
        />
        <div className="form-actions">
          <button type="submit" disabled={isLoading || otp.length !== 6}>
            {isLoading ? 'Verifying...' : 'Create Wallet'}
          </button>
          <button type="button" onClick={() => setFlowId(null)}>
            Back to Email
          </button>
        </div>
      </form>
    );
  }

  // Email input state
  return (
    <form onSubmit={handleEmailSubmit} className="email-form">
      <h2>Create Your Wallet</h2>
      <p>Enter your email to create a secure crypto wallet</p>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={isLoading}
        className="email-input"
        required
      />
      <button type="submit" disabled={isLoading || !email}>
        {isLoading ? 'Sending Code...' : 'Create Wallet'}
      </button>
      <p className="privacy-note">
        No seed phrases. No downloads. Your keys are secured by Coinbase.
      </p>
    </form>
  );
}
```

---

## **6. COMMON INTEGRATION PATTERNS**

### **6.1 – E-commerce Checkout**

```tsx
// components/CryptoCheckout.tsx
"use client";

import { useState } from 'react';
import PaymentForm from './PaymentForm';

interface CheckoutProps {
  items: Array<{ name: string; price: number; }>;
  merchantAddress: string;
}

export default function CryptoCheckout({ items, merchantAddress }: CheckoutProps) {
  const [paymentStep, setPaymentStep] = useState<'review' | 'payment' | 'success'>('review');
  const [txHash, setTxHash] = useState<string | null>(null);

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const totalEth = (totalAmount * 0.0003).toFixed(6); // Example conversion rate

  const handlePaymentSuccess = (hash: string) => {
    setTxHash(hash);
    setPaymentStep('success');
  };

  if (paymentStep === 'payment') {
    return (
      <PaymentForm
        recipientAddress={merchantAddress}
        amount={totalEth}
        description={`Purchase: ${items.map(i => i.name).join(', ')}`}
        onSuccess={handlePaymentSuccess}
        onError={(error) => console.error('Payment failed:', error)}
      />
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="checkout-success">
        <h2>🎉 Order Complete!</h2>
        <p>Payment processed successfully</p>
        <p>Transaction: {txHash}</p>
        <button onClick={() => window.location.href = '/'}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-review">
      <h2>Order Summary</h2>
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <span>{item.name}</span>
            <span>${item.price}</span>
          </div>
        ))}
      </div>
      <div className="total-row">
        <span>Total: ${totalAmount} ({totalEth} ETH)</span>
      </div>
      <button 
        onClick={() => setPaymentStep('payment')}
        className="pay-crypto-button"
      >
        Pay with Crypto
      </button>
    </div>
  );
}
```

### **6.2 – P2P Payment Interface**

```tsx
// components/P2PPayment.tsx
"use client";

import { useState } from 'react';
import { AuthButton } from '@coinbase/cdp-react';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';

export default function P2PPayment() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const isSignedIn = useIsSignedIn();
  const evmAddress = useEvmAddress();

  const handleSend = () => {
    if (recipient && amount) {
      setShowPayment(true);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p2p-signin">
        <h2>💸 Send Crypto</h2>
        <p>Connect your wallet to send crypto to anyone</p>
        <AuthButton />
      </div>
    );
  }

  if (showPayment) {
    return (
      <PaymentForm
        recipientAddress={recipient}
        amount={amount}
        description={message || 'P2P Payment'}
        onSuccess={(txHash) => {
          alert(`Payment sent! Transaction: ${txHash}`);
          setShowPayment(false);
          setRecipient('');
          setAmount('');
          setMessage('');
        }}
        onError={(error) => {
          alert(`Payment failed: ${error}`);
          setShowPayment(false);
        }}
      />
    );
  }

  return (
    <div className="p2p-form">
      <h2>💸 Send Crypto</h2>
      <div className="sender-info">
        <p>From: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}</p>
      </div>
      
      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="address-input"
        />
      </div>

      <div className="form-group">
        <label>Amount (ETH):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.001"
          step="0.001"
          min="0"
          className="amount-input"
        />
      </div>

      <div className="form-group">
        <label>Message (Optional):</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="For coffee ☕"
          className="message-input"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!recipient || !amount}
        className="send-button"
      >
        Send {amount} ETH
      </button>
    </div>
  );
}
```

---

## **7. NETWORK CONFIGURATION**

### **7.1 – Supported Networks**

```tsx
// Network configurations for different use cases

// Base (Recommended for most apps)
const baseConfig = {
  chainId: 8453,
  network: "base",
  name: "Base",
  fees: "~$0.01",
  use: "General payments, low fees"
};

// Base Sepolia (Testing)
const baseSepoliaConfig = {
  chainId: 84532,
  network: "base-sepolia",
  name: "Base Sepolia",
  fees: "Free",
  use: "Development and testing"
};

// Ethereum (High-value transactions)
const ethereumConfig = {
  chainId: 1,
  network: "ethereum-mainnet",
  name: "Ethereum",
  fees: "$5-50",
  use: "High-value transactions only"
};

// Polygon (Alternative low-cost)
const polygonConfig = {
  chainId: 137,
  network: "polygon-mainnet",
  name: "Polygon",
  fees: "~$0.01",
  use: "Alternative to Base"
};
```

### **7.2 – Dynamic Network Selection**

```tsx
"use client";

import { useState } from 'react';

interface NetworkConfig {
  chainId: number;
  network: string;
  name: string;
  fees: string;
}

const networks: NetworkConfig[] = [
  { chainId: 8453, network: "base", name: "Base", fees: "~$0.01" },
  { chainId: 137, network: "polygon-mainnet", name: "Polygon", fees: "~$0.01" },
  { chainId: 1, network: "ethereum-mainnet", name: "Ethereum", fees: "$5-50" },
];

export default function NetworkSelector({ onNetworkChange }: { onNetworkChange: (network: NetworkConfig) => void }) {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const handleNetworkChange = (network: NetworkConfig) => {
    setSelectedNetwork(network);
    onNetworkChange(network);
  };

  return (
    <div className="network-selector">
      <label>Payment Network:</label>
      <select 
        value={selectedNetwork.chainId}
        onChange={(e) => {
          const network = networks.find(n => n.chainId === parseInt(e.target.value));
          if (network) handleNetworkChange(network);
        }}
      >
        {networks.map((network) => (
          <option key={network.chainId} value={network.chainId}>
            {network.name} (Fees: {network.fees})
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## **8. SETUP CHECKLIST**

### **8.1 – Before Integration**

- [ ] Create CDP Portal account at https://portal.cdp.coinbase.com
- [ ] Create new project and copy Project ID
- [ ] Configure CORS settings with your app domains
- [ ] Choose implementation approach (Components vs Hooks)
- [ ] Plan your payment flow and UI/UX

### **8.2 – Development Setup**

- [ ] Install required packages based on chosen approach
- [ ] Add environment variable `NEXT_PUBLIC_CDP_PROJECT_ID`
- [ ] Set up provider in app/layout.tsx
- [ ] Test on Base Sepolia testnet first (chainId: 84532)
- [ ] Implement error handling and loading states

### **8.3 – Production Launch**

- [ ] Switch to Base mainnet (chainId: 8453) for low fees
- [ ] Add production domains to CORS settings
- [ ] Test complete payment flows end-to-end
- [ ] Monitor transaction success rates
- [ ] Set up error tracking and analytics

---

## **9. AI MODEL VERIFICATION STEPS**

Before generating embedded wallet integration code, you **MUST** verify:

1. **CORS Configuration**: Did you instruct user to configure CORS first?
2. **Package Installation**: Are you including all required packages for chosen approach?
3. **Provider Setup**: Is the correct provider used in the right location?
4. **Network Choice**: Are you using Base (8453) for low-cost payments?
5. **Error Handling**: Are you implementing proper try/catch and error states?
6. **Initialization Check**: Are you checking `useIsInitialized` before using other hooks?
7. **Client Directive**: Are you using `"use client"` only when needed?
8. **Loading States**: Are you handling loading states for better UX?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **10. COMMON CUSTOMIZATIONS**

### **10.1 – Custom Styling**

```css
/* Example CSS for payment components */
.payment-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  background: #ffffff;
}

.payment-success {
  text-align: center;
  padding: 32px;
  background: #f0f9f0;
  border: 1px solid #4caf50;
  border-radius: 12px;
}

.error-message {
  background: #ffeaea;
  color: #d32f2f;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #ffcdd2;
}

.pay-button {
  width: 100%;
  padding: 16px;
  background: #0052ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pay-button:hover:not(:disabled) {
  background: #0041cc;
}

.pay-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
```

### **10.2 – Transaction Tracking**

```tsx
"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  hash: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (tx: Omit<Transaction, 'timestamp' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      status: 'pending'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <div className="tx-list">
          {transactions.map((tx, index) => (
            <div key={index} className="tx-item">
              <div className="tx-info">
                <span className="tx-hash">{tx.hash.slice(0, 10)}...</span>
                <span className="tx-amount">{tx.value} ETH</span>
                <span className={`tx-status ${tx.status}`}>{tx.status}</span>
              </div>
              <a 
                href={`https://basescan.org/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## **11. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate wallet integration code that:
- Skips CORS configuration
- Uses expensive networks
- Missing error handling
- Wrong provider setup
- Incorrect client directives

The implementation will:
1. **Fail completely** due to CORS errors
2. **Cost users too much** in transaction fees
3. **Provide poor UX** without proper error handling
4. **Break with hydration errors** from incorrect setup
5. **Have race conditions** without initialization checks

---

## **12. AI MODEL RESPONSE TEMPLATE**

When implementing CDP Embedded Wallets in any application, you **MUST**:

1. **ALWAYS** instruct CORS configuration first
2. **ALWAYS** use Base network (8453) for low-cost payments
3. **ALWAYS** include proper error handling and loading states
4. **ALWAYS** check initialization before using wallet functions
5. **ALWAYS** use correct provider for chosen approach
6. **NEVER** skip critical setup steps or use expensive networks
7. **VERIFY** your response follows all verification steps

**Remember: These wallets handle real money - there are NO EXCEPTIONS to these rules.**