
# Comprehensive Fix Plan: API Key, Footer, Transactions & Full Pages Audit

---

## Overview

This plan fixes the **remaining critical issues** and provides a **full audit** of all panel owner and tenant pages that still need enhancement.

---

## Issues to Fix

### Issue 1: API Key Not Displaying

**Root Cause Analysis:**
The `api_key` column exists in the database (confirmed via SQL query). The `BuyerUser` interface in `BuyerAuthContext.tsx` has `api_key: string | null` defined (line 30). The edge function `buyer-auth/index.ts` returns `safeUser` which includes all fields except password_hash and password_temp.

**The Real Problem:**
When `handleGenerateApiKey()` in `BuyerProfile.tsx` runs, it:
1. Generates a key
2. Updates the database with `.update({ api_key: key } as any)` - the `as any` is suspicious
3. Sets `localApiKey` state
4. Calls `refreshBuyer()`

The issue is that supabase client-side update to `client_users` is blocked by RLS. The update silently fails because buyers don't have UPDATE permissions on `client_users`.

**Solution:**
Create an edge function endpoint to generate the API key server-side (bypassing RLS), similar to how buyer-auth works.

### Issue 2: Footer `{companyName}` Not Interpolated in Theme Homepages

**Root Cause:**
While `StorefrontFooter.tsx` correctly interpolates `{companyName}`, the individual theme homepages (TGRef, AliPanel, FlySMM, SMMStay, SMMVisit) have their OWN footer implementations that don't interpolate the placeholder.

Looking at the code:
- `TGRefHomepage.tsx` line 595: `{customization.footerText || \`© ${new Date().getFullYear()} [${companyName}]. All rights reserved.\`}`
- `AliPanelHomepage.tsx` line 596: `{customization.footerText || \`© ${new Date().getFullYear()} ${companyName}. All rights reserved.\`}`

The problem is that when `customization.footerText` contains `{companyName}` (e.g., "© 2025 {companyName}. All rights reserved."), it's displayed literally without interpolation.

**Solution:**
Add interpolation logic to ALL theme homepage footers to replace `{companyName}` with actual `companyName`.

### Issue 3: Transaction List Not Updating in BuyerDeposit

**Analysis:**
The `BuyerDeposit.tsx` already has:
1. Real-time subscription (lines 296-364)
2. `fetchTransactions()` function that fetches all statuses
3. Display of pending/completed/failed transactions (lines 788-846)

**The Issue:**
The real-time subscription at line 301-359 subscribes to all transaction changes but the filter logic may not be working correctly. Also, manual transfers may not be triggering updates because the panel owner's approval changes happen in a different context.

**Solution:**
Ensure the real-time subscription doesn't filter out any transactions, and add a periodic poll fallback.

---

## Files to Modify

### Theme Homepages - Footer Interpolation
| File | Change |
|------|--------|
| `src/components/buyer-themes/tgref/TGRefHomepage.tsx` | Interpolate `{companyName}` in footerText |
| `src/components/buyer-themes/alipanel/AliPanelHomepage.tsx` | Interpolate `{companyName}` in footerText |
| `src/components/buyer-themes/flysmm/FlySMMHomepage.tsx` | Interpolate `{companyName}` in footerText |
| `src/components/buyer-themes/smmstay/SMMStayHomepage.tsx` | Interpolate `{companyName}` in footerText |
| `src/components/buyer-themes/smmvisit/SMMVisitHomepage.tsx` | Interpolate `{companyName}` in footerText |

### API Key Generation
| File | Change |
|------|--------|
| `supabase/functions/buyer-auth/index.ts` | Add `generate-api-key` action handler |
| `src/pages/buyer/BuyerProfile.tsx` | Call edge function instead of direct DB update |

### Transaction Updates
| File | Change |
|------|--------|
| `src/pages/buyer/BuyerDeposit.tsx` | Add poll fallback, improve subscription reliability |

---

## Technical Implementation

### Footer Interpolation (All 5 Themes)

```tsx
// Add this helper function in each theme homepage
const interpolateFooterText = (text: string) => {
  return text.replace(/\{companyName\}/g, companyName);
};

// In the footer section, change:
// FROM:
{customization.footerText || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}

// TO:
{customization.footerText 
  ? interpolateFooterText(customization.footerText)
  : `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
