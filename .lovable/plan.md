

# Provider Management & Ads Marketplace Enhancement Plan

## Overview

This plan implements a comprehensive provider system with tiered access (Free = 1 provider limit), a marketplace divided into Direct Providers (from HomeOfSMM tenants) and Other Providers (external panels), an Ads Management system for provider visibility monetization, and automatic account creation for direct provider connections.

---

## Part 1: Database Schema Updates

### 1.1 New Tables Required

**Table: `provider_ads`** - For sponsored/promoted provider listings
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| panel_id | uuid | Panel being advertised (FK to panels) |
| ad_type | enum | 'sponsored', 'top', 'best', 'featured' |
| position | integer | Display position/priority |
| daily_fee | numeric | Daily cost set by admin |
| total_spent | numeric | Total amount spent on this ad |
| is_active | boolean | Whether ad is currently running |
| starts_at | timestamp | Ad start date |
| expires_at | timestamp | Ad expiration date |
| impressions | integer | View count |
| clicks | integer | Click-through count |
| created_at | timestamp | Creation timestamp |

**Table: `provider_ad_pricing`** - Admin-controlled ad pricing tiers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| ad_type | text | 'sponsored', 'top', 'best', 'featured' |
| daily_rate | numeric | Daily cost in USD |
| weekly_rate | numeric | Weekly cost (discounted) |
| monthly_rate | numeric | Monthly cost (more discounted) |
| max_slots | integer | Maximum concurrent ads of this type |
| description | text | Description for panel owners |
| is_active | boolean | Whether this tier is available |

**Table: `direct_provider_connections`** - Links panels as providers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| source_panel_id | uuid | Panel owner who is connecting (consumer) |
| target_panel_id | uuid | Panel being connected as provider |
| client_user_id | uuid | Auto-created buyer account on target panel |
| api_key | text | API key for the connection |
| balance_transferred | numeric | Total balance transferred from billing |
| is_active | boolean | Connection status |
| created_at | timestamp | When connection was established |

### 1.2 Modify Existing Tables

**Add to `providers` table:**
- `is_direct` boolean - Whether this is a HomeOfSMM direct provider
- `source_panel_id` uuid - If direct, which panel it connects to
- `direct_connection_id` uuid - Reference to direct_provider_connections

---

## Part 2: Provider Tier Limits

### 2.1 Free Tier Limitation (1 Provider)

**File: `src/pages/panel/ProviderManagement.tsx`**

Add subscription check before allowing provider addition:

```typescript
// Fetch subscription
const { data: subscription } = await supabase
  .from('panel_subscriptions')
  .select('plan_type')
  .eq('panel_id', panel.id)
  .single();

const planLimits = {
  free: 1,
  basic: 5,
  pro: Infinity
};

const maxProviders = planLimits[subscription?.plan_type || 'free'];
```

**UI Changes:**
- Show provider limit badge in header: "1/1 Providers" for free tier
- When limit reached, disable "Add Provider" button
- Show upgrade prompt modal when trying to add beyond limit
- Add tooltip explaining tier limits

### 2.2 Enabling Before Connecting

**Flow:**
1. Panel owner browses marketplace
2. Clicks "Enable" on a provider (adds to enabled list)
3. Then clicks "Connect" to add API credentials
4. For direct providers: "Enable" auto-creates account and API key

---

## Part 3: Marketplace Restructure

### 3.1 New Marketplace Tab Structure

**Current:** Single marketplace with `popularProviders` static list

**New Structure:**
```
Marketplace Tab
├── Direct Providers (HomeOfSMM Panels)
│   ├── Sponsored (gold badge, top position)
│   ├── Top Providers (sorted by rating/orders)
│   └── All Direct Providers (searchable list)
└── Other Providers (External SMM Panels)
    └── Current popularProviders list
```

### 3.2 Direct Providers Section

**Data Source:** Query active panels with:
- `status = 'active'`
- `subdomain IS NOT NULL OR custom_domain IS NOT NULL`
- Has active services available

**UI Components:**
```tsx
// DirectProviderCard component
<Card>
  {isSponsored && <Badge variant="premium">Sponsored</Badge>}
  {isTop && <Badge variant="warning">Top Provider</Badge>}
  <Avatar src={panel.logo_url} />
  <h3>{panel.name}</h3>
  <p>{panel.subdomain}.homeofsmm.com</p>
  <Stats>
    <span>Services: {serviceCount}</span>
    <span>Rating: {rating}/5</span>
  </Stats>
  <Button onClick={() => handleEnableDirectProvider(panel)}>
    Enable
  </Button>
</Card>
```

### 3.3 Other Providers Section

Keep existing `popularProviders` static list but enhance with:
- Category filters (General, Instagram, TikTok, YouTube)
- Search functionality
- Manual API key entry flow

