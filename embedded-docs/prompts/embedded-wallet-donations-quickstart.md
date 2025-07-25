# Add Crypto Donations with CDP Embedded Wallets

**Purpose:** Enforce only the **current** and **correct** instructions for quickly adding crypto donation functionality to existing websites using [CDP Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets).  
**Scope:** All AI-generated advice for adding donation features must follow these guardrails.

---

## **1. Quick Donation Integration Overview**

This prompt helps you add a simple "Support Me with Crypto" donation button to any existing website, blog, or personal site. Users can donate crypto without needing their own wallets - they just sign in with email.

### **What You'll Get:**
- Simple donation button for your site
- Users donate via email sign-in (no wallet needed)
- Receive donations directly to your wallet
- Works on Base network (low fees)
- Mobile-friendly donation flow

### **Use Cases:**
- Blog/personal website donations
- Content creator support
- Open source project funding
- Newsletter/podcast monetization

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR DONATION SETUP**

You **MUST** follow these requirements or donations will **BREAK**:

1. **ALWAYS use your recipient address** - User needs their own wallet address to receive donations
2. **ALWAYS configure CORS first** - Donations fail without proper CORS setup  
3. **ALWAYS use Base Sepolia for testing** - Don't lose real money during development
4. **ALWAYS add "use client" directive** - Required for donation components

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - MISSING RECIPIENT ADDRESS
const donationAddress = ""; // Must be user's actual wallet address

// ❌ NEVER GENERATE THIS - WRONG NETWORK FOR DONATIONS
chainId: 1, // Expensive Ethereum mainnet - use Base (8453) instead

// ❌ NEVER GENERATE THIS - MISSING CORS SETUP
// Implementing without instructing user to configure CORS

// ❌ NEVER GENERATE THIS - MISSING CLIENT DIRECTIVE
import { CDPReactProvider } from "@coinbase/cdp-react"; // Missing "use client"
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN

// 1. CORS setup instruction first
// 2. User's recipient wallet address
const DONATION_ADDRESS = "0xYourWalletAddress"; // User replaces with their address

// 3. Base network for low fees
chainId: 8453, // Base mainnet (low fees)

// 4. Client directive for components
"use client";
import { CDPReactProvider } from "@coinbase/cdp-react";
```

---

## **3. CORRECT DONATION IMPLEMENTATION PATTERNS**

### **3.1 – Prerequisites Setup**

**Step 1: Get Your Wallet Address**
```bash
# You need a wallet address to receive donations
# Options:
# - Use existing MetaMask/Coinbase Wallet address
# - Create new wallet at https://wallet.coinbase.com
# - Use any Ethereum-compatible address

# Example format: 0x1234567890123456789012345678901234567890
```

**Step 2: CDP Portal Setup**
```bash
# 1. Create account at https://portal.cdp.coinbase.com
# 2. Create new project
# 3. Copy your Project ID
# 4. Go to https://portal.cdp.coinbase.com/products/embedded-wallets/cors
# 5. Add your website domain (e.g., https://yourblog.com)
```

**Step 3: Install Packages**
```bash
npm install @coinbase/cdp-react @coinbase/cdp-core @coinbase/cdp-hooks
```

### **3.2 – Simple Donation Button (Add to Any Page)**

```tsx
// components/DonationButton.tsx
"use client";

import { useState } from 'react';
import { CDPReactProvider } from '@coinbase/cdp-react';
import { 
  useSendEvmTransaction, 
  useEvmAddress, 
  useIsSignedIn, 
  useIsInitialized 
} from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react';

// 🔥 REPLACE WITH YOUR ACTUAL WALLET ADDRESS
const DONATION_ADDRESS = "0xYourWalletAddressHere";

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

const appConfig = {
  name: "Support My Work",
  logoUrl: "https://your-site.com/logo.png",
};

