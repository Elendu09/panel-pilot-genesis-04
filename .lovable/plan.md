

# Plan: Combine Domain Options, Strict Next Gating & Persistent Verification State

## Current Issues

1. **3 separate radio options** ("I have a domain", "Register new domain", "Free subdomain") — user wants "buy" and "have" combined into one "Custom Domain" box (like the payment flow pattern).
2. **Next button not gated by domain verification** — when custom domain is selected, user can click Next even if DNS is not verified. Should block Next until verified (or explicitly choosing subdomain).
3. **Verification state lost on navigate-back** — `domainVerificationState` is React state only. When user goes to Complete step, clicks "Edit" on Domain, the `OnboardingDomainStep` remounts and loses `verificationStep`, `verificationToken`, `dnsRecords`, and `pollingActive`. User has to reconfigure from scratch.

## Changes

### 1. Combine "I have a domain" + "Register new domain" into one card

Reduce from 3 radio options to 2:
- **Custom Domain** (combines both): Shows domain input + configure button. Below that, a collapsible "Don't have a domain yet?" section with registrar links and TLD search (the current "register-new" content). Single card, single radio value `'custom-domain'`.
- **Free Subdomain** (unchanged): Same as current `'free-subdomain'`.

In `OnboardingDomainStep.tsx`:
- Remove the `'register-new'` option from `DomainOption` type → `'custom-domain' | 'free-subdomain'`
- Merge the "have-domain" card content (domain input, DNS verification stepper) with a "Need a domain?" expandable section containing registrar links + TLD search
- The domain input and verification flow remains primary; registrar links become secondary/helper content

### 2. Gate Next button on domain verification

In `PanelOnboardingV2.tsx` `handleNext`:
- When `currentStepKey === STEP_KEYS.DOMAIN` and `domainType === 'custom'`:
  - Block Next unless `domainVerificationState.step === 'verified'`
  - Show toast: "Please verify your domain before continuing"
- Also disable the Next button visually (like payment step):
  - Change `disabled` condition: `(isPaymentStep && !paymentCompleted) || (isDomainStep && domainType === 'custom' && domainVerificationState.step !== 'verified')`

### 3. Persist and restore verification state

**Save to `onboarding_data`**: In `saveProgress()`, add `domainVerificationStep` and `domainVerificationToken` to `progressData`.

**Restore on mount**: In the state restoration block (line ~169), restore:
```
if (savedData.domainVerificationStep) setDomainVerificationState({ step: savedData.domainVerificationStep, token: savedData.domainVerificationToken })
```

**Pass restored state into OnboardingDomainStep**: Add new props `initialVerificationStep` and `initialVerificationToken`. On mount, if these are provided and non-default, initialize from them instead of `'configure'`. This means:
- If user had reached `'txt-pending'` or `'dns-pending'`, the component starts there with the token already set
- DNS records are re-fetched from `panel_domains` table or reconstructed from the token
- Polling resumes automatically

**OnboardingDomainStep changes**:
- Accept `initialVerificationStep?: string` and `initialVerificationToken?: string` props
- In `useState` initializers, use these if provided
- On mount, if `initialVerificationStep !== 'configure'`, load DNS records from `panel_domains` for the domain, and resume polling

### 4. Also persist to `panel_domains` on each step transition

The current code only syncs to `panel_domains` in `handleComplete`. Move the domain upsert to also happen in `saveProgress` when on the domain step, so even mid-flow the token is stored.

---

## Files to Change

| File | Changes |
|------|---------|
| `src/components/onboarding/OnboardingDomainStep.tsx` | Combine 3 options → 2, accept `initialVerificationStep`/`initialVerificationToken` props, restore state on mount, load DNS records from DB if resuming |
| `src/pages/panel/PanelOnboardingV2.tsx` | Gate Next on domain verification, persist verification state in `saveProgress`, restore on mount, pass initial state as props, update disabled logic on Next buttons |