```

### API Key Generation via Edge Function

```typescript
// In buyer-auth/index.ts - add new action handler
async function handleGenerateApiKey(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, token } = body;
  
  // Verify JWT token
  if (!token) {
    return jsonResponse({ error: 'Authentication required' });
  }
  
  const verification = await verifyJWT(token);
  if (!verification.valid || verification.payload?.sub !== buyerId) {
    return jsonResponse({ error: 'Invalid token' });
  }
  
  // Generate secure API key
  const panelPrefix = panelId.substring(0, 8);
  const randomPart = crypto.randomUUID().replace(/-/g, '');
  const apiKey = `sk_${panelPrefix}_${randomPart}`;
  
  // Update in database (bypasses RLS)
  const { error } = await supabaseAdmin
    .from('client_users')
    .update({ api_key: apiKey })
    .eq('id', buyerId)
    .eq('panel_id', panelId);
  
  if (error) {
    return jsonResponse({ error: 'Failed to generate API key' });
  }
  
  return jsonResponse({ success: true, api_key: apiKey });
}
```

```tsx
// In BuyerProfile.tsx - update handleGenerateApiKey
const handleGenerateApiKey = async () => {
  if (!buyer?.id || !buyer.panel_id) return;
  
  setGeneratingKey(true);
  try {
    const token = getToken?.();
    
    const { data, error } = await supabase.functions.invoke('buyer-auth', {
      body: { 
        panelId: buyer.panel_id,
        buyerId: buyer.id,
        token,
        action: 'generate-api-key'
      }
    });
    
    if (error || data?.error) {
      throw new Error(data?.error || 'Failed to generate API key');
    }
    
    if (data?.api_key) {
      setLocalApiKey(data.api_key);
      refreshBuyer();
      toast({ title: "API Key Generated", description: "Your new API key is ready to use" });
    }
  } catch (error) {
    console.error('Error generating API key:', error);
    toast({ variant: "destructive", title: "Error", description: "Failed to generate API key" });
  } finally {
    setGeneratingKey(false);
  }
};
```

---

## Full Pages Audit: Panel Owner Dashboard

### Pages Needing Enhancement

| Page | File | Issues/Enhancements Needed |
|------|------|---------------------------|
| **Overview** | `PanelOverview.tsx` | ✅ Generally working |
| **Services** | `ServicesManagement.tsx` | ⚠️ Auto-categorization sometimes loses categories |
| **Orders** | `OrdersManagement.tsx` | ✅ Generally working |
| **Customers** | `CustomerManagement.tsx` | ✅ Generally working |
| **Payment Methods** | `PaymentMethods.tsx` | ⚠️ UnifiedTransactionManager filtering may need panel_id |
| **Design** | `DesignCustomization.tsx` | ✅ Working but defaults need verification |
| **Blog** | `BlogManagement.tsx` | ⚠️ Need to verify blog_enabled syncs to storefront |
| **Analytics** | `Analytics.tsx` | ✅ Generally working |
| **Support** | `SupportCenter.tsx` | ✅ Generally working |
| **General Settings** | `GeneralSettings.tsx` | ✅ Generally working |
| **SEO** | `SEOSettings.tsx` | ✅ Generally working |
| **Domain** | `DomainSettings.tsx` | ✅ Generally working |
| **Integrations** | `Integrations.tsx` | ✅ Generally working |
| **Security** | `SecuritySettings.tsx` | ✅ Generally working |
| **API** | `APIManagement.tsx` | ✅ Generally working |
| **Provider** | `ProviderManagement.tsx` | ✅ Generally working |
| **Promos** | `PromoManagement.tsx` | ✅ Generally working |
| **Team** | `TeamManagement.tsx` | ✅ Generally working |
| **Billing** | `Billing.tsx` | ✅ Generally working |

### Key Issues to Address

1. **UnifiedTransactionManager** - The component fetches ALL transactions then filters by `panel_id` buyers. This is correct but may have performance issues with large datasets.

2. **Blog Visibility** - Need to ensure `panel_settings.blog_enabled` properly syncs to storefront header.

---

## Full Pages Audit: Tenant/Buyer Pages

### Pages Needing Enhancement

| Page | File | Issues/Enhancements Needed |
|------|------|---------------------------|
| **Dashboard** | `BuyerDashboard.tsx` | ⚠️ Loading flicker - panel name shows "Panel" first |
| **New Order** | `BuyerNewOrder.tsx` | ✅ Generally working |
| **Fast Order** | `FastOrder.tsx` (main) | ⚠️ Service categorization sync with New Order |
| **Orders** | `BuyerOrders.tsx` | ✅ Generally working |
| **Deposit** | `BuyerDeposit.tsx` | ⚠️ Transaction list real-time updates |
| **Services** | `BuyerServices.tsx` | ✅ Generally working |
| **Profile** | `BuyerProfile.tsx` | ⚠️ API key generation via edge function |
| **Support** | `BuyerSupport.tsx` | ✅ Generally working |
| **Blog** | `BuyerBlog.tsx` | ✅ Generally working |
| **About** | `BuyerAbout.tsx` | ⚠️ Auth redirect issue (fixed in previous plan) |
| **Terms** | `BuyerTerms.tsx` | ✅ Generally working |
| **Privacy** | `BuyerPrivacy.tsx` | ✅ Generally working |
| **Favorites** | `BuyerFavorites.tsx` | ✅ Generally working |
| **API** | `BuyerAPI.tsx` | ✅ Generally working |
| **Contact** | `BuyerContact.tsx` | ✅ Generally working |

### Critical Issues Summary

1. **API Key** - RLS blocking client-side updates → Need edge function
2. **Footer {companyName}** - Theme homepages don't interpolate → Add replace logic
3. **Transaction Real-time** - May miss updates → Add poll fallback
4. **Loading Flicker** - Panel name shows late → Improve caching

---

## Implementation Order

1. **Fix Footer Interpolation** (5 theme files) - Quick fix
2. **Add API Key Edge Function** - Edge function + profile update
3. **Improve Transaction Updates** - Add poll fallback
4. **Verify Blog Visibility** - Check panel_settings sync

---

## Testing Checklist

After implementation:
- [ ] Footer shows actual panel name in ALL themes (TGRef, AliPanel, FlySMM, SMMStay, SMMVisit)
- [ ] Generate API key in profile → Key displays immediately and persists after page reload
- [ ] Copy API key → Correct key copied to clipboard
- [ ] Make a deposit → Transaction appears in list with correct status
- [ ] Panel owner approves deposit → Buyer's transaction list updates to "completed"
- [ ] Enable Blog in panel settings → Blog appears in storefront header
- [ ] All theme storefronts render correctly with proper branding
