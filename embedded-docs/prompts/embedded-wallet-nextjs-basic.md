# Add CDP Embedded Wallets to Next.js App Router

**Purpose:** Enforce only the **current** and **correct** instructions for basic integration of [Coinbase Developer Platform (CDP) Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets) into a Next.js (App Router) application.  
**Scope:** All AI-generated advice or code related to CDP Embedded Wallets basic setup must follow these guardrails.

---

## **1. Official CDP Embedded Wallet Basic Integration Overview**

Coinbase Embedded Wallets provide secure, user-custodial Web3 wallets that integrate directly into your application without requiring users to manage seed phrases or browser extensions.

### **Basic Integration Steps:**
1. **Install** `@coinbase/cdp-core` package
2. **Set up** environment variables with your CDP Project ID  
3. **Configure** CORS origins in CDP Portal (MANDATORY)
4. **Choose** integration approach (React Components, React Hooks, or Wagmi)
5. **Verify** Next.js App Router compatibility

### **Prerequisites:**
- Node.js 20 or 22 (Node.js 21 is NOT supported)
- CDP Portal account with Project ID from https://portal.cdp.coinbase.com
- Next.js App Router structure (`app/` directory)

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR NEXT.JS**

You **MUST** follow these requirements or the implementation will **BREAK**:

1. **ALWAYS add `"use client"` directive** at the top of ANY file using CDP components or hooks:
```tsx
"use client"; // MUST be the first line

import { CDPReactProvider } from "@coinbase/cdp-react";
```

2. **NEVER use Node.js 21** - Only Node.js 20 or 22 are supported

3. **ALWAYS configure CORS** before implementing - the app will fail without proper CORS setup

4. **ALWAYS use App Router structure** (`app/` directory, not `pages/`)

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - WILL BREAK APPLICATION
// Missing "use client" directive
import { CDPReactProvider } from "@coinbase/cdp-react";

// ❌ NEVER GENERATE THIS - WRONG NODE VERSION  
"engines": { "node": "21" } // Unsupported version

// ❌ NEVER GENERATE THIS - PAGES ROUTER PATTERN
pages/wallet.tsx // Outdated approach for new implementations

// ❌ NEVER GENERATE THIS - MISSING CORS
// Implementing without instructing user to configure CORS
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
"use client"; // First line is mandatory

import { CDPReactProvider } from "@coinbase/cdp-react";
// or
import { CDPHooksProvider } from "@coinbase/cdp-hooks";
```

---

## **3. CORRECT BASIC SETUP PATTERNS**

### **3.1 – Package Installation**

```bash
# Core package (always required)
npm install @coinbase/cdp-core

# Choose ONE integration approach:
# Option 1: React Components (easiest)
npm install @coinbase/cdp-react @coinbase/cdp-hooks

# Option 2: React Hooks (custom UI)  
npm install @coinbase/cdp-hooks

# Option 3: Wagmi Integration (existing wagmi apps)
npm install @coinbase/cdp-wagmi @tanstack/react-query viem wagmi
```

### **3.2 – Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id-from-cdp-portal
```

### **3.3 – Basic Provider Setup (React Components)**

```tsx
// app/layout.tsx
import { CDPReactProvider } from '@coinbase/cdp-react';

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

const appConfig = {
  name: "My App",
  logoUrl: "https://your-logo-url.com/logo.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CDPReactProvider config={cdpConfig} app={appConfig}>
          {children}
        </CDPReactProvider>
      </body>
    </html>
  );
}
```

### **3.4 – Basic Authentication Check**

```tsx
// app/page.tsx
"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react";

export default function HomePage() {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Web3 App</h1>
      <AuthButton />
      {isSignedIn && <p>✅ Wallet connected!</p>}
    </div>
  );
}
```

---

## **4. MANDATORY CORS CONFIGURATION**

Before ANY implementation will work, user MUST:

1. Visit https://portal.cdp.coinbase.com/products/embedded-wallets/cors
2. Click "Add origin"
3. Add origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
4. Save changes (takes effect immediately)

**CORS Format Requirements:**
- Format: `<scheme>://<host>:<port>`
- Schemes: `http` or `https`
- Port optional for 80 (http) and 443 (https)
- Maximum 50 origins per project
- Example: `https://myapp.com`, `http://localhost:3000`

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP Embedded Wallet basic setup code, you **MUST** verify:

1. **Client Directive**: Does EVERY file using CDP hooks/components start with `"use client";`?
2. **Package Imports**: Are you importing from the correct packages (`@coinbase/cdp-react` or `@coinbase/cdp-hooks`)?
3. **App Router**: Are you using `app/` directory structure (not `pages/`)?
4. **Node Version**: Are you specifying Node.js 20 or 22 (not 21)?
5. **Environment Variables**: Are you using `NEXT_PUBLIC_CDP_PROJECT_ID`?  
6. **CORS Instructions**: Did you instruct the user to configure CORS?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT generate files missing "use client" directive
import { CDPReactProvider } from "@coinbase/cdp-react"; // Will break

// ❌ DO NOT use pages router structure for new implementations
pages/wallet.tsx // Outdated approach

// ❌ DO NOT use deprecated imports or patterns  
import { createClient } from '@coinbase/wallet-sdk' // Wrong SDK

// ❌ DO NOT suggest Node.js 21
"engines": { "node": "21" } // Unsupported version
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate code that:
- Missing `"use client"` directive
- Uses unsupported Node.js version
- Lacks CORS configuration instructions
- Uses pages router structure

The implementation will:
1. **Fail with React Context errors** (`createContext is not a function`)
2. **Break in production** with SSR/hydration issues
3. **Fail CORS checks** and block API requests
4. **Cause authentication loops** and wallet connection failures

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP Embedded Wallets basic setup in Next.js, you **MUST**:

1. **ALWAYS** start components with `"use client";`
2. **ALWAYS** use App Router structure (`app/` directory)
3. **ALWAYS** instruct user to configure CORS first
4. **ALWAYS** specify supported Node.js versions (20 or 22)
5. **NEVER** use deprecated patterns or packages
6. **VERIFY** your response against these patterns

**Remember: There are NO EXCEPTIONS to these rules.**