-- Update API documentation with proper structure and content
-- Using separate UPDATE statements to avoid ON CONFLICT issues

-- Update Panel API Overview
UPDATE platform_docs
SET 
  content = '# Panel Owner API Overview

The Panel Owner API enables you to build custom management applications, automate workflows, and integrate with third-party tools for your SMM panel business.

## Base URL

All Panel Owner API requests use the following base URL:

```bash
https://homeofsmm.com/api/v2/panel
```

## Authentication

Every request must include your Panel API Key. You can find or generate your API key in **Settings > API Management**.

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"key": "sk_live_your_api_key", "action": "services"}''
```

## Available Actions

| Action | Description |
|--------|-------------|
| `services` | List all services in your panel |
| `services.sync` | Sync services from a provider |
| `service.update` | Update a service |
| `orders` | List all orders |
| `order` | Get single order details |
| `customers` | List all customers |
| `customer` | Get single customer |
| `customer.update` | Update customer details |
| `balance` | Get your panel balance |
| `providers` | List connected providers |
| `stats` | Get panel statistics |

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Example: List Services

```bash
curl -X POST "https://homeofsmm.com/api/v2/panel" \
  -H "Content-Type: application/json" \
  -d ''{"key": "sk_live_xxx", "action": "services"}''
```

## Rate Limits

- 100 requests per minute
- 5,000 requests per day',
  updated_at = now()
WHERE slug = 'panel-api-overview' AND category = 'api';

-- Update Buyer API Overview
UPDATE platform_docs
SET 
  content = '# Buyer API Overview

The Buyer API allows your customers to integrate their applications directly with your panel for automated order placement.

## Base URL

Each panel has its own API endpoint:

```bash
https://yourpanel.homeofsmm.com/api/v1
```

## Authentication

```bash
curl -X POST "https://yourpanel.homeofsmm.com/api/v1" \
  -H "Content-Type: application/json" \
  -d ''{"key": "API_KEY", "action": "services"}''
```

## Available Actions

| Action | Description |
|--------|-------------|
| `services` | Get list of available services |
| `add` | Place a new order |
| `status` | Check order status |
| `balance` | Get account balance |
| `refill` | Request order refill |
| `cancel` | Cancel pending orders |

## Example: Place an Order

```bash
curl -X POST "https://yourpanel.homeofsmm.com/api/v1" \
  -d ''{"key": "API_KEY", "action": "add", "service": "1", "link": "https://instagram.com/user", "quantity": 1000}''
```

Response:

```json
{"order": "ORD1234567890ABCD"}
```

## Rate Limits

- 60 requests per minute per API key',
  updated_at = now()
WHERE slug = 'buyer-api-overview' AND category = 'api';

-- Update api-overview to be clearly Buyer API focused
UPDATE platform_docs
SET 
  title = 'Buyer API Quick Start',
  content = '# Buyer API Quick Start

Get started with the Buyer API in minutes.

## Getting Your API Key

Contact your panel owner to obtain an API key.

## Base URL

```bash
https://yourpanel.homeofsmm.com/api/v1
```

## Making Your First Request

### Get Available Services

```bash
curl -X POST "https://yourpanel.homeofsmm.com/api/v1" \
  -d ''{"key": "YOUR_API_KEY", "action": "services"}''
```

### Place an Order

```bash
curl -X POST "https://yourpanel.homeofsmm.com/api/v1" \
  -d ''{"key": "API_KEY", "action": "add", "service": "1", "link": "https://instagram.com/user", "quantity": 1000}''
```

### Check Order Status

```bash
curl -X POST "https://yourpanel.homeofsmm.com/api/v1" \
  -d ''{"key": "API_KEY", "action": "status", "order": "ORD123"}''
```

## Code Examples

### PHP

```php
<?php
$url = "https://yourpanel.homeofsmm.com/api/v1";
$data = ["key" => "API_KEY", "action" => "services"];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
print_r(json_decode($response));
```

### Python

```python
import requests

url = "https://yourpanel.homeofsmm.com/api/v1"
data = {"key": "API_KEY", "action": "add", "service": "1", "link": "https://instagram.com/user", "quantity": 1000}
response = requests.post(url, json=data)
print(response.json())
```

### Node.js

```javascript
const response = await fetch("https://yourpanel.homeofsmm.com/api/v1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "API_KEY", action: "services" })
});
console.log(await response.json());
```',
  updated_at = now()
WHERE slug = 'api-overview' AND category = 'api';