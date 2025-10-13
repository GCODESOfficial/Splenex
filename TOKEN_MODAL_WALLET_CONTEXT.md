# Token Selection Modal - Wallet Context Feature

## Overview
The token selection modal now displays balances from the appropriate wallet based on context. When selecting tokens for the "FROM" side, it shows primary wallet balances. When selecting for the "TO" side with a secondary wallet connected, it shows secondary wallet balances.

## Changes Made

### 1. Enhanced Secondary Wallet Hook (`use-secondary-wallet.tsx`)

Added token balance tracking to the secondary wallet:

```typescript
interface SecondaryWalletContextType {
  // ... existing properties
  secondaryTokenBalances: TokenBalance[]      // ✨ NEW
  secondaryTotalUsdBalance: number            // ✨ NEW
  refreshSecondaryBalances: () => Promise<void> // ✨ NEW
}
```

**Features:**
- Fetches token balances on connection
- Caches balances in localStorage
- Auto-restores on page reload
- Refreshes in background
- Clears on disconnect

### 2. Updated Token Selection Modal (`token-selection-modal.tsx`)

Added wallet context awareness:

```typescript
interface TokenSelectionModalProps {
  // ... existing props
  walletContext?: "primary" | "secondary" // ✨ NEW
}
```

**Features:**
- Accepts `walletContext` prop
- Displays balances from appropriate wallet
- Visual indicator showing which wallet's balances are displayed
- Works on both desktop and mobile layouts

### 3. Updated Swap Interface (`simple-swap-interface.tsx`)

Passes correct context to token modals:

```tsx
// FROM token modal - always primary
<TokenSelectionModal
  walletContext="primary"
  {...otherProps}
/>

// TO token modal - secondary if connected, otherwise primary
<TokenSelectionModal
  walletContext={isSecondaryConnected ? "secondary" : "primary"}
  {...otherProps}
/>
```

## Visual Indicators

### Desktop Layout
```
┌─────────────────────────────────────────────────┐
│ Select Token     📍 Secondary Wallet Balances   │
│                     (purple badge)               │
└─────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────┐
│ Select Token               ✕    │
│ 📍 Secondary Wallet Balances    │
└─────────────────────────────────┘
```

## User Experience

### Scenario 1: Self-Swap (No Secondary Wallet)
```
FROM Modal: "📍 Primary Wallet Balances"
  ├─ Shows primary wallet's tokens
  └─ User's current balance

TO Modal: "📍 Primary Wallet Balances"
  ├─ Shows same tokens (primary)
  └─ Same balances (self-swap)
```

### Scenario 2: Wallet-to-Wallet Swap
```
FROM Modal: "📍 Primary Wallet Balances"
  ├─ Shows primary wallet's tokens (MetaMask)
  └─ Balance: 1.5 ETH, 1000 USDC

TO Modal: "📍 Secondary Wallet Balances"
  ├─ Shows secondary wallet's tokens (Rabby)
  └─ Balance: 0.3 ETH, 50 USDC
  └─ Different balances = different wallet
```

## Balance Fetching

### Primary Wallet
- Uses existing `useWallet()` hook
- Fetches across all supported chains
- Updates on connection/chain switch

### Secondary Wallet
- Uses new `useSecondaryWallet()` hook
- Fetches on connection
- Currently: Ethereum mainnet only
- Future: Multi-chain support

## API Usage

### Secondary Balance Fetch
```typescript
// Endpoint
GET /api/tokens?address={walletAddress}&chain=eth

// Response
{
  result: [
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "1000000", // wei format
      decimals: "6",
      token_address: "0x..."
    }
  ]
}
```

## Cache Strategy

### Primary Wallet Cache
```
Key: "wallet_balances_v1"
Data: { tokenBalances, totalUsdBalance }
```

### Secondary Wallet Cache
```
Key: "secondary_wallet_balances_v1"
Data: { tokenBalances, totalUsdBalance }
```

### Benefits
- Instant UI on page reload
- Reduced API calls
- Better user experience
- Automatic refresh in background

## Console Logs

### Balance Fetch Logs
```javascript
[SecondaryWallet] 📊 Fetching balances for: 0x123...
[SecondaryWallet] ✅ Balances updated: 5 tokens
[TokenSelectionModal] 💼 Using secondary wallet balances: 5 tokens
```

