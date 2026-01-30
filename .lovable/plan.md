
# Comprehensive Fix Plan: Announcements, About Us, Light Mode, Desktop Controls, Recent Deposits

---

## Issues Identified from Analysis

### Issue 1: Announcement Bar Not Showing on Tenant Homepage
**Root Cause:** The `AnnouncementBar` component is rendered in `Storefront.tsx` and reads from `panel_settings.integrations.announcements`. The config structure expected is:
```typescript
{
  enabled: true,
  text: "Welcome message",
  linkText: "Learn More",
  linkUrl: "https://...",
  backgroundColor: "#...",
  textColor: "#..."
}
```

However, looking at `Integrations.tsx` (lines 381-391), the "Announcements" service only saves:
- `text` (Announcement Text)
- `link` (Link URL - optional)

**Missing:** The integration doesn't save `enabled`, `linkText`, `backgroundColor`, or `textColor`. The AnnouncementBar checks `if (!enabled || dismissed || !text)` at line 35.

**Fix:**
1. Update `Integrations.tsx` to save proper announcement fields including `enabled: true`
2. Add proper fields for `linkText`, `backgroundColor`, `textColor` in the integration dialog
3. Ensure the save function properly sets `enabled: true` when content is provided

---

### Issue 2: Rewrite Tenant About Us Page
**Current State:** The `BuyerAbout.tsx` page has some content with 3 feature bullets and a contact CTA, but user wants it even simpler.

**Fix:** Simplify to a basic page with:
- Panel name + description from `custom_branding.footerAbout`
- No feature bullets
- Single contact CTA
- Consistent with other informational tenant pages (Terms, Privacy)

---

### Issue 3: Design Customization Light Mode Background Still Dark
**Root Cause from Images:** When "Light" mode is toggled in Design Customization, the controls panel and preview area still have dark backgrounds. User expects the editor itself to show a white/light background to clearly differentiate light mode.

Looking at the code:
- Line 3443-3448 in `DesignCustomization.tsx`: Preview container changes background based on `previewThemeMode === 'light'` to `bg-gray-100`
- But the **left controls panel** (line 2422) always uses `bg-card/30` regardless of preview mode

**Fix:**
1. When light mode is selected, the **preview area** should use a clearly white/light-gray background
2. The controls should remain dark (dashboard theme) but the preview iframe/container should be clearly light

The current code does set `bg-gray-100` for light mode, but this may not be visible enough. Need to set a more obvious white background like `bg-white` or `bg-slate-50`.

---

### Issue 4: Design Customization Menu Shrinking (Not Desktop Responsive)
**Root Cause from Images:** The left sidebar with "Design Presets" section appears shrunk/narrow on wider screens.

Looking at line 2422: `w-[420px]` is a fixed width.

The issue from the uploaded image shows the sidebar is properly sized, but the **Design Presets cards** are using a 2-column grid (`grid grid-cols-2 gap-3`) which may look cramped.

**Fix:**
1. Ensure the left panel has `min-w-[420px]` and `flex-shrink-0` to prevent shrinking
2. Improve the design presets grid layout for better visual appearance

---

### Issue 5: Recent Deposits Not Showing Manual Transfer
**Root Cause:** This is **the critical bug**!

Looking at `BuyerDeposit.tsx` lines 816-818:
```typescript
const isCompleted = tx.status === 'completed';
const isPending = tx.status === 'pending';  // ← BUG: Only checks 'pending', not 'pending_verification'
const isFailed = tx.status === 'failed' || tx.status === 'cancelled';
```

When a manual transfer is initiated, the `process-payment` edge function sets `status: 'pending_verification'` (line 1076). But the UI only recognizes `'pending'` as a pending status.

This means:
1. Manual transfer creates transaction with `status: 'pending_verification'`
2. UI checks `isPending = tx.status === 'pending'` → `false`
3. Neither `isCompleted` nor `isPending` is true, so it falls through to `isFailed` styling (red/failed)
4. OR the transaction doesn't appear at all if there's a query timing issue

**Fix:**
Update the status logic to include `pending_verification`:
```typescript
const isPending = tx.status === 'pending' || tx.status === 'pending_verification' || tx.status === 'processing';
```

---

## Files to Modify

| File | Issue | Changes |
|------|-------|---------|
| `src/pages/panel/Integrations.tsx` | #1 | Add proper announcement fields (enabled, linkText, backgroundColor, textColor) |
| `src/pages/buyer/BuyerAbout.tsx` | #2 | Simplify to minimal about page |
| `src/pages/panel/DesignCustomization.tsx` | #3, #4 | Fix light mode preview background, fix sidebar shrinking |
| `src/pages/buyer/BuyerDeposit.tsx` | #5 | Fix pending status check to include `pending_verification` |

---

## Implementation Details

### 1. Announcement Integration Fix (`Integrations.tsx`)

