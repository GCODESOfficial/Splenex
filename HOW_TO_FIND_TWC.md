# How to Find TWC (TIWICAT) - Step by Step Guide

## Quick Start

The real-time CoinGecko search is now integrated and working! Here's how to find TWC:

---

## Step-by-Step Instructions

### **Step 1: Open Token Selection**

```bash
1. Navigate to http://localhost:3000
2. Click on "From" or "To" token dropdown
3. Token selection modal opens
```

### **Step 2: Search for TWC**

```bash
1. Click in the search box (top of modal)
2. Type: TWC
3. Wait ~1 second (search is loading)
4. Loading skeleton appears
```

### **Step 3: See Results**

```bash
Expected result:

┌─────────────────────────────────────┐
│  Search Results                     │
├─────────────────────────────────────┤
│  🐱 TWC    TIWICAT          BSC    │ ← Click this!
│           0x...                     │
└─────────────────────────────────────┘

Note: TWC is on BSC (Binance Smart Chain)
```

### **Step 4: Select TWC**

```bash
1. Click on the TWC row
2. Modal closes
3. TWC is now selected!
4. Ready to swap
```

---

## How the Search Works

### Behind the Scenes:

```
You type "TWC"
    ↓
800ms wait (debounce - prevents spam)
    ↓
Call CoinGecko search API
    ↓
Find: "tiwicat" (id) = TWC (symbol)
    ↓
Get token details:
  - Logo: https://coin-images.coingecko.com/coins/images/68750/...
  - Platform: binance-smart-chain
  - Address: Contract address on BSC
    ↓
Format for display:
  - Symbol: TWC
  - Name: TIWICAT
  - Chain: BSC
  - Logo: From CoinGecko
    ↓
Show in modal
    ↓
✅ You can now select it!
```

---

## Troubleshooting

### Problem: TWC Doesn't Appear

**Check 1: Spelling**
```
✅ Correct: "TWC" (uppercase or lowercase works)
❌ Wrong: "TC", "TW", "TWIC"
```

**Check 2: Wait for Loading**
```
- Type "TWC"
- Wait for loading skeleton (3 pulsing rows)
- Loading text: "Loading CoinGecko tokens..."
- Results appear after ~1-2 seconds
```

**Check 3: Browser Console**
```
Open DevTools Console (F12)
Look for:
  [Token Search] 🔍 Searching CoinGecko for: "TWC"
  [Token Search] 📦 Found X coins for "TWC"
  [Token Search] ✅ Returning X tokens with addresses

If you see errors:
  [Token Search] ❌ Search failed: ...
  → Check internet connection
```

**Check 4: Network Connection**
```
Ensure you have internet access
CoinGecko API requires network connection
If offline, search won't work
```

**Check 5: CoinGecko API Status**
```
Visit: https://www.coingecko.com/en/api/status
Check if API is operational

Or test directly:
https://api.coingecko.com/api/v3/search?query=TWC

Should return JSON with tiwicat data
```

---

## What TWC Looks Like in Results

### Expected Display:

```
┌──────────────────────────────────────────┐
│                                          │
│   [🐱]  TWC                             │
│         TIWICAT                          │
│         BSC • 0x...4444                  │
│                                          │
│                          $0.00           │
│                          0               │
└──────────────────────────────────────────┘

Elements:
- 🐱 = TWC logo from CoinGecko (or badge if loading)
- TWC = Token symbol
- TIWICAT = Full token name
- BSC = Blockchain (Binance Smart Chain)
- 0x...4444 = Contract address
- $0.00 = USD value (0 if you don't own it)
- 0 = Balance (0 if you don't own it)
```

---

## After Finding TWC

### To Swap TWC:

**Scenario 1: Swap TWC to USDT (on BSC)**
```
1. Search "TWC" → Select TWC (BSC)
2. For "To" token, search "USDT"
3. Select USDT (BSC) - same chain!
4. Enter amount of TWC
5. Get quote from LiFi
6. Swap executes through PancakeSwap or best DEX
```

**Scenario 2: Bridge TWC to another chain**
```
Note: TWC is only on BSC
To bridge, you'd need to:
1. Swap TWC → USDT (on BSC)
2. Bridge USDT → Ethereum/Polygon/etc.
```

---

## Console Debugging

### Successful Search Output:

```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] 📦 Found 1 coins for "TWC"
// ... fetching details ...
[Token Search] ✅ Returning 1 tokens with addresses

// Then in token list:
[Icon] ⏳ TWC: Showing badge temporarily, still loading logo...
[Icon] ✅ TWC: Logo loaded!
```

### Failed Search Output:

```javascript
[Token Search] 🔍 Searching CoinGecko for: "TWC"
[Token Search] ❌ Search failed: TypeError: Failed to fetch

// Indicates network issue or CoinGecko API down
```

---

## Alternative: Browse by Chain

If search isn't working, you can also:

```bash
1. Click chain filter (left sidebar on desktop)
2. Select "BSC"
3. Scroll through BSC tokens
4. Look for TWC

Note: This requires TWC to be in LiFi's supported tokens
Search is more reliable!
```

---

## Technical Details

### CoinGecko API Endpoints Used:

**1. Search Endpoint:**
```
GET https://api.coingecko.com/api/v3/search?query=TWC

Returns:
{
  "coins": [
    {
      "id": "tiwicat",
      "name": "TIWICAT",
      "symbol": "TWC",
      "thumb": "https://coin-images.coingecko.com/coins/images/68750/thumb/...",
      "large": "https://coin-images.coingecko.com/coins/images/68750/large/..."
    }
  ]
}
```

**2. Details Endpoint:**
```
GET https://api.coingecko.com/api/v3/coins/tiwicat?...

Returns:
{
  "id": "tiwicat",
  "symbol": "twc",
  "name": "TIWICAT",
  "image": {
    "thumb": "...",
    "small": "...",
    "large": "..."
  },
  "platforms": {
    "binance-smart-chain": "0x..." // Contract address!
  }
}
```

---

## Summary

### To Find TWC:

1. ✅ Open token modal
2. ✅ Type "TWC" in search
3. ✅ Wait ~1 second
4. ✅ See TIWICAT (TWC) with logo
5. ✅ Click to select
6. ✅ Swap!

### Features:

✅ **Real-time search** - Searches CoinGecko directly  
✅ **No cache needed** - Works immediately  
✅ **Finds ANY token** - 10,000+ tokens  
✅ **Shows logo** - From CoinGecko CDN  
✅ **Shows chain** - BSC for TWC  
✅ **Shows address** - Contract address  
✅ **Ready to swap** - Through best AMM  

---

## Status

✅ **Search Working**: Direct CoinGecko integration  
✅ **TWC Findable**: Type "TWC" to find it  
✅ **Logo Loading**: Background loading with auto-update  
✅ **Swappable**: Works with LiFi + 40+ AMMs  

**Just type "TWC" in the search box and it will appear!** 🎉

---

## Need Help?

1. **Check console** (F12) for search logs
2. **Verify internet** connection
3. **Wait full 1-2 seconds** after typing
4. **Try different search** ("TIWICAT" instead of "TWC")
5. **Clear browser cache** (Ctrl+Shift+R)

**If still not working, check that your dev server is running: `npm run dev`** ✅

