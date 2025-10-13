# 🎯 FIX: Limit Order - Show Swap Confirmation IMMEDIATELY

## Current Problem

When user clicks "Place Limit Swap":
1. ❌ Only gets signatures (Permit + EIP-712)
2. ❌ No swap confirmation screen appears
3. ❌ User expects to see the swap confirmation (like screenshot) immediately

## Desired Behavior

When user clicks "Place Limit Swap":
1. ✅ **IMMEDIATE**: Show swap confirmation screen (like screenshot)
2. ✅ User signs the swap transaction
3. ✅ **THEN**: Get limit order signatures (Permit + EIP-712)
4. ✅ Store order for future auto-execution

## Solution

### Step 1: Execute Swap First
```typescript
// In handlePlaceLimitOrder():
const handlePlaceLimitOrder = async () => {
  // STEP 1: Execute swap immediately (shows confirmation screen)
  console.log("[LimitOrder] 🎯 Executing swap for immediate confirmation...")
  
  const quote = await getQuote(quoteRequest);
  const swapResult = await executeSwap(quote); // This shows wallet confirmation!
  
  if (!swapResult.success) {
    throw new Error("Swap execution failed");
  }
  
  console.log("[LimitOrder] ✅ User confirmed swap - now getting signatures...")
  
  // STEP 2: Get limit order signatures after swap confirmation
  const permitSignature = await getPermitSignature(...);
  const orderSignature = await signLimitOrder(...);
  
  // STEP 3: Store order with signatures
  onPlaceLimitOrder(completeOrderData);
}
```

### Step 2: Update Component Props
```typescript
// Pass executeSwap function to LimitOrderInterface
<LimitOrderInterface
  // ... existing props
  executeSwap={executeSwap}  // Add this!
/>
```

### Step 3: Update Interface Props
```typescript
interface LimitOrderInterfaceProps {
  // ... existing props
  executeSwap?: (quote: any) => Promise<{success: boolean, error?: string}>;
}
```

## Result

✅ **Swap confirmation screen appears immediately**
✅ **User signs swap transaction**
✅ **Then gets limit order signatures**
✅ **Order stored for auto-execution**

This matches the user's expectation: "the swap prompt signing for swap should come ahead when the place limit was click"

---

## Files to Update

1. `components/simple-swap-interface.tsx` - Pass executeSwap prop
2. `components/limit-order-interface.tsx` - Add executeSwap prop and restructure handlePlaceLimitOrder

## Implementation

The key insight: **executeSwap() shows the wallet confirmation screen**, not getQuote().

We need to call executeSwap() FIRST, then get the signatures.
