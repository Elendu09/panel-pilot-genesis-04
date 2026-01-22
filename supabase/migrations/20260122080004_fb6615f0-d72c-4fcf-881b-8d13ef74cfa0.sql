-- Update API documentation to clearly differentiate Panel Owner API vs Buyer/Tenant API

-- Update Panel API Overview
UPDATE public.platform_docs
SET content = '# Panel Owner API Overview

The Panel Owner API allows you to programmatically manage your SMM panel. This API is designed for **panel owners** who want to build custom dashboards, automate workflows, or integrate with third-party tools.

---

## Two API Types

HOME OF SMM provides two distinct APIs for different purposes:

### Panel Owner API (Management)

**Purpose:** Manage your panel, services, orders, and customers

**Base URL:**
```bash
https://homeofsmm.com/api/v2/panel
```

**Who uses it:** Panel owners, developers building admin tools

**Capabilities:**
- Sync services from providers
- Monitor and manage orders
- Manage customer accounts and balances
- View analytics and statistics
- Configure webhooks

---

### Buyer API (Storefront)

**Purpose:** Allow your customers to interact with your panel programmatically

**Base URL (Subdomain):**
```bash
https://{your-panel}.homeofsmm.com/api/v1
```

**Base URL (Custom Domain):**
```bash
https://yourdomain.com/api/v1
```

**Who uses it:** Your customers, resellers, automation tools

**Capabilities:**
- List available services
- Place orders
- Check order status
- View balance

---

## Quick Comparison

| Feature | Panel Owner API | Buyer API |
|---------|-----------------|-----------|
| **Endpoint** | homeofsmm.com/api/v2/panel | {panel}.homeofsmm.com/api/v1 |
| **Authentication** | Panel API Key | Customer API Key |
| **Purpose** | Panel management | Customer orders |
| **Access Level** | Full admin access | Customer-scoped |

---

## Getting Started

### Step 1: Generate Your API Key

1. Log in to your panel dashboard
2. Navigate to **Settings > API Management**
3. Click **Generate New Key**
4. Copy and securely store your API key

### Step 2: Make Your First Request

Test your API key with a simple request:

```bash
curl -X POST https://homeofsmm.com/api/v2/panel \
  -H "Content-Type: application/json" \
  -d ''{"key": "YOUR_API_KEY", "action": "stats"}''
```

### Step 3: Explore Available Actions

- `services` - List all your panel services
- `orders` - View and manage orders
- `customers` - Manage customer accounts
- `stats` - Get panel statistics

---

## Response Format

All API responses follow a consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Rate Limits

- **Panel Owner API:** 100 requests per minute
- **Buyer API:** 60 requests per minute per customer

Exceeding limits returns HTTP 429 with a retry-after header.

---

## Next Steps

- [Authentication Guide](/docs/api/panel-api-auth) - Secure API key management
- [Services Endpoint](/docs/api/panel-api-services) - Sync and manage services
- [Orders Endpoint](/docs/api/panel-api-orders) - Order management
- [Customer Endpoint](/docs/api/panel-api-customers) - Customer operations'
WHERE slug = 'panel-api-overview';

-- Update Panel API Authentication
UPDATE public.platform_docs
SET content = '# Panel Owner API Authentication

Secure authentication is essential for protecting your panel data. This guide covers API key management and security best practices.

---

## Authentication Method

The Panel Owner API uses **API Key authentication**. Include your key in every request body.

### Request Format

```json
{
  "key": "your-panel-api-key",
  "action": "action_name",
  ...additional parameters
}
```

---

## Generating API Keys

### From Dashboard

1. Go to **Settings > API Management**
2. Click **Generate New Key**
3. Give it a descriptive name (e.g., "Production Dashboard")
4. Copy the key immediately - it won''t be shown again

### Key Format

API keys are 64-character alphanumeric strings:

```
pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## Authentication Examples

### cURL

```bash
curl -X POST https://homeofsmm.com/api/v2/panel \
  -H "Content-Type: application/json" \
  -d ''{
    "key": "YOUR_API_KEY",
    "action": "services"
  }''
