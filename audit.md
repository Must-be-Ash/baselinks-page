I'll audit your codebase for security vulnerabilities and issues. Let me examine the key areas systematically.

Read file: components/SupportButton.tsx
Read file: app/page.tsx
Read file: app/layout.tsx
Read file: components/CDPProvider.tsx
Ran tool
Read file: app/api/onramp/session-token/route.ts
Ran tool
Read file: components/ui/chart.tsx
Ran tool
Ran tool
Read file: components/SupportButton.tsx
Based on my comprehensive security audit of your codebase, here are the security issues I've identified:

## 🔴 **CRITICAL SECURITY ISSUES**

### 1. **Hardcoded CDP Project ID**
- **Location**: `components/CDPProvider.tsx:7`
- **Issue**: Project ID is hardcoded instead of using environment variable
- **Risk**: Exposes your CDP project configuration
- **Fix**: Move to environment variable

### 2. **Excessive Console Logging in Production**
- **Locations**: Multiple files including `app/api/onramp/session-token/route.ts`
- **Issue**: Console logs expose sensitive API responses and error details
- **Risk**: Information disclosure, potential data leakage
- **Fix**: Remove or conditionally log only in development

### 3. **Missing Security Headers**
- **Issue**: No Content Security Policy (CSP) or other security headers
- **Risk**: XSS attacks, clickjacking, MIME type sniffing
- **Fix**: Implement security headers in Next.js config

## 🟡 **MEDIUM SECURITY ISSUES**

### 4. **Environment Variable Validation**
- **Issue**: Using `!` assertion without validation
- **Risk**: App crashes if env vars are missing
- **Fix**: Add proper validation and fallbacks

### 5. **Input Sanitization**
- **Location**: `components/SupportButton.tsx:225` (OTP input)
- **Issue**: Basic input filtering but could be more robust
- **Risk**: Potential injection attacks
- **Fix**: Implement stricter input validation

### 6. **API Error Information Disclosure**
- **Location**: `app/api/onramp/session-token/route.ts:81`
- **Issue**: Detailed error messages exposed to client
- **Risk**: Information disclosure about internal systems
- **Fix**: Use generic error messages in production

## 🟢 **LOW SECURITY ISSUES**

### 7. **DangerouslySetInnerHTML Usage**
- **Location**: `components/ui/chart.tsx:80`
- **Issue**: Used for CSS injection in chart component
- **Risk**: Potential XSS if chart data is compromised
- **Mitigation**: Appears to be safe as it's only for CSS, but monitor

### 8. **External Link Security**
- **Status**: ✅ **GOOD** - All external links use `rel="noopener noreferrer"`
- **Note**: Properly implemented

### 9. **Wallet Address Exposure**
- **Location**: `components/SupportButton.tsx:130`
- **Issue**: Wallet address copied to clipboard without validation
- **Risk**: Low - wallet addresses are public anyway

## 📋 **RECOMMENDED FIXES**

### **Immediate Actions:**
1. **Move CDP Project ID to environment variable**
2. **Remove console.log statements from production**
3. **Add input validation for all user inputs**
4. **Implement proper error handling**

### **Security Headers to Add:**
```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

### **Environment Variable Validation:**
```typescript
// Add validation function
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
```

## ✅ **POSITIVE SECURITY PRACTICES FOUND:**
- Proper use of `rel="noopener noreferrer"` on external links
- Client-side input filtering for OTP
- Proper error boundaries and loading states
- Secure CDP integration with proper JWT handling
- No obvious XSS vulnerabilities in user-facing code

The codebase is generally well-structured, but these security improvements should be prioritized, especially the hardcoded project ID and console logging issues.