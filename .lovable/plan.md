


# Plan: Fix Tenant Auth (Username Forgot-Password, Email Delivery, Password Issues), Service Type UI, and Live Chat Panel ID

## COMPLETED

### 1. Fixed Forgot-Password: No longer overwrites main password
- Temp password stored in `password_temp` with `password_temp_expires_at` (24h default)
- Main `password_hash` stays intact
- Fixed `normalizedEmail` undefined variable bug

### 2. Fixed Login: Independent password_hash and password_temp checking
- Login first checks `password_hash`, then independently checks `password_temp` (if not expired)
- Both the real password AND temp password work during the temp window
- Expired temp passwords are auto-cleared

### 3. Database: Added `password_temp_expires_at` column to `client_users`

### 4. Fixed Live Chat "Missing Panel ID"
- Added triple fallback: `authPanelId || panel?.id || localStorage.getItem('current_panel_id')`
- All ticket/chat operations use `resolvedPanelId` instead of `panel?.id`

### 5. Fixed Support Ticket Creation
- Ticket creation uses `resolvedPanelId` consistently
- Notification also uses `resolvedPanelId`

### 6. SupportCenter: Default tab changed to "livechat"

### 7. FAQ Management for Panel Owners
- CRUD interface in Knowledge tab for managing tenant-facing FAQs
- Saved to `panels.custom_branding.faqs`
- Tenant BuyerSupport reads and displays these FAQs

### 8. SMTP Configuration UI
- Added SMTP config fields in GeneralSettings (host, port, username, password, from email, from name)
- Panel owners can configure SMTP for sending password reset emails

### 9. Edge functions deployed: buyer-auth, panel-customers
