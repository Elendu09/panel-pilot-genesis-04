-- Update Panel Owner API documentation with comprehensive content using homeofsmm.com domain

-- 1. Panel API Overview
UPDATE platform_docs SET 
  content = '# Panel Owner API Overview

Build custom applications that integrate with your SMM panel for complete management control.

## Base URL

All Panel Owner API requests go through your main brand domain:

```
https://homeofsmm.com/api/v2/panel
```

## API Capabilities

The Panel Owner API provides full control over your panel:

- **Services**: List, sync from providers, update pricing, enable/disable
- **Orders**: List all orders, create on behalf of customers, cancel, refill
- **Customers**: Manage accounts, adjust balances, set custom pricing
- **Providers**: Check balances, sync services, manage connections
- **Statistics**: Revenue reports, order analytics, customer metrics

## Quick Example

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "pk_live_xxxx", "action": "services"}''
```

## Panel API vs Buyer API

| Feature | Panel Owner API | Buyer API |
|---------|-----------------|-----------|
| Base URL | homeofsmm.com/api/v2/panel | {tenant}.homeofsmm.com/api/v1 |
| Purpose | Panel management | Customer order placement |
| Access | Panel owners only | Panel customers |
| Scope | Full admin control | Limited to own account |

## Available Actions

- `services` - List and manage services
- `orders` - Manage all orders
- `customers` - Manage customer accounts
- `providers` - Manage provider connections
- `stats` - Get analytics data
- `balance` - Check provider balances

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

## Error Handling

```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "AUTH_FAILED"
}
```

## Rate Limits

- 100 requests per minute
- 5,000 requests per day
- Exceeded limits return HTTP 429',
  excerpt = 'Complete API reference for building custom panel management applications',
  updated_at = now()
WHERE slug = 'panel-api-overview';

-- 2. Panel API Authentication
UPDATE platform_docs SET 
  content = '# Panel API Authentication

Secure authentication for Panel Owner API access.

## Getting Your API Key

1. Log in to your HOME OF SMM panel owner dashboard
2. Navigate to **Settings > API Management**
3. Click **Generate New Key**
4. Copy and store the key securely

> [!WARNING]
> Your API key grants full access to your panel. Never expose it in client-side code or public repositories.

## Authentication Method

Include your API key in every request body:

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "pk_live_xxxxxxxxxxxx", "action": "services"}''
```

## Example Request (Python)

```python
import requests

response = requests.post(
    "https://homeofsmm.com/api/v2/panel",
    json={
        "api_key": "pk_live_xxxxxxxxxxxx",
        "action": "services"
    }
)
print(response.json())
```

## Example Request (PHP)

```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://homeofsmm.com/api/v2/panel");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "api_key" => "pk_live_xxxxxxxxxxxx",
    "action" => "services"
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
```

## Security Best Practices

- Store keys in environment variables, not code
- Rotate keys periodically via Settings > Regenerate
- Use IP whitelisting for production
- Monitor API logs for unauthorized access

## Authentication Errors

| Error Code | Description |
|------------|-------------|
| AUTH_FAILED | Invalid or missing API key |
| KEY_EXPIRED | API key has been revoked |
| IP_BLOCKED | Request from non-whitelisted IP |',
  excerpt = 'How to authenticate and secure your Panel Owner API requests',
  updated_at = now()
WHERE slug = 'panel-api-auth';

-- 3. Panel Services API
UPDATE platform_docs SET 
  content = '# Panel Services API

Manage your panel services programmatically.

## List All Services

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "services"}''
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "svc_123",
      "name": "Instagram Followers",
      "category": "Instagram",
      "price_per_1000": 2.50,
      "min_quantity": 100,
      "max_quantity": 100000,
      "is_active": true
    }
  ]
}
```

## Get Single Service

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "service", "service_id": "svc_123"}''
```

## Update Service Pricing

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "update_service",
    "service_id": "svc_123",
    "price_per_1000": 3.00,
    "is_active": true
  }''
```

## Sync Services from Provider

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "sync_services",
    "provider_id": "prov_456"
  }''
```

## Bulk Update Services

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "bulk_update_services",
    "services": [
      {"id": "svc_123", "markup_percent": 50},
      {"id": "svc_456", "markup_percent": 40}
    ]
  }''
