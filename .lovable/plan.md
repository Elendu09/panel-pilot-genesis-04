

# Plan: Complete Homepage Redesign, Webhook Configuration, and Deposit Error Fix

## Overview

Rewrite the entire homepage from scratch with a modern, premium multi-panel SaaS design. Remove tenant detection from `index.html` to improve load speed. Fix the Flutterwave "channel not enabled" error messaging. Configure webhook URLs properly.

## Part 1: Remove Tenant Detection from index.html

The tenant detection script in `index.html` (lines 10-30) hides the document, removes favicons, and sets `__IS_TENANT_DOMAIN__`. Since no code references `__IS_TENANT_DOMAIN__` in the React codebase, these scripts can be safely removed. The cleanup script (lines 142-158) and favicon conditional script (lines 118-138) also get removed.

**Keep**: All preconnects, font loading, critical CSS, meta tags (without `data-platform-only` attributes since those were only for tenant cleanup).

## Part 2: Homepage Sections (Complete Rewrite)

### Files to Create/Rewrite

| File | Section |
|------|---------|
| `src/pages/Index.tsx` | New page structure with all sections |
| `src/components/sections/HeroSection.tsx` | "Launch Your Own SMM Panel" + animated text + panel mockup |
| `src/components/sections/HowItWorksSection.tsx` | NEW: 4-step process (Create, Connect, Add Payments, Sell) |
| `src/components/sections/FeaturesGridSection.tsx` | NEW: 8-card feature grid |
| `src/components/sections/WhyChooseUsSection.tsx` | NEW: 2-column differentiator with badges |
| `src/components/sections/TestimonialsSection.tsx` | Rewritten with new data, avatars, roles, star ratings, carousel |
| `src/components/sections/PricingPreviewSection.tsx` | NEW: Free/Basic/Pro cards with CTA |
| `src/components/sections/CTASection.tsx` | NEW: Final call-to-action banner |
| `src/components/sections/FAQSection.tsx` | Updated content, same accordion style |
| `src/components/layout/Footer.tsx` | Updated copy, remove SocPanel references |
| `index.html` | Remove tenant detection scripts, clean up meta tags |

### Section Details

**Hero**: Headline "Launch Your Own SMM Panel", subheadline about multi-panel platform. Keep the `AnimatedText` with "build an smm panel..." phrases. Keep the panel mockup card but with updated categories (Instagram, TikTok, YouTube, Twitter instead of VK/Telegram). Keep BackgroundEffects and floating glow orbs. Stats bar below mockup.

**How It Works**: 4 horizontal steps on desktop (numbered cards with connecting line), vertical stacked on mobile. Icons: Rocket (Create), Link (Connect Providers), CreditCard (Add Payments), TrendingUp (Start Selling). Each card has title + 1-sentence description.

**Features Grid**: 2x4 grid on desktop, 1-column on mobile. Cards: Multi-Panel System, Custom Domains, Automated Orders, Payment Gateways, Analytics Dashboard, White-Label Branding, API Integration, Scalable Infrastructure. Each with icon, title, description, hover glow effect. Keep BackgroundEffects.

**Why Choose Us**: Left column: heading + bullet points with check badges (Faster Setup, Enhanced UI/UX, Multi-Tenant Architecture, Advanced Automation, Built for Scale). Right column: decorative dashboard mockup or gradient card stack visual.

**Testimonials**: 3 new testimonials with realistic names, roles ("Panel Owner", "SMM Reseller", "Agency Owner"), star ratings, avatar initials. Auto-scroll carousel with CSS animation. No SocPanel references.

**Pricing Preview**: 3 cards (Free $0, Basic $5/mo, Pro $15/mo) with short feature lists. "View Full Pricing" CTA button linking to /pricing.

**CTA Section**: Full-width gradient banner. "Ready to Launch Your SMM Empire?" with "Get Started Free" button.

**FAQ**: Updated answers referencing "multi-panel" capability. Same accordion design.

**Footer**: Updated tagline to "The most advanced multi-panel SMM platform." Copyright 2025. Remove email emoji.

### Design Principles
- Mobile-first: all grids use `grid-cols-1` base, scale up at `md:` and `lg:`
- Keep existing `BackgroundEffects` component on key sections
- Keep existing `glass-card` and `bg-gradient-primary` utility classes
- Keep `CursorEffects` lazy-loaded
- No emoji in any content
- All text optimized for SEO/AEO (question-answer patterns in FAQ, semantic headings)

## Part 3: Webhook URL Configuration

Currently webhooks use `Deno.env.get('SUPABASE_URL')/functions/v1/payment-webhook`. This is correct for all cases since edge functions are the centralized payment handler. No change needed -- the webhook URL is already the platform's edge function URL regardless of tenant/admin.

For admin payment methods documentation/display: show `https://homeofsmm.com` as the platform webhook base. For panel owner methods: the webhook still routes through the same edge function (tenant domain is irrelevant for server-to-server callbacks).

## Part 4: Deposit "Channel Not Enabled" Error

The error "you don't have any channel enabled for checkout payment" comes from **Flutterwave's API** -- it means the Flutterwave account is in test/sandbox mode and hasn't activated live payment channels. This is NOT a code bug.

**Fix**: Improve error messaging in `process-payment/index.ts` for the Flutterwave case (line 800+) to surface this specific error clearly: "Flutterwave: Your account does not have any payment channel enabled. Please activate live mode in your Flutterwave dashboard." Also add similar clear messaging for other gateways that return account-configuration errors.

## Files Summary

| File | Action |
|------|--------|
| `index.html` | Remove tenant detection scripts, clean meta tags |
| `src/pages/Index.tsx` | Rewrite with new section structure |
| `src/components/sections/HeroSection.tsx` | Rewrite hero |
| `src/components/sections/HowItWorksSection.tsx` | Create new |
| `src/components/sections/FeaturesGridSection.tsx` | Create new |
| `src/components/sections/WhyChooseUsSection.tsx` | Create new |
| `src/components/sections/TestimonialsSection.tsx` | Rewrite |
| `src/components/sections/PricingPreviewSection.tsx` | Create new |
| `src/components/sections/CTASection.tsx` | Create new |
| `src/components/sections/FAQSection.tsx` | Update content |
| `src/components/layout/Footer.tsx` | Update copy |
| `supabase/functions/process-payment/index.ts` | Improve Flutterwave error message |
| Delete `src/components/sections/PlatformFeaturesSection.tsx` | No longer needed |
| Delete `src/components/sections/StatsSection.tsx` | Replaced by stats in hero |
| Delete `src/components/sections/ServiceShowcase.tsx` | No longer needed |

