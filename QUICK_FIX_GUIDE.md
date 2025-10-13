# 🚀 QUICK FIX GUIDE

## 1. Run SQL Migration

Go to Supabase → SQL Editor → Run this:

```sql
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS signed_swap_transaction TEXT;
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS swap_transaction_data JSONB;
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS permit_signature JSONB;
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS order_signature JSONB;
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS executor_address TEXT;
ALTER TABLE limit_orders ADD COLUMN IF NOT EXISTS ready_for_execution BOOLEAN DEFAULT false;
```

## 2. Test Limit Order

1. Go to Limit tab
2. Fill in amount and limit rate
3. Click "Place Limit Swap"
4. Should see wallet confirmation screen
5. Sign the transaction
6. Should save to database successfully

## 3. Check Database

Go to Supabase → Table Editor → limit_orders
- Should see new order with all the new columns

## 4. If Still Errors

Check browser console for specific error messages and share them.

---

## Files Updated:
- ✅ `components/limit-order-interface.tsx` - Fixed variable scope
- ✅ `app/api/limit-orders/route.ts` - Added new columns
- ✅ `FIX_LIMIT_ORDERS_SQL.sql` - Simple migration

## Expected Result:
- ✅ Wallet confirmation screen appears immediately
- ✅ One-time signature stored for auto-execution
- ✅ No more errors
- ✅ Order saved to database