```

## Service Categories

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "categories"}''
```

> [!TIP]
> Use the bulk update endpoint when changing prices for multiple services to avoid rate limits.',
  excerpt = 'List, update, and sync services through the Panel Owner API',
  updated_at = now()
WHERE slug = 'panel-services-api';

-- 4. Panel Orders API
UPDATE platform_docs SET 
  content = '# Panel Orders API

Monitor and manage all orders across your panel.

## List All Orders

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "orders",
    "limit": 100,
    "offset": 0
  }''
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_789",
      "order_number": "ORD-2026-001234",
      "customer_id": "cust_456",
      "service_id": "svc_123",
      "quantity": 1000,
      "price": 2.50,
      "status": "completed",
      "target_url": "https://instagram.com/example",
      "created_at": "2026-01-22T08:00:00Z"
    }
  ],
  "total": 1543
}
```

## Filter Orders

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "orders",
    "status": "pending",
    "customer_id": "cust_456",
    "date_from": "2026-01-01",
    "date_to": "2026-01-31"
  }''
```

## Get Order Details

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "order", "order_id": "ord_789"}''
```

## Create Order (on behalf of customer)

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "create_order",
    "customer_id": "cust_456",
    "service_id": "svc_123",
    "quantity": 1000,
    "target_url": "https://instagram.com/example"
  }''
```

## Cancel Order

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "cancel_order", "order_id": "ord_789"}''
```

## Refill Order

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "refill_order", "order_id": "ord_789"}''
```

## Order Status Codes

| Status | Description |
|--------|-------------|
| pending | Order received, awaiting processing |
| processing | Order sent to provider |
| in_progress | Delivery in progress |
| completed | Successfully delivered |
| partial | Partially delivered |
| cancelled | Order cancelled |
| refunded | Order refunded |',
  excerpt = 'Monitor, create, and manage orders through the Panel Owner API',
  updated_at = now()
WHERE slug = 'panel-orders-api';

-- 5. Panel Customers API
UPDATE platform_docs SET 
  content = '# Panel Customers API

Manage customer accounts, balances, and custom pricing.

## List All Customers

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "customers",
    "limit": 50,
    "offset": 0
  }''
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_456",
      "email": "customer@example.com",
      "username": "johndoe",
      "balance": 150.00,
      "total_spent": 2500.00,
      "is_vip": true,
      "custom_discount": 10,
      "created_at": "2025-06-15T10:00:00Z"
    }
  ],
  "total": 523
}
```

## Get Customer Details

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "customer", "customer_id": "cust_456"}''
```

## Add Balance to Customer

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "add_balance",
    "customer_id": "cust_456",
    "amount": 50.00,
    "note": "Manual deposit"
  }''
```

## Deduct Balance

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "deduct_balance",
    "customer_id": "cust_456",
    "amount": 25.00,
    "note": "Refund adjustment"
  }''
```

## Set Custom Discount

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "set_discount",
    "customer_id": "cust_456",
    "discount_percent": 15
  }''
```

## Set VIP Status

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "set_vip",
    "customer_id": "cust_456",
    "is_vip": true
  }''
```

## Ban/Unban Customer

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "ban_customer",
    "customer_id": "cust_456",
    "reason": "Terms violation"
  }''
```

> [!TIP]
> Use bulk operations for updating multiple customers at once to improve efficiency.',
  excerpt = 'Manage customer accounts, balances, and permissions via API',
  updated_at = now()
WHERE slug = 'panel-customers-api';

-- 6. Panel Providers API
UPDATE platform_docs SET 
  content = '# Panel Providers API

Manage provider connections, sync services, and check balances.

## List Providers

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "providers"}''
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prov_123",
      "name": "Provider A",
      "api_url": "https://provider-a.com/api/v2",
      "balance": 500.00,
      "is_active": true,
      "services_count": 245,
      "last_sync": "2026-01-22T06:00:00Z"
    }
  ]
}
```

## Check Provider Balance

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "provider_balance", "provider_id": "prov_123"}''
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 500.00,
    "currency": "USD"
  }
}
```

## Sync Provider Services

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "sync_provider",
    "provider_id": "prov_123"
  }''
```

**Response:**
```json
{
  "success": true,
  "data": {
    "new_services": 12,
    "updated_services": 45,
    "removed_services": 3
  }
}
```