```

### Python

```python
import requests

response = requests.post(
    "https://homeofsmm.com/api/v2/panel",
    json={
        "key": "YOUR_API_KEY",
        "action": "services"
    }
)

data = response.json()
print(data)
```

### PHP

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://homeofsmm.com/api/v2/panel",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode([
        "key" => "YOUR_API_KEY",
        "action" => "services"
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data);
?>
```

### JavaScript (Node.js)

```javascript
const response = await fetch("https://homeofsmm.com/api/v2/panel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "YOUR_API_KEY",
    action: "services"
  })
});

const data = await response.json();
console.log(data);
```

---

## Security Best Practices

### Do

- Store API keys in environment variables
- Use different keys for development and production
- Rotate keys periodically (every 90 days recommended)
- Monitor API logs for unusual activity

### Avoid

- Hardcoding keys in source code
- Sharing keys via email or chat
- Using the same key across multiple applications
- Committing keys to version control

---

## Error Responses

| HTTP Code | Error Message | Solution |
|-----------|---------------|----------|
| 401 | Invalid API key | Check your key is correct |
| 401 | API key not found | Generate a new key |
| 403 | API key disabled | Re-enable in dashboard |
| 429 | Rate limit exceeded | Wait and retry |

---

## IP Whitelisting (Optional)

For enhanced security, restrict API access to specific IP addresses:

1. Go to **Settings > API Management > Security**
2. Enable **IP Whitelist**
3. Add allowed IP addresses
4. Save changes

Requests from non-whitelisted IPs will receive a 403 error.'
WHERE slug = 'panel-api-auth';

-- Update Buyer API documentation
UPDATE public.platform_docs
SET content = '# Buyer API Reference

The Buyer API allows your customers to interact with your panel programmatically. This enables resellers and power users to automate their orders.

---

## API Endpoint

The Buyer API endpoint is specific to your panel:

**Subdomain Panel:**
```bash
https://yourpanel.homeofsmm.com/api/v1
```

**Custom Domain:**
```bash
https://yourdomain.com/api/v1
```

---

## Authentication

Buyers authenticate using their personal API key, found in their account settings.

```json
{
  "key": "buyer-api-key",
  "action": "balance"
}
```

---

## Available Actions

### Get Services List

Returns all services available on your panel.

**Request:**
```bash
curl -X POST https://yourpanel.homeofsmm.com/api/v1 \
  -d "key=BUYER_API_KEY&action=services"
```

**Response:**
```json
[
  {
    "service": 1,
    "name": "Instagram Followers",
    "type": "default",
    "rate": "2.50",
    "min": 100,
    "max": 10000,
    "category": "Instagram"
  }
]
```

---

### Place Order

Submit a new order for a service.

**Request:**
```bash
curl -X POST https://yourpanel.homeofsmm.com/api/v1 \
  -d "key=BUYER_API_KEY&action=add&service=1&link=https://instagram.com/example&quantity=1000"
```

**Response:**
```json
{
  "order": 12345
}
```

---

### Check Order Status

Get the current status of an order.

**Request:**
```bash
curl -X POST https://yourpanel.homeofsmm.com/api/v1 \
  -d "key=BUYER_API_KEY&action=status&order=12345"
```

**Response:**
```json
{
  "charge": "2.50",
  "start_count": "1000",
  "status": "In progress",
  "remains": "500",
  "currency": "USD"
}
```

---

### Check Balance

Get the buyer''s current account balance.

**Request:**
```bash
curl -X POST https://yourpanel.homeofsmm.com/api/v1 \
  -d "key=BUYER_API_KEY&action=balance"
```

**Response:**
```json
{
  "balance": "150.00",
  "currency": "USD"
}
```

---

## Error Handling

Errors are returned in the response body:

```json
{
  "error": "Incorrect request"
}
```

### Common Error Messages

| Error | Meaning |
|-------|---------|
| Invalid API key | The provided key is incorrect |
| Action is required | Missing action parameter |
| Service not found | Invalid service ID |
| Not enough balance | Insufficient funds |
| Incorrect link format | Invalid URL provided |

