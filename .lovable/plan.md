# Fix: SEO Meta Tag Leakage Across Pages and Tenants

## Root Cause

The `index.html` file has **two categories of problematic tags**:

1. **Tags missing `data-platform-only**` -- These survive on ALL pages (homepage, about, blog, etc.) and ALL tenant domains because neither Helmet nor the cleanup script removes them reliably.
2. **Duplicate og/twitter tags at lines 203-206** -- These hardcoded homepage-specific title/description tags persist on every page route, overriding page-specific Helmet tags.

### Tags missing `data-platform-only` (leak everywhere):

- Line 36: `<meta name="description">`
- Line 37: `<meta name="keywords">`
- Line 106: `<meta property="og:type">`
- Line 107: `<meta property="og:locale">`
- Line 111: `<meta property="og:image">`
- Line 112-113: `<meta property="og:image:width/height">`
- Line 117: `<meta name="twitter:card">`
- Line 122: `<meta name="twitter:image">`
- Lines 203-206: `og:title`, `twitter:title`, `og:description`, `twitter:description`

## Fix Plan

### Step 1: Clean up `index.html`

**Remove lines 203-206 entirely** -- these are duplicate og:title/twitter:title/og:description/twitter:description tags that override page-specific Helmet values.

**Add `data-platform-only` to ALL remaining platform-specific meta tags** that currently lack it:

- Line 36: description
- Line 37: keywords
- Line 106: og:type
- Line 107: og:locale
- Line 111: og:image
- Line 112: og:image:width
- Line 113: og:image:height
- Line 117: twitter:card
- Line 122: twitter:image

This ensures the tenant cleanup script removes them, AND Helmet on each platform page can set its own values without conflict.

### Step 2: Verify `Index.tsx` uses correct title/description

Confirm it uses:

- Title: `Home of SMM – Create & Manage Your Own SMM Panel`
- Description: `Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow revenue`

(Already correct from previous fix -- no change needed.)

### Step 3: Verify `JsonLdSchema.tsx` descriptions match

The `MainHomepageSchemas` component already uses the correct description. No change needed.

### Step 4: Verify tenant `TenantHead.tsx`

Already correctly uses panel-specific `seo_title` and `seo_description` from panel_settings via Helmet. Once the leaking tags are removed from `index.html`, tenant pages will only show their own panel's SEO data. No change needed.

## Summary

Only **one file** needs changes: `index.html`. The fix is adding `data-platform-only` to ~9 meta tags and removing 4 duplicate lines (203-206). This stops homepage SEO from bleeding into other pages and tenant domains.