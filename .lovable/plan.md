
# Plan: Fix Panel Owner API Documentation, Integration Icons, Customer Actions & Order Controls

## Issues Identified from Screenshots & Analysis

### Issue 1: Panel Owner API Documentation Shows Buyer Endpoints
**Current Problem:** The "Documentation" tab in API Management (line 219-276) shows buyer-facing endpoints:
- `/api/v2/services` - Get services (buyer action)
- `/api/v2/order` - Add order (buyer action)
- `/api/v2/status` - Order status (buyer action)
- `/api/v2/balance` - Get balance (buyer action)
- `/api/v2/refill` - Request refill (buyer action)
- `/api/v2/cancel` - Cancel order (buyer action)

**Required:** Panel Owner API should show management endpoints:
- `/api/v2/panel` action=services - List all panel services
- `/api/v2/panel` action=customers - List all customers
- `/api/v2/panel` action=orders - List all orders
- `/api/v2/panel` action=stats - Get panel statistics
- `/api/v2/panel` action=services.sync - Sync with provider
- `/api/v2/panel` action=balance.adjust - Adjust customer balance

### Issue 2: API URL Hardcoded to homeofsmm.com
**Current Problem:** Line 93 hardcodes `const apiBaseUrl = "https://homeofsmm.com"`

**Required:** Detect current domain dynamically:
```typescript
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If on localhost/preview, show placeholder
    if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
      return 'https://homeofsmm.com'; // Default brand domain
    }
    return `https://${hostname.split('.').slice(-2).join('.')}`;
  }
  return 'https://homeofsmm.com';
};
```

### Issue 3: Integration Icons Showing Plain Colored Squares
**Current Problem:** The screenshots show Telegram, VK, Discord, WhatsApp, GetButton, Zendesk, Tidio all displaying as plain colored squares without actual brand logos.

**Root Cause Analysis:** The icons exist in `IntegrationIcons.tsx` with proper SVG paths, but they're being rendered inside a colored div that's hiding the icon. Looking at line 97-98 in `Integrations.tsx`:
```tsx
icon: <GoogleIcon className="w-5 h-5" />,
color: 'bg-white border border-gray-200',
```

The icon is placed inside a div with the `color` background class, but the SVG fill colors in the icons themselves may be conflicting with dark backgrounds.

**Fix Required:**
1. Ensure icons are rendered with proper visibility
2. Use white fill for icons on dark backgrounds OR
3. Remove fill from SVGs when placed on colored backgrounds and use `fill="currentColor"`

### Issue 4: Customer Suspend vs Ban Confusion
**Current Status (Already Implemented):**
- **Suspend**: Temporary (`is_active: false`) - sets status to "suspended"
- **Ban**: Permanent (`is_banned: true`, `is_active: false`) - includes reason and timestamp
- **Unsuspend**: Button labeled "Activate Account" (not "Unsuspend")
- **Unban**: Button labeled "Unban Account"

**Issues to Fix:**
1. When suspended, action shows "Activate" but should show "Unsuspend" for clarity
2. Ban action needs a stronger warning (permanent action)
3. The dropdown menu shows "Ban" when user is suspended instead of differentiating

### Issue 5: Order Management - Cancel/Stop/Pause
**Current Capabilities:**
- Cancel: Yes (changes status to 'cancelled')
- Refund: Yes (with amount and reason)
- Bulk Cancel/Complete/In Progress: Yes

**Missing Features:**
- **Pause Order**: No current implementation (useful for temporarily stopping delivery)
- **Resume Order**: No current implementation (resume paused orders)

---

## Implementation Plan

### Part 1: Update Panel Owner API Endpoints (Documentation Tab)

**File:** `src/pages/panel/APIManagement.tsx`

**Replace lines 219-276 (endpoints array) with Panel Owner Management endpoints:**

```typescript
const endpoints = [
  {
    id: "services",
    method: "POST",
    path: "/api/v2/panel",
    description: "Get all panel services",
    params: ["key", "action=services"],
    response: `{"success":true,"data":[{"id":"uuid","service_id":1,"name":"Instagram Followers","rate":"2.50","min":100,"max":10000,"category":"Instagram","status":"active"}]}`
  },
  {
    id: "customers",
    method: "POST",
    path: "/api/v2/panel",
    description: "Get all customers",
    params: ["key", "action=customers", "page (optional)", "limit (optional)"],
    response: `{"success":true,"data":[{"id":"uuid","email":"user@example.com","balance":"150.50","total_spent":"500.00","status":"active","created_at":"2024-01-15"}],"pagination":{"page":1,"limit":20,"total":156}}`
  },
  {
    id: "orders",
    method: "POST",
    path: "/api/v2/panel",
    description: "Get all panel orders",
    params: ["key", "action=orders", "status (optional)", "page (optional)"],
    response: `{"success":true,"data":[{"id":"uuid","order_number":"ORD-12345","service":"Instagram Followers","quantity":1000,"price":"2.50","status":"completed","created_at":"2024-01-20"}]}`
  },
  {
    id: "stats",
    method: "POST",
    path: "/api/v2/panel",
    description: "Get panel statistics",
    params: ["key", "action=stats"],
    response: `{"success":true,"data":{"total_orders":1250,"total_revenue":"15000.00","total_customers":450,"active_services":125,"orders_today":45}}`
  },
  {
    id: "services-sync",
    method: "POST",
    path: "/api/v2/panel",
    description: "Sync services from provider",
    params: ["key", "action=services.sync", "provider_id"],
    response: `{"success":true,"message":"Synced 125 services","imported":125,"updated":30,"failed":2}`
  },
  {
    id: "customer-balance",
    method: "POST",
    path: "/api/v2/panel",
    description: "Adjust customer balance",
    params: ["key", "action=balance.adjust", "customer_id", "amount", "type (add/subtract)", "reason (optional)"],
    response: `{"success":true,"customer_id":"uuid","new_balance":"175.50","transaction_id":"tx_123"}`
  },
  {
    id: "customer-status",
    method: "POST",
    path: "/api/v2/panel",
    description: "Update customer status",
    params: ["key", "action=customer.status", "customer_id", "status (active/suspended/banned)"],
    response: `{"success":true,"customer_id":"uuid","status":"suspended"}`
  },
  {
    id: "order-update",
    method: "POST",
    path: "/api/v2/panel",
    description: "Update order status",
    params: ["key", "action=order.update", "order_id", "status (pending/in_progress/completed/cancelled)"],
    response: `{"success":true,"order_id":"uuid","status":"completed"}`
  },
];
```

**Update Base URL display (line 536):**
Change from static `apiBaseUrl` to show dynamic detection message.

### Part 2: Dynamic API URL Detection

**File:** `src/pages/panel/APIManagement.tsx`

**Replace lines 91-100 with:**

```typescript
// Detect current platform domain dynamically
const getPlatformDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Extract root domain (e.g., "homeofsmm.com" from "panel.homeofsmm.com")
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      // Whitelist known platform domains
      if (['homeofsmm.com', 'smmpilot.online'].includes(rootDomain)) {
        return `https://${rootDomain}`;
      }
    }
    // For development/preview environments
    if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
      return 'https://homeofsmm.com';
    }
  }
  return 'https://homeofsmm.com';
};