## Add New Provider

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "add_provider",
    "name": "New Provider",
    "api_url": "https://newprovider.com/api/v2",
    "api_key": "provider_api_key_here"
  }''
```

## Update Provider

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "update_provider",
    "provider_id": "prov_123",
    "is_active": false
  }''
```

## Delete Provider

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "delete_provider", "provider_id": "prov_123"}''
```

> [!WARNING]
> Deleting a provider will not delete associated services but will mark them as orphaned.',
  excerpt = 'Connect and manage SMM service providers via API',
  updated_at = now()
WHERE slug = 'panel-providers-api';

-- 7. Panel Statistics API
UPDATE platform_docs SET 
  content = '# Panel Statistics API

Access revenue reports, order analytics, and customer metrics.

## Get Dashboard Statistics

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "stats"}''
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": 156,
      "revenue": 1250.50,
      "new_customers": 12
    },
    "month": {
      "orders": 4523,
      "revenue": 35600.00,
      "new_customers": 234
    },
    "total": {
      "orders": 125000,
      "revenue": 850000.00,
      "customers": 5234
    }
  }
}
```

## Revenue Report (Date Range)

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "revenue_report",
    "date_from": "2026-01-01",
    "date_to": "2026-01-31",
    "group_by": "day"
  }''
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"date": "2026-01-01", "revenue": 1200.00, "orders": 145},
    {"date": "2026-01-02", "revenue": 1450.00, "orders": 167}
  ]
}
```

## Top Services Report

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "top_services",
    "limit": 10,
    "period": "month"
  }''
```

## Top Customers Report

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "top_customers",
    "limit": 10,
    "period": "month"
  }''
```

## Order Status Breakdown

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "order_status_stats",
    "date_from": "2026-01-01",
    "date_to": "2026-01-31"
  }''
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completed": 4200,
    "pending": 123,
    "processing": 89,
    "cancelled": 45,
    "refunded": 66
  }
}
```

> [!TIP]
> Use the group_by parameter (day, week, month) for time-series data visualization.',
  excerpt = 'Access analytics, revenue reports, and performance metrics',
  updated_at = now()
WHERE slug = 'panel-stats-api';

-- 8. Panel Webhooks
UPDATE platform_docs SET 
  content = '# Panel Webhooks

Receive real-time notifications for panel events.

## Webhook Overview

Webhooks notify your application when events occur in your panel. Configure endpoints to receive POST requests with event data.

## Setting Up Webhooks

1. Go to **Settings > Webhooks** in your panel dashboard
2. Click **Add Webhook**
3. Enter your endpoint URL
4. Select events to subscribe to
5. Copy the signing secret

## Webhook Events

| Event | Description |
|-------|-------------|
| order.created | New order placed |
| order.completed | Order finished |
| order.cancelled | Order cancelled |
| order.refunded | Order refunded |
| customer.created | New customer registered |
| customer.deposit | Customer added funds |
| balance.low | Provider balance low |

## Webhook Payload

```json
{
  "event": "order.completed",
  "timestamp": "2026-01-22T08:30:00Z",
  "data": {
    "order_id": "ord_789",
    "order_number": "ORD-2026-001234",
    "customer_id": "cust_456",
    "service_id": "svc_123",
    "quantity": 1000,
    "status": "completed"
  }
}
```

## Verifying Webhooks

Verify webhook signatures to ensure authenticity:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

```php
function verifyWebhook($payload, $signature, $secret) {
    $expected = hash_hmac(''sha256'', $payload, $secret);
    return hash_equals($expected, $signature);
}
```

## Webhook via API

Create webhook programmatically:

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{
    "api_key": "YOUR_KEY",
    "action": "create_webhook",
    "url": "https://yoursite.com/webhook",
    "events": ["order.created", "order.completed"]
  }''
```

## List Webhooks

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "webhooks"}''
```

## Delete Webhook

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"api_key": "YOUR_KEY", "action": "delete_webhook", "webhook_id": "wh_123"}''
```

> [!WARNING]
> Your webhook endpoint must respond with HTTP 200 within 30 seconds or the delivery will be marked as failed.',
  excerpt = 'Configure real-time event notifications for your panel',
  updated_at = now()
WHERE slug = 'panel-webhooks';