### Modal Context Logs
```javascript
[TokenSelectionModal] 💼 Using primary wallet balances: 12 tokens
[TokenSelectionModal] 💼 Using secondary wallet balances: 5 tokens
```

## Error Handling

### No Balances Available
- Shows LiFi supported tokens
- Shows popular tokens
- User can still select tokens
- Balance displays as "0"

### API Failure
```typescript
try {
  await fetchSecondaryBalances(address)
} catch (error) {
  console.error("[SecondaryWallet] ❌ Error fetching balances:", error)
  // Silently fails, shows cached or empty balances
}
```

### Session Restore Failure
- Attempts to restore cached balances
- Fetches fresh balances in background
- Graceful degradation to empty state

## Benefits

### ✅ Accurate Balance Display
- Users see correct balances for each wallet
- No confusion about available funds
- Clear indication of which wallet is being used

### ✅ Better UX
- Visual indicators (color-coded badges)
- Context-aware token lists
- Reduces user errors

### ✅ Wallet Isolation
- Primary and secondary balances tracked separately
- No cross-contamination
- Independent caching

### ✅ Performance
- Cached balances for instant load
- Background refresh for accuracy
- Minimal API calls

## Future Enhancements

### Multi-Chain Support for Secondary Wallet
```typescript
// Fetch balances across all chains like primary wallet
const chains = ["eth", "base", "arbitrum", "bsc", "polygon"]
for (const chain of chains) {
  await fetchBalances(secondaryAddress, chain)
}
```

### Token Price Integration
```typescript
// Add USD values to secondary wallet tokens
const prices = await fetchTokenPrices(symbols)
tokenBalances.forEach(token => {
  token.usdValue = token.balance * prices[token.symbol]
})
```

### Real-Time Balance Updates
```typescript
// Subscribe to balance changes
ethereum.on('accountsChanged', async () => {
  await refreshSecondaryBalances()
})
```

### Balance Comparison View
```
┌─────────────────────────────────────┐
│ ETH                                 │
│ Primary: 1.5 ETH  →  Secondary: 0.3│
│ Transfer available: 1.2 ETH         │
└─────────────────────────────────────┘
```

## Testing Checklist

- [ ] FROM modal shows primary balances
- [ ] TO modal shows secondary balances when connected
- [ ] TO modal shows primary balances when no secondary
- [ ] Visual indicators display correctly
- [ ] Balances persist on page reload
- [ ] Secondary wallet disconnect clears balances
- [ ] Mobile layout shows indicators
- [ ] Desktop layout shows indicators
- [ ] Console logs show correct context
- [ ] Cache is saved and restored properly

## Known Limitations

### 1. Secondary Wallet: Ethereum Only
Currently, secondary wallet only fetches Ethereum mainnet balances. Multi-chain support planned.

### 2. Token Prices
Secondary wallet tokens don't have USD values yet. Planned enhancement.

### 3. Balance Refresh
Secondary balances don't auto-refresh on chain switch (primary wallet feature only).

## Troubleshooting

### Issue: Secondary wallet balances not showing
**Solution**: Check console for API errors. Verify wallet is connected. Try refreshing the page.

### Issue: Wrong balances displayed
**Solution**: Verify `walletContext` prop is passed correctly. Check which wallet is connected.

### Issue: Balances not updating
**Solution**: Call `refreshSecondaryBalances()` manually or reconnect wallet.

### Issue: Cached balances out of date
**Solution**: Clear localStorage keys `secondary_wallet_balances_v1` and reconnect.

## Summary

The token selection modal now intelligently displays balances from the appropriate wallet:
- **FROM modal**: Always shows primary wallet balances (signing wallet)
- **TO modal**: Shows secondary wallet balances if connected, otherwise primary
- **Visual indicators**: Clear badges show which wallet's balances are displayed
- **Performance**: Cached balances with background refresh
- **User-friendly**: Reduces confusion and errors in wallet-to-wallet swaps

This enhancement makes wallet-to-wallet swaps more intuitive and helps users understand which wallet's tokens they're viewing and selecting from.

