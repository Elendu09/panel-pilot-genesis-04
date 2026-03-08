

# Plan: Update Outdated Docs, Features & Tutorial Pages

## What's Outdated

After reviewing the codebase against actual panel capabilities, here are the gaps:

### 1. `src/pages/docs/GettingStarted.tsx` — Empty placeholder
Says "Quick start guide coming soon..." with no content.

### 2. `src/pages/docs/APIReference.tsx` — Empty placeholder
Says "Complete API documentation coming soon..." with no content.

### 3. `src/pages/Tutorial.tsx` — Generic, doesn't reflect actual flows
- "Getting Started" section says "Add Funds" as step 2 but actual onboarding is: create panel name → choose plan → payment → connect provider → set up domain → configure branding → launch
- "Panel Owner Guide" is vague ("Panel Setup", "Service Management") — doesn't mention actual features like design customization, storefront builder, blog management, promo codes, team management
- "Advanced Features" lists "White Label" and "Multi-Panel Management" generically without explaining the actual implementation (guided onboarding, panel switcher, etc.)

### 4. `src/pages/Features.tsx` — Outdated counts and missing features
- Says "150+ Payment Methods" but KnowledgeBase says "200+ payment systems"
- Missing major implemented features: Guided Onboarding (6-step wizard), Storefront Builder/Design Customization, Blog Management, Promo/Coupon Management, Provider Advertising marketplace, Chat Inbox, Multi-Panel support, Payment Gateway Request system
- "Hosting" section lists CDN, DDoS Protection, Backups — these are generic claims not tied to actual implementation

### 5. `src/components/support/KnowledgeBase.tsx` — Outdated instructions
- "Getting Started" FAQ says "go to General Settings" — actual path is through guided onboarding
- Missing FAQ categories: Multi-Panel Management, Onboarding, Storefront/Design, Blog, Promotions
- Payment section says "200+ payment systems" but Features page says "150+" — inconsistency

---

## Changes

### `src/pages/docs/GettingStarted.tsx`
Replace placeholder with actual getting started content covering:
- Account creation and verification
- Panel onboarding wizard (6 steps: name, plan, payment, provider, domain, branding)
- First order walkthrough
- Link to `/docs` hub for deeper articles

### `src/pages/docs/APIReference.tsx`
Replace placeholder with actual API reference overview covering:
- Buyer API endpoints (place order, check status, get services, get balance)
- Panel Owner API endpoints (manage services, users, orders)
- Authentication (API key)
- Example request/response snippets
- Link to detailed docs articles

### `src/pages/Tutorial.tsx`
Rewrite all 4 sections to match actual platform:
- **Getting Started**: Reflect actual onboarding (create account → panel name → choose plan → payment → connect provider → domain → branding → launch)
- **Panel Owner Guide**: Mention actual pages (Design Customization, Services Management, Provider Management, Payment Methods, Blog Management, Team Management, Analytics)
- **Order Management**: Keep statuses but add info about provider sync, refill, drip-feed
- **Advanced Features**: Update to cover actual implementations (Multi-Panel from dashboard, Storefront Builder with 7+ templates, API with webhooks, Promo/Coupon system)

### `src/pages/Features.tsx`
- Update "150+ Payment Methods" → "200+ Payment Methods"
- Add missing feature entries to relevant categories:
  - **User Panel**: Add "Guided Onboarding", "Multi-Panel Support"
  - **Services**: Add "Provider Advertising Marketplace"
  - **Accept Payments**: Update count, add "Payment Gateway Requests"
  - **Theme Editor**: Rename to "Storefront Builder", add "7+ Pre-built Templates", "Live Preview"
  - **Admin Options**: Add "Chat Inbox", "Blog Management", "Promo & Coupons", "Provider Ads"

### `src/components/support/KnowledgeBase.tsx`
- Update "Getting Started" FAQs to reference onboarding wizard instead of manual setup
- Add new category: "Multi-Panel & Scaling" with FAQs about managing multiple panels, switching panels, separate storefronts
- Add new category: "Storefront & Design" with FAQs about templates, customization, live preview
- Update payment FAQ answer for consistency ("200+ payment systems")

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/docs/GettingStarted.tsx` | Replace placeholder with real getting started guide |
| `src/pages/docs/APIReference.tsx` | Replace placeholder with API overview + examples |
| `src/pages/Tutorial.tsx` | Rewrite all sections to match actual platform |
| `src/pages/Features.tsx` | Update counts, add missing features |
| `src/components/support/KnowledgeBase.tsx` | Update FAQs, add new categories |

