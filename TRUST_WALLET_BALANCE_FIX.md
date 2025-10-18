# 🔧 Trust Wallet Balance Detection Fix

## Issue Identified

Your Trust Wallet with $18 worth of TWT and TWC tokens isn't showing balances because:

1. **Missing Moralis API Key**: The balance fetching system requires a Moralis API key
2. **Chain Detection**: TWT/TWC tokens are likely on BSC (Binance Smart Chain)
3. **Token Recognition**: Need to ensure these tokens are properly supported

## 🚀 Solution Steps

### Step 1: Get Moralis API Key (FREE)

1. Go to [https://moralis.io/](https://moralis.io/)
2. Sign up for a free account
3. Go to your dashboard and copy your API key
4. Create a `.env.local` file in your project root with:

```bash
# Moralis API Key for token balance fetching
MORALIS_API_KEY=your_actual_api_key_here

# Revenue wallet address for gas fee collection
NEXT_PUBLIC_REVENUE_WALLET_ADDRESS=0xe4ee3d9BDd5b4D1b7dE2174F93729f3628a04E4e
```

### Step 2: Verify TWT/TWC Token Details

**Trust Wallet Token (TWT):**
- Contract: `0x4B0F1812e5Df2A09796481Ff14017e6005508003`
- Chain: BSC (Binance Smart Chain)
- Symbol: TWT

**Trust Wallet Cat (TWC):**
- Contract: `0x...` (check your wallet for exact address)
- Chain: BSC (Binance Smart Chain)
- Symbol: TWC

### Step 3: Test Balance Detection

After adding the API key:

1. **Refresh the page** completely
2. **Reconnect Trust Wallet**
3. **Check browser console** for balance fetching logs
4. **Switch to BSC network** in Trust Wallet
5. **Look for your tokens** in the token selection modal

## 🔍 Troubleshooting

### Check Browser Console
Open DevTools (F12) and look for:
```
[v0] 🔄 Fetching balances across all supported chains...
[v0] Fetching balances for BSC (0x38)
[v0] Moralis API success for bsc: {...}
```

### Common Issues:
- **"Moralis API key not configured"** → Add API key to .env.local
- **"No tokens found"** → Switch to BSC network in wallet
- **"API failed"** → Check internet connection and API key validity

### Manual Token Addition
If tokens still don't appear, you can manually search for them:
1. Open token selection modal
2. Type "TWT" or "TWC" in search
3. Select from search results
4. Balance should appear after selection

## 🎯 Expected Results

After fixing:
- ✅ TWT balance shows in wallet
- ✅ TWC balance shows in wallet  
- ✅ Total $18 value displayed
- ✅ Tokens available for swapping
- ✅ BSC network properly detected

## 📞 Need Help?

If issues persist:
1. Check browser console for errors
2. Verify Moralis API key is correct
3. Ensure Trust Wallet is on BSC network
4. Try refreshing and reconnecting wallet
