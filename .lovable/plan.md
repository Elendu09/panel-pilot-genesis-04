
# Comprehensive Security Settings Enhancement Plan

## Summary of Previous Build Implementation Verification

### ✅ Successfully Implemented Features

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| DomainSettings Enhancement | ✅ Complete | `DomainSettings.tsx` | Uses `isValidCustomDomain`, `isPlatformSubdomain`, DNSVerificationProgress component |
| GeneralSettings Advertising | ✅ Complete | `GeneralSettings.tsx` | Clean promotional banner note, no "Custom HTML not supported" warning |
| Team Management Coming Soon | ✅ Complete | `TeamManagement.tsx` | Button disabled with Clock icon, "Coming Soon!" text, info card explaining roadmap |
| FastOrder Theme-Safe Colors | ✅ Complete | `FastOrder.tsx` | Uses `text-primary`, `text-foreground`, `text-muted-foreground` tokens |
| BuyerServices Category Fallback | ✅ Complete | `BuyerServices.tsx` | Fallback builds categories from services when `categoriesWithServices` is empty |
| Analytics Real Deposits | ✅ Complete | `Analytics.tsx` Lines 282-299 | Real calculation from `transactions` table with status filters |
| PaymentsFunnelCard Restored | ✅ Complete | `Analytics.tsx` Line 682-687 | Both funnels displayed side-by-side |
| Security IP Masking | ✅ Complete | `SecuritySettings.tsx` Line 168 | Uses "IP masked" instead of `Math.random()` IPs |

---

## Security Settings Enhancement Plan

Based on OWASP 2025 A07 Authentication Failures best practices and modern SaaS security standards, here is a comprehensive plan to enhance the Panel Security Settings page:

### Current State Analysis

**Existing Features:**
- Core Security: 2FA toggle, max login attempts, session timeout, re-auth frequency
- Password Policy: Min length, numbers, symbols toggles
- Device Limits: Max concurrent sessions, new device notifications
- IP/Country Rules: IP allowlist, country blocklist, VPN/TOR blocking
- Active Sessions: Display with revoke capability
- Audit Logs: Recent security events display

**Gaps Identified (Based on OWASP 2025):**
1. No rate limiting visualization/configuration
2. No brute force attack detection metrics
3. No credential stuffing protection indicators
4. No security health score
5. No API key management section
6. No session fingerprinting configuration
7. No login history with geographic visualization
8. No security alerts/notifications section
9. No backup codes/recovery options display
10. No CAPTCHA configuration

---

## Implementation Plan

### Part 1: Security Health Score Dashboard

Add a prominent security score card at the top of the page that calculates overall security posture based on enabled features.

**Implementation:**
```typescript
const calculateSecurityScore = (): number => {
  let score = 0;
  const maxScore = 100;
  
  // 2FA enabled: +20 points
  if (enforce2FA) score += 20;
  
  // Password policy (up to 15 points)
  if (passwordMinLength) score += 5;
  if (passwordNumbers) score += 5;
  if (passwordSymbols) score += 5;
  
  // Session security (up to 15 points)
  if (parseInt(maxSessions) <= 3) score += 5;
  if (parseInt(sessionTimeout) <= 60) score += 5;
  if (notifyNewDevice) score += 5;
  
  // Network security (up to 20 points)
  if (blockTorVpn) score += 10;
  if (ipAllowlist.trim()) score += 5;
  if (countryBlocklist.trim()) score += 5;
  
  // Advanced (up to 30 points)
  if (parseInt(maxAttempts) <= 5) score += 10;
  if (parseInt(reauthFrequency) <= 15) score += 10;
  score += 10; // Base security (using Supabase Auth)
  
  return Math.min(score, maxScore);
};
```

**UI:** Display as a circular progress with color coding (red < 50, yellow 50-75, green > 75)

---

### Part 2: Enhanced Core Security Section

**New Features to Add:**

1. **Rate Limiting Configuration**
   - Requests per minute slider (10-100)
   - Lockout duration selector (5/15/30/60 minutes)
   - Cooldown period after successful login

2. **Brute Force Protection Metrics**
   - Blocked attempts counter (last 24h/7d/30d)
   - Top blocked IPs list
   - Attack pattern visualization

3. **CAPTCHA Configuration**
   - Toggle: Enable CAPTCHA after N failed attempts
   - CAPTCHA provider selection (hCaptcha/reCAPTCHA)
   - Threshold slider (1-10 failed attempts)

**UI Enhancement:**
```typescript
// Rate Limiting Card
<div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
  <div className="flex items-center gap-2">
    <Gauge className="w-4 h-4 text-primary" />
    <span className="font-medium">Rate Limiting</span>
    <Badge variant="outline" className="ml-auto">Recommended</Badge>
  </div>
  <div className="space-y-4">
    <div>
      <Label className="text-sm">Max requests per minute</Label>
      <Slider value={[rateLimit]} onValueChange={([v]) => setRateLimit(v)} min={10} max={100} />
      <span className="text-xs text-muted-foreground">{rateLimit} requests/min</span>
    </div>
    <div>
      <Label className="text-sm">Lockout duration after limit</Label>
      <Select value={lockoutDuration} onValueChange={setLockoutDuration}>
        <SelectContent>
          <SelectItem value="5">5 minutes</SelectItem>
          <SelectItem value="15">15 minutes</SelectItem>
          <SelectItem value="30">30 minutes</SelectItem>
          <SelectItem value="60">1 hour</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>
```

---

### Part 3: Login History & Geography

