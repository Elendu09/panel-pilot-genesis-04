

# Plan: Fix API Key Architecture, Deposit Status Handling & Transaction Sync

## Issues Identified

### Issue 1: API Key Architecture - Panel vs Buyer Keys Should Be Separate

**Current Problem:** The `buyer-api` edge function (lines 94-127) currently checks **both** `panel_api_keys` (for panel owner keys) AND `client_users.api_key` (for buyer keys) in a fallback manner. This is actually CORRECT architecture:

- **Panel API keys** (`panel_api_keys` table): Used by panel owners to automate their panel operations
- **Buyer API keys** (`client_users.api_key` column): Used by individual buyers/customers to automate their own orders within a panel

The confusion is in the naming - this IS the correct separation:
1. Panel owners have their own API keys stored in `panel_api_keys`
2. Buyers have their own API keys stored in `client_users.api_key`

**What needs fixing:** When a buyer uses their API key, the `balance` action should return THEIR balance (from `client_users.balance`), not the panel's balance. Currently `handleBalance` (lines 345-368) always returns the panel's balance.

**Solution:** Update `handleBalance` to return buyer-specific balance when using a buyer key.

---

### Issue 2: Deposit Showing "Success" When Payment Was Cancelled

**Root Cause Analysis:**

Looking at `BuyerDeposit.tsx` lines 341-366:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  const cancelled = params.get('cancelled');
  
  if (success === 'true' && transactionId) {
    toast({ title: "Payment Successful!" }); // ← Shows success toast
    refreshBuyer();  // ← Refreshes buyer data
  } else if (cancelled === 'true') {
    toast({ variant: "destructive", title: "Payment Cancelled" });
  }
}, [refreshBuyer]);
```

**The Problem:**
1. The user returns to `/deposit?success=true` from the gateway, but the payment may have actually failed
2. The code shows "Payment Successful!" based only on URL params, NOT actual transaction status
3. The actual transaction status is set by webhooks (`payment-webhook`), but the toast fires immediately on return

**Real flow:**
1. User starts deposit → Transaction created with status `pending`
2. User redirected to gateway → User cancels or fails payment
3. User returns to `/deposit?success=true` (some gateways still use success URL even for failures)
4. Toast shows "Payment Successful!" ← WRONG
5. Webhook never fires or fires with `failed` status
6. Transaction stays `pending` or updates to `failed`
7. Balance never updated

**Solution:** 
1. DON'T show "Payment Successful!" toast immediately on return
2. Instead show "Verifying payment..." and fetch the actual transaction status
3. Only show success/failure based on actual DB transaction status
4. Update failed/cancelled transactions to show in Recent Deposits with correct status

---

### Issue 3: Recent Deposits Not Showing All Statuses with Transaction ID Copy

**Current State:** Looking at lines 690-734, the Recent Deposits section DOES show pending/completed/failed with icons and badges. But it's missing:
1. Transaction ID display (users need to copy for support)
2. Fast sync when status changes

**Solution:** Add transaction ID display with copy button, and enhance real-time subscription.

---

## Implementation Details

### Part 1: Fix API Balance to Return Buyer-Specific Balance

**File:** `supabase/functions/buyer-api/index.ts`
**Lines:** 344-368

**Current code returns panel balance:**
```typescript
async function handleBalance(supabase: any, panelId: string, apiKey: string) {
  const { data: panel, error } = await supabase
    .from('panels')
    .select('balance, default_currency')
    .eq('id', panelId)
    .maybeSingle();
  
  return jsonResponse({
    balance: parseFloat(panel.balance || 0).toFixed(4),
    currency: panel.default_currency || "USD"
  });
}
```

**Updated code - return buyer balance if buyer key:**
```typescript
async function handleBalance(supabase: any, panelId: string, apiKey: string, buyerId: string | null) {
  // If this is a buyer-specific API key, return the buyer's balance
  if (buyerId) {
    const { data: buyer, error } = await supabase
      .from('client_users')
      .select('balance')
      .eq('id', buyerId)
      .single();
    
    if (error || !buyer) {
      return errorResponse("Failed to fetch balance");
    }
    
    return jsonResponse({
      balance: parseFloat(buyer.balance || 0).toFixed(4),
      currency: "USD"
    });
  }
  
  // Otherwise return panel balance (for panel-level API keys)
  const { data: panel, error } = await supabase
    .from('panels')
    .select('balance, default_currency')
    .eq('id', panelId)
    .maybeSingle();

  if (error || !panel) {
    return errorResponse("Failed to fetch balance");
  }

  return jsonResponse({
    balance: parseFloat(panel.balance || 0).toFixed(4),
    currency: panel.default_currency || "USD"
  });
}
```

Also update the call site (line 145):
```typescript
case 'balance':
  response = await handleBalance(supabase, panelId, key, buyerId);
  break;
