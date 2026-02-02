
# Comprehensive Enhancement Plan: Payment Rename, API URL Fix, Ads Preview, Provider Balance Fix & Live Support

## Overview

This plan addresses 6 key requirements:
1. Rename "Payment Methods" to "Payment" in More Menu
2. Fix edge function to detect tenant API base URL with custom domains
3. Add "Example" preview button to Advertising page  
4. Fix direct provider balance error
5. Enhance live support with three-dot menu for authenticated users
6. Hide "Talk to Human" for visitors and improve AI chat messaging

---

## Part 1: Rename "Payment Methods" to "Payment" in More Menu

**File: `src/pages/panel/MoreMenu.tsx`**

**Change:**
Line 50: Change `{ name: "Payment Methods", ...}` to `{ name: "Payment", ...}`

```typescript
// FROM
{ name: "Payment Methods", href: "/panel/payment-methods", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },

// TO  
{ name: "Payment", href: "/panel/payment-methods", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
```

---

## Part 2: Fix Tenant API Base URL in Edge Function

**Current Issue:**
In `supabase/functions/enable-direct-provider/index.ts`, lines 204-206 and 262-264:
```typescript
const apiEndpoint = targetPanel.custom_domain
  ? `https://${targetPanel.custom_domain}/api/v2/buyer-api`
  : `https://${targetPanel.subdomain}.homeofsmm.com/api/v2/buyer-api`;
```

**Problems:**
1. Uses hardcoded `homeofsmm.com` instead of detecting actual platform domain
2. Endpoint ends with `/buyer-api` instead of `/v2` (the correct tenant API base)

**Fix:**
According to memory `architecture/api-tenant-endpoint-path`, the correct API base URL is:
`https://{domain}/api/v2` (NOT `/api/v2/buyer-api`)

The endpoint should be:
- Custom domain: `https://{custom_domain}/api/v2`
- Subdomain: `https://{subdomain}.{PLATFORM_DOMAIN}/api/v2`

**Platform Domain Detection:**
Need to use a platform domain constant or environment variable. Based on memory `architecture/platform-branding-standardization`, the platform uses `PRIMARY_PLATFORM_DOMAIN` constant.

**Updated Code:**
```typescript
// Get platform domain from environment or use default
const platformDomain = Deno.env.get('PRIMARY_PLATFORM_DOMAIN') || 'homeofsmm.com';

// Build correct API endpoint - ends with /v2, not /buyer-api
const apiEndpoint = targetPanel.custom_domain
  ? `https://${targetPanel.custom_domain}/api/v2`
  : `https://${targetPanel.subdomain}.${platformDomain}/api/v2`;
```

**Apply this change in two places:**
- Lines 204-206 (existing user flow)
- Lines 262-264 (new user flow)

---

## Part 3: Add "Example" Preview Button to Advertising Page

**File: `src/pages/panel/ProviderAds.tsx`**

Based on uploaded screenshots, need to add an "Example" button next to "Purchase" that shows how the panel will appear in marketplace rankings.

**Changes:**

### 3.1 Add Example Preview State
```typescript
const [previewOpen, setPreviewOpen] = useState(false);
const [previewAdType, setPreviewAdType] = useState<string | null>(null);
```

### 3.2 Add Example Button Next to Purchase
After line 410, add Example button:
```typescript
<div className="flex items-center justify-between pt-2">
  <div>
    <p className="text-2xl font-bold">${price.toFixed(2)}</p>
    {discount > 0 && (
      <p className="text-xs text-green-500">Save {discount}%</p>
    )}
  </div>
  <div className="flex items-center gap-2">
    {/* New Example Button */}
    <Button
      variant="outline"
      onClick={() => {
        setPreviewAdType(tier.ad_type);
        setPreviewOpen(true);
      }}
      className="gap-2"
    >
      <Eye className="w-4 h-4" />
      Example
    </Button>
    {/* Existing Purchase Button */}
    <Button
      onClick={() => handlePurchase(tier)}
      disabled={purchasing === tier.ad_type || isActive || (panel?.balance || 0) < price}
      className={cn("gap-2", `bg-gradient-to-r ${config?.gradient}`)}
    >
      {/* ... existing content ... */}
    </Button>
  </div>
