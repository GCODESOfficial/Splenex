# Wallet-to-Wallet Swap Implementation

## Overview
This implementation enables **true wallet-to-wallet swaps** where users can send tokens from one wallet (primary) to a completely different wallet (secondary). This is achieved through a dedicated secondary wallet connection system that operates independently from the main wallet connection.

## Architecture

### 1. **Primary Wallet System** (`use-wallet.tsx`)
- Handles the main wallet connection (FROM wallet)
- Manages token balances and chain switching
- Used for transaction signing and gas payment
- Connected via navbar or main connection flow

### 2. **Secondary Wallet System** (`use-secondary-wallet.tsx`) ⭐ NEW
- Handles additional wallet connections (TO wallet)
- Operates independently from primary wallet
- Can connect different wallet providers simultaneously
- Persists session across page reloads
- Can be disconnected without affecting primary wallet

### 3. **Wallet Selector Dropdown** (`wallet-selector-dropdown.tsx`)
- Enhanced with `isSecondaryWallet` flag
- Shows appropriate wallet type (primary or secondary)
- Includes disconnect option for secondary wallet
- Uses correct wallet hook based on context

### 4. **Wallet Modal** (`wallet-modal.tsx`)
- Updated to support both primary and secondary connections
- Routes connection requests to appropriate hook
- Shows correct wallet type in UI
- Auto-closes after successful connection

### 5. **Swap Interface** (`simple-swap-interface.tsx`)
- FROM wallet: Always uses primary wallet (connected via navbar)
- TO wallet: Uses secondary wallet if connected, falls back to primary
- Displays correct wallet icons and addresses
- Manages state for both wallets independently

## How It Works

### Connecting Wallets

#### Primary Wallet (FROM)
1. User clicks "Connect Wallet" in navbar or swap interface
2. Selects wallet from modal (MetaMask, Rabby, Coinbase, etc.)
3. Wallet connects via `useWallet` hook
4. Address is set as `fromWalletAddress`

#### Secondary Wallet (TO)
1. User clicks wallet dropdown in "To" section
2. Clicks "Connect new wallet"
3. Modal opens with `isSecondaryWallet={true}` flag
4. Selects wallet (can be same or different type as primary)
5. Wallet connects via `useSecondaryWallet` hook
6. Address is set as `toWalletAddress`

### Wallet Address Flow

```typescript
// FROM wallet sync (primary only)
useEffect(() => {
  if (isConnected && address) {
    setFromWalletAddress(address);
  }
}, [isConnected, address]);

// TO wallet sync (secondary first, primary fallback)
useEffect(() => {
  if (isSecondaryConnected && secondaryAddress) {
    setToWalletAddress(secondaryAddress); // ✅ Use secondary
  } else if (isConnected && address) {
    setToWalletAddress(address); // ⚠️ Fallback to primary
  }
}, [isSecondaryConnected, secondaryAddress, isConnected, address]);
```

### Swap Execution

When user clicks "Swap":
1. **FROM wallet** (primary) is used to:
   - Sign the transaction
   - Pay gas fees
   - Approve token spending (if ERC20)
   - Execute the swap

2. **TO wallet** (secondary or primary) is used as:
   - Destination address for received tokens
   - Can be any valid Ethereum address
   - No signature required from this wallet

## Use Cases

### 1. Send to Another User
```
FROM: User's MetaMask (0xABC...)
TO: Friend's address (0xDEF...)
Action: Swap ETH → USDC directly to friend's wallet
```

### 2. Multi-Wallet Management
```
FROM: Hot wallet (0x123...)
TO: Cold wallet (0x456...)
Action: Move assets between your own wallets
```

### 3. Cross-Wallet Trading
```
FROM: Rabby wallet (0xAAA...)
TO: Coinbase wallet (0xBBB...)
Action: Consolidate tokens from different wallets
```

### 4. Smart Contract Interactions
```
FROM: Your wallet (0xUSER...)
TO: Contract address (0xCONTRACT...)
Action: Send tokens to a smart contract
```

## Key Features

### ✅ Independent Wallet Connections
- Primary and secondary wallets are completely independent
- Can connect different wallet types (e.g., MetaMask → Rabby)
- Can connect multiple times without conflicts

### ✅ Session Persistence
- Both wallet connections persist across page reloads
- Stored separately in localStorage
- Auto-restores on app mount

### ✅ Disconnect Control
- Secondary wallet can be disconnected independently
- Primary wallet disconnect doesn't affect secondary
- Clear UI indicators for connection state

### ✅ Wallet Type Detection
- Automatically detects wallet type (MetaMask, Rabby, etc.)
- Shows correct wallet icons
- Handles multi-provider scenarios (e.g., Rabby + MetaMask)

### ✅ Fallback Behavior
- If no secondary wallet connected, TO defaults to primary
- Seamless transition between wallet-to-wallet and self-swap
- No breaking changes to existing functionality

## UI Components

### Wallet Selector Dropdown States

#### Not Connected
```
[ Connect wallet ]
```

#### Connected (Primary)
```
[🦊 0xABC...DEF ▼]
  ├─ Connect new wallet
  └─ Paste new wallet
```

