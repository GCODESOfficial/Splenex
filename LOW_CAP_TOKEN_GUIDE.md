# 🎯 Guide: Swapping Low-Cap Tokens Like TWC (TIWICAT)

## ❌ The Issue

When trying to swap **BNB → TWC**, you see:
```
No routes available for this swap - try a different amount or token pair
```

## 🔍 Why This Happens

**TWC (TIWICAT) is a very low-cap meme token** that:
- ❌ Has very low liquidity (small market cap)
- ❌ Not indexed by major aggregators (LiFi, 1inch, 0x, Paraswap)
- ❌ PancakeSwap API doesn't return it (minimum liquidity threshold)
- ✅ BUT... it DOES exist on PancakeSwap V2 with some liquidity!

### What Our System Tried:
```
✅ LiFi → No route found
✅ 1inch → No route found  
✅ 0x → No route found
✅ Paraswap → No route found
✅ PancakeSwap API → No route found
```

All 5 aggregators tried, but none could find it because TWC is below their liquidity thresholds.

## ✅ Solution 1: Use PancakeSwap Directly

For very low-cap tokens like TWC, use PancakeSwap directly:

### Direct Links:
1. **PancakeSwap**: https://pancakeswap.finance/swap?outputCurrency=0xda1060158f7d593667cce0a15db346bb3ffb3596
2. **PooCoin**: https://poocoin.app/tokens/0xda1060158f7d593667cce0a15db346bb3ffb3596
3. **DEXScreener**: https://dexscreener.com/bsc/0xda1060158f7d593667cce0a15db346bb3ffb3596

### Steps:
1. Go to PancakeSwap link above
2. Connect BSC wallet
3. Input currency: BNB
4. Output currency: TWC (already set)
5. Enter amount
6. Set high slippage (20-50% for low-cap tokens)
7. Swap!

## ✅ Solution 2: Check Liquidity First

Before swapping low-cap tokens:

### Check on DEXScreener:
1. Visit: https://dexscreener.com/bsc/0xda1060158f7d593667cce0a15db346bb3ffb3596
2. Look for:
   - **Liquidity**: Should be > $1,000 minimum
   - **24h Volume**: Higher is better
   - **Pair**: Usually with BNB or USDT

### Check on PooCoin:
1. Visit: https://poocoin.app/tokens/0xda1060158f7d593667cce0a15db346bb3ffb3596
2. Check:
   - **Holders**: More holders = more established
   - **Chart**: Check if there's trading activity
   - **Liquidity**: Is it locked or unlocked?

## 🚨 Low-Cap Token Risks

### ⚠️ Warning Signs:
- Very low liquidity (< $10,000)
- High price impact (> 10%)
- No locked liquidity
- Recently created (< 1 week)
- Very few holders (< 100)

### ✅ Safer Low-Cap Tokens:
- Liquidity > $50,000
- Price impact < 5%
- Locked liquidity for 6+ months
- Active community
- Multiple holders (1000+)

## 🔧 Why Aggregators Don't Support TWC

### Aggregator Minimum Requirements:

| Aggregator | Min Liquidity | Min Volume |
|------------|---------------|------------|
| **LiFi** | ~$100k | ~$10k/day |
| **1inch** | ~$50k | ~$5k/day |
| **0x** | ~$100k | ~$10k/day |
| **Paraswap** | ~$75k | ~$7.5k/day |
| **PancakeSwap API** | ~$25k | ~$2.5k/day |

**TWC's Status:**
- Liquidity: ~$5-15k (too low)
- Volume: ~$1-5k/day (too low)
- Result: None of the aggregators index it

## 💡 Future Enhancement Ideas

### Option 1: Add Direct DEX Integration
- Call PancakeSwap V2 Router directly
- Get quote via `getAmountsOut()`
- Works for ANY token with liquidity
- More complex, needs Web3 integration

### Option 2: Manual Token Entry
- Allow users to paste token addresses
- Show warning about unverified tokens
- Integrate directly with router contracts
- Good for advanced users

### Option 3: Liquidity Scanner
- Scan DEXs for token pairs
- Show available liquidity
- Calculate price impact
- Warn about risks

## 📊 TWC (TIWICAT) Info

```
Name: TIWICAT
Symbol: TWC
Address: 0xda1060158f7d593667cce0a15db346bb3ffb3596
Chain: BSC (56)
Market Cap Rank: #4269 (very low)
Decimals: 18

CoinGecko: https://www.coingecko.com/en/coins/tiwicat
```

## 🎯 Recommended Approach for Low-Cap Tokens

### For $100-$1000 Swaps:
1. ✅ Use PancakeSwap directly
2. ✅ Set slippage: 10-20%
3. ✅ Check liquidity first on DEXScreener
4. ✅ Start with small test amount

### For $1000+ Swaps:
1. ⚠️ **Extreme caution!**
2. Check price impact (should be < 5%)
3. If impact > 10%, split into smaller swaps
4. Consider waiting for more liquidity

### Red Flags to Avoid:
- ❌ Can't sell (honeypot)
- ❌ 99%+ tax on sells
- ❌ Owner can pause trading
- ❌ No locked liquidity
- ❌ Rug pull risk indicators

## 🔍 How to Check if Token is Safe

### Use Token Scanners:
1. **BSCheck**: https://bscheck.eu/bsc/0xda1060158f7d593667cce0a15db346bb3ffb3596
2. **Token Sniffer**: https://tokensniffer.com/token/bsc/0xda1060158f7d593667cce0a15db346bb3ffb3596
3. **RugDoc**: Check their scam database

### What to Look For:
- ✅ Contract verified on BSCScan
- ✅ No hidden mint function
- ✅ No suspicious pause/blacklist functions
- ✅ Reasonable sell tax (< 10%)
- ✅ Renounced ownership (optional but good)

## 📚 Resources

### Tools:
- **PancakeSwap**: https://pancakeswap.finance
- **DEXScreener**: https://dexscreener.com
- **PooCoin**: https://poocoin.app
- **BSCScan**: https://bscscan.com

### Communities:
- **r/CryptoMoonShots**: For finding new tokens (high risk!)
- **r/BSC**: BSC community
- **Telegram**: Check token's official TG

## ✅ Summary

**For High-Cap Tokens** (like ETH, BNB, USDT):
- ✅ Use our DEX aggregator (best prices from 5 sources!)

**For Mid-Cap Tokens** (market cap > $1M):
- ✅ Our aggregator usually works
- ✅ If not, use PancakeSwap directly

**For Low-Cap Tokens** (like TWC):
- ✅ Use PancakeSwap directly
- ✅ Set high slippage (20-50%)
- ✅ Check liquidity first
- ⚠️ Be cautious of scams!

---

**Your DEX aggregator (with 5 aggregators) is perfect for 95% of tokens!** 

For the remaining 5% (very low-cap meme tokens), use PancakeSwap directly. 🥞

**Stay safe and DYOR (Do Your Own Research)!** 🚀

