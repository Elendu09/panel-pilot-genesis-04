
# Comprehensive Enhancement Plan: ChatInbox Spacing, Navigation Fixes, Provider Marketplace & Live Support

## Issues Identified

### Issue 1: ChatInbox Mobile Spacing (Three-dot menu too close to cancel button)
**File:** `src/pages/panel/ChatInbox.tsx` (lines 777-828)
- The three-dot menu button (`MoreVertical`) and the back button (`ArrowLeft`) are too close together in the mobile sheet header
- Need to add more spacing between header elements

### Issue 2: Support FAB & Menu Items Redirect to Homepage
**Root Cause:** Using `window.location.href` instead of React Router's `navigate` function
- In `ChatInbox.tsx` lines 455-482, handlers use `window.location.href`
- When on tenant domains (e.g., `panelname.smmpilot.online`), this causes full page reload which triggers `TenantRouter` to redetect the domain type
- The fix is to use React Router's `useNavigate()` for client-side navigation

**Affected handlers:**
- `handleManageBalance` (line 462)
- `handleViewUserOrders` (line 472)
- `handleViewPaymentHistory` (line 481)
- `supportFabAction` in `PanelOwnerDashboard.tsx` (line 159)

### Issue 3: Provider Marketplace UI Enhancement
Based on the uploaded reference image, the marketplace should have:
1. **Tabbed interface**: Providers | Services | Performers
2. **Ranked list view** with:
   - Rank number (1, 2, 3...) with crown icons
   - Provider logo/avatar
   - Domain name
   - "Ads" badge for sponsored providers
   - Currency badge (USD)
   - Service tags/badges showing top services
3. **Switch toggle** for enable/disable instead of just button styling

### Issue 4: Edge Function Error for Direct Providers
Looking at the edge function, I found one remaining issue:
- Line 301 still has hardcoded `homeofsmm.com` in the response:
  ```typescript
  domain: targetPanel.custom_domain || `${targetPanel.subdomain}.homeofsmm.com`,
  ```
- Should use the platform domain constant

### Issue 5: Add Manual Provider Option
Need to add ability for users who already have accounts on target panels (registered with their panel email) to manually connect using their existing credentials rather than auto-creating new accounts.

---

## Implementation Plan

### Part 1: Fix ChatInbox Mobile Spacing

**File:** `src/pages/panel/ChatInbox.tsx`

Update the mobile sheet header layout (lines 775-830):
```typescript
<SheetHeader className="p-4 border-b shrink-0">
  <div className="flex items-center gap-4"> {/* Increased gap from 3 to 4 */}
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setChatSheetOpen(false)}
      className="shrink-0 -ml-1" // Negative margin to align with edge
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
    <Avatar className="w-10 h-10 shrink-0">
      {/* ... */}
    </Avatar>
    <div className="flex-1 min-w-0">
      {/* ... */}
    </div>
    
    {/* Add spacing wrapper for three-dot menu */}
    <div className="pl-2"> {/* Extra padding to separate from content */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        {/* ... */}
      </DropdownMenu>
    </div>
  </div>
</SheetHeader>
```

### Part 2: Fix Navigation Redirects (Use React Router)

**File:** `src/pages/panel/ChatInbox.tsx`

Replace `window.location.href` with React Router navigation:

```typescript
// Add import at top
import { useNavigate } from 'react-router-dom';

// Inside component
const navigate = useNavigate();

// Update handlers:
const handleManageBalance = (session: ChatSession | null) => {
  if (!session) return;
  toast({ 
    title: 'Opening Customer Management', 
    description: `Managing balance for ${session.visitor_name || session.visitor_email || 'visitor'}` 
  });
  setChatSheetOpen(false); // Close sheet first on mobile
  navigate(`/panel/customers?search=${encodeURIComponent(session.visitor_email || session.visitor_id)}`);
};

const handleViewUserOrders = (session: ChatSession | null) => {
  if (!session) return;
  toast({ title: 'Opening Orders' });
  setChatSheetOpen(false);
  navigate('/panel/orders');
};

const handleViewPaymentHistory = (session: ChatSession | null) => {
  if (!session) return;
  toast({ title: 'Opening Transactions' });
  setChatSheetOpen(false);
  navigate('/panel/transactions');
};
```

