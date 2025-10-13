# Wallet-to-Wallet Swap - Quick Reference

## 🚀 Quick Start

### User Flow
1. **Connect Primary Wallet** (FROM) - via navbar or swap interface
2. **Connect Secondary Wallet** (TO) - click dropdown in "To" section → "Connect new wallet"
3. **Enter amount** and select tokens
4. **Click "Swap"** - tokens will be sent from primary to secondary wallet

---

## 📁 Files Modified/Created

### ✨ New Files
- `hooks/use-secondary-wallet.tsx` - Secondary wallet connection hook

### 🔧 Modified Files
- `components/wallet-selector-dropdown.tsx` - Added secondary wallet support
- `components/wallet-modal.tsx` - Added secondary wallet connection logic
- `components/simple-swap-interface.tsx` - Integrated secondary wallet system
- `app/layout.tsx` - Added SecondaryWalletProvider

---

## 🔑 Key Concepts

### Two Independent Wallet Systems

| Aspect | Primary Wallet | Secondary Wallet |
|--------|---------------|------------------|
| **Purpose** | Send tokens FROM | Receive tokens TO |
| **Hook** | `useWallet()` | `useSecondaryWallet()` |
| **Signs Transactions** | ✅ Yes | ❌ No |
| **Pays Gas** | ✅ Yes | ❌ No |
| **Context** | `WalletProvider` | `SecondaryWalletProvider` |
| **Storage Key** | `wallet_session_v1` | `secondary_wallet_session_v1` |

---

## 💻 Code Examples

### Using the Hooks

```tsx
import { useWallet } from "@/hooks/use-wallet"
import { useSecondaryWallet } from "@/hooks/use-secondary-wallet"

function SwapComponent() {
  // Primary wallet (FROM)
  const { 
    address,           // Primary wallet address
    isConnected,       // Primary connection status
    connectedWallet    // Wallet type (metamask, rabby, etc)
  } = useWallet()
  
  // Secondary wallet (TO)
  const { 
    secondaryAddress,      // Secondary wallet address
    isSecondaryConnected,  // Secondary connection status
    secondaryWalletType,   // Secondary wallet type
    connectSecondaryWallet, // Connect function
    disconnectSecondary    // Disconnect function
  } = useSecondaryWallet()
  
  return (
    <div>
      <p>FROM: {address}</p>
      <p>TO: {secondaryAddress || address}</p>
    </div>
  )
}
```

### Wallet Selector Dropdown

```tsx
// For FROM wallet (primary)
<WalletSelectorDropdown
  address={fromWalletAddress}
  walletType={connectedWallet}
  onConnectNewWallet={() => handleConnect("from")}
  onPasteWallet={() => handlePaste("from")}
  isSecondaryWallet={false} // Use primary hook
/>

// For TO wallet (secondary)
<WalletSelectorDropdown
  address={toWalletAddress}
  walletType={isSecondaryConnected ? secondaryWalletType : connectedWallet}
  onConnectNewWallet={() => handleConnect("to")}
  onPasteWallet={() => handlePaste("to")}
  isSecondaryWallet={true} // Use secondary hook ⭐
/>
```

### Wallet Modal

```tsx
<WalletModal
  open={isOpen}
  onOpenChange={setIsOpen}
  swapWalletType={swapWalletType} // "from" | "to"
  isSecondaryWallet={swapWalletType === "to"} // Route to correct hook ⭐
  onSwapWalletConnected={(address, type) => {
    if (type === "from") setFromWalletAddress(address)
    if (type === "to") setToWalletAddress(address)
  }}
/>
```

---

## 🎯 Address Priority Logic

### FROM Wallet
```typescript
// Always uses primary wallet
fromWalletAddress = address
```

### TO Wallet
```typescript
// Priority: Secondary → Primary → undefined
toWalletAddress = secondaryAddress || address || undefined
```

---

## 🔍 State Indicators

### Connection Status
```tsx
// Check if wallet-to-wallet mode is active
const isWalletToWallet = isSecondaryConnected && secondaryAddress !== address

// Check if self-swap mode (backward compatible)
const isSelfSwap = !isSecondaryConnected || secondaryAddress === address
```

### UI States
```tsx
// Show secondary wallet info
{isSecondaryConnected && (
  <div>
    Connected: {secondaryWalletType} - {secondaryAddress}
  </div>
)}

// Show disconnect option (only for secondary)
{isSecondaryWallet && (
  <button onClick={disconnectSecondary}>
    Disconnect Secondary Wallet
  </button>
)}
```

---

## 🐛 Debugging Commands

### Browser Console

```javascript
// Check primary wallet
localStorage.getItem('wallet_session_v1')

// Check secondary wallet
localStorage.getItem('secondary_wallet_session_v1')

// Clear all wallets
localStorage.removeItem('wallet_session_v1')
localStorage.removeItem('secondary_wallet_session_v1')
```

