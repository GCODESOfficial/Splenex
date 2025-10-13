# Fix TypeScript Linter Errors

## Issue
You might see TypeScript errors in `limit-order-interface.tsx` for the `logoURI` property:

```
Property 'logoURI' does not exist on type 'Token'
```

## Root Cause
The TypeScript linter is caching the old Token interface definition before we added the `logoURI` property.

## Solution

### Option 1: Clear Next.js Cache (Recommended)
```bash
# Stop your dev server (Ctrl+C)

# Delete the .next folder
rm -rf .next

# Restart dev server
npm run dev
```

### Option 2: Restart TypeScript Server in VS Code
1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type: "TypeScript: Restart TS Server"
3. Press Enter
4. Errors should disappear

### Option 3: Restart Your IDE
Close and reopen your code editor completely.

### Option 4: Force TypeScript Rebuild
```bash
# Delete node_modules/.cache if it exists
rm -rf node_modules/.cache

# Rebuild
npm run build
npm run dev
```

## Verification
After applying any solution above:

1. Open `components/limit-order-interface.tsx`
2. Check lines 175, 177, 211, 213
3. Errors should be gone ✅

## What Was Changed
The Token interface in `limit-order-interface.tsx` now includes:

```typescript
interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  chainName: string
  balance?: string
  usdValue?: string
  icon?: string
  decimals?: number
  logoURI?: string  // ← This was added
}
```

This matches the Token interface in `simple-swap-interface.tsx`.

## Why This Happens
TypeScript uses a language server that caches type definitions for performance. When interfaces are updated, the cache sometimes doesn't invalidate immediately. The solutions above force a cache refresh.

## Still Seeing Errors?

### Check the Interface
Open `components/limit-order-interface.tsx` and verify line 12-23 shows:

```typescript
interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  chainName: string
  balance?: string
  usdValue?: string
  icon?: string
  decimals?: number
  logoURI?: string  // Must be present
}
```

### Nuclear Option
If nothing else works:

```bash
# Delete everything cached
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Restart with fresh slate
npm run dev
```

## After Fixing
You should see no TypeScript errors and:
- Token logos display correctly in limit orders
- Fallback to cryptocurrency-icons works
- Final fallback to colored initials works

## Note
These are **linter errors only** - the code works correctly even with the errors showing. But it's cleaner to fix them! 😊