**File:** `src/pages/PanelOwnerDashboard.tsx`

Fix supportFabAction to use navigate:
```typescript
// Already using useNavigate in the file
const supportFabAction = () => {
  navigate('/panel/support');
};
```

### Part 3: Enhanced Provider Marketplace UI

Based on the reference image, create a ranked list view with:

**File:** `src/pages/panel/ProviderManagement.tsx`

Add tabbed interface inside marketplace section:
```typescript
<Tabs defaultValue="providers" className="w-full">
  <TabsList className="w-full grid grid-cols-3 mb-6">
    <TabsTrigger value="providers">Providers</TabsTrigger>
    <TabsTrigger value="services">Services</TabsTrigger>
    <TabsTrigger value="performers">Performers</TabsTrigger>
  </TabsList>
  
  <TabsContent value="providers">
    {/* Ranked provider list */}
  </TabsContent>
  
  <TabsContent value="services">
    <div className="text-center py-12 text-muted-foreground">
      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Coming soon - Top services from featured providers</p>
    </div>
  </TabsContent>
  
  <TabsContent value="performers">
    <div className="text-center py-12 text-muted-foreground">
      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>Coming soon - Highest performing providers</p>
    </div>
  </TabsContent>
</Tabs>
```

**File:** `src/components/providers/ProviderListItem.tsx`

Add ranking display and Switch toggle:
```typescript
interface ProviderListItemProps {
  rank?: number;  // NEW - for ranked display
  showRank?: boolean;  // NEW
  showSwitch?: boolean;  // NEW - for enable/disable toggle
  isEnabled?: boolean;  // NEW
  onToggle?: (enabled: boolean) => void;  // NEW
  // ... existing props
}

// Inside component
<div className="flex items-center gap-3">
  {/* Rank with Crown */}
  {showRank && rank && (
    <div className="flex items-center gap-1 min-w-[40px]">
      <span className="text-xl font-bold">{rank}</span>
      {rank <= 3 && <Crown className="w-4 h-4 text-amber-500" />}
    </div>
  )}
  
  {/* Avatar */}
  <Avatar>...</Avatar>
  
  {/* Info */}
  <div>...</div>
  
  {/* Badges: Ads, USD */}
  {adType && <Badge>Ads</Badge>}
  <Badge variant="outline">USD</Badge>
</div>

{/* Switch instead of button for connected providers */}
{showSwitch ? (
  <Switch checked={isEnabled} onCheckedChange={onToggle} />
) : (
  <Button>Enable</Button>
)}
```

### Part 4: Fix Edge Function Domain Reference

**File:** `supabase/functions/enable-direct-provider/index.ts`

Line 301-302 - Update to use platform domain:
```typescript
// BEFORE (line 301):
domain: targetPanel.custom_domain || `${targetPanel.subdomain}.homeofsmm.com`,

// AFTER:
domain: targetPanel.custom_domain || `${targetPanel.subdomain}.${platformDomain}`,
```

### Part 5: Add Manual Provider Connection Option

**File:** `src/pages/panel/ProviderManagement.tsx`

