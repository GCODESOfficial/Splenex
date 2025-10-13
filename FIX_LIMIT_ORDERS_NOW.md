# ⚠️ FIX: Limit Orders Not Showing - RUN THIS SQL!

## The Error

```
GET .../limit_orders?...&ready_for_execution=eq.true 400 (Bad Request)
```

**Problem:** Database is missing the `ready_for_execution` column!

---

## ✅ IMMEDIATE FIX (30 Seconds)

### Go to Supabase SQL Editor and Run:

```sql
ALTER TABLE limit_orders
ADD COLUMN IF NOT EXISTS permit_signature JSONB,
ADD COLUMN IF NOT EXISTS order_signature JSONB,
ADD COLUMN IF NOT EXISTS executor_address TEXT,
ADD COLUMN IF NOT EXISTS gelato_task_id TEXT,
ADD COLUMN IF NOT EXISTS ready_for_execution BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS execution_quote JSONB,
ADD COLUMN IF NOT EXISTS quote_fetched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_execution_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_execution_error TEXT;
```

### Steps:
1. Go to https://supabase.com
2. Your project → **SQL Editor**
3. **New query**
4. **Copy/paste SQL above**
5. Click **"Run"**
6. Should see: `Success. No rows returned`

---

## ✅ Then Refresh Your DApp

```bash
# In browser:
Press F5 (refresh)

# Or restart server:
npm run dev
```

---

## 🎯 After Running SQL

**Try placing limit order again:**

1. Go to "Limit" tab
2. Create order
3. Sign twice (Permit + Order)
4. ✅ Should save successfully
5. ✅ Should appear in ongoing orders list!

---

## 📊 What These Columns Do

| Column | Purpose |
|--------|---------|
| `permit_signature` | ERC20 Permit for token approval |
| `order_signature` | EIP-712 order authorization |
| `executor_address` | Who will execute the order |
| `gelato_task_id` | Gelato Relay task tracking |
| `ready_for_execution` | Flag when conditions are met |
| `execution_quote` | Quote data for execution |
| `quote_fetched_at` | When quote was fetched |
| `last_execution_attempt` | Last execution try timestamp |
| `last_execution_error` | Error from failed execution |

---

## ✅ Expected Result

After running SQL, console should show:

```
[v0] ✅ Limit order saved to database!
[OngoingOrders] Fetching orders...
[OngoingOrders] Found 1 orders
```

And you'll see your order in the ongoing orders list!

---

**File:** This is in `LIMIT_ORDERS_PRESIGN_MIGRATION.sql` (updated)

**Action Required:** RUN THE SQL MIGRATION NOW!

After that, everything will work! ✅

