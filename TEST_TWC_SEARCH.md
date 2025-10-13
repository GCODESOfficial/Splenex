# Test TWC Search - Debugging Guide

## Quick Test Steps

### 1. Open Browser Console FIRST
```
Press F12 (or Cmd+Option+I on Mac)
Go to Console tab
Keep it open while testing
```

### 2. Start Dev Server
```bash
cd /Users/macbookpro2019/Desktop/SPLENEX/Splenex
npm run dev
```

### 3. Open Token Modal
```
- Go to http://localhost:3000
- Click on token dropdown (From or To)
- Modal should open
```

### 4. Search for TWC
```
- Click in search box
- Type: TWC
- Watch console for logs
```

## What You Should See in Console

### Successful Search:
```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] 📦 Found 1 coins for "TWC"
[Token Search] Processing: TIWICAT (twc)
[Token Search] ✅ Added TWC on BSC
[Token Search] ✅ Returning 1 tokens total

// Result: TWC appears in token list!
```

### If TWC Doesn't Appear:

**Scenario A: Search not triggered**
```javascript
// Console shows nothing
// Problem: Search query might be too short
// Solution: Type at least "TWC" (3 characters)
```

**Scenario B: API call fails**
```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] ❌ Search failed: Failed to fetch

// Problem: Network issue or CORS
// Solution: Check internet connection
```

**Scenario C: No coins found**
```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] 📦 Found 0 coins for "TWC"
[Token Search] ⚠️ No results for "TWC"

// Problem: CoinGecko doesn't have TWC
// Solution: Try "TIWICAT" instead
```

**Scenario D: Token filtered out**
```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] 📦 Found 1 coins for "TWC"
[Token Search] Processing: TIWICAT (twc)
[Token Search] ✅ Returning 1 tokens total

// But TWC still doesn't appear in list
// Problem: Filtering or deduplication removing it
// Check: filteredTokens vs allTokens in console
```

---

## Manual CoinGecko API Test

Test CoinGecko API directly in browser:

### Test 1: Search API
```
Open in new tab:
https://api.coingecko.com/api/v3/search?query=TWC

Expected: JSON response with tiwicat
```

### Test 2: Token Details
```
Open in new tab:
https://api.coingecko.com/api/v3/coins/tiwicat

Expected: Full token details with platforms
```

---

## Debugging Console Commands

### Run these in browser console:

**Test 1: Check if search function exists**
```javascript
// Type in console:
searchQuery
// Should show current search value
```

**Test 2: Check token state**
```javascript
// After searching for TWC, type:
console.log('CoinGecko tokens:', coinGeckoTokens)
console.log('All tokens:', allTokens)
console.log('Filtered tokens:', filteredTokens)
```

**Test 3: Manual search test**
```javascript
// Paste in console:
fetch('https://api.coingecko.com/api/v3/search?query=TWC')
  .then(r => r.json())
  .then(d => console.log('TWC search result:', d.coins))
```

---

## Expected TWC Data

When search works, TWC should look like:

```javascript
{
  id: "tiwicat",
  symbol: "TWC",
  name: "TIWICAT",
  address: "0x..." // Contract address on BSC
  chainId: 56,
  chainName: "BSC",
  logoURI: "https://coin-images.coingecko.com/coins/images/68750/...",
  decimals: 18
}
```

---

## If Still Not Working

### Option 1: Try Different Search Terms
```
Instead of "TWC", try:
- "TIWICAT" (full name)
- "tiwi" (partial)
- "tiw" (partial)
```

### Option 2: Check Network Tab
```
1. Open DevTools → Network tab
2. Type "TWC" in search
3. Look for:
   - Request to: api.coingecko.com/api/v3/search?query=TWC
   - Status: Should be 200 OK
   - Response: Should contain tiwicat

If request fails or is blocked → Network/CORS issue
```

### Option 3: Restart Everything
```bash
# Stop dev server (Ctrl+C)
# Clear browser cache (Ctrl+Shift+R)
# Restart server
npm run dev

# Try again
```

### Option 4: Check for CORS Issues
```
If you see in console:
"CORS policy blocked..."

This means browser is blocking CoinGecko API calls.

Solution: CoinGecko API should work from browser,
but if blocked, we need to route through our API.
```

---

## Alternative: Use API Route

If direct browser calls don't work, use the API route:

**File:** `components/token-selection-modal.tsx`

Change line 351 from:
```typescript
const searchResponse = await fetch(
  `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
);
```

To:
```typescript
const searchResponse = await fetch(
  `/api/search-tokens?q=${encodeURIComponent(searchQuery)}`
);
```

This routes through your server instead of calling CoinGecko directly.

---

## Quick Test Script

Copy this to browser console to test:

```javascript
// Test 1: CoinGecko API accessible?
fetch('https://api.coingecko.com/api/v3/ping')
  .then(r => r.json())
  .then(d => console.log('✅ CoinGecko API:', d))
  .catch(e => console.error('❌ CoinGecko API blocked:', e));

// Test 2: Search for TWC
fetch('https://api.coingecko.com/api/v3/search?query=TWC')
  .then(r => r.json())
  .then(d => {
    console.log('TWC search results:', d.coins);
    if (d.coins.length > 0) {
      console.log('✅ TWC found:', d.coins[0]);
    } else {
      console.log('❌ TWC not found');
    }
  })
  .catch(e => console.error('❌ Search failed:', e));
```

---

## What I Changed

### Made search more forgiving:
- ✅ Shows token even if no platform data (defaults to BSC)
- ✅ Shows token even if detail fetch partially fails
- ✅ Better error logging
- ✅ "No results" message if nothing found
- ✅ More detailed console logs

### Search should now find TWC because:
- ✅ Calls CoinGecko search API directly
- ✅ Doesn't require perfect platform data
- ✅ Defaults tokens to BSC if unknown
- ✅ Shows logo from CoinGecko

---

## Status Check

Open your app now and:

1. ✅ Open console (F12)
2. ✅ Type "TWC" in search
3. ✅ Watch console logs
4. ✅ Copy/paste the console output here if it doesn't work

**The logs will tell us exactly what's happening!** 🔍

---

## Expected Flow

```
Type "TWC"
    ↓ (800ms wait)
Console: [Token Search] 🔍 Searching CoinGecko for: "TWC"
    ↓
Console: [Token Search] 📦 Found 1 coins for "TWC"
    ↓
Console: [Token Search] Processing: TIWICAT (twc)
    ↓
Console: [Token Search] ✅ Added TWC on BSC
    ↓
Console: [Token Search] ✅ Returning 1 tokens total
    ↓
TWC appears in list! ✅
```

**If you see different console output, that tells us where the problem is!** 📊