```

---

### Part 2: Fix Deposit Success/Failure Detection

**File:** `src/pages/buyer/BuyerDeposit.tsx`
**Lines:** 341-366

**Problem:** Shows success based on URL params, not actual transaction status

**Solution:** Verify transaction status from database before showing success:

```typescript
// Check for payment success/cancel URL params on mount
useEffect(() => {
  const verifyPaymentStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const successParam = params.get('success');
    const cancelledParam = params.get('cancelled');
    
    // Clean up URL immediately
    if (successParam || cancelledParam || transactionId) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // If cancelled explicitly, show error
    if (cancelledParam === 'true') {
      toast({ 
        variant: "destructive",
        title: "Payment Cancelled", 
        description: "Your deposit was not completed." 
      });
      // Update transaction to failed if we have ID
      if (transactionId) {
        await supabase.from('transactions')
          .update({ status: 'failed' })
          .eq('id', transactionId);
      }
      fetchTransactions();
      return;
    }
    
    // If we have a transaction ID, verify actual status
    if (transactionId && successParam === 'true') {
      toast({ 
        title: "Verifying Payment...", 
        description: "Please wait while we confirm your payment." 
      });
      
      // Poll for status update (webhooks may take a moment)
      let attempts = 0;
      const maxAttempts = 10;
      const checkStatus = async () => {
        const { data: tx } = await supabase
          .from('transactions')
          .select('status, amount')
          .eq('id', transactionId)
          .single();
        
        if (tx?.status === 'completed') {
          toast({ 
            title: "Payment Successful!", 
            description: `$${tx.amount.toFixed(2)} has been added to your balance.` 
          });
          refreshBuyer();
          fetchTransactions();
          return true;
        } else if (tx?.status === 'failed') {
          toast({ 
            variant: "destructive",
            title: "Payment Failed", 
            description: "Your payment could not be processed." 
          });
          fetchTransactions();
          return true;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          // After 20 seconds, show pending message
          toast({ 
            title: "Payment Processing", 
            description: "Your payment is still being verified. Check back shortly." 
          });
          fetchTransactions();
        }
        return false;
      };
      
      checkStatus();
    }
  };
  
  verifyPaymentStatus();
}, [refreshBuyer]);
```

---

### Part 3: Update Recent Deposits to Show Transaction ID with Copy

**File:** `src/pages/buyer/BuyerDeposit.tsx`
**Lines:** 690-734

**Add transaction ID with copy functionality:**

```typescript
{transactions.map((tx) => {
  const isCompleted = tx.status === 'completed';
  const isPending = tx.status === 'pending';
  const isFailed = tx.status === 'failed' || tx.status === 'cancelled';
  
  return (
    <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <div className={cn(
          "p-1.5 md:p-2 rounded-lg shrink-0",
          isCompleted && "bg-green-500/10",
          isPending && "bg-yellow-500/10",
          isFailed && "bg-red-500/10"
        )}>
          {isCompleted ? (
            <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
          ) : isPending ? (
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
          ) : (
            <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm md:text-base">${tx.amount.toFixed(2)}</p>
            {/* Transaction ID with copy */}
            <button 
              onClick={() => copyToClipboard(tx.id)}
              className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1"
              title="Copy Transaction ID"
            >
              #{tx.id.slice(0, 8).toUpperCase()}
              <Copy className="w-2.5 h-2.5" />
            </button>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">
            {tx.payment_method || 'Payment'} • {new Date(tx.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Badge 
        variant={isCompleted ? 'default' : 'secondary'}
        className={cn(
          "text-[10px] md:text-xs capitalize shrink-0",
          isCompleted && "bg-green-500/10 text-green-500 border-green-500/20",
          isPending && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          isFailed && "bg-red-500/10 text-red-500 border-red-500/20"
        )}
      >
        {tx.status || 'pending'}
      </Badge>
    </div>
  );
})}
```

---

### Part 4: Enhance Real-Time Subscription for Faster Sync

**File:** `src/pages/buyer/BuyerDeposit.tsx`
**Lines:** 296-338

**Current subscription filters by `user_id`**, but also add `buyer_id` filter and handle all event types:

```typescript
useEffect(() => {
  if (!buyer?.id) return;

  // Subscribe to all transaction changes for this buyer
  const channel = supabase
    .channel(`buyer-transactions-${buyer.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
      },
      async (payload) => {
        // Check if this transaction belongs to this buyer
        const newRecord = payload.new as any;
        const oldRecord = payload.old as any;
        const recordBuyerId = newRecord?.buyer_id || newRecord?.user_id || oldRecord?.buyer_id || oldRecord?.user_id;
        
        if (recordBuyerId !== buyer.id) return;
        
        console.log('Transaction update for buyer:', payload);
        
        // Always refresh transactions list
        fetchTransactions();
        
        // Handle completed status
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          if (newRecord?.status === 'completed' && oldRecord?.status !== 'completed') {
            refreshBuyer();
            toast({
              title: "Balance Updated!",
              description: `$${newRecord.amount?.toFixed(2)} has been added to your balance.`
            });
          } else if (newRecord?.status === 'failed' && oldRecord?.status !== 'failed') {
            toast({
              variant: "destructive",
              title: "Payment Failed",
              description: "Your payment could not be processed."
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [buyer?.id, refreshBuyer]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/buyer-api/index.ts` | Update `handleBalance` to return buyer-specific balance when using buyer API key |
| `src/pages/buyer/BuyerDeposit.tsx` | Fix URL param handling to verify actual status, add transaction ID copy, enhance real-time sync |

---

## Technical Summary

1. **API Balance Fix**: When a buyer uses their API key, return their `client_users.balance` instead of the panel's balance. Panel owner keys still return panel balance.

2. **Deposit Status Verification**: Instead of trusting URL params (`?success=true`), verify actual transaction status from database. Poll for status updates since webhooks may take time.

3. **Transaction ID Display**: Add transaction ID with copy button in Recent Deposits so users can reference their transactions for support.

4. **Real-Time Sync Enhancement**: Improve subscription to catch all transaction status changes and update UI immediately with appropriate toast notifications.

5. **Cancelled Payment Handling**: When user returns with `?cancelled=true`, update transaction to failed status and show error toast.