---

## Part 4: Ads Management System

### 4.1 New Admin Page: Ads Management

**Location:** `src/pages/admin/AdsManagement.tsx`
**Route:** `/admin/ads`

**Features:**
1. **Pricing Configuration**
   - Set daily/weekly/monthly rates per ad type
   - Configure max slots per tier
   - Enable/disable ad types

2. **Active Ads Dashboard**
   - View all running ads
   - Monitor impressions/clicks
   - Pause/cancel ads
   - Revenue tracking

3. **Ad Types:**
   - **Sponsored**: Premium placement at top with gold badge
   - **Top Provider**: Highlighted in "Top Providers" section
   - **Best Provider**: "Editor's Pick" style badge
   - **Featured**: Homepage carousel inclusion

### 4.2 Panel Owner Ad Purchase Flow

**Location:** `src/pages/panel/MoreMenu.tsx` → Add "Promote My Panel"

**New Page:** `src/pages/panel/ProviderAds.tsx`

**Flow:**
1. Panel owner visits Promote My Panel
2. Sees available ad types with pricing
3. Selects duration (daily/weekly/monthly)
4. System checks billing balance
5. If sufficient, deducts from balance and activates ad
6. If insufficient, prompts to add funds first

**UI:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sponsored Listing</CardTitle>
    <Badge>$5/day</Badge>
  </CardHeader>
  <CardContent>
    <ul>
      <li>Top position in marketplace</li>
      <li>Gold "Sponsored" badge</li>
      <li>Priority in search results</li>
    </ul>
    <Select value={duration}>
      <SelectItem value="daily">1 Day - $5</SelectItem>
      <SelectItem value="weekly">7 Days - $30 (14% off)</SelectItem>
      <SelectItem value="monthly">30 Days - $100 (33% off)</SelectItem>
    </Select>
    <Button onClick={handlePurchaseAd}>
      Purchase with Balance (${panelBalance})
    </Button>
  </CardContent>
</Card>
```

### 4.3 Integration with Billing

**Deduction Flow:**
1. Check panel balance >= ad cost
2. Create transaction record (type: 'ad_purchase')
3. Deduct from panels.balance
4. Create provider_ads record
5. Notify admin of new ad purchase

---

## Part 5: Direct Provider Auto-Connection

### 5.1 Enable Direct Provider Flow

When panel owner clicks "Enable" on a direct provider:

**Edge Function:** `enable-direct-provider`

```typescript
// Steps:
1. Validate source panel subscription (free = 1 provider limit)
2. Get target panel's API endpoint (subdomain.homeofsmm.com/api/v2/buyer-api)
3. Create client_user on target panel:
   - email: source panel owner's email
   - username: auto-generated
   - password_hash: bcrypt random password
4. Generate API key for the new client_user
5. Store in direct_provider_connections
6. Create provider record in source panel's providers table
7. Return API key and connection details
```

**API Endpoint Construction:**
```typescript
const apiEndpoint = panel.custom_domain 
  ? `https://${panel.custom_domain}/api/v2/buyer-api`
  : `https://${panel.subdomain}.homeofsmm.com/api/v2/buyer-api`;
```

### 5.2 Balance Transfer Feature

**For Direct Providers Only:**

When panel owner's provider balance is low:
1. Show "Transfer from Billing Balance" button
2. Enter amount to transfer
3. Call edge function to:
   - Deduct from source panel's billing balance
   - Add funds to client_user account on target panel
   - Create transaction records on both sides

---

## Part 6: File Changes Summary

### New Files:
| File | Purpose |
|------|---------|
| `src/pages/admin/AdsManagement.tsx` | Admin ad pricing & management |
| `src/pages/panel/ProviderAds.tsx` | Panel owner ad purchase page |
| `src/components/providers/DirectProviderCard.tsx` | Card for direct provider display |
| `src/components/providers/ProviderLimitBanner.tsx` | Shows tier limit status |
| `supabase/functions/enable-direct-provider/index.ts` | Auto-connect to direct provider |
| `supabase/functions/transfer-provider-balance/index.ts` | Balance transfer for direct providers |
| `supabase/migrations/xxx_provider_ads_system.sql` | Database schema |

### Modified Files:
| File | Changes |
|------|---------|
| `src/pages/panel/ProviderManagement.tsx` | Add tier limits, split marketplace, direct provider UI |
| `src/pages/SuperAdminDashboard.tsx` | Add Ads Management route |
| `src/pages/panel/MoreMenu.tsx` | Add "Promote My Panel" link |
| `src/hooks/usePanel.tsx` | Add subscription tier helper |

---

## Part 7: Technical Architecture

### 7.1 Direct Provider Discovery Query

```sql
SELECT 
  p.id,
  p.name,
  p.subdomain,
  p.custom_domain,
  p.logo_url,
  pa.ad_type,
  pa.position,
  (SELECT COUNT(*) FROM services s WHERE s.panel_id = p.id AND s.is_active = true) as service_count
