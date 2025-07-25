# Use CDP React Components in Next.js

**Purpose:** Enforce only the **current** and **correct** instructions for using [CDP React Components](https://docs.cdp.coinbase.com/embedded-wallets/react-components) in Next.js (App Router) applications.  
**Scope:** All AI-generated advice or code related to CDP React Components must follow these guardrails.

---

## **1. Official CDP React Components Overview**

CDP React Components provide pre-built, customizable UI elements for common wallet and authentication flows, built on top of the CDP Embedded Wallets SDK. This is the **recommended approach** for most applications.

### **Key Components:**
- `CDPReactProvider` - Main provider component
- `AuthButton` - Pre-built authentication button (sign in/out)
- Theme customization system
- App configuration options

### **Benefits:**
- Fastest implementation time
- Built-in UI/UX best practices
- Automatic theme support
- Consistent user experience

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR REACT COMPONENTS**

You **MUST** follow these requirements or the implementation will **BREAK**:

1. **ALWAYS install both packages**: `@coinbase/cdp-react` AND `@coinbase/cdp-hooks`
2. **ALWAYS use CDPReactProvider** in app/layout.tsx (not individual pages)
3. **ALWAYS configure cdpConfig, appConfig** - components need this context
4. **COMPONENTS don't need "use client"** - but custom hooks usage does

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - MISSING CDP-HOOKS PACKAGE
npm install @coinbase/cdp-react // Missing @coinbase/cdp-hooks

// ❌ NEVER GENERATE THIS - PROVIDER IN WRONG LOCATION
// app/page.tsx (wrong - should be in layout.tsx)
<CDPReactProvider><AuthButton /></CDPReactProvider>

// ❌ NEVER GENERATE THIS - MISSING CONFIGURATION
<CDPReactProvider> // Missing required config prop
  <App />
</CDPReactProvider>

// ❌ NEVER GENERATE THIS - CLIENT DIRECTIVE ON LAYOUT
"use client"; // Not needed in app/layout.tsx for provider
import { CDPReactProvider } from '@coinbase/cdp-react';
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN

// app/layout.tsx (NO "use client" needed here)
import { CDPReactProvider } from '@coinbase/cdp-react';

const cdpConfig = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
  basePath: "https://api.cdp.coinbase.com/platform",
  useMock: false,
  debugging: false,
};

// ✅ Component usage (NEEDS "use client" if using hooks)
"use client"; // Only needed if using hooks alongside components

import { AuthButton } from '@coinbase/cdp-react';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
```

---

## **3. CORRECT REACT COMPONENTS IMPLEMENTATION PATTERNS**

### **3.1 – Package Installation**

```bash
# BOTH packages are required for React Components approach
npm install @coinbase/cdp-react @coinbase/cdp-core @coinbase/cdp-hooks
```

### **3.2 – Layout Provider Setup**

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
  name: "My Web3 App",
  logoUrl: "https://your-domain.com/logo.png", // Optional
};

// Optional theme customization
const themeOverrides: Partial<Theme> = {
  "colors-background": "#ffffff",
  "colors-text": "#1a1a1a",
  "colors-primary": "#0052ff",
  "colors-error": "#ff4444",
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
          theme={themeOverrides} // Optional
        >
          {children}
        </CDPReactProvider>
      </body>
    </html>
  );
}
```

### **3.3 – Basic Component Usage**

```tsx
// app/page.tsx
"use client"; // Required because we're using hooks

import { AuthButton } from '@coinbase/cdp-react';
import { useIsInitialized, useIsSignedIn, useCurrentUser } from '@coinbase/cdp-hooks';

export default function HomePage() {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();
  const user = useCurrentUser();

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div>
      <h1>My Web3 Application</h1>
      
      {/* Pre-built authentication button */}
      <AuthButton />
      
      {/* Show user info when signed in */}
      {isSignedIn && user && (
        <div>
          <p>Welcome!</p>
          <p>Wallet: {user.evmAccounts[0]}</p>
        </div>
      )}
    </div>
  );
}
```

### **3.4 – Component-Only Usage (No Custom Hooks)**

```tsx
// app/wallet/page.tsx
// NO "use client" needed - just using components

import { AuthButton } from '@coinbase/cdp-react';

export default function WalletPage() {
  return (
    <div>
      <h1>Wallet</h1>
      <AuthButton />
      {/* AuthButton handles all authentication states internally */}
    </div>
  );
}
```

