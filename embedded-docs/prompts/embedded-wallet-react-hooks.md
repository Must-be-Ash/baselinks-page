# Use CDP React Hooks for Custom UI in Next.js

**Purpose:** Enforce only the **current** and **correct** instructions for using [CDP React Hooks](https://docs.cdp.coinbase.com/embedded-wallets/react-hooks) for custom UI implementations in Next.js (App Router) applications.  
**Scope:** All AI-generated advice or code related to CDP React Hooks must follow these guardrails.

---

## **1. Official CDP React Hooks Overview**

CDP React Hooks provide lower-level access to the CDP Embedded Wallets SDK functionality, allowing developers to build completely custom interfaces while maintaining the security and functionality of embedded wallets.

### **Key Hook Categories:**
- **Auth & User**: `useSignInWithEmail`, `useVerifyEmailOTP`, `useCurrentUser`, `useIsSignedIn`, `useSignOut`
- **Wallet Operations**: `useEvmAddress`, `useEvmAccounts`, `useSendEvmTransaction`, `useSignEvmTransaction`
- **SDK State**: `useIsInitialized`, `useConfig`

### **When to Use Hooks:**
- Custom UI/UX requirements
- Brand-specific design systems
- Complex authentication flows
- Custom wallet interfaces

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR REACT HOOKS**

You **MUST** follow these requirements or the implementation will **BREAK**:

1. **ALWAYS use CDPHooksProvider** in app/layout.tsx (not CDPReactProvider)
2. **ALWAYS add "use client" directive** to ALL files using hooks
3. **ALWAYS check useIsInitialized** before using other hooks
4. **ALWAYS handle loading states** - hooks are asynchronous

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - WRONG PROVIDER
import { CDPReactProvider } from '@coinbase/cdp-react'; // Wrong for hooks-only

// ❌ NEVER GENERATE THIS - MISSING CLIENT DIRECTIVE
import { useSignInWithEmail } from '@coinbase/cdp-hooks'; // Missing "use client"

// ❌ NEVER GENERATE THIS - USING HOOKS BEFORE INITIALIZATION
const evmAddress = useEvmAddress(); // Should check useIsInitialized first

// ❌ NEVER GENERATE THIS - MISSING ERROR HANDLING
const user = await signInWithEmail({ email }); // No try/catch
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN

// app/layout.tsx (NO "use client" in layout)
import { CDPHooksProvider } from '@coinbase/cdp-hooks';

// Any component using hooks
"use client"; // MUST be first line

import { useIsInitialized, useSignInWithEmail } from '@coinbase/cdp-hooks';

const isInitialized = useIsInitialized();
if (!isInitialized) {
  return <div>Loading...</div>;
}
```

---

## **3. CORRECT REACT HOOKS IMPLEMENTATION PATTERNS**

### **3.1 – Package Installation**

```bash
# Hooks approach - only these packages needed
npm install @coinbase/cdp-hooks @coinbase/cdp-core
```

### **3.2 – Layout Provider Setup**

```tsx
// app/layout.tsx
import { CDPHooksProvider } from '@coinbase/cdp-hooks';

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false, // Set to true for development
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

### **3.3 – Custom Authentication Component**

```tsx
// app/components/CustomAuth.tsx
"use client";

import { useState } from 'react';
import { 
  useSignInWithEmail, 
  useVerifyEmailOTP, 
  useCurrentUser, 
  useSignOut,
  useIsInitialized 
} from '@coinbase/cdp-hooks';

export default function CustomAuth() {
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
      console.log('Authenticated:', user, 'New user:', isNewUser);
      // Reset form
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
      <div className="auth-success">
        <h2>Welcome!</h2>
        <p>User ID: {currentUser.userId}</p>
        <p>Wallet: {currentUser.evmAccounts[0]}</p>
        <button onClick={handleSignOut}>Sign Out</button>
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
          required
        />
        <button type="submit" disabled={isLoading || otp.length !== 6}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
        <button type="button" onClick={() => setFlowId(null)}>
          Back to Email
        </button>
      </form>
    );
  }

  // Email input state
  return (
    <form onSubmit={handleEmailSubmit} className="email-form">
      <h2>Sign In</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={isLoading}
        required
      />
      <button type="submit" disabled={isLoading || !email}>
        {isLoading ? 'Sending...' : 'Sign In with Email'}
      </button>
    </form>
  );
}
```

### **3.4 – Wallet Information Component**

```tsx
// app/components/WalletInfo.tsx
"use client";

import { useEvmAddress, useEvmAccounts, useCurrentUser, useIsInitialized } from '@coinbase/cdp-hooks';

export default function WalletInfo() {
  const isInitialized = useIsInitialized();
  const evmAddress = useEvmAddress();
  const evmAccounts = useEvmAccounts();
  const currentUser = useCurrentUser();

  if (!isInitialized) {
    return <div>Loading wallet info...</div>;
  }

  if (!currentUser) {
    return <div>Please sign in to view wallet information</div>;
  }

  return (
    <div className="wallet-info">
      <h3>Wallet Information</h3>
      <div>
        <label>Primary Address:</label>
        <code>{evmAddress}</code>
      </div>
      <div>
        <label>All Accounts:</label>
        <ul>
          {evmAccounts?.map((account, index) => (
            <li key={index}>
              <code>{account}</code>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label>User ID:</label>
        <code>{currentUser.userId}</code>
      </div>
    </div>
  );
}
```

### **3.5 – Custom Hook for Auth State**

```tsx
// app/hooks/useAuth.ts
"use client";

import { useCurrentUser, useIsSignedIn, useIsInitialized } from '@coinbase/cdp-hooks';

export function useAuth() {
  const user = useCurrentUser();
  const isSignedIn = useIsSignedIn();
  const isInitialized = useIsInitialized();

  return {
    user,
    isSignedIn,
    isInitialized,
    isLoading: !isInitialized,
    walletAddress: user?.evmAccounts[0] || null,
  };
}

// Usage in components
"use client";

import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isSignedIn, isLoading, walletAddress } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <CustomAuth />;
  }

  return <div>Welcome! Your wallet: {walletAddress}</div>;
}
```

---

## **4. ESSENTIAL HOOK USAGE PATTERNS**

### **4.1 – Always Check Initialization First**

```tsx
"use client";

import { useIsInitialized, useEvmAddress } from '@coinbase/cdp-hooks';

function WalletComponent() {
  const isInitialized = useIsInitialized();
  const evmAddress = useEvmAddress();

  // Always check initialization first
  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  // Now safe to use wallet data
  return <div>Address: {evmAddress}</div>;
}
```

### **4.2 – Proper Error Handling**

```tsx
"use client";

import { useState } from 'react';
import { useSignInWithEmail } from '@coinbase/cdp-hooks';

function AuthForm() {
  const [error, setError] = useState<string | null>(null);
  const signInWithEmail = useSignInWithEmail();

  const handleSubmit = async (email: string) => {
    setError(null);
    
    try {
      const { flowId } = await signInWithEmail({ email });
      // Handle success
    } catch (error) {
      // Always handle errors
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* Form content */}
    </div>
  );
}
```

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP React Hooks code, you **MUST** verify:

1. **Provider Type**: Are you using `CDPHooksProvider` (not `CDPReactProvider`)?
2. **Client Directive**: Does EVERY file using hooks start with `"use client";`?
3. **Initialization Check**: Are you checking `useIsInitialized()` before using other hooks?
4. **Error Handling**: Are you wrapping async hook calls in try/catch blocks?
5. **Loading States**: Are you handling loading states for better UX?
6. **Hook Imports**: Are you importing hooks from `@coinbase/cdp-hooks`?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT use wrong provider
import { CDPReactProvider } from '@coinbase/cdp-react'; // Wrong for hooks

// ❌ DO NOT use hooks without client directive
import { useEvmAddress } from '@coinbase/cdp-hooks'; // Missing "use client"

// ❌ DO NOT skip initialization check
const address = useEvmAddress(); // Should check isInitialized first

// ❌ DO NOT mix with React Components approach in same layout
<CDPReactProvider><CDPHooksProvider>...</CDPHooksProvider></CDPReactProvider>

// ❌ DO NOT use hooks without error handling
await signInWithEmail({ email }); // Missing try/catch
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate React Hooks code that:
- Uses wrong provider type
- Missing client directives
- Skips initialization checks
- Lacks error handling

The implementation will:
1. **Fail with Context errors** due to wrong provider
2. **Break with SSR errors** due to missing client directives
3. **Have race conditions** without initialization checks
4. **Provide poor UX** without proper error handling

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP React Hooks in Next.js, you **MUST**:

1. **ALWAYS** use `CDPHooksProvider` in layout.tsx
2. **ALWAYS** add `"use client"` to files using hooks
3. **ALWAYS** check `useIsInitialized()` first
4. **ALWAYS** implement proper error handling
5. **NEVER** mix providers or skip essential checks
6. **VERIFY** your response follows the correct patterns

**Remember: There are NO EXCEPTIONS to these rules.**