FROM panels p
LEFT JOIN provider_ads pa ON pa.panel_id = p.id AND pa.is_active = true AND pa.expires_at > NOW()
WHERE p.status = 'active'
  AND (p.subdomain IS NOT NULL OR p.custom_domain IS NOT NULL)
ORDER BY 
  CASE WHEN pa.ad_type = 'sponsored' THEN 0 ELSE 1 END,
  pa.position NULLS LAST,
  p.monthly_revenue DESC;
```

### 7.2 Provider Limit Check

```typescript
async function canAddProvider(panelId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  plan: string;
}> {
  const { data: sub } = await supabase
    .from('panel_subscriptions')
    .select('plan_type')
    .eq('panel_id', panelId)
    .single();

  const { count } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('panel_id', panelId);

  const limits = { free: 1, basic: 5, pro: Infinity };
  const plan = sub?.plan_type || 'free';
  const maxAllowed = limits[plan];

  return {
    allowed: (count || 0) < maxAllowed,
    currentCount: count || 0,
    maxAllowed,
    plan
  };
}
```

---

## Part 8: UI/UX Enhancements

### 8.1 Provider Management Header

```
┌─────────────────────────────────────────────────────────┐
│ Provider Management                          [Refresh]  │
│ Connect SMM providers and import services               │
│                                                         │
│ Plan: Free    Providers: 1/1    [Upgrade for more →]   │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Marketplace Tabs

```
┌─────────────────────────────────────────────────────────┐
│ [My Providers] [Marketplace]                            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────┬────────────────────────┐      │
│ │ Direct Providers     │ Other Providers        │      │
│ │ (HomeOfSMM Panels)   │ (External Panels)      │      │
│ └──────────────────────┴────────────────────────┘      │
│                                                         │
│ 🏆 Sponsored Providers                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │ Panel A │ │ Panel B │ │ Panel C │                   │
│ │ ⭐ 4.9  │ │ ⭐ 4.8  │ │ ⭐ 4.7  │                   │
│ │ [Enable]│ │ [Enable]│ │ [Enable]│                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
│ 📊 Top Providers                                        │
│ ┌─────────┐ ┌─────────┐                                │
│ │ Panel D │ │ Panel E │                                │
│ └─────────┘ └─────────┘                                │
└─────────────────────────────────────────────────────────┘
```

---

## Part 9: Admin Ads Management UI

```
┌─────────────────────────────────────────────────────────┐
│ Ads Management                                          │
│ Configure provider advertising and visibility           │
├─────────────────────────────────────────────────────────┤
│ Revenue This Month: $1,250    Active Ads: 15           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Ad Pricing Configuration                                │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Type      │ Daily  │ Weekly │ Monthly │ Max Slots │  │
│ ├───────────┼────────┼────────┼─────────┼───────────┤  │
│ │ Sponsored │ $5.00  │ $30.00 │ $100.00 │ 3         │  │
│ │ Top       │ $3.00  │ $18.00 │ $60.00  │ 10        │  │
│ │ Best      │ $2.00  │ $12.00 │ $40.00  │ 10        │  │
│ │ Featured  │ $4.00  │ $24.00 │ $80.00  │ 5         │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ Active Advertisements                                   │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Panel Name  │ Type      │ Expires   │ Actions    │  │
│ │ SMMPanel    │ Sponsored │ 5 days    │ [Pause]    │  │
│ │ BestSMM     │ Top       │ 12 days   │ [Pause]    │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Phase 1: Database Migration**
   - Create provider_ads, provider_ad_pricing, direct_provider_connections tables
   - Add columns to providers table

2. **Phase 2: Provider Tier Limits**
   - Implement subscription-based provider limits
   - Add upgrade prompts in ProviderManagement

3. **Phase 3: Marketplace Restructure**
   - Split marketplace into Direct/Other sections
   - Create DirectProviderCard component
   - Query and display active panels as direct providers

4. **Phase 4: Direct Provider Auto-Connection**
   - Create enable-direct-provider edge function
   - Implement auto account creation
   - Add API key generation

5. **Phase 5: Ads Management (Admin)**
   - Create AdsManagement admin page
   - Implement pricing configuration
   - Add active ads dashboard

6. **Phase 6: Ad Purchase (Panel Owner)**
   - Create ProviderAds page
   - Implement purchase flow with balance deduction
   - Connect to marketplace display

7. **Phase 7: Balance Transfer**
   - Create transfer-provider-balance edge function
   - Add UI for direct provider balance top-up