const apiBaseUrl = getPlatformDomain();

// Buyer API URL (for reference in the info card)
const buyerApiUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.${apiBaseUrl.replace('https://', '')}/api/v2`
    : `https://yourpanel.${apiBaseUrl.replace('https://', '')}/api/v2`;
```

### Part 3: Fix Integration Icons Visibility

**File:** `src/pages/panel/Integrations.tsx`

**Problem:** The icon component is rendered inside a colored container, but the SVG has its own fill color which may not be visible on some backgrounds.

**Solution:** Render icons with a white background circle or ensure contrast:

**Update OAuth providers rendering (around line 700-750):**

```tsx
<div className={cn(
  "w-10 h-10 rounded-xl flex items-center justify-center",
  provider.color
)}>
  {/* Ensure icon is visible with proper contrast */}
  <div className="relative">
    {provider.id === 'google' ? (
      provider.icon // Google icon has multi-colors
    ) : (
      <div className="text-white">
        {React.cloneElement(provider.icon as React.ReactElement, {
          className: "w-5 h-5",
          fill: "white" // Override to white for colored backgrounds
        })}
      </div>
    )}
  </div>
</div>
```

**Alternative (Cleaner) Solution:** Update `IntegrationIcons.tsx` to accept a `fill` prop and default to `currentColor`:

**File:** `src/components/icons/IntegrationIcons.tsx`

Update each icon to accept and use the fill prop:

```typescript
export const TelegramIcon = ({ className = "", size = 24, fill }: IconProps & { fill?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#26A5E4"}>
    // ... path
  </svg>
);
```

Then in Integrations.tsx, pass `fill="white"` for icons on colored backgrounds.

### Part 4: Customer Management - Suspend/Unsuspend/Ban Clarity

**File:** `src/components/customers/CustomerDetailsSheet.tsx`

**Changes (lines 274-292):**

Replace "Activate Account" with "Unsuspend Account" for suspended (non-banned) users:

```tsx
{customer.status === 'suspended' && !customer.isBanned ? (
  <Button 
    variant="outline" 
    className="w-full justify-start text-green-500 hover:text-green-600"
    onClick={onActivate}
  >
    <UserCheck className="w-4 h-4 mr-2" />
    Unsuspend Account
  </Button>
) : customer.status !== 'suspended' && (
  <Button 
    variant="outline" 
    className="w-full justify-start text-amber-500 hover:text-amber-600"
    onClick={onSuspend}
  >
    <UserX className="w-4 h-4 mr-2" />
    Suspend Account (Temporary)
  </Button>
)}
```

**Add Ban Warning Dialog (lines 322-330):**

```tsx
{!customer.isBanned && (
  <>
    {!showBanInput ? (
      <Button 
        variant="outline" 
        className="w-full justify-start text-red-500 hover:text-red-600"
        onClick={() => setShowBanWarning(true)}
      >
        <Ban className="w-4 h-4 mr-2" />
        Ban Account (Permanent)
      </Button>
    ) : (
      // Ban reason input UI
    )}
  </>
)}

{/* Ban Warning Dialog */}
<AlertDialog open={showBanWarning} onOpenChange={setShowBanWarning}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="w-5 h-5" />
        Permanent Ban Warning
      </AlertDialogTitle>
      <AlertDialogDescription>
        This action will <strong>permanently ban</strong> this customer. 
        They will not be able to access your panel or place orders. 
        This is different from suspension which is temporary.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        className="bg-red-500 hover:bg-red-600"
        onClick={() => { setShowBanWarning(false); setShowBanInput(true); }}
      >
        Proceed to Ban
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**File:** `src/pages/panel/CustomerManagement.tsx`

Update dropdown menu (lines 946-952) to show clearer labels:

```tsx
<DropdownMenuItem 
  className="text-amber-500"
  onClick={() => customer.status === 'suspended' 
    ? handleSingleActivate(customer.id) 
    : handleSingleSuspend(customer.id)}
>
  {customer.status === 'suspended' ? (
    <>
      <UserCheck className="w-4 h-4 mr-2" /> 
      Unsuspend
    </>
  ) : (
    <>
      <UserX className="w-4 h-4 mr-2" /> 
      Suspend (Temporary)
    </>
  )}
</DropdownMenuItem>
```

### Part 5: Order Management - Add Pause/Resume Functionality

**File:** `src/pages/panel/OrdersManagement.tsx`

**Add new status to statusConfig (line 82-88):**

```typescript
const statusConfig: Record<string, { label: string; color: string; icon: any; glow: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, glow: "shadow-yellow-500/20" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2, glow: "shadow-blue-500/20" },
  paused: { label: "Paused", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Pause, glow: "shadow-purple-500/20" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle, glow: "shadow-green-500/20" },
  partial: { label: "Partial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle, glow: "shadow-orange-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, glow: "shadow-red-500/20" },
};
```

**Add Pause and Resume functions:**

```typescript
const pauseOrder = async (orderId: string) => {
  await updateOrderStatus(orderId, 'paused');
  toast({ title: "Order paused", description: "Order has been paused and can be resumed later" });
};

const resumeOrder = async (orderId: string) => {
  await updateOrderStatus(orderId, 'in_progress');
  toast({ title: "Order resumed", description: "Order is now back in progress" });
};
```

**Update bulk actions to include pause/resume:**

```typescript
} else if (bulkAction === "pause") {
  await supabase
    .from('orders')
    .update({ status: 'paused' as any, updated_at: new Date().toISOString() })
    .in('id', orderIds);
  toast({ title: `${orderIds.length} orders paused` });
} else if (bulkAction === "resume") {
  await supabase
    .from('orders')
    .update({ status: 'in_progress' as any, updated_at: new Date().toISOString() })
    .in('id', orderIds);
  toast({ title: `${orderIds.length} orders resumed` });
}
```

**Add Pause/Resume to order dropdown menu (in order details dialog):**

```tsx
{order.status === 'in_progress' && (
  <DropdownMenuItem onClick={() => pauseOrder(order.id)}>
    <Pause className="w-4 h-4 mr-2" /> Pause Order
  </DropdownMenuItem>
)}
{order.status === 'paused' && (
  <DropdownMenuItem onClick={() => resumeOrder(order.id)}>
    <Play className="w-4 h-4 mr-2" /> Resume Order
  </DropdownMenuItem>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/APIManagement.tsx` | 1) Replace buyer endpoints with panel owner management endpoints 2) Add dynamic domain detection 3) Update SDK examples to use panel endpoints |
| `src/pages/panel/Integrations.tsx` | Fix icon rendering to ensure visibility on colored backgrounds |
| `src/components/icons/IntegrationIcons.tsx` | Add optional `fill` prop to all icons for better flexibility |
| `src/components/customers/CustomerDetailsSheet.tsx` | 1) Rename "Activate" to "Unsuspend" for suspended users 2) Add ban warning dialog with permanent action notice |
| `src/pages/panel/CustomerManagement.tsx` | Update dropdown labels to differentiate suspend vs ban clearly |
| `src/pages/panel/OrdersManagement.tsx` | 1) Add "paused" status 2) Add pause/resume functions 3) Add bulk pause/resume actions |

---

## Summary of Changes

1. **Panel Owner API Documentation** - Replace buyer endpoints with management endpoints (customers, orders, stats, sync)
2. **Dynamic API URL** - Detect platform domain from current URL instead of hardcoding
3. **Integration Icons** - Fix visibility by ensuring proper fill colors on colored backgrounds
4. **Customer Suspend/Ban** - Add "Unsuspend" label, permanent ban warning dialog, clearer action labels
5. **Order Pause/Resume** - Add new "paused" status with pause/resume functionality for order control
