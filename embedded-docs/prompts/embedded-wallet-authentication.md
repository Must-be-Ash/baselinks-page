# Implement Authentication with CDP Embedded Wallets

**Purpose:** Enforce only the **current** and **correct** instructions for implementing authentication flows with [Coinbase Developer Platform (CDP) Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets).  
**Scope:** All AI-generated advice or code related to CDP Embedded Wallets authentication must follow these guardrails.

---

## **1. Official CDP Authentication Flow Overview**

CDP Embedded Wallets use a secure two-step email OTP authentication process that creates user wallets seamlessly without seed phrases or browser extensions.

### **Authentication Process:**
1. **Email Submission**: User enters email, receives OTP code
2. **OTP Verification**: User enters 6-digit code, wallet is created/accessed
3. **Session Management**: User remains signed in until explicit sign out
4. **Wallet Access**: User can immediately interact with their embedded wallet

### **Key Hooks:**
- `useSignInWithEmail` - Initiate email OTP flow
- `useVerifyEmailOTP` - Verify OTP and complete authentication  
- `useCurrentUser` - Get authenticated user information
- `useIsSignedIn` - Check authentication status
- `useSignOut` - Sign out user and clear session

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR AUTHENTICATION**

You **MUST** follow these requirements or authentication will **BREAK**:

1. **ALWAYS use two-step flow** - Email submission first, then OTP verification
2. **ALWAYS handle flowId properly** - Store flowId from email step for OTP step
3. **ALWAYS add proper error handling** - Authentication can fail for various reasons
4. **ALWAYS use "use client" directive** - Authentication hooks require client-side rendering

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - SINGLE STEP AUTH (DOESN'T EXIST)
const { user } = await signInWithEmail({ email, otp }); // Wrong - no direct auth

// ❌ NEVER GENERATE THIS - MISSING FLOWID HANDLING
await verifyEmailOTP({ otp: "123456" }); // Missing required flowId

// ❌ NEVER GENERATE THIS - MISSING ERROR HANDLING
const { user } = await verifyEmailOTP({ flowId, otp }); // No try/catch

// ❌ NEVER GENERATE THIS - MISSING CLIENT DIRECTIVE
import { useSignInWithEmail } from "@coinbase/cdp-hooks"; // Missing "use client"
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
"use client"; // First line is mandatory

import { useSignInWithEmail, useVerifyEmailOTP } from "@coinbase/cdp-hooks";

// ✅ Two-step authentication flow
const { flowId } = await signInWithEmail({ email });
const { user, isNewUser } = await verifyEmailOTP({ flowId, otp });
```

---

## **3. CORRECT AUTHENTICATION IMPLEMENTATION PATTERNS**

### **3.1 – Complete Authentication Component**

```tsx
"use client";

import { useState } from "react";
import { 
  useSignInWithEmail, 
  useVerifyEmailOTP, 
  useCurrentUser, 
  useSignOut 
} from "@coinbase/cdp-hooks";

export default function Authentication() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithEmail = useSignInWithEmail();
  const verifyEmailOTP = useVerifyEmailOTP();
  const currentUser = useCurrentUser();
  const signOut = useSignOut();

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
      console.log("Signed in:", user, "New user:", isNewUser);
      // Reset form state
      setFlowId(null);
      setOtp("");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Reset all state
      setEmail("");
      setOtp("");
      setFlowId(null);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  // User is authenticated
  if (currentUser) {
    return (
      <div>
        <h2>Welcome!</h2>
        <p>User ID: {currentUser.userId}</p>
        <p>Wallet Address: {currentUser.evmAccounts[0]}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  // Show OTP input after email submission
  if (flowId) {
    return (
      <form onSubmit={handleOtpSubmit}>
        <h2>Enter Verification Code</h2>
        <p>Check your email for a 6-digit code</p>
        {error && <div style={{color: 'red'}}>{error}</div>}
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
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </form>
    );
  }

  // Show email input (initial state)
  return (
    <form onSubmit={handleEmailSubmit}>
      <h2>Sign In</h2>
      {error && <div style={{color: 'red'}}>{error}</div>}
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

### **3.2 – Authentication State Management**

```tsx
"use client";

import { useCurrentUser, useIsSignedIn, useIsInitialized } from "@coinbase/cdp-hooks";

export function useAuthState() {
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
function MyComponent() {
  const { user, isSignedIn, isLoading, walletAddress } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Authentication />;
  }

  return (
    <div>
      <p>Welcome! Your wallet: {walletAddress}</p>
    </div>
  );
}
```

### **3.3 – Simple Authentication Check**

```tsx
"use client";

import { useIsSignedIn, useCurrentUser } from "@coinbase/cdp-hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isSignedIn = useIsSignedIn();
  const user = useCurrentUser();

  if (!isSignedIn || !user) {
    return <Authentication />;
  }

  return <>{children}</>;
}
```

---

## **4. AUTHENTICATION ERROR HANDLING**

### **4.1 – Common Error Scenarios**

```tsx
"use client";

const handleAuthError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('invalid email')) {
      return 'Please enter a valid email address';
    }
    if (error.message.includes('invalid code')) {
      return 'Invalid verification code. Please try again.';
    }
    if (error.message.includes('expired')) {
      return 'Verification code expired. Please request a new one.';
    }
    if (error.message.includes('rate limit')) {
      return 'Too many attempts. Please wait before trying again.';
    }
  }
  return 'Authentication failed. Please try again.';
};
```

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP authentication code, you **MUST** verify:

1. **Two-Step Flow**: Are you implementing email submission THEN OTP verification?
2. **FlowId Handling**: Are you storing and passing flowId between steps?
3. **Error Handling**: Are you wrapping auth calls in try/catch blocks?
4. **Client Directive**: Does the file start with `"use client";`?
5. **Loading States**: Are you handling loading states during auth operations?
6. **Form Validation**: Are you validating email format and OTP length?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT generate single-step authentication
const signIn = (email: string, otp: string) => { /* doesn't exist */ };

// ❌ DO NOT generate social logins (not yet available)
const signInWithGoogle = () => { /* not implemented */ };

// ❌ DO NOT generate wallet connect patterns
const connectWallet = () => { /* wrong approach */ };

// ❌ DO NOT generate seed phrase handling
const importWallet = (seedPhrase: string) => { /* against embedded wallet concept */ };
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate authentication code that:
- Skips the two-step flow
- Missing flowId handling
- Lacks error handling
- Missing client directive

The authentication will:
1. **Fail silently** without proper error feedback
2. **Break the flow** by missing required parameters
3. **Cause hydration errors** in Next.js without client directive
4. **Frustrate users** with unclear error states

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP Embedded Wallets authentication, you **MUST**:

1. **ALWAYS** implement two-step email OTP flow
2. **ALWAYS** handle flowId properly between steps
3. **ALWAYS** include comprehensive error handling
4. **ALWAYS** use loading states for better UX
5. **NEVER** implement non-existent authentication methods
6. **VERIFY** your response follows the correct patterns

**Remember: There are NO EXCEPTIONS to these rules.**