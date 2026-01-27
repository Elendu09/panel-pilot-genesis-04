
# Plan: Fix API Documentation, Custom 404 Page, Customer Management & Order Resume

## Summary of Issues to Fix

### Issue 1: API Endpoints Not Showing Action Names
**Current Problem:** Screenshot shows all endpoints display only `POST /api/v2/panel` without showing what the action is (services, customers, orders, etc.)

**Fix Required:** Update the API documentation UI to show the action name inline with each endpoint card (e.g., `POST /api/v2/panel action=services`).

**File:** `src/pages/panel/APIManagement.tsx`

### Issue 2: API URL Returns 404 Error
**Root Cause:** The API calls are going to the wrong domain. The Vercel rewrite (`vercel.json`) sends all requests to `/` (the SPA), but API calls need to route to Supabase Edge Functions.

**Note:** The `/api/v2/panel` path does not exist as a frontend route - it needs to be proxied to Supabase Edge Functions. Currently the platform uses direct edge function calls, not a custom domain API proxy.

**Fix Required:**
1. Add proper rewrite rules in `vercel.json` to proxy `/api/v2/*` requests to Supabase Edge Functions
2. OR update documentation to show the actual working endpoint URL

### Issue 3: Custom 404 Page Design (✨🤍🖤 Theme)
**Current:** Basic plain 404 page

**Fix Required:** Create a beautiful, premium 404 page with:
- Dark/light theme support
- Sparkle/gradient effects
- Black/white color scheme with accent colors
- Animated elements
- Links back to home, dashboard, support

**File:** `src/pages/NotFound.tsx`

### Issue 4: Customer Suspend Shows as Ban
**Root Cause:** Found the bug on lines 1068 and 1093 of `CustomerManagement.tsx`:
```typescript
isBanned: selectedCustomer.status === 'suspended', // Wrong!
is_banned: selectedCustomer.status === 'suspended', // Wrong!
```

This incorrectly marks suspended customers as banned. The mapping should check actual banned state, not suspended state.

**Fix Required:** Track banned state separately from suspended state in the Customer interface and state management.

**Files:** 
- `src/pages/panel/CustomerManagement.tsx`
- Customer interface needs `isBanned` field

### Issue 5: Combine View and Edit into One Page/Fragment
**Current:** Separate dialogs for View (Sheet) and Edit (Dialog)

**Fix Required:** Replace separate View/Edit components with a unified CustomerDetailPage that:
- Shows all customer info in a scrollable page/fragment
- Allows inline editing of all fields
- Combines profile, balance, orders, settings in one scrollable view
- Is accessible from the customer list

**Files:**
- Create new `src/components/customers/CustomerDetailPage.tsx`
- Update `CustomerManagement.tsx` to use the combined view

### Issue 6: Order Resume vs Refill Clarification
**Answer:** SMM providers typically support:
- **Refill:** Request to top up an order that lost followers/likes (standard SMM action)
- **Resume:** Not a standard SMM API action - this is internal panel management

**Fix Required:** Replace "Resume" with "Refill" for provider-synced orders, keep "Resume" for paused internal orders only. The pause/resume feature is for panel owner control, not provider integration.

---

## Implementation Details

### Part 1: Fix API Endpoint Display

**File:** `src/pages/panel/APIManagement.tsx`

Update the endpoint card display (around line 569-576) to show action name:

```text
Current: POST /api/v2/panel
Fixed:   POST /api/v2/panel • services
         POST /api/v2/panel • customers
         POST /api/v2/panel • orders
         etc.
```

Also update the endpoint paths in the `endpoints` array to include the action label.

### Part 2: API URL 404 Fix

**Option A - Update vercel.json:**
Add rewrite rules to proxy API requests to Supabase Edge Functions. However, this requires Supabase URL knowledge at build time.

**Option B (Recommended):** 
In APIManagement.tsx, update the base URL display to show the actual working edge function URL format with a note that custom domain routing needs DNS configuration.

Add a note in the API documentation:
- For production: Use custom domain + API proxy configuration
- For development: Use direct Supabase edge function URL

### Part 3: Custom 404 Page Design

**File:** `src/pages/NotFound.tsx`

Create a premium 404 page with:
- Animated 404 text with gradient/glow effects
- Particle or sparkle background animation
- Black/white/primary color scheme
- "Lost in space" or creative theme
- Clear navigation buttons
- Mobile responsive design
- Dark/light mode support

### Part 4: Fix Customer Suspend/Ban Mapping

**File:** `src/pages/panel/CustomerManagement.tsx`

