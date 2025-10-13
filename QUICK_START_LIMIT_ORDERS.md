# 🚀 QUICK START - Autonomous Limit Orders

## 5-Minute Setup Guide

### Step 1: Run Database Migration (30 seconds)

1. Go to https://supabase.com
2. Your project → SQL Editor → New query
3. Copy/paste:

```sql
ALTER TABLE limit_orders
ADD COLUMN IF NOT EXISTS permit_signature JSONB,
ADD COLUMN IF NOT EXISTS order_signature JSONB,
ADD COLUMN IF NOT EXISTS executor_address TEXT,
ADD COLUMN IF NOT EXISTS executor_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS last_execution_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_execution_error TEXT;
```

4. Click "Run"
5. ✅ Done!

---

### Step 2: Create Executor Wallet (2 minutes)

```bash
# In terminal:
cd /Users/macbookpro2019/Desktop/SPLENEX/Splenex

# Generate wallet:
node -e "const ethers = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Private Key:', w.privateKey);"
```

**Save the output:**
```
Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9
Private Key: 0x1234...abcd
```

---

### Step 3: Fund Executor Wallet (2 minutes)

Send small amounts of gas tokens to the executor address:

- **Ethereum:** 0.05 ETH (for ~50 executions)
- **BSC:** 0.1 BNB (for ~500 executions)
- **Base:** 0.01 ETH (for ~100 executions)

**Note:** Executor pays gas, but you can collect fees from users to refund it!

---

### Step 4: Add Environment Variables (1 minute)

Create/update `.env.local`:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local and add:
EXECUTOR_PRIVATE_KEY=0xyour_private_key_from_step2
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ NEVER commit .env.local to Git!**

---

### Step 5: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

### Step 6: Test It!

1. Open http://localhost:3000
2. Connect wallet
3. Go to "Limit" tab
4. Create order:
   - Amount: 0.01 ETH
   - To: USDC
   - Rate: 3500
5. Click "Place Limit Swap"
6. **Sign TWICE:**
   - Popup 1: Token approval ✍️
   - Popup 2: Order authorization ✍️
7. Order created! ✅

Console should show:
```
[LimitOrder] ✅ BOTH SIGNATURES OBTAINED!
[LimitOrder] ⚡ Swap will execute AUTOMATICALLY with ZERO popups!
```

---

### Step 7: Test Keeper (Manual)

```bash
# In another terminal:
curl http://localhost:3000/api/limit-orders/keeper

# Should see:
{
  "success": true,
  "checked": 1,
  "executed": 0,
  "expired": 0
}
```

---

### Step 8: Setup Auto-Execution (For Production)

**Option A: Vercel Cron**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/limit-orders/keeper",
    "schedule": "*/1 * * * *"
  }]
}
```

**Option B: Local Development Script**

Create `scripts/keeper.js`:
```javascript
setInterval(async () => {
  const res = await fetch('http://localhost:3000/api/limit-orders/keeper');
  const data = await res.json();
  console.log('[Keeper]', data);
}, 60000);
```

Run: `node scripts/keeper.js`

---

## ✅ You're Done!

### What Works Now:

✅ User clicks "Place Limit Swap"
✅ **Signs TWICE upfront** (Permit + Order)
✅ Order is stored with both signatures
✅ **Keeper monitors automatically**
✅ **Executes autonomously** when conditions met
✅ **ZERO user interaction** during execution
✅ **User can be offline!**

---

## 🎮 Test Execution Flow

1. Create order (sign twice)
2. Manually call keeper: `curl http://localhost:3000/api/limit-orders/keeper`
3. Check console logs
4. Verify order executed automatically!

**Or wait for price to reach target naturally!**

---

## 🎉 Success!

**Your limit orders now work EXACTLY like Binance/dYdX/GMX!**

- Professional implementation ✅
- EIP-2612 Permit ✅
- EIP-712 Typed Data ✅
- Autonomous execution ✅
- Industry standard ✅

**User satisfaction: 😡 → 😊 → 🤩 → 🚀**