#### Connected (Secondary)
```
[🐰 0x123...456 ▼]
  ├─ Connect new wallet
  ├─ Paste new wallet
  └─ 🔴 Disconnect secondary wallet
```

## Technical Implementation

### Context Providers
```tsx
<WalletProvider>           {/* Primary wallet context */}
  <SecondaryWalletProvider> {/* Secondary wallet context */}
    {children}
  </SecondaryWalletProvider>
</WalletProvider>
```

### Hook Usage
```tsx
// In any component
const { address, isConnected } = useWallet(); // Primary
const { secondaryAddress, isSecondaryConnected } = useSecondaryWallet(); // Secondary
```

### Modal Configuration
```tsx
<WalletModal
  open={isOpen}
  swapWalletType={swapWalletType}
  isSecondaryWallet={swapWalletType === "to"} // Route to correct hook
  onSwapWalletConnected={(address, type) => {
    // Handle connection
  }}
/>
```

## Security Considerations

### ✅ Safe
- Secondary wallet only used as destination address
- No private keys shared or exposed
- Transactions signed only by primary wallet
- Standard ERC20 approval flow

### ⚠️ User Responsibilities
- Verify destination address before swapping
- Ensure recipient address is correct
- Double-check transaction details
- Be aware of potential phishing

## Testing Scenarios

### Scenario 1: Self Swap (Backward Compatible)
1. Connect primary wallet only
2. FROM and TO both use primary address
3. Tokens sent to same wallet
4. ✅ Works exactly as before

### Scenario 2: Wallet-to-Wallet Swap
1. Connect primary wallet (FROM)
2. Connect secondary wallet (TO)
3. Verify different addresses shown
4. Execute swap
5. ✅ Tokens sent to secondary wallet

### Scenario 3: Paste Address
1. Connect primary wallet (FROM)
2. Click "Paste new wallet" in TO section
3. Enter recipient address
4. Execute swap
5. ✅ Tokens sent to pasted address

### Scenario 4: Switch TO Wallet
1. Connect primary wallet
2. Connect secondary wallet A
3. Disconnect secondary wallet
4. Connect secondary wallet B
5. ✅ TO address updates to wallet B

### Scenario 5: Disconnect Secondary
1. Both wallets connected
2. Click disconnect on secondary wallet dropdown
3. ✅ TO address falls back to primary
4. ✅ Can still swap (self-swap mode)

## Debugging

### Console Logs
```typescript
// Primary wallet
[v0] Wallet connected: { account, chainId, wallet: "metamask" }
[Swap] 🔄 FROM wallet synced (primary): 0xABC...

// Secondary wallet
[SecondaryWallet] 🔗 Connecting secondary wallet: rabby
[SecondaryWallet] ✅ Connected: { account, chainId, wallet: "rabby" }
[Swap] 🔄 TO wallet synced (secondary): 0x123...

// Wallet modal
[WalletModal] Secondary - Connecting with provider for Rabby
[WalletModal] 🔗 Secondary wallet connected: 0x123...
```

### Common Issues

#### Issue: Secondary wallet not connecting
**Solution**: Check browser console for provider errors. Ensure wallet extension is installed.

#### Issue: Both wallets show same address
**Solution**: Secondary wallet not connected. Check `isSecondaryConnected` state.

#### Issue: TO wallet icon not showing
**Solution**: Verify `secondaryWalletType` is being passed correctly to dropdown.

#### Issue: Session not persisting
**Solution**: Check localStorage for `secondary_wallet_session_v1` key.

## Future Enhancements

### Potential Additions
- [ ] Support for more than 2 simultaneous wallets
- [ ] Address book for frequent recipients
- [ ] QR code scanning for recipient addresses
- [ ] ENS name resolution for recipient field
- [ ] Transaction history filtering by wallet pair
- [ ] Batch swaps to multiple recipients
- [ ] Multi-signature support for FROM wallet

## Migration Guide

### For Existing Implementations
No breaking changes! The new system is fully backward compatible:
- If no secondary wallet connected, behavior is identical to before
- Existing swap logic unchanged
- All existing features continue to work

### To Enable Wallet-to-Wallet
1. Ensure `SecondaryWalletProvider` is in your app layout ✅ (Already done)
2. Use `isSecondaryWallet` flag on wallet components ✅ (Already done)
3. Update wallet selectors with secondary wallet props ✅ (Already done)
4. Test both scenarios (self-swap and wallet-to-wallet) ✅ (Ready to test)

## Summary

This implementation provides a robust, secure, and user-friendly way to perform wallet-to-wallet swaps. The system:
- ✅ Maintains backward compatibility
- ✅ Operates independently from primary wallet
- ✅ Persists across sessions
- ✅ Provides clear UI feedback
- ✅ Handles edge cases gracefully
- ✅ Follows React best practices
- ✅ Fully typed with TypeScript
- ✅ No breaking changes

The user can now seamlessly send tokens from their wallet to any other wallet, enabling use cases like gifting, payment splitting, multi-wallet management, and more!

