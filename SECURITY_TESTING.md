# Security Testing Guide

This document explains how to verify the security of the authentication implementation using Chrome DevTools.

## Test Checklist

### 1. ✅ HTTP-Only Cookies
**What to check:**
- Open Chrome DevTools (F12)
- Go to Application tab → Cookies
- Visit http://localhost:3000 and sign in
- Look for `appwrite-session` cookie

**Expected:**
- ✅ Cookie should have `HttpOnly` flag checked
- ✅ Cookie should have `SameSite: Strict`
- ✅ Cookie should have `Secure` flag in production

**Why it matters:** HTTP-only cookies cannot be accessed by JavaScript, preventing XSS attacks from stealing session tokens.

### 2. ✅ No Credentials in JavaScript
**What to check:**
- Open Chrome DevTools → Sources tab
- Search all JavaScript files for "APPWRITE_API_KEY"
- Check Network tab → look at any JS bundle

**Expected:**
- ❌ API key should NOT appear anywhere
- ✅ Only `NEXT_PUBLIC_` variables should be visible

**Why it matters:** Server-only credentials must never be sent to the browser.

### 3. ✅ Server-Side Route Protection
**What to check:**
- Sign out (if signed in)
- Try to access http://localhost:3000 directly
- Check if you're redirected to /sign-in

**Expected:**
- ✅ Should redirect to /sign-in before page loads
- ✅ Redirect happens server-side (check Network tab - should see 307 redirect)

**Why it matters:** Client-side redirects can be bypassed; server-side middleware cannot.

### 4. ✅ CSRF Protection
**What to check:**
- Open DevTools → Network tab
- Sign in and watch the sign-in request
- Check the cookies sent with the request

**Expected:**
- ✅ Cookie should have `SameSite: Strict` or `Lax`
- ✅ Cookies won't be sent in cross-origin requests

**Why it matters:** SameSite cookies prevent cross-site request forgery attacks.

### 5. ✅ Session Validation
**What to check:**
- Sign in successfully
- Open Application tab → Cookies
- Delete the `appwrite-session` cookie manually
- Try to navigate to any protected page

**Expected:**
- ✅ Should be redirected to /sign-in immediately
- ✅ No protected content should be visible

**Why it matters:** Every request validates the session server-side.

### 6. ✅ No Sensitive Data in Client State
**What to check:**
- Open DevTools → Components (React DevTools)
- Look at the AuthProvider context
- Check what data is stored

**Expected:**
- ✅ User info (name, email) - OK to show
- ❌ Session token - should NOT be visible
- ❌ API keys - should NOT be visible

**Why it matters:** Client-side state is visible and can be tampered with.

## Security Architecture

### Request Flow:
```
1. Browser → Middleware (validates session cookie)
2. Middleware → Page (if authorized)
3. Page → Server Action (auth operations)
4. Server Action → Appwrite (using server-only client)
5. Server Action → Set HTTP-only cookie
6. Redirect → Protected page
```

### Key Security Layers:
1. **Middleware** - Server-side route protection
2. **Server Actions** - All auth operations server-side
3. **HTTP-only Cookies** - Session tokens not accessible to JS
4. **SameSite Cookies** - CSRF protection
5. **Server-only Package** - Prevents accidental client-side imports

## Common Vulnerabilities Prevented:

### ❌ XSS (Cross-Site Scripting)
**Attack:** Malicious script tries to steal session token
**Prevention:** HTTP-only cookies cannot be accessed by JavaScript

### ❌ CSRF (Cross-Site Request Forgery)
**Attack:** Malicious site tries to make authenticated requests
**Prevention:** SameSite cookie policy blocks cross-origin requests

### ❌ Session Hijacking
**Attack:** Attacker steals session token from localStorage/sessionStorage
**Prevention:** Token only in HTTP-only cookie, never in storage

### ❌ Man-in-the-Middle
**Attack:** Attacker intercepts HTTP traffic to steal credentials
**Prevention:** Secure flag ensures cookies only sent over HTTPS (in production)

### ❌ Credential Exposure
**Attack:** API keys visible in browser or client-side code
**Prevention:** Server-only configuration, credentials never sent to browser

## Production Checklist:

Before deploying to production, ensure:
- [ ] `APPWRITE_API_KEY` is set as server-side environment variable
- [ ] `NODE_ENV=production` to enable secure cookie flag
- [ ] HTTPS is enabled (required for secure cookies)
- [ ] API key has minimal required permissions
- [ ] Rate limiting configured on Appwrite
- [ ] Session timeout configured appropriately

## Testing Tools:

- **Chrome DevTools**: Cookie inspection, Network monitoring
- **OWASP ZAP**: Automated security testing
- **Burp Suite**: Advanced security testing
- **curl**: Command-line testing of endpoints
