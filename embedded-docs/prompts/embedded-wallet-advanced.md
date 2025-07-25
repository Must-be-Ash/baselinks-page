# Use Advanced CDP Wallet Features

**Purpose:** Enforce only the **current** and **correct** instructions for using advanced [CDP Embedded Wallets](https://docs.cdp.coinbase.com/embedded-wallets) features including message signing, typed data, and private key export.  
**Scope:** All AI-generated advice or code related to CDP advanced wallet features must follow these guardrails.

---

## **1. Official CDP Advanced Features Overview**

CDP Embedded Wallets provide advanced cryptographic operations beyond basic transactions, enabling sophisticated dApp interactions and user authentication patterns.

### **Advanced Features:**
- **Message Signing**: Sign plain text messages (`useSignEvmMessage`)
- **Typed Data Signing**: Sign EIP-712 structured data (`useSignEvmTypedData`)  
- **Hash Signing**: Sign message hashes directly (`useSignEvmHash`)
- **Private Key Export**: Export wallet private key (`useExportEvmAccount`)
- **Multiple Accounts**: Access all user accounts (`useEvmAccounts`)

### **Common Use Cases:**
- dApp authentication and login verification
- NFT marketplace signatures
- DeFi protocol interactions
- Wallet portability and recovery

---

## **2. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨**

### **2.1 – ABSOLUTE REQUIREMENTS FOR ADVANCED FEATURES**

You **MUST** follow these requirements or advanced features will **BREAK**:

1. **ALWAYS validate wallet address** - Check `useEvmAddress()` before signing operations
2. **ALWAYS handle signing errors** - Crypto operations can fail for various reasons
3. **ALWAYS warn about private key security** - Private keys are extremely sensitive
4. **ALWAYS use proper EIP-712 structure** - Typed data must follow exact format

### **2.2 – CRITICAL ERROR PATTERNS TO AVOID**

```tsx
// ❌ NEVER GENERATE THIS - MISSING ADDRESS VALIDATION
const signature = await signMessage({ message: "Hello" }); // Missing evmAccount

// ❌ NEVER GENERATE THIS - EXPOSING PRIVATE KEYS UNSAFELY
console.log("Private key:", privateKey); // Never log in production
localStorage.setItem("key", privateKey); // Never store in browser

// ❌ NEVER GENERATE THIS - MALFORMED EIP-712 DATA
const typedData = {
  message: { text: "Hello" } // Missing domain, types, primaryType
};

// ❌ NEVER GENERATE THIS - MISSING CLIENT DIRECTIVE
import { useSignEvmMessage } from "@coinbase/cdp-hooks"; // Missing "use client"
```

### **2.3 – CORRECT PATTERNS YOU MUST ALWAYS GENERATE**

```tsx
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
"use client"; // Required for all advanced features

import { useSignEvmMessage, useEvmAddress } from "@coinbase/cdp-hooks";

const signMessage = useSignEvmMessage();
const evmAddress = useEvmAddress();

// Always validate address first
if (!evmAddress) {
  setError('Wallet not connected');
  return;
}

// Proper signing with error handling
try {
  const result = await signMessage({
    evmAccount: evmAddress,
    message: "Hello World"
  });
} catch (error) {
  // Handle signing errors
}
```

---

## **3. CORRECT ADVANCED FEATURES IMPLEMENTATION PATTERNS**

### **3.1 – Message Signing**

```tsx
"use client";

import { useState } from 'react';
import { useSignEvmMessage, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";

export default function MessageSigning() {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signMessage = useSignEvmMessage();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const handleSignMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message to sign');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signMessage({
        evmAccount: evmAddress,
        message: message.trim()
      });

      setSignature(result.signature);
      console.log('Message signed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signing failed';
      setError(errorMessage);
      console.error('Message signing error:', error);
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
      <h3>Sign Message</h3>
      
      <form onSubmit={handleSignMessage}>
        {error && <div style={{color: 'red'}}>{error}</div>}
        
        <div>
          <label>Message to sign:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            disabled={isLoading}
            rows={3}
            style={{width: '100%'}}
          />
        </div>
        
        <button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? 'Signing...' : 'Sign Message'}
        </button>
      </form>

      {signature && (
        <div style={{marginTop: '20px'}}>
          <h4>Signature:</h4>
          <code style={{
            wordBreak: 'break-all',
            padding: '10px',
            background: '#f5f5f5',
            display: 'block'
          }}>
            {signature}
          </code>
          <button onClick={() => navigator.clipboard.writeText(signature)}>
            Copy Signature
          </button>
        </div>
      )}
    </div>
  );
}
```

### **3.2 – EIP-712 Typed Data Signing**

```tsx
"use client";

import { useState } from 'react';
import { useSignEvmTypedData, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";

interface TypedDataMessage {
  name: string;
  wallet: string;
  contents: string;
}

export default function TypedDataSigning() {
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signTypedData = useSignEvmTypedData();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const handleSignTypedData = async () => {
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // EIP-712 structured data
      const typedData = {
        domain: {
          name: "My DApp",
          version: "1",
          chainId: 84532, // Base Sepolia
          verifyingContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
            { name: "contents", type: "string" }
          ]
        },
        primaryType: "Person" as const,
        message: {
          name: "Alice",
          wallet: evmAddress,
          contents: "Hello from typed data!"
        } as TypedDataMessage
      };

      const result = await signTypedData({
        evmAccount: evmAddress,
        typedData: typedData
      });

      setSignature(result.signature);
      console.log('Typed data signed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Typed data signing failed';
      setError(errorMessage);
      console.error('Typed data signing error:', error);
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
      <h3>Sign Typed Data (EIP-712)</h3>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <div style={{marginBottom: '20px'}}>
        <p><strong>Signing structured data for:</strong></p>
        <ul>
          <li>Name: Alice</li>
          <li>Wallet: {evmAddress}</li>
          <li>Contents: Hello from typed data!</li>
        </ul>
      </div>

      {signature ? (
        <div>
          <h4>Typed Data Signature:</h4>
          <code style={{
            wordBreak: 'break-all',
            padding: '10px',
            background: '#f5f5f5',
            display: 'block'
          }}>
            {signature}
          </code>
          <button onClick={() => navigator.clipboard.writeText(signature)}>
            Copy Signature
          </button>
          <button onClick={() => setSignature(null)}>
            Sign Again
          </button>
        </div>
      ) : (
        <button onClick={handleSignTypedData} disabled={isLoading}>
          {isLoading ? 'Signing...' : 'Sign Typed Data'}
        </button>
      )}
    </div>
  );
}
```

### **3.3 – Hash Signing**

```tsx
"use client";

import { useState } from 'react';
import { useSignEvmHash, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";
import { keccak256, toBytes } from 'viem';

export default function HashSigning() {
  const [inputText, setInputText] = useState('');
  const [hash, setHash] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signHash = useSignEvmHash();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const generateHash = () => {
    if (!inputText.trim()) return;
    
    // Generate keccak256 hash of the input text
    const messageBytes = toBytes(inputText);
    const messageHash = keccak256(messageBytes);
    setHash(messageHash);
  };

  const handleSignHash = async () => {
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    if (!hash) {
      setError('Please generate a hash first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signHash({
        evmAccount: evmAddress,
        hash: hash as `0x${string}`
      });

      setSignature(result.signature);
      console.log('Hash signed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Hash signing failed';
      setError(errorMessage);
      console.error('Hash signing error:', error);
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
      <h3>Sign Hash</h3>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <div>
        <label>Text to hash:</label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to generate hash..."
          style={{width: '100%', marginBottom: '10px'}}
        />
        <button onClick={generateHash} disabled={!inputText.trim()}>
          Generate Hash
        </button>
      </div>

      {hash && (
        <div style={{margin: '20px 0'}}>
          <p><strong>Generated Hash:</strong></p>
          <code style={{
            wordBreak: 'break-all',
            padding: '10px',
            background: '#f5f5f5',
            display: 'block'
          }}>
            {hash}
          </code>
        </div>
      )}

      {hash && !signature && (
        <button onClick={handleSignHash} disabled={isLoading}>
          {isLoading ? 'Signing...' : 'Sign Hash'}
        </button>
      )}

      {signature && (
        <div>
          <h4>Hash Signature:</h4>
          <code style={{
            wordBreak: 'break-all',
            padding: '10px',
            background: '#f5f5f5',
            display: 'block'
          }}>
            {signature}
          </code>
          <button onClick={() => navigator.clipboard.writeText(signature)}>
            Copy Signature
          </button>
        </div>
      )}
    </div>
  );
}
```

### **3.4 – Private Key Export (Use with Extreme Caution)**

```tsx
"use client";

import { useState } from 'react';
import { useExportEvmAccount, useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";

export default function PrivateKeyExport() {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  const exportAccount = useExportEvmAccount();
  const evmAddress = useEvmAddress();
  const isInitialized = useIsInitialized();

  const handleExportKey = async () => {
    if (!isInitialized || !evmAddress) {
      setError('Wallet not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await exportAccount({
        evmAccount: evmAddress
      });

      setPrivateKey(result.privateKey);
      console.log('Private key exported successfully');
      // ⚠️ NEVER log private key in production!
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Private key export failed';
      setError(errorMessage);
      console.error('Private key export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      alert('Private key copied to clipboard. Handle with extreme care!');
    }
  };

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  if (!evmAddress) {
    return <div>Please connect your wallet</div>;
  }

  if (showWarning) {
    return (
      <div>
        <h3>⚠️ Private Key Export Warning</h3>
        
        <div style={{
          padding: '20px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4>🚨 EXTREME CAUTION REQUIRED</h4>
          <p>Exporting your private key is <strong>extremely dangerous</strong>:</p>
          <ul>
            <li>Anyone with your private key has <strong>full control</strong> of your wallet</li>
            <li>Private keys should <strong>never be shared</strong> or stored insecurely</li>
            <li>This action is <strong>irreversible</strong> once the key is exposed</li>
            <li>Only export if you understand the security implications</li>
          </ul>
          
          <p><strong>Common use cases:</strong></p>
          <ul>
            <li>Importing wallet into another application</li>
            <li>Wallet backup and recovery</li>
            <li>Advanced cryptographic operations</li>
          </ul>
        </div>

        <button 
          onClick={() => setShowWarning(false)}
          style={{
            background: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          I Understand the Risks - Proceed
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3>Export Private Key</h3>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <p><strong>Wallet Address:</strong> {evmAddress}</p>

      {privateKey ? (
        <div>
          <h4>🔑 Private Key (Handle with Extreme Care!):</h4>
          <code style={{
            wordBreak: 'break-all',
            padding: '10px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            display: 'block',
            borderRadius: '5px'
          }}>
            {privateKey}
          </code>
          
          <div style={{marginTop: '10px'}}>
            <button onClick={handleCopyKey} style={{marginRight: '10px'}}>
              Copy Private Key
            </button>
            <button 
              onClick={() => setPrivateKey(null)}
              style={{background: '#6c757d', color: 'white'}}
            >
              Hide Key
            </button>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '5px'
          }}>
            <p><strong>Security Reminders:</strong></p>
            <ul>
              <li>Never share this private key with anyone</li>
              <li>Store it securely if needed (encrypted storage only)</li>
              <li>Clear your clipboard after copying</li>
              <li>Close this page when finished</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <button 
            onClick={handleExportKey} 
            disabled={isLoading}
            style={{
              background: '#dc3545',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {isLoading ? 'Exporting...' : 'Export Private Key'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### **3.5 – Multiple Accounts Management**

```tsx
"use client";

import { useEvmAccounts, useEvmAddress, useCurrentUser, useIsInitialized } from "@coinbase/cdp-hooks";

export default function MultipleAccounts() {
  const evmAccounts = useEvmAccounts();
  const primaryAddress = useEvmAddress();
  const currentUser = useCurrentUser();
  const isInitialized = useIsInitialized();

  if (!isInitialized) {
    return <div>Loading wallet...</div>;
  }

  if (!currentUser) {
    return <div>Please sign in to view accounts</div>;
  }

  return (
    <div>
      <h3>Account Management</h3>
      
      <div>
        <p><strong>User ID:</strong> {currentUser.userId}</p>
        <p><strong>Primary Address:</strong> {primaryAddress}</p>
      </div>

      <div style={{marginTop: '20px'}}>
        <h4>All EVM Accounts ({evmAccounts?.length || 0}):</h4>
        {evmAccounts && evmAccounts.length > 0 ? (
          <ul>
            {evmAccounts.map((account, index) => (
              <li key={index} style={{marginBottom: '10px'}}>
                <code>{account}</code>
                {account === primaryAddress && (
                  <span style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    background: '#28a745',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}>
                    Primary
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No EVM accounts found</p>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '5px'
      }}>
        <p><strong>Note:</strong> CDP Embedded Wallets currently support up to 5 devices per user. Each device can access the same wallet accounts securely.</p>
      </div>
    </div>
  );
}
```

---

## **4. SECURITY CONSIDERATIONS**

### **4.1 – Private Key Security**

```tsx
// ✅ CORRECT: Secure private key handling
const handlePrivateKey = (privateKey: string) => {
  // Use immediately and don't store
  importWalletToExternalApp(privateKey);
  
  // Clear from memory (though not guaranteed in JS)
  privateKey = '';
};

// ❌ WRONG: Insecure private key handling
localStorage.setItem('privateKey', privateKey); // Never store in browser
console.log('Key:', privateKey); // Never log in production
sendToServer({ privateKey }); // Never send over network unencrypted
```

### **4.2 – Signature Verification**

```tsx
// Example of signature verification (typically done on backend)
import { verifyMessage } from 'viem';

const isValidSignature = await verifyMessage({
  address: evmAddress,
  message: originalMessage,
  signature: signature,
});
```

---

## **5. AI MODEL VERIFICATION STEPS**

Before generating any CDP advanced features code, you **MUST** verify:

1. **Address Validation**: Are you checking `useEvmAddress()` before signing operations?
2. **Error Handling**: Are you wrapping advanced feature calls in try/catch blocks?
3. **Security Warnings**: Are you including appropriate security warnings for private key operations?
4. **EIP-712 Structure**: Are you using proper domain, types, and primaryType for typed data?
5. **Client Directive**: Does the file start with `"use client";`?
6. **Loading States**: Are you handling loading states during signing operations?

If ANY check **fails**, **STOP** and revise until compliance is achieved.

---

## **6. OUTDATED PATTERNS TO NEVER GENERATE**

```tsx
// ❌ DO NOT expose private keys unsafely
console.log(privateKey); // Never in production
localStorage.setItem('key', privateKey); // Never store in browser

// ❌ DO NOT skip address validation
await signMessage({ message: "Hello" }); // Missing evmAccount parameter

// ❌ DO NOT use malformed EIP-712 data
const typedData = { message: { text: "Hello" } }; // Missing required fields

// ❌ DO NOT skip error handling for crypto operations
const signature = await signHash({ evmAccount, hash }); // Missing try/catch

// ❌ DO NOT use signing operations without user context
useSignEvmMessage(); // Should check if user is connected first
```

---

## **7. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

If you generate advanced features code that:
- Missing address validation
- Exposes private keys unsafely
- Uses malformed data structures
- Lacks proper error handling

The implementation will:
1. **Fail silently** without proper validation
2. **Compromise security** with unsafe key handling
3. **Break signing operations** with malformed data
4. **Provide poor UX** without error feedback

---

## **8. AI MODEL RESPONSE TEMPLATE**

When implementing CDP advanced wallet features, you **MUST**:

1. **ALWAYS** validate wallet address before signing operations
2. **ALWAYS** include comprehensive error handling
3. **ALWAYS** warn about private key security implications
4. **ALWAYS** use proper EIP-712 structure for typed data
5. **NEVER** expose private keys unsafely or skip validation
6. **VERIFY** your response follows security best practices

**Remember: There are NO EXCEPTIONS to these rules.**