---

## Rate Limits

- 60 requests per minute per API key
- Bulk orders count as multiple requests

---

## Enabling Buyer API

To enable the Buyer API for your customers:

1. Go to **Settings > API Management**
2. Toggle **Enable Buyer API**
3. Configure rate limits if needed
4. Customers can find their API key in their account settings'
WHERE slug = 'buyer-api-reference' OR slug = 'api-endpoints';

-- Create or update the API comparison article
INSERT INTO public.platform_docs (title, slug, category, content, excerpt, status, order_index, read_time)
VALUES (
  'API Comparison Guide',
  'api-comparison',
  'api',
  '# Panel Owner vs Buyer API Comparison

Understanding which API to use is crucial for building the right integration. This guide explains the differences between the Panel Owner API and Buyer API.

---

## Quick Reference

| Aspect | Panel Owner API | Buyer API |
|--------|-----------------|-----------|
| **Purpose** | Panel administration | Customer transactions |
| **Users** | Panel owners, admins | Customers, resellers |
| **Endpoint** | homeofsmm.com/api/v2/panel | {panel}.homeofsmm.com/api/v1 |
| **Auth Type** | Panel API Key | Customer API Key |
| **Scope** | Full panel access | User''s own data only |

---

## Panel Owner API

### Who Should Use It

- Panel owners building custom dashboards
- Developers creating admin automation tools
- Integration with business management systems
- Monitoring and analytics applications

### Capabilities

- **Service Management:** Sync from providers, update pricing, toggle visibility
- **Order Management:** View all orders, update statuses, process refunds
- **Customer Management:** Create accounts, adjust balances, set discounts
- **Analytics:** Revenue reports, order statistics, customer metrics
- **Webhooks:** Configure event notifications

### Example: Get All Orders

```bash
curl -X POST https://homeofsmm.com/api/v2/panel \
  -H "Content-Type: application/json" \
  -d ''{"key": "PANEL_API_KEY", "action": "orders"}''
```

---

## Buyer API

### Who Should Use It

- Your customers placing orders programmatically
- Resellers automating their business
- Third-party tools integrating with your panel
- Mobile apps for your customers

### Capabilities

- **View Services:** Browse available services and prices
- **Place Orders:** Submit new orders
- **Track Orders:** Check order status and progress
- **Check Balance:** View account balance

### Example: Place an Order

```bash
curl -X POST https://yourpanel.homeofsmm.com/api/v1 \
  -d "key=CUSTOMER_API_KEY&action=add&service=1&link=https://example.com&quantity=1000"
```

---

## Authentication Differences

### Panel Owner API

```json
{
  "key": "pk_live_...",
  "action": "stats"
}
```

- Uses panel-level API key
- Generated in Settings > API Management
- Has full administrative access

### Buyer API

```
key=ck_...&action=balance
```

- Uses customer-specific API key
- Each customer has their own key
- Limited to their own account data

---

## Response Formats

### Panel Owner API

Always returns JSON with success indicator:

```json
{
  "success": true,
  "data": { ... }
}
```

### Buyer API

Returns industry-standard SMM panel format:

```json
{
  "order": 12345
}
```

Or for errors:

```json
{
  "error": "Not enough balance"
}
```

---

## Use Case Examples

### Panel Owner Scenarios

- Build a custom revenue dashboard
- Automate service price updates based on provider changes
- Create alerts for low-balance customers
- Generate monthly reports

### Buyer Scenarios

- Automate order placement from a reseller panel
- Build a mobile app for placing orders
- Create a Telegram bot for customers
- Integrate with marketing automation tools

---

## Getting Started

### For Panel Owners

1. Go to Settings > API Management
2. Generate a Panel API Key
3. Use https://homeofsmm.com/api/v2/panel
4. Include key in JSON body

### For Buyers (Your Customers)

1. Log in to their panel account
2. Find API key in Account Settings
3. Use your panel''s API endpoint
4. Include key as form parameter',
  'Learn the differences between Panel Owner API for administration and Buyer API for customer transactions',
  'published',
  2,
  '6 min'
)
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  updated_at = now();