### React DevTools
```
Components → WalletProvider → hooks
  ├─ address: "0x..."
  ├─ isConnected: true
  └─ connectedWallet: "metamask"

Components → SecondaryWalletProvider → hooks
  ├─ secondaryAddress: "0x..."
  ├─ isSecondaryConnected: true
  └─ secondaryWalletType: "rabby"
```

---

## ⚠️ Important Notes

### ✅ DO
- Connect primary wallet before secondary
- Verify recipient address before swapping
- Test with small amounts first
- Check both wallet icons display correctly

### ❌ DON'T
- Don't disconnect primary while swapping
- Don't assume secondary wallet pays gas
- Don't share private keys between wallets
- Don't skip transaction confirmation

---

## 🔄 Common Workflows

### Workflow 1: Basic Wallet-to-Wallet Swap
```
1. Connect MetaMask (primary) → FROM: 0xAAA
2. Connect Rabby (secondary) → TO: 0xBBB
3. Select tokens: ETH → USDC
4. Enter amount: 0.1 ETH
5. Click "Swap"
6. MetaMask signs transaction
7. USDC arrives at 0xBBB (Rabby wallet)
```

### Workflow 2: Switch Secondary Wallet
```
1. Connected: MetaMask (FROM) + Rabby (TO)
2. Click dropdown on TO section
3. Click "Disconnect secondary wallet"
4. Click "Connect new wallet"
5. Select Coinbase Wallet
6. New TO wallet: Coinbase
```

### Workflow 3: Paste Address (No Second Connection)
```
1. Connect MetaMask (primary)
2. Click "Paste new wallet" in TO section
3. Enter: 0x123...456
4. Swap executes to pasted address
5. No secondary wallet connection needed
```

---

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Swap to same wallet | ✅ | ✅ |
| Swap to different wallet | ❌ | ✅ |
| Multiple wallet connections | ❌ | ✅ |
| Session persistence | ✅ Primary only | ✅ Both |
| Disconnect control | ✅ Primary only | ✅ Both |
| Wallet type icons | ✅ Primary only | ✅ Both |

---

## 🎨 UI Components Reference

### Wallet Icon Mapping
```typescript
const WALLET_ICONS = {
  rabby: "https://rabby.io/assets/images/logo-128.png",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  coinbase: "https://avatars.githubusercontent.com/u/18060234?s=280&v=4",
  trust: "https://trustwallet.com/assets/images/media/assets/trust_platform.svg",
  brave: "https://brave.com/static-assets/images/brave-logo-sans-text.svg",
  okx: "https://static.okx.com/cdn/assets/imgs/221/8B0F8A7B25C5B0B0.png",
  phantom: "https://phantom.app/img/logo.png",
  walletconnect: "https://walletconnect.com/static/favicon.png",
  zerion: "https://zerion.io/favicon.ico",
}
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No wallet detected" | Extension not installed | Install wallet extension |
| "Connection failed" | User rejected | Try connecting again |
| "Transaction failed" | Insufficient gas/balance | Check balance and gas |
| "Invalid address" | Wrong address format | Use valid 0x address |

---

## ✅ Testing Checklist

- [ ] Primary wallet connects successfully
- [ ] Secondary wallet connects successfully
- [ ] Both wallet icons display correctly
- [ ] Addresses show correct values
- [ ] Swap executes from primary wallet
- [ ] Tokens arrive at secondary wallet
- [ ] Disconnect secondary works
- [ ] Fallback to primary works
- [ ] Session persists on reload
- [ ] Multiple wallet types work together

---

## 📞 Support

### Issues?
1. Check browser console for errors
2. Verify wallet extensions installed
3. Clear localStorage and reconnect
4. Try different wallet combination
5. Check transaction on block explorer

### Success Indicators
- ✅ Two different addresses shown
- ✅ Correct wallet icons displayed
- ✅ "Swap" button enabled
- ✅ Transaction confirms
- ✅ Tokens arrive at destination

---

## 🎯 Quick Tips

💡 **Tip 1**: You can connect the same wallet type twice if you have multiple accounts

💡 **Tip 2**: Secondary wallet session persists - disconnect it when done

💡 **Tip 3**: Primary wallet must have gas fees, secondary doesn't need any balance

💡 **Tip 4**: Use "Paste wallet" for one-time sends without connecting

💡 **Tip 5**: Check recipient address carefully - transactions are irreversible!

---

## 🔗 Related Documentation

- Full Documentation: `WALLET_TO_WALLET_SWAP.md`
- Main Wallet Hook: `hooks/use-wallet.tsx`
- Secondary Wallet Hook: `hooks/use-secondary-wallet.tsx`
- Swap Interface: `components/simple-swap-interface.tsx`

