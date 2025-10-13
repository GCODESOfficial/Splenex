# 🔍 TROUBLESHOOT: Limit Order Not Showing

## Quick Checks

### 1. Check Browser Console

After placing order, you should see:
```
[v0] 📝 Placing limit order with data: {...}
[v0] 🔍 Order details: {fromToken: "ETH", ...}
[v0] 📡 API Response status: 200
[v0] 📡 API Response data: {success: true, data: {...}}
[v0] ✅ Limit order saved to database!
[v0] 💾 Order ID: abc-123-def
[v0] ✅ Order added to local state
[v0] 🔄 Triggering order list refresh...
[OngoingOrders] Fetching orders for wallet: 0x...
[OngoingOrders] Found 1 orders
```

### 2. If You See Error

**Check for:**
```
[v0] ❌ Database save failed: ...
```

**Common Issues:**
- Missing database columns (need SQL migration)
- Wallet address mismatch
- Database connection issue

### 3. Check Database Directly

Go to Supabase → Table Editor → `limit_orders`:
- Do you see your order?
- Check `wallet_address` column - does it match yours?
- Check `status` column - should be "pending"

### 4. Check Wallet Address

Console should show:
```
[OngoingOrders] Fetching orders for wallet: 0xYourAddress
```

Does this match the address you used to create the order?

---

## 🐛 Common Issues & Fixes

### Issue 1: Database Columns Missing

**Symptoms:**
```
[v0] ❌ Database save failed: Column 'permit_signature' not found
```

**Fix:**
Run SQL migration in Supabase:
```sql
ALTER TABLE limit_orders
ADD COLUMN IF NOT EXISTS permit_signature JSONB,
ADD COLUMN IF NOT EXISTS order_signature JSONB,
ADD COLUMN IF NOT EXISTS executor_address TEXT,
ADD COLUMN IF NOT EXISTS gelato_task_id TEXT,
ADD COLUMN IF NOT EXISTS last_execution_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_execution_error TEXT;
```

### Issue 2: Signature Error

**Symptoms:**
```
Unable to encode value: Invalid number
```

**Fix:**
Already fixed! Using BigInt for proper number formatting.

### Issue 3: Order Saved But Not Showing

**Symptoms:**
- Console shows "saved to database"
- But list is empty

**Fix:**
1. Check console for `[OngoingOrders] Found X orders`
2. If 0, check wallet address in database matches
3. Refresh page (F5) - should appear
4. Check if component is visible (scroll down if needed)

### Issue 4: Wrong Wallet Address

**Symptoms:**
- Order saved with different address

**Fix:**
Check console:
```
[v0] 🔍 Order details: { walletAddress: "0x..." }
[OngoingOrders] Fetching orders for wallet: "0x..."
```

These MUST match! If not:
- Wallet might have switched
- Secondary wallet vs primary issue

---

## 🔧 Debug Steps

### Step 1: Open Browser Console
Press F12 → Console tab

### Step 2: Try Creating Order
1. Go to "Limit" tab
2. Fill in details
3. Click "Place Limit Swap"
4. Watch console logs

### Step 3: Check What You See

**Success Pattern:**
```
[LimitOrder] 🚀 Creating limit order...
[LimitOrder] 🎯 FIRST SIGNATURE: Token Approval...
[LimitOrder] ✅ FIRST SIGNATURE COMPLETE
[LimitOrder] 🎯 SECOND SIGNATURE: Order Authorization...
[LimitOrder] ✅ SECOND SIGNATURE COMPLETE
[v0] 📝 Placing limit order...
[v0] 📡 API Response status: 200
[v0] ✅ Limit order saved to database!
[v0] 🔄 Triggering order list refresh...
[OngoingOrders] Fetching orders...
[OngoingOrders] Found 1 orders ← Should show here!
```

**Failure Pattern:**
```
[v0] ❌ Database save failed: ...
[v0] ❌ Error details: ...
```

### Step 4: Check Database

Supabase → limit_orders table:
- Is there a new row?
- Does `wallet_address` match?
- Is `status` = "pending"?

### Step 5: Force Refresh

If order is in database but not showing:
1. Refresh page (F5)
2. Reconnect wallet
3. Go to Limit tab
4. Scroll down to see ongoing orders section

---

## 🚀 Quick Fix

Try this:

1. **Refresh page** (F5)
2. **Check if order appears** now

If still not showing, share the console log output and I'll help debug!

---

## 📋 What to Share for Help

If issue persists, share:
1. Console logs (especially errors)
2. Screenshot of ongoing orders section
3. Supabase limit_orders table screenshot
4. Your wallet address

This will help diagnose the exact issue!

