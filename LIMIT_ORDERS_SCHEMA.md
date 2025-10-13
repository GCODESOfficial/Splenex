# Limit Orders Database Schema

## Table: `limit_orders`

This table stores persistent limit orders that execute automatically when target rates are reached.

### SQL Schema

```sql
CREATE TABLE limit_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  from_token JSONB NOT NULL,
  to_token JSONB NOT NULL,
  from_amount TEXT NOT NULL,
  limit_rate TEXT NOT NULL,
  to_amount TEXT NOT NULL,
  expiry_timestamp BIGINT NOT NULL,
  slippage NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  signature TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  executed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'executed', 'expired', 'cancelled'))
);

-- Indexes for performance
CREATE INDEX idx_limit_orders_wallet ON limit_orders(wallet_address);
CREATE INDEX idx_limit_orders_status ON limit_orders(status);
CREATE INDEX idx_limit_orders_expiry ON limit_orders(expiry_timestamp);
CREATE INDEX idx_limit_orders_created ON limit_orders(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE limit_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view own limit orders"
  ON limit_orders FOR SELECT
  USING (wallet_address = LOWER(auth.jwt() ->> 'wallet_address'));

-- Users can insert their own orders
CREATE POLICY "Users can create own limit orders"
  ON limit_orders FOR INSERT
  WITH CHECK (wallet_address = LOWER(auth.jwt() ->> 'wallet_address'));

-- Users can update their own orders (cancel)
CREATE POLICY "Users can update own limit orders"
  ON limit_orders FOR UPDATE
  USING (wallet_address = LOWER(auth.jwt() ->> 'wallet_address'));
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier for the order |
| `wallet_address` | TEXT | Wallet address of the user (lowercase) |
| `from_token` | JSONB | Source token details (symbol, name, address, chainId, decimals) |
| `to_token` | JSONB | Destination token details (symbol, name, address, chainId, decimals) |
| `from_amount` | TEXT | Amount of source token to swap |
| `limit_rate` | TEXT | Target exchange rate (1 fromToken = X toToken) |
| `to_amount` | TEXT | Expected amount of destination token |
| `expiry_timestamp` | BIGINT | Unix timestamp when order expires (milliseconds) |
| `slippage` | NUMERIC | Slippage tolerance percentage |
| `status` | TEXT | Order status: `pending`, `executed`, `expired`, or `cancelled` |
| `signature` | TEXT | Wallet signature for order verification |
| `message` | TEXT | Signed message for order verification |
| `created_at` | BIGINT | Unix timestamp when order was created (milliseconds) |
| `executed_at` | TIMESTAMP | Timestamp when order was executed (null if not executed) |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Token JSONB Structure

```json
{
  "symbol": "ETH",
  "name": "Ethereum",
  "address": "0x0000000000000000000000000000000000000000",
  "chainId": 1,
  "decimals": 18
}
```

## Setup Instructions

### 1. Create the Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL schema above
4. Execute the query

### 2. Configure RLS (Row Level Security)

The RLS policies ensure:
- Users can only see their own orders
- Users can only create orders for their own wallet
- Users can only cancel their own orders
- Backend services can monitor all orders

### 3. Set Up Monitoring (Optional)

For automatic order execution, set up a cron job to call the monitoring endpoint:

#### Option A: Vercel Cron Jobs (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/limit-orders/monitor",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Use a service like:
- **Cron-job.org**: Free, reliable
- **EasyCron**: Feature-rich
- **AWS EventBridge**: Enterprise solution

Configure to call:
```
GET https://your-domain.com/api/limit-orders/monitor
```

Every 5 minutes: `*/5 * * * *`

## API Endpoints

### POST `/api/limit-orders`
Create a new limit order

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "fromToken": { "symbol": "ETH", ... },
  "toToken": { "symbol": "USDC", ... },
  "fromAmount": "1.0",
  "limitRate": "3500",
  "toAmount": "3500",
  "expiryTimestamp": 1234567890000,
  "slippage": 1,
  "signature": "0x...",
  "message": "...",
  "createdAt": 1234567890000
}
```

### GET `/api/limit-orders?walletAddress=0x...&status=pending`
Fetch limit orders for a wallet

### DELETE `/api/limit-orders?orderId=uuid`
Cancel a limit order

### GET `/api/limit-orders/monitor`
Monitor and execute pending orders (called by cron)

## Features

### ✅ Persistent Storage
- Orders are stored in Supabase database
- Survive wallet disconnections
- Accessible from any device

### ✅ Wallet Signature Verification
- Each order is signed by the user's wallet
- Prevents unauthorized order creation
- Cryptographically secure

### ✅ Automatic Execution
- Background monitoring service checks market rates
- Executes orders when target rate is reached
- Works even when user is offline

### ✅ Expiration Handling
- Orders automatically expire after set time
- Status updated to `expired`
- No manual cleanup needed

### ✅ User Control
- Users can view all their pending orders
- Cancel orders at any time
- Real-time status updates

## Security Considerations

1. **Wallet Signatures**: All orders must be signed by the wallet owner
2. **RLS Policies**: Database-level security ensures data isolation
3. **Rate Limits**: Consider implementing rate limits on order creation
4. **Gas Management**: Backend execution requires secure wallet management
5. **Signature Verification**: Verify signatures before executing orders

## Monitoring Dashboard

View order statistics:

```sql
-- Pending orders count
SELECT status, COUNT(*) 
FROM limit_orders 
GROUP BY status;

-- Orders by token pair
SELECT 
  from_token->>'symbol' as from_token,
  to_token->>'symbol' as to_token,
  COUNT(*) as order_count
FROM limit_orders
WHERE status = 'pending'
GROUP BY from_token->>'symbol', to_token->>'symbol';

-- Expiring soon (next 1 hour)
SELECT * FROM limit_orders
WHERE status = 'pending'
  AND expiry_timestamp < (EXTRACT(EPOCH FROM NOW()) * 1000 + 3600000)
ORDER BY expiry_timestamp;
```

## Troubleshooting

### Orders Not Appearing
- Check if wallet address is lowercase in database
- Verify RLS policies are set up correctly
- Check browser console for API errors

### Orders Not Executing
- Verify monitoring endpoint is being called
- Check if orders have expired
- Review monitoring endpoint logs
- Ensure market rate detection is working

### Performance Issues
- Add indexes on frequently queried columns
- Archive old orders (executed/expired/cancelled)
- Implement pagination for large result sets

## Future Enhancements

- [ ] Email/push notifications when orders execute
- [ ] Partial order fills
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Order history and analytics
- [ ] Multi-wallet order management
- [ ] Gas price optimization

