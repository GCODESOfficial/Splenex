# 🎯 Limit Orders - Quick Start

## What is a Limit Order?

A **Limit Order** lets you set a target price for swapping tokens. The swap executes automatically when the market reaches your target price - even if you're offline!

## How to Use

### 1. Go to Limit Tab
```
Swap Interface → Click "Limit" tab
```

### 2. Set Your Order
- **From Token**: Select token and amount (e.g., 1 ETH)
- **Limit Rate**: Set target price (e.g., 1 ETH = 3500 USDC)
- **Expiry**: Choose when order expires (1h, 6h, 24h, custom)
- **Slippage**: Set tolerance (default 1%)

### 3. Sign & Confirm
- Click "Place Limit Swap"
- Sign the transaction in your wallet
- ✅ Order is now active!

### 4. Track Your Orders
- **Desktop**: Bottom-right corner panel (above footer)
- **Mobile**: Bottom sheet above footer (swipe up/down)

## Key Features

### ✨ Set & Forget
- Place order and disconnect wallet
- Order stays active until expiry
- Executes automatically when price is reached

### 🔐 Secure
- Wallet signature required
- Cryptographically verified
- Only you can cancel your orders

### 📱 Cross-Device
- Set order on mobile
- Check status on desktop
- Works everywhere

### ⚡ Real-Time
- Live order status
- Countdown timer
- Instant notifications

## Example Use Cases

### 1. Buy the Dip
```
You have USDC and want to buy ETH at $3000
→ Set limit: 3000 USDC → 1 ETH
→ Order executes when ETH drops to $3000
```

### 2. Take Profit
```
You have ETH and want to sell at $4000
→ Set limit: 1 ETH → 4000 USDC
→ Order executes when ETH hits $4000
```

### 3. Time-Limited Opportunity
```
You want to buy a token but only if price drops in next hour
→ Set limit with 1-hour expiry
→ Order executes if price drops, or expires after 1 hour
```

## Order Status

| Status | Description |
|--------|-------------|
| 🟡 **Pending** | Waiting for target price |
| ✅ **Executed** | Successfully swapped |
| ⏰ **Expired** | Time limit reached without execution |
| ❌ **Cancelled** | You cancelled the order |

## Managing Orders

### View Orders
- Desktop: Check bottom-right panel
- Mobile: Swipe up from bottom (above footer)

### Cancel Order
- Click ❌ button on any order
- Confirms immediately

### Refresh Orders
- Auto-refreshes every 10 seconds
- Manual: collapse/expand panel

## Tips & Tricks

### 💡 Setting the Right Rate
```
Current: 1 ETH = 3400 USDC
Target: Buy at 3300 USDC
→ Set limit rate: 3300
→ Order executes when ETH price drops 3%
```

### 💡 Slippage for Volatile Tokens
```
Stable tokens: 0.5% - 1%
Popular tokens: 1% - 2%
Low-liquidity tokens: 20% - 50%
```

### 💡 Expiry Times
```
Quick trades: 1 hour
Swing trades: 6-24 hours
Patient trades: Custom (up to 7 days)
```

### 💡 Multiple Orders
```
You can have multiple orders active:
- 1 ETH → USDC at 3500
- 0.5 ETH → USDC at 3600
- 0.5 ETH → USDC at 3700
```

## Common Questions

### Q: Does it cost gas to place a limit order?
**A:** No! Placing an order only requires a wallet signature (free). Gas is only paid when the order executes.

### Q: What happens if I disconnect my wallet?
**A:** Your orders stay active! Reconnect anytime to check status or cancel.

### Q: Can I modify an order?
**A:** No. Cancel the old order and create a new one with updated parameters.

### Q: What if the price is reached but order doesn't execute?
**A:** The monitoring system checks every 5 minutes. If market moves too fast, order might miss execution.

### Q: Can I use this for cross-chain swaps?
**A:** Not yet. Both tokens must be on the same chain.

## Limitations

- ⚠️ Orders check every 5 minutes (not instant)
- ⚠️ Fast-moving markets might skip your target price
- ⚠️ Requires sufficient balance + gas at execution time
- ⚠️ Same-chain swaps only (for now)

## Database Setup Required

**First Time Setup:**
1. Create `limit_orders` table in Supabase
2. See `LIMIT_ORDERS_SCHEMA.md` for SQL
3. Set up monitoring cron job (optional)

**Already set up?** Just start using! 🚀

## Troubleshooting

### Order not appearing?
- Check if wallet is connected
- Refresh the page
- Check browser console for errors

### Order not executing?
- Verify target price was actually reached
- Check if order expired
- Ensure monitoring service is running

### Can't place order?
- Ensure wallet is connected
- Check if you have balance for swap
- Verify limit rate is valid number

---

## 🎯 Ready to Trade Smarter?

1. **Navigate** to swap interface
2. **Click** "Limit" tab
3. **Set** your target price
4. **Sign** with wallet
5. **Relax** - order works automatically!

---

**Need more help?** Check:
- `LIMIT_ORDERS_SETUP_GUIDE.md` - Complete setup instructions
- `LIMIT_ORDERS_SCHEMA.md` - Database schema details
- Browser console - Detailed error messages