### **3.5 – Mixed Usage (Components + Custom Logic)**

```tsx
// app/dashboard/page.tsx
"use client"; // Required for hooks usage

import { AuthButton } from '@coinbase/cdp-react';
import { useCurrentUser, useEvmAddress } from '@coinbase/cdp-hooks';

export default function Dashboard() {
  const user = useCurrentUser();
  const evmAddress = useEvmAddress();

  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <AuthButton /> {/* Pre-built component */}
      </header>
      
      {user && (
        <main>
          <h2>Wallet Information</h2>
          <p>Address: {evmAddress}</p>
          <p>User ID: {user.userId}</p>
        </main>
      )}
    </div>
  );
}
```

---

## **4. THEME CUSTOMIZATION**

### **4.1 – Available Theme Properties**

```tsx
import { type Theme } from '@coinbase/cdp-react';

const themeOverrides: Partial<Theme> = {
  // Colors
  "colors-background": "#ffffff",
  "colors-backgroundOverlay": "rgba(0,0,0,0.5)",
  "colors-text": "#1a1a1a",
  "colors-textSecondary": "#666666",
  "colors-primary": "#0052ff",
  "colors-error": "#ff4444",
  "colors-success": "#00cc44",
  "colors-warning": "#ffaa00",
  
  // Spacing
  "spacing-xs": "4px",
  "spacing-sm": "8px", 
  "spacing-md": "16px",
  "spacing-lg": "24px",
  "spacing-xl": "32px",
  
  // Border Radius
  "borderRadius-sm": "4px",
  "borderRadius-md": "8px",
  "borderRadius-lg": "12px",
  
  // Typography
  "fontFamily-primary": "Inter, sans-serif",
  "fontSize-sm": "14px",
  "fontSize-md": "16px",
  "fontSize-lg": "18px",
};
```

### **4.2 – Dark Theme Example**

```tsx
const darkTheme: Partial<Theme> = {
  "colors-background": "#1a1a1a",
  "colors-text": "#ffffff",
  "colors-textSecondary": "#cccccc",
  "colors-primary": "#0066ff",
  "colors-backgroundOverlay": "rgba(255,255,255,0.1)",
};

<CDPReactProvider config={cdpConfig} app={appConfig} theme={darkTheme}>
  <App />
</CDPReactProvider>
```

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP React Components code, you **MUST** verify:

1. **Package Installation**: Are you including BOTH `@coinbase/cdp-react` AND `@coinbase/cdp-hooks`?
2. **Provider Location**: Is `CDPReactProvider` in `app/layout.tsx` (not in pages)?
3. **Configuration**: Are you providing required `config` prop with `projectId`?
4. **Client Directive**: Are you using `"use client"` ONLY when using hooks alongside components?
5. **Component Imports**: Are you importing components from `@coinbase/cdp-react`?
6. **Hook Imports**: Are you importing hooks from `@coinbase/cdp-hooks`?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT use provider in individual pages
// app/page.tsx
<CDPReactProvider>...</CDPReactProvider> // Wrong location

// ❌ DO NOT install only one package
npm install @coinbase/cdp-react // Missing @coinbase/cdp-hooks

// ❌ DO NOT use client directive unnecessarily  
"use client";
import { AuthButton } from '@coinbase/cdp-react'; // Not needed for components only

// ❌ DO NOT create custom auth buttons when AuthButton exists
const CustomAuthButton = () => { /* Use AuthButton instead */ };

// ❌ DO NOT mix with wallet connection patterns
const connectWallet = () => { /* Wrong approach for embedded wallets */ };
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate React Components code that:
- Missing required packages
- Provider in wrong location  
- Missing configuration
- Incorrect client directive usage

The implementation will:
1. **Fail to compile** due to missing dependencies
2. **Break component functionality** without proper provider context
3. **Cause hydration errors** with incorrect client directive usage
4. **Lose theme customization** without proper configuration

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP React Components in Next.js, you **MUST**:

1. **ALWAYS** install both `@coinbase/cdp-react` and `@coinbase/cdp-hooks`
2. **ALWAYS** place `CDPReactProvider` in `app/layout.tsx`
3. **ALWAYS** provide required configuration props
4. **ALWAYS** use `"use client"` only when using hooks
5. **NEVER** recreate functionality that exists in components
6. **VERIFY** your response follows the correct patterns

**Remember: There are NO EXCEPTIONS to these rules.**