

# Plan: Onboarding Full Audit — Fix Errors & Redesign Complete Step

## Issues Found

### 1. Custom domain type never set on "have-domain" selection (BUG)
In `OnboardingDomainStep.tsx`, when a Basic/Pro user selects "I have a domain" radio option, `domainOption` is set to `'have-domain'` but `onDomainTypeChange('custom')` is **never called**. This means `domainType` stays `'subdomain'` in the parent, and on completion the panel gets a subdomain instead of the custom domain. Similarly, "register-new" never calls `onDomainTypeChange('custom')`.

**Fix in `OnboardingDomainStep.tsx`**: Add `onDomainTypeChange('custom')` in the `onValueChange` handler of the `RadioGroup`, and call `onDomainTypeChange('subdomain')` for the free-subdomain option (already done for click but not for radio change).

### 2. Payment step uses stale `createdPanelId` state instead of ref (BUG)
Line 661: `panelId={createdPanelId || undefined}` — This uses React state which may be stale during the same render cycle. Should use `createdPanelIdRef.current`.

**Fix in `PanelOnboardingV2.tsx` line 661**: Change to `panelId={createdPanelIdRef.current || undefined}`.

### 3. SEO auto-generated text not clamped to pixel limits (BUG)
`generateAllSeo()` sets `seoTitle` and `seoDescription` from the edge function response without clamping to `SEO_TITLE_PX_RANGE.max` / `SEO_DESC_PX_RANGE.max`. If the AI returns text that's too long, the user gets a validation error they can't easily fix.

**Fix in `PanelOnboardingV2.tsx` `generateAllSeo()`**: Import `clampToPx` from `seo-metrics` and clamp both title and description before setting state.

### 4. handleComplete fails if user skipped SEO step with empty fields (BUG)
If `seoTitle` or `seoDescription` is empty, `measureTextPx('')` returns 0, which is outside `SEO_TITLE_PX_RANGE`, causing validation to block completion. The fallback generation only triggers if the user actually visits the SEO step.

**Fix**: In `handleComplete`, if SEO fields are empty, auto-generate fallback values before validating.

### 5. Complete step UI needs redesign
Current "Complete your panel" step is a basic Card with minimal styling. Needs better container, visual hierarchy, and padding.

**Redesign in `PanelOnboardingV2.tsx` lines 966-1036**:
- Add gradient border glow effect on the summary card
- Add animated confetti/sparkle icon
- Show all configuration items in a structured grid with icons
- Add currency to the summary
- Better spacing, rounded corners, and visual separation
- Add a subtle "Everything looks good" success banner

### 6. Domain step RadioGroup doesn't sync domainType on option change (BUG)
The `RadioGroup`'s `onValueChange` only sets `domainOption` state locally. It needs to also call `onDomainTypeChange` to sync the parent.

**Fix in `OnboardingDomainStep.tsx`**: Update the RadioGroup `onValueChange`:
```tsx
onValueChange={(value: DomainOption) => {
  setDomainOption(value);
  onDomainTypeChange(value === 'free-subdomain' ? 'subdomain' : 'custom');
}}
```

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/onboarding/OnboardingDomainStep.tsx` | Fix RadioGroup to sync `domainType` with parent on option change |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix panelId prop to use ref; clamp SEO auto-gen; auto-fill empty SEO on complete; redesign Complete step UI |