Add a "Manual Connect" button next to "Enable" for direct providers:
```typescript
// In the marketplace section, add dialog for manual connection
const [manualConnectOpen, setManualConnectOpen] = useState(false);
const [manualConnectPanel, setManualConnectPanel] = useState<DirectPanel | null>(null);
const [manualApiKey, setManualApiKey] = useState('');

// Handler
const handleManualConnect = async (panel: DirectPanel) => {
  if (!manualApiKey || !panel.id) return;
  
  try {
    // Create provider with user's existing API key
    const platformDomain = 'smmpilot.online';
    const apiEndpoint = panel.custom_domain
      ? `https://${panel.custom_domain}/api/v2`
      : `https://${panel.subdomain}.${platformDomain}/api/v2`;
    
    await supabase.from('providers').insert({
      panel_id: panel?.id,
      name: panel.name,
      api_endpoint: apiEndpoint,
      api_key: manualApiKey,
      is_active: true,
      is_direct: true,
      source_panel_id: panel.id,
    });
    
    toast({ title: 'Provider connected manually' });
    fetchProviders();
    setManualConnectOpen(false);
  } catch (error) {
    toast({ variant: 'destructive', title: 'Failed to connect' });
  }
};
```

Add button in ProviderListItem:
```typescript
<div className="flex items-center gap-2">
  <Button variant="outline" size="sm" onClick={() => openManualConnect(provider)}>
    Manual
  </Button>
  <Button size="sm" onClick={onAction}>
    Enable
  </Button>
</div>
```

Dialog for manual connection:
```typescript
<Dialog open={manualConnectOpen} onOpenChange={setManualConnectOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Connect with Existing Account</DialogTitle>
      <DialogDescription>
        Already have an account on {manualConnectPanel?.name}? Enter your API key to connect.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>API Key</Label>
        <Input 
          type="password"
          value={manualApiKey}
          onChange={(e) => setManualApiKey(e.target.value)}
          placeholder="Enter your existing API key"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        You can find your API key in your account settings on {manualConnectPanel?.name}.
      </p>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setManualConnectOpen(false)}>Cancel</Button>
      <Button onClick={() => handleManualConnect(manualConnectPanel!)}>Connect</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/panel/ChatInbox.tsx` | Increase spacing, use `useNavigate()` instead of `window.location.href` |
| `src/pages/PanelOwnerDashboard.tsx` | Update supportFabAction to use `navigate()` |
| `src/pages/panel/ProviderManagement.tsx` | Add tabbed marketplace UI, manual connect dialog |
| `src/components/providers/ProviderListItem.tsx` | Add rank display, Switch toggle, service badges |
| `supabase/functions/enable-direct-provider/index.ts` | Fix hardcoded domain on line 301 |

---

## Visual Design: Enhanced Marketplace Layout

Based on the reference image:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Providers]  [Services]  [Performers]                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 1 👑 ⭐ telegramshop.org        [Ads] [USD]                │ │
│  │      [📱 Telegram Members] [⭐ Telegram Premium...]        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 2 👑 🛒 flysmm.com               [USD]                     │ │
│  │      [📱⭐ Telegram Members [BEST]] [📱 Telegram...]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 3 👑 💎 teateagram.com           [USD]    [Manual][Enable] │ │
│  │      [⭐ Premium subscribers Telegram] [⭐ Premium...]     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Key visual elements:
- Rank numbers (1, 2, 3...) with crown icons for top positions
- Provider logos/avatars
- Domain names prominently displayed
- "Ads" badge for sponsored providers (golden gradient)
- "USD" badge for currency
- Service tag badges showing sample services
- Manual + Enable buttons
- Connected providers show Switch toggle instead

---

## Technical Implementation Notes

### Navigation Fix Explanation
When using `window.location.href`, the browser performs a full page reload. On tenant domains, this triggers `TenantRouter` to re-analyze the domain and potentially route incorrectly. Using React Router's `navigate()` performs client-side navigation, preserving the current routing context.

### Manual Provider Connection Flow
1. User clicks "Manual" on a direct provider
2. Dialog opens asking for their existing API key
3. User enters API key from their account on the target panel
4. System creates provider record with that API key
5. System verifies connection by calling balance endpoint
6. If successful, provider is added to "My Providers"

This bypasses the automated account creation flow for users who already have buyer accounts on target panels.