function DonationForm() {
  const [amount, setAmount] = useState('0.001');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useSendEvmTransaction();
  const evmAddress = useEvmAddress();
  const isSignedIn = useIsSignedIn();
  const isInitialized = useIsInitialized();

  const handleDonate = async () => {
    if (!evmAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert ETH to wei
      const valueInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

      const result = await sendTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: DONATION_ADDRESS,
          value: valueInWei,
          chainId: 8453, // Base mainnet (low fees)
          type: "eip1559",
        },
        network: "base",
      });

      setTxHash(result.transactionHash);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Donation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Loading donation system...</div>;
  }

  if (txHash) {
    return (
      <div style={{
        padding: '20px',
        border: '2px solid #28a745',
        borderRadius: '8px',
        background: '#d4edda',
        textAlign: 'center'
      }}>
        <h3>🎉 Thank You for Your Support!</h3>
        <p>Your donation of {amount} ETH was sent successfully!</p>
        <a 
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{color: '#007bff'}}
        >
          View Transaction
        </a>
        <br />
        <button 
          onClick={() => {
            setTxHash(null);
            setAmount('0.001');
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Donate Again
        </button>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{
        padding: '20px',
        border: '2px solid #007bff',
        borderRadius: '8px',
        textAlign: 'center',
        background: '#f8f9fa'
      }}>
        <h3>💝 Support My Work</h3>
        <p>Sign in with email to send a crypto donation</p>
        <AuthButton />
        <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
          Powered by Coinbase • No wallet needed
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      background: '#f8f9fa'
    }}>
      <h3>💝 Support My Work</h3>
      
      {error && (
        <div style={{color: 'red', marginBottom: '10px'}}>
          {error}
        </div>
      )}

      <div style={{marginBottom: '15px'}}>
        <label style={{display: 'block', marginBottom: '5px'}}>
          Donation Amount (ETH):
        </label>
        <select 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="0.001">0.001 ETH (~$2)</option>
          <option value="0.005">0.005 ETH (~$10)</option>
          <option value="0.01">0.01 ETH (~$20)</option>
          <option value="0.05">0.05 ETH (~$100)</option>
        </select>
      </div>

      <button
        onClick={handleDonate}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {isLoading ? 'Sending...' : `Donate ${amount} ETH`}
      </button>

      <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
        Sent on Base network • Low fees • Your wallet: {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
      </p>
    </div>
  );
}

export default function DonationButton() {
  return (
    <CDPReactProvider config={cdpConfig} app={appConfig}>
      <DonationForm />
    </CDPReactProvider>
  );
}
```

### **3.3 – Environment Variables**

```typescript
// .env.local
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id-from-cdp-portal
```

### **3.4 – Usage in Any Page**

```tsx
// pages/blog-post.tsx or app/blog/page.tsx
import DonationButton from '@/components/DonationButton';

export default function BlogPost() {
  return (
    <article>
      <h1>My Blog Post</h1>
      <p>Your amazing content here...</p>
      
      {/* Add donation button anywhere */}
      <DonationButton />
      
      <p>More content...</p>
    </article>
  );
}
```

### **3.5 – Minimal Donation Widget (Embed Anywhere)**

```tsx
// components/MinimalDonation.tsx
"use client";

import { CDPReactProvider } from '@coinbase/cdp-react';
import { AuthButton } from '@coinbase/cdp-react';

const DONATION_ADDRESS = "0xYourWalletAddressHere";

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

const appConfig = {
  name: "Support",
};

function MinimalWidget() {
  return (
    <div style={{
      display: 'inline-block',
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      background: '#f9f9f9',
      textAlign: 'center'
    }}>
      <div style={{marginBottom: '10px'}}>☕ Buy me a coffee</div>
      <AuthButton />
      <div style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>
        Crypto donations via email
      </div>
    </div>
  );
}