Update the announcements service definition (line 381-391):
```typescript
{
  id: 'announcements',
  name: 'Announcements',
  description: 'Show announcements bar on storefront',
  icon: <AnnouncementsIcon className="w-5 h-5" />,
  color: 'bg-[#F59E0B]',
  category: 'other',
  fields: [
    { type: 'input', name: 'text', label: 'Announcement Text', placeholder: 'Welcome to our panel! Check out our new services.' },
    { type: 'input', name: 'linkText', label: 'Link Text (optional)', placeholder: 'Learn More' },
    { type: 'input', name: 'linkUrl', label: 'Link URL (optional)', placeholder: 'https://...' },
    { type: 'input', name: 'backgroundColor', label: 'Background Color', placeholder: '#6366F1' },
    { type: 'input', name: 'textColor', label: 'Text Color', placeholder: '#FFFFFF' }
  ]
}
```

Also ensure `saveServiceConfig` sets `enabled: true` properly.

---

### 2. Simplified About Us Page (`BuyerAbout.tsx`)

Replace with minimal content:
```tsx
const BuyerAbout = () => {
  const { panel, loading } = useTenant();
  const { t } = useLanguage();

  const companyName = panel?.name || 'SMM Panel';
  const customBranding = panel?.custom_branding as any;
  const description = customBranding?.footerAbout || customBranding?.description || 
    'Professional social media marketing services.';
  const primaryColor = customBranding?.primaryColor || panel?.primary_color || '#3B82F6';

  return (
    <BuyerLayout>
      <Helmet>
        <title>About Us - {companyName}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          About <span style={{ color: primaryColor }}>{companyName}</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          {description}
        </p>
        <Button asChild style={{ backgroundColor: primaryColor }}>
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </BuyerLayout>
  );
};
```

---

### 3. Light Mode Preview Background (`DesignCustomization.tsx`)

Change line 3443-3448 to use more obvious white background:
```tsx
<div className={cn(
  "flex-1 flex flex-col min-h-[50vh] lg:min-h-0 transition-colors duration-300",
  previewThemeMode === 'light' 
    ? "bg-white"  // Changed from bg-gray-100 to bg-white for clearer contrast
    : "bg-[#0a0a12]"
)}>
```

Also fix the left panel (line 2422) to prevent shrinking:
```tsx
<div className="w-[420px] min-w-[420px] flex-shrink-0 border-r border-border/50 overflow-y-auto bg-card/30 p-4 space-y-2">
```

---

### 4. Recent Deposits Status Fix (`BuyerDeposit.tsx`)

Change lines 816-818:
```typescript
const isCompleted = tx.status === 'completed';
const isPending = tx.status === 'pending' || tx.status === 'pending_verification' || tx.status === 'processing';
const isFailed = tx.status === 'failed' || tx.status === 'cancelled';
```

Also update the badge display to show user-friendly text for `pending_verification`:
```typescript
<Badge ...>
  {tx.status === 'pending_verification' ? 'Pending Verification' : (tx.status || 'pending')}
</Badge>
```

---

## Transaction Status Flow Diagram

```text
┌──────────────────────────────────────────────────────────────────┐
│                     MANUAL TRANSFER FLOW                          │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. Buyer clicks "Deposit" with manual payment method            │
│     → BuyerDeposit.tsx calls process-payment edge function       │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. Edge function creates transaction                             │
│     → Initial status: 'pending'                                   │
│     → Detects manual gateway (gateway.startsWith('manual_'))      │
│     → Updates status to 'pending_verification'                    │
│     → Returns { requiresManualTransfer: true, transactionId }     │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. BuyerDeposit.tsx receives response                            │
│     → Shows ManualPaymentDetails dialog with bank details         │
│     → Waits 800ms then calls fetchTransactions()                  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. Recent Deposits List (BEFORE FIX - BUG)                       │
│     → Fetches transactions with type='deposit'                    │
│     → Checks: isPending = status === 'pending' → FALSE!           │
│     → Transaction with 'pending_verification' shows as FAILED     │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Recent Deposits List (AFTER FIX)                              │
│     → isPending includes 'pending_verification'                   │
│     → Transaction shows with yellow "Pending Verification" badge  │
│     → Real-time polling checks for status updates                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

After implementation:
- [ ] Enable Announcements in Integrations → verify banner appears on tenant storefront
- [ ] Visit tenant `/about` page → verify simplified layout
- [ ] Toggle Light mode in Design Customization → verify preview background is clearly white
- [ ] Check Design Customization sidebar on wide screens → no shrinking
- [ ] Make a manual deposit → verify it appears in Recent Deposits with "Pending Verification" badge

---

## Priority Order

1. **Recent Deposits bug** (#5) - Critical: Users can't see their pending transactions
2. **Light mode background** (#3) - High: Design preview is confusing
3. **Announcement integration** (#1) - Medium: Feature doesn't work
4. **About Us page** (#2) - Low: Content update
5. **Sidebar shrinking** (#4) - Low: Minor layout issue