1. Update Customer interface to include `isBanned` field
2. Fix data mapping from Supabase to properly set `isBanned` from `is_banned` column
3. Update lines 1068 and 1093 to use actual banned state:

```typescript
// Line 1068 - CustomerDetailsSheet
isBanned: actualBannedState, // From database is_banned field

// Line 1093 - CustomerEditDialog  
is_banned: actualBannedState, // From database is_banned field
```

### Part 5: Combined Customer View/Edit Page

**New File:** `src/components/customers/CustomerDetailPage.tsx`

Create a unified customer detail component that:
- Uses Sheet (slides in from right) for the container
- Has scrollable content with sections:
  1. **Header**: Avatar, name, status badges, quick actions
  2. **Overview Cards**: Balance, Total Spent, Orders, Join Date
  3. **Profile Section**: Editable name, email, username
  4. **Balance Management**: Add/deduct funds with history
  5. **Discount Settings**: Custom discount percentage
  6. **Account Status**: Active/Suspended/Banned radio options
  7. **Password Management**: Reset password button
  8. **Recent Orders**: Last 10 orders list
  9. **Danger Zone**: Delete account

All fields are editable inline with a floating "Save Changes" button.

### Part 6: Order Pause/Resume Clarification

**File:** `src/pages/panel/OrdersManagement.tsx`

Keep the pause/resume feature but clarify:
- **Pause/Resume**: Panel owner internal control (stops processing on your end)
- **Refill**: Request from provider (for drop protection orders)

No code changes needed - the current implementation is correct for internal management. The pause feature is local control, not an API call to providers.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/NotFound.tsx` | Rewrite | Premium 404 page with animations |
| `src/pages/panel/APIManagement.tsx` | Modify | Show action names in endpoint cards |
| `src/pages/panel/CustomerManagement.tsx` | Modify | Fix banned state mapping, integrate unified view |
| `src/components/customers/CustomerDetailPage.tsx` | Create | Unified view/edit customer page |
| `vercel.json` | Modify | Add API proxy rewrites (optional) |

---

## UI/UX Improvements

### 404 Page Mockup
```text
┌─────────────────────────────────────────┐
│            ✨  4 0 4  ✨                │
│     (Large gradient animated text)      │
│                                         │
│        Page Not Found                   │
│   The page you're looking for           │
│   doesn't exist or has been moved.      │
│                                         │
│   ┌───────────┐  ┌───────────┐          │
│   │  Go Home  │  │  Support  │          │
│   └───────────┘  └───────────┘          │
│                                         │
│        (Sparkle particles)              │
└─────────────────────────────────────────┘
```

### API Endpoint Display Mockup
```text
┌─────────────────────────────────────────┐
│ POST  /api/v2/panel • services       ▸ │
├─────────────────────────────────────────┤
│ POST  /api/v2/panel • customers      ▸ │
├─────────────────────────────────────────┤
│ POST  /api/v2/panel • orders         ▸ │
├─────────────────────────────────────────┤
│ POST  /api/v2/panel • stats          ▸ │
└─────────────────────────────────────────┘
```

### Customer Detail Page Mockup
```text
┌───────────────────────────────────────┐
│ ←  Customer Details                   │
├───────────────────────────────────────┤
│  ┌──┐ John Doe                        │
│  │🧑│ john@example.com                │
│  └──┘ ● Active   VIP                  │
│                                       │
│  ┌─────────┐ ┌─────────┐              │
│  │ $150.50 │ │ $2,450  │              │
│  │ Balance │ │  Spent  │              │
│  └─────────┘ └─────────┘              │
│                                       │
│  ═══ Profile ══════════════════════   │
│  Full Name: [John Doe          ]      │
│  Email:     [john@example.com  ]      │
│  Username:  [johnd             ]      │
│                                       │
│  ═══ Balance ══════════════════════   │
│  [+$10] [-$10]                        │
│  Reason: [                    ]       │
│                                       │
│  ═══ Discount ═════════════════════   │
│  Custom: [10] %                       │
│                                       │
│  ═══ Account Status ═══════════════   │
│  ○ Active  ○ Suspended  ○ Banned      │
│                                       │
│  ══════════════════════════════════   │
│  [       Save Changes       ]         │
└───────────────────────────────────────┘
```

---

## Summary

This plan fixes:
1. API endpoints showing action names in the card view
2. API 404 error with proper URL routing/documentation
3. Beautiful custom 404 page with sparkle/gradient effects
4. Customer suspend incorrectly showing as ban (data mapping bug)
5. Combined View/Edit customer page instead of separate dialogs
6. Clarification on pause/resume vs refill (already correct implementation)