</div>
```

### 3.3 Add Preview Dialog Component
```typescript
{/* Ad Preview Dialog */}
<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Ad Preview</DialogTitle>
      <DialogDescription>
        How your panel will appear in the marketplace
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {/* Mock Ranking Display */}
      <div className="border rounded-xl p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 relative">
        {/* "You will be here" tooltip */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card border rounded-lg px-3 py-1 shadow-lg">
          <p className="text-sm font-medium">You will be here</p>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary p-0 h-auto"
            onClick={() => setPreviewOpen(false)}
          >
            Back to ads
          </Button>
        </div>
        
        {/* Ranking #1 with Crown */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">1</span>
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <Avatar className="w-10 h-10 border-2 border-amber-500">
            <AvatarImage src={panel?.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10">
              {panel?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{panel?.name}</p>
            <p className="text-xs text-muted-foreground">
              {panel?.custom_domain || `${panel?.subdomain}.homeofsmm.com`}
            </p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Ads</Badge>
          <Badge variant="outline">USD</Badge>
        </div>
        
        {/* Sample service badges */}
        <div className="flex flex-wrap gap-2 mt-3 pl-12">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" /> Premium Services
          </Badge>
          <Badge variant="secondary">Top Quality</Badge>
        </div>
      </div>
      
      {/* Lower rankings preview */}
      <div className="space-y-3 opacity-60">
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <span className="font-bold">2</span>
          <Crown className="w-4 h-4 text-muted-foreground" />
          <Avatar className="w-8 h-8"><AvatarFallback>FS</AvatarFallback></Avatar>
          <span className="text-sm">flysmm.com</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <span className="font-bold">3</span>
          <Crown className="w-4 h-4 text-muted-foreground" />
          <Avatar className="w-8 h-8"><AvatarFallback>TG</AvatarFallback></Avatar>
          <span className="text-sm">teateagram.com</span>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 3.4 Strategic Ad Placement (Where Ads Show)

Based on uploaded images, ads should display in the **Provider Management Marketplace** page with a ranking-style view showing:
- Top 50 Providers
- Best Services  
- Top Performers

**Implementation in existing page: `src/pages/panel/ProviderManagement.tsx`**

Add tabs inside the marketplace section:
```typescript
<Tabs defaultValue="providers" className="w-full">
  <TabsList className="w-full justify-start mb-4">
    <TabsTrigger value="providers">Providers</TabsTrigger>
    <TabsTrigger value="services">Services</TabsTrigger>
    <TabsTrigger value="performers">Performers</TabsTrigger>
  </TabsList>
  
  <TabsContent value="providers">
    {/* Existing sponsored slider + top providers list */}
    {/* Each provider shows rank (1, 2, 3...) with crown icon */}
    {/* Sponsored providers get "Ads" badge */}
  </TabsContent>
  
  <TabsContent value="services">
    {/* Top services from sponsored panels */}
    <p className="text-muted-foreground text-center py-8">
      Coming soon - Top services from featured providers
    </p>
  </TabsContent>
  
  <TabsContent value="performers">
    {/* Top performing panels by order volume */}
    <p className="text-muted-foreground text-center py-8">
      Coming soon - Highest performing providers
    </p>
  </TabsContent>
</Tabs>
```

---

## Part 4: Fix Direct Provider Balance Error

**Current Issue:**
Direct providers show balance errors while external providers work correctly.

**Root Cause Analysis:**
When `enable-direct-provider` creates a provider record, it uses an incorrect API endpoint:
- Current: `https://{domain}/api/v2/buyer-api`
- Should be: `https://{domain}/api/v2`

The `provider-balance` edge function calls the provider's API endpoint with `action=balance`, but the endpoint path is wrong.

**Fix:** 
Part 2 above fixes this for NEW connections. For EXISTING direct providers with wrong URLs:

**Option A: Migration to fix existing records**
```sql
-- Fix existing direct provider endpoints
UPDATE providers 
SET api_endpoint = REPLACE(api_endpoint, '/api/v2/buyer-api', '/api/v2')
WHERE is_direct = true 
AND api_endpoint LIKE '%/api/v2/buyer-api';
```

**Option B: Frontend-side endpoint normalization (safer)**
In `src/pages/panel/ProviderManagement.tsx`, add endpoint normalization when fetching balance:
```typescript
const fetchProviderBalance = useCallback(async (provider: Provider) => {
  // Normalize endpoint for direct providers
  let endpoint = provider.api_endpoint;
  if (provider.is_direct && endpoint.endsWith('/buyer-api')) {
    endpoint = endpoint.replace('/buyer-api', '');
  }
  
  // ... rest of fetch logic
}, []);
```

**Recommended:** Apply both fixes - migration for database cleanup and frontend normalization for immediate relief.

---

## Part 5: Enhance Live Support with Three-Dot Menu for Authenticated Users

**File: `src/pages/panel/ChatInbox.tsx`**

The three-dot menu already exists (lines 758-770) but only has "Archive Chat". Need to add more options for authenticated buyer management.

**Enhancement to DropdownMenuContent:**

```typescript
<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuItem onClick={() => handleManageBalance(selectedSession)}>
    <Plus className="w-4 h-4 mr-2" />
    Manage balance
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleViewPaymentHistory(selectedSession)}>
    <DollarSign className="w-4 h-4 mr-2" />
    Payments history
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleViewUserOrders(selectedSession)}>
    <ShoppingCart className="w-4 h-4 mr-2" />
    User orders
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleCustomPrice(selectedSession)}>
    <Tag className="w-4 h-4 mr-2" />
    Custom price
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={() => handleMarkAsSolved(selectedSession)}>
    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
    Mark as solved
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => archiveSession(selectedSession)}>
    <Archive className="w-4 h-4 mr-2" />
    Archive Chat
  </DropdownMenuItem>
</DropdownMenuContent>
```

**Add handler functions:**
```typescript
const handleManageBalance = async (session: ChatSession | null) => {
  if (!session) return;
  // Find client_user by visitor_id or email
  // Open balance management dialog
  toast({ title: "Balance Management", description: "Opening customer balance..." });
  // Navigate or open dialog
};

const handleViewPaymentHistory = (session: ChatSession | null) => {
  if (!session) return;
  // Navigate to transactions filtered by customer
};

const handleViewUserOrders = (session: ChatSession | null) => {
  if (!session) return;
  // Navigate to orders filtered by customer
};

const handleCustomPrice = (session: ChatSession | null) => {
  if (!session) return;
  // Open custom discount dialog
};

const handleMarkAsSolved = async (session: ChatSession | null) => {
  if (!session) return;
  await archiveSession(session);
  toast({ title: "Marked as Solved", description: "Chat has been archived." });
};
```

---

## Part 6: Hide "Talk to Human" for Visitors & Improve AI Messaging

**File: `src/components/storefront/FloatingChatWidget.tsx`**

### 6.1 Pass buyer authentication status to widget

The widget needs to know if user is logged in. Add prop:
```typescript
interface FloatingChatWidgetProps {
  // ... existing props
  isAuthenticated?: boolean;  // NEW
}
```

### 6.2 Hide "Talk to Human" button for non-authenticated users

Change lines 827-843:
```typescript
{/* Talk to Human button - only show for authenticated users */}
{panelId && isAuthenticated && (
  <Button
    variant="outline"
    size="sm"
    onClick={startLiveChat}
    disabled={liveChatConnecting}
    className="w-full mt-2 gap-2"
  >
    {liveChatConnecting ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <User className="w-4 h-4" />
    )}
    Talk to Human
  </Button>
)}

{/* Show login prompt for non-authenticated users */}
{panelId && !isAuthenticated && (
  <div className="mt-2 p-2 bg-muted/50 rounded-lg text-center">
    <p className="text-xs text-muted-foreground mb-1">
      Need more support?
    </p>
    <Button 
      variant="link" 
      size="sm" 
      className="h-auto p-0 text-xs"
      onClick={() => {
        // Navigate to login
        window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
      }}
    >
      Log in to chat with a human
    </Button>
  </div>
)}
```

### 6.3 Update AI greeting for visitors

Update the greeting message (lines 281-285) to include login prompt:
```typescript
// For non-authenticated visitors
const visitorGreeting = `Hi! 👋 Welcome to **${panelName || 'our panel'}**!

How can I help you today? I can assist with:

1. **Services** - finding the right service for your needs
2. **Pricing** - understanding our competitive rates  
3. **FAQs** - answering common questions

🔐 **Need personalized help?** Log in to your account to access live human support, order history, and more!`;

// For authenticated users
const authenticatedGreeting = `Hi! 👋 Welcome back to **${panelName || 'our panel'}**!

How can I help you today? I can assist with:

1. **Orders** - placing new orders or checking status
2. **Services** - finding the right service for your needs
3. **Pricing** - understanding our competitive rates
4. **Account** - deposits, balance, and settings

💬 Need to talk to a human? Just click "Talk to Human" below!`;

// Use appropriate greeting
const greeting = isAuthenticated ? authenticatedGreeting : visitorGreeting;
```

### 6.4 Pass isAuthenticated from Storefront

**File: `src/pages/Storefront.tsx`** (or wherever FloatingChatWidget is rendered)

```typescript
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";

// Inside component:
const { buyer } = useBuyerAuth();

// Pass to widget
<FloatingChatWidget
  panelId={panel.id}
  panelName={panel.name}
  isAuthenticated={!!buyer}
  // ... other props
/>
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/panel/MoreMenu.tsx` | Rename "Payment Methods" to "Payment" |
| `supabase/functions/enable-direct-provider/index.ts` | Fix API endpoint URL (platform domain + /v2) |
| `src/pages/panel/ProviderAds.tsx` | Add Example/Preview button and dialog |
| `src/pages/panel/ProviderManagement.tsx` | Add Provider/Services/Performers tabs, fix endpoint normalization |
| `src/pages/panel/ChatInbox.tsx` | Add three-dot menu options for customer management |
| `src/components/storefront/FloatingChatWidget.tsx` | Hide Talk to Human for visitors, improve AI messages |
| `src/pages/Storefront.tsx` | Pass isAuthenticated to FloatingChatWidget |
| **Database Migration** | Fix existing direct provider endpoint URLs |

---

## Technical Implementation Notes

### API Endpoint Format

According to architecture documentation:
- **Correct:** `https://{domain}/api/v2`
- **Incorrect:** `https://{domain}/api/v2/buyer-api`

The buyer-api function receives requests at `/api/v2` via Vercel proxy rewrites, not at `/api/v2/buyer-api`.

### Database Migration for Existing Records
```sql
-- Migrate existing direct provider endpoints to correct format
UPDATE providers 
SET api_endpoint = REPLACE(api_endpoint, '/api/v2/buyer-api', '/api/v2')
WHERE is_direct = true 
AND api_endpoint LIKE '%/api/v2/buyer-api';
```

### Environment Variable for Platform Domain
Add to edge function config or use default:
```typescript
const PLATFORM_DOMAIN = Deno.env.get('PRIMARY_PLATFORM_DOMAIN') || 'homeofsmm.com';
```
