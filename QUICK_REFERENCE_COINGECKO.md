# Quick Reference: CoinGecko & AMM Features

## 🚀 Quick Start

### For Users

#### Swapping CoinGecko Tokens

1. **Open Swap Interface**: Navigate to home page (`/`)
2. **Select Token**: Click token dropdown → Search any token
3. **Find Your Token**: 
   - Type token name/symbol (e.g., "LINK", "UNI", "AAVE")
   - Filter by chain if needed
4. **Execute Swap**: Enter amount → Click "Swap" → Confirm in wallet

#### Finding Specific Tokens

**Popular Tokens**: Just start typing - ETH, BTC, USDC, USDT, etc.
**Obscure Tokens**: Use full name or contract address
**Chain-Specific**: Select chain first, then search

#### Viewing AMMs

- Navigate to `/overview` page
- Scroll to "Liquidity Sources" section
- See all 40+ DEXs and Bridges
- Click tabs to filter: All | DEXs | Bridges

---

### For Developers

#### Import CoinGecko Service

```typescript
import { 
  fetchCoinGeckoTokens, 
  searchCoinGeckoTokens,
  getCoinGeckoTokensByChain 
} from '@/lib/coingecko-service';
```

#### Fetch All Tokens

```typescript
const tokens = await fetchCoinGeckoTokens();
console.log(`Loaded ${tokens.length} tokens`);
```

#### Search Tokens

```typescript
// Search by query
const results = await searchCoinGeckoTokens('USDC');

// Search on specific chain
const ethResults = await searchCoinGeckoTokens('USDC', 1);
```

#### Get Chain Tokens

```typescript
// Get all Ethereum tokens
const ethTokens = await getCoinGeckoTokensByChain(1);

// Get all Polygon tokens
const maticTokens = await getCoinGeckoTokensByChain(137);
```

#### Use API Endpoints

```typescript
// Client-side fetch
const response = await fetch('/api/coingecko-tokens?search=bitcoin&chainId=1');
const data = await response.json();

if (data.success) {
  console.log(data.data); // Array of tokens
}
```

#### Clear Cache

```typescript
import { clearTokenCache } from '@/lib/coingecko-service';

clearTokenCache(); // Force fresh fetch
```

---

## 📊 Supported Chains & IDs

| Chain | Chain ID | CoinGecko Key |
|-------|----------|---------------|
| Ethereum | 1 | `ethereum` |
| BSC | 56 | `binance-smart-chain` |
| Polygon | 137 | `polygon-pos` |
| Arbitrum | 42161 | `arbitrum-one` |
| Optimism | 10 | `optimistic-ethereum` |
| Avalanche | 43114 | `avalanche` |
| Base | 8453 | `base` |
| Fantom | 250 | `fantom` |
| zkSync Era | 324 | `zksync` |
| Linea | 59144 | `linea` |

[See full list in documentation]

---

## 🔧 Configuration

### Cache Duration

Default: **1 hour**

Change in `lib/coingecko-service.ts`:
```typescript
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
```

### Search Debounce

Default: **300ms**

Change in `components/token-selection-modal.tsx`:
```typescript
setTimeout(() => {
  loadCoinGeckoTokens();
}, 300); // 300ms debounce
```

### Pagination Limit

Default: **100 tokens per page**

Change in API route or component:
```typescript
params.append("limit", "500"); // Adjust as needed
```

---

## 🎯 Use Cases

### 1. Swap Popular Token
```
ETH → USDC (Same chain)
```

### 2. Bridge Across Chains
```
USDC (Ethereum) → USDC (Polygon)
```

### 3. Cross-Wallet Transfer
```
DAI (Wallet A) → DAI (Wallet B)
```

### 4. Complex Bridge
```
ETH (Ethereum, Wallet A) → USDC (Base, Wallet B)
```

---

## ⚠️ Limitations

1. **Rate Limits**: CoinGecko Free API = 10-30 calls/min
2. **Swappability**: Not all tokens are swappable (depends on LiFi)
3. **Logo Availability**: Some tokens may not have logos
4. **Bridge Time**: Cross-chain swaps take 5-30 minutes

---

## 🐛 Troubleshooting

### Tokens Not Loading
```typescript
// Check console for errors
console.log('[CoinGecko] Status:', response.status);

// Clear cache and retry
clearTokenCache();
```

### Logo Not Showing
```typescript
// Verify logoURI exists
console.log('Token Logo:', token.logoURI);

// Check image URL in DevTools Network tab
```

### Search Too Slow
```typescript
// Increase debounce delay
setTimeout(loadTokens, 500); // 500ms instead of 300ms
```

### Cache Not Working
```typescript
// Verify cache timestamp
console.log('Cache age:', Date.now() - cacheTimestamp);

// Should be < CACHE_DURATION (3600000 ms = 1 hour)
```

---

## 📚 Related Documentation

- [Full Integration Guide](./COINGECKO_AMM_INTEGRATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [API Documentation](./API_DOCS.md)

---

## 🆘 Support

**Issues?**
1. Check browser console for errors
2. Verify network connectivity
3. Test API endpoint directly: `curl http://localhost:3000/api/coingecko-tokens`
4. Review documentation

**Still stuck?**
- Open GitHub issue
- Contact development team

---

## 🎉 Quick Tips

✨ **Pro Tip 1**: Use chain filter before searching for faster results

✨ **Pro Tip 2**: Wallet balance tokens always appear first

✨ **Pro Tip 3**: Token symbols are case-insensitive in search

✨ **Pro Tip 4**: Paste contract address for exact match

✨ **Pro Tip 5**: Check "trending" endpoint for popular tokens

---

**Version**: 1.0.0  
**Last Updated**: October 12, 2025