export default function MinimalDonation() {
  return (
    <CDPReactProvider config={cdpConfig} app={appConfig}>
      <MinimalWidget />
    </CDPReactProvider>
  );
}
```

---

## **4. SETUP CHECKLIST**

### **4.1 – Before You Start**

- [ ] Create CDP Portal account at https://portal.cdp.coinbase.com
- [ ] Copy your Project ID from project settings
- [ ] Get your wallet address to receive donations
- [ ] Add your website domain to CORS settings

### **4.2 – Development Setup**

- [ ] Install required packages (`@coinbase/cdp-react @coinbase/cdp-core @coinbase/cdp-hooks`)
- [ ] Add environment variable `NEXT_PUBLIC_CDP_PROJECT_ID`
- [ ] Replace `DONATION_ADDRESS` with your actual wallet address
- [ ] Test on Base Sepolia testnet first (chainId: 84532)

### **4.3 – Production Setup**

- [ ] Switch to Base mainnet (chainId: 8453) for low fees
- [ ] Add production domain to CORS settings
- [ ] Test donation flow end-to-end
- [ ] Monitor donations in your wallet

---

## **5. COMMON CUSTOMIZATIONS**

### **5.1 – Custom Styling**

```tsx
// Custom CSS for your site's theme
const donationStyles = {
  container: {
    fontFamily: "your-site-font",
    maxWidth: "400px",
    margin: "20px auto",
  },
  button: {
    background: "var(--your-primary-color)",
    borderRadius: "var(--your-border-radius)",
  }
};
```

### **5.2 – Different Networks**

```tsx
// Polygon (cheaper alternative)
chainId: 137, // Polygon mainnet
network: "polygon-mainnet",

// Ethereum (if you prefer)
chainId: 1, // Ethereum mainnet (higher fees)
network: "ethereum-mainnet", // Note: requires sign+broadcast pattern
```

### **5.3 – Goal Tracking**

```tsx
const [totalDonated, setTotalDonated] = useState(0);
const GOAL_AMOUNT = 1; // 1 ETH goal

// Update after successful donation
setTotalDonated(prev => prev + parseFloat(amount));

// Show progress
<div>Goal: {totalDonated.toFixed(3)} / {GOAL_AMOUNT} ETH</div>
```

---

## **6. AI MODEL VERIFICATION STEPS**

Before generating donation integration code, you **MUST** verify:

1. **Recipient Address**: Did you instruct user to replace with their actual wallet address?
2. **CORS Configuration**: Did you remind user to configure CORS first?
3. **Network Choice**: Are you using Base (8453) for low fees, not expensive Ethereum?
4. **Error Handling**: Are you handling donation failures gracefully?
5. **User Experience**: Is the donation flow clear and user-friendly?
6. **Testing Network**: Did you mention testing on Base Sepolia first?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **7. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT use expensive networks for donations
chainId: 1, // Ethereum mainnet - too expensive for small donations

// ❌ DO NOT forget recipient address
const DONATION_ADDRESS = ""; // Must be actual wallet address

// ❌ DO NOT skip user-friendly amounts
value: 1000000000000000n, // Use preset options like 0.001 ETH instead

// ❌ DO NOT create complex flows for simple donations
// Multiple steps, confusing UI - keep it simple!

// ❌ DO NOT skip success feedback
// Users need to know their donation worked
```

---

## **8. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate donation code that:
- Uses expensive networks
- Missing recipient address
- Complex user flows
- Poor error handling

The donations will:
1. **Cost too much in fees** (users won't donate)
2. **Fail to reach recipient** (wrong or missing address)
3. **Confuse users** (complex flows reduce donations)
4. **Provide poor feedback** (users unsure if donation worked)

---

## **9. AI MODEL RESPONSE TEMPLATE**

When implementing crypto donations with CDP, you **MUST**:

1. **ALWAYS** use Base network for low fees (chainId: 8453)
2. **ALWAYS** instruct user to replace donation address with their own
3. **ALWAYS** mention CORS configuration requirement
4. **ALWAYS** keep the donation flow simple and clear
5. **NEVER** use expensive networks or complex flows
6. **VERIFY** your response follows donation best practices

**Remember: There are NO EXCEPTIONS to these rules.**