Add a new "Login History" tab showing:

1. **Recent Logins Table**
   - Email, IP, Device, Location (country flag), Time, Status
   - Filter by success/failed
   - Export to CSV

2. **Geographic Map Visualization**
   - World map with login locations highlighted
   - Red pins for suspicious locations
   - Ability to block countries from map

3. **Suspicious Activity Alerts**
   - Impossible travel detection
   - New device/location warnings
   - Unusual time pattern alerts

---

### Part 4: API Security Section (New Tab)

Add dedicated API security management:

1. **API Key Management**
   - List of active API keys with last used date
   - Create new key with name/expiry
   - Revoke key button
   - Copy key (shown only once)

2. **API Rate Limits**
   - Separate rate limits for API vs UI
   - Endpoint-specific limits
   - Usage statistics

3. **Webhook Security**
   - Signature verification toggle
   - IP allowlist for webhooks
   - Retry policy configuration

---

### Part 5: Enhanced Audit Log

Improve the existing audit log section:

1. **Advanced Filtering**
   - Filter by action type (login, settings, orders, etc.)
   - Filter by user
   - Filter by IP
   - Date range picker

2. **Log Details Modal**
   - Click on log entry to see full details
   - Request payload (sanitized)
   - Response status
   - User agent parsing

3. **Export & Retention**
   - Export logs to CSV/JSON
   - Log retention policy configuration
   - Archive old logs

---

### Part 6: Security Alerts Configuration

New section for configuring security notifications:

1. **Alert Triggers**
   - Failed login threshold (toggle + number)
   - New device login
   - Settings changes
   - Suspicious activity
   - API key usage anomalies

2. **Notification Channels**
   - Email notifications toggle
   - In-app notifications toggle
   - Webhook notification URL

3. **Alert History**
   - List of recent security alerts
   - Acknowledge/dismiss buttons
   - Alert severity badges

---

### Part 7: Recovery & Backup

Add recovery options section:

1. **Backup Codes Display**
   - Generate 10 recovery codes
   - Download as text file
   - Regenerate option (invalidates old codes)

2. **Recovery Email**
   - Configure secondary email for account recovery
   - Verification status display

3. **Session Kill Switch**
   - "Log out all devices" button
   - Force password reset option

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/SecuritySettings.tsx` | Complete overhaul with all 7 parts above |

## New State Variables to Add

```typescript
// Rate Limiting
const [rateLimit, setRateLimit] = useState(60);
const [lockoutDuration, setLockoutDuration] = useState("15");

// CAPTCHA
const [captchaEnabled, setCaptchaEnabled] = useState(false);
const [captchaThreshold, setCaptchaThreshold] = useState(3);

// API Security
const [apiKeys, setApiKeys] = useState<{id: string; name: string; lastUsed: string}[]>([]);

// Alerts
const [alertOnFailedLogin, setAlertOnFailedLogin] = useState(true);
const [alertThreshold, setAlertThreshold] = useState(5);
const [alertEmail, setAlertEmail] = useState(true);

// Login History
const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);

// Recovery
const [backupCodes, setBackupCodes] = useState<string[]>([]);
const [recoveryEmail, setRecoveryEmail] = useState("");
```

## UI Layout Enhancement

```text
┌─────────────────────────────────────────────────────────────────┐
│ SECURITY HEALTH SCORE                                            │
│ ┌─────────┐                                                      │
│ │   78%   │  Your security is GOOD                              │
│ │  ●●●●○  │  Enable 2FA for all users to reach 100%            │
│ └─────────┘                                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TABS: [Core Security] [IP Rules] [Login History] [API] [Audit] │
└─────────────────────────────────────────────────────────────────┘

Core Security Tab:
┌──────────────────────────┬──────────────────────────┐
│ Authentication           │ Rate Limiting            │
│ ┌────────────────────┐  │ ┌────────────────────┐   │
│ │ 2FA, Login attempts│  │ │ Requests/min slider│   │
│ │ Session timeout    │  │ │ Lockout duration   │   │
│ └────────────────────┘  │ └────────────────────┘   │
├──────────────────────────┼──────────────────────────┤
│ Password Policy          │ CAPTCHA Protection       │
│ ┌────────────────────┐  │ ┌────────────────────┐   │
│ │ Min 8 chars, nums  │  │ │ Enable after N fails│  │
│ │ symbols            │  │ │ Provider selection │   │
│ └────────────────────┘  │ └────────────────────┘   │
└──────────────────────────┴──────────────────────────┘
```

---

## Security Best Practices Implementation Summary

Based on OWASP 2025 A07 Authentication Failures:

1. ✅ **Multi-Factor Authentication** - Existing 2FA toggle
2. ✅ **Credential Stuffing Protection** - Rate limiting + CAPTCHA (to add)
3. ✅ **Brute Force Protection** - Max attempts + lockout (to enhance)
4. ✅ **Session Management** - Timeout + max sessions (existing)
5. ✅ **Audit Logging** - Enhanced filtering (to add)
6. 🆕 **Impossible Travel Detection** - Geographic alerts (new)
7. 🆕 **API Security** - Key management + rate limits (new)
8. 🆕 **Recovery Options** - Backup codes (new)

---

## Database Considerations

No new database tables required. All settings will be stored in the existing `panels.settings` JSONB field under a `security` key, similar to the current implementation.

The login history and API keys may benefit from dedicated tables in a future iteration, but for MVP can be derived from:
- `audit_logs` table (login history)
- `panel_settings` or new `panel_api_keys` table (API keys)
