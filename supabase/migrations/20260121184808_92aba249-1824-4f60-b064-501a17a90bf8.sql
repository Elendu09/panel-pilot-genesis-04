-- Insert comprehensive documentation articles
INSERT INTO platform_docs (title, slug, category, excerpt, content, icon, order_index, is_popular, read_time, seo_title, seo_description, seo_keywords, status) VALUES

-- GETTING STARTED (6 articles)
('Quick Start Guide', 'quick-start-guide', 'getting-started', 
'Get your SMM panel up and running in just 5 minutes with this quick start guide.',
'# Quick Start Guide

Welcome to HOME OF SMM! This guide will help you get your panel up and running in just 5 minutes.

## Step 1: Create Your Account

1. Visit the signup page and enter your details
2. Verify your email address
3. Complete the onboarding wizard

## Step 2: Choose Your Plan

Select a subscription plan that fits your needs:
- **Starter**: Perfect for beginners
- **Professional**: For growing businesses
- **Enterprise**: Full white-label solution

## Step 3: Configure Your Panel

1. Set your panel name and subdomain
2. Upload your logo and favicon
3. Choose your preferred theme

## Step 4: Add a Provider

Connect to an SMM provider to import services:
1. Go to Providers section
2. Enter your provider API credentials
3. Sync services

## Step 5: Customize Pricing

Set your markup to ensure profitability:
1. Navigate to Services
2. Configure global or per-service markup
3. Review buyer-facing prices

## Next Steps

- [Add Payment Methods](/docs/configuration/payment-methods)
- [Customize Your Storefront](/docs/configuration/branding-customization)
- [Invite Your First Customer](/docs/user-management/managing-customers)',
'zap', 0, true, '5 min read',
'Quick Start Guide - HOME OF SMM Documentation',
'Get your SMM panel up and running in 5 minutes with our step-by-step quick start guide.',
ARRAY['quick start', 'smm panel setup', 'getting started', 'beginner guide'], 'published'),

('Creating Your First Panel', 'creating-your-panel', 'getting-started',
'Step-by-step guide to creating and configuring your first SMM panel.',
'# Creating Your First Panel

This guide walks you through creating your first SMM panel from scratch.

## Prerequisites

Before you begin, make sure you have:
- A verified HOME OF SMM account
- An active subscription plan
- Basic information about your business

## Panel Setup Process

### 1. Access Panel Creation

After logging in, you''ll be guided through our onboarding wizard. If you''ve already completed onboarding, go to Settings > Panel Setup.

### 2. Basic Information

Enter your panel details:
- **Panel Name**: Your business name (e.g., "FastSMM")
- **Subdomain**: Your unique URL (e.g., fastsmm.homeofsmm.com)
- **Description**: Brief description of your services

### 3. Branding

Upload your branding assets:
- **Logo**: Recommended size 200x50px, PNG or SVG
- **Favicon**: 32x32px or 64x64px
- **Brand Colors**: Primary and secondary colors

### 4. Contact Information

Add your contact details:
- Support email
- Business phone (optional)
- Social media links

## Post-Setup Checklist

- [ ] Add at least one provider
- [ ] Import services
- [ ] Configure pricing
- [ ] Set up payment methods
- [ ] Test the buyer experience',
'layout-dashboard', 1, true, '8 min read',
'Creating Your First Panel - SMM Panel Setup Guide',
'Complete guide to creating and configuring your first SMM panel with HOME OF SMM.',
ARRAY['create panel', 'panel setup', 'smm panel creation', 'white label'], 'published'),

('Adding SMM Providers', 'adding-providers', 'getting-started',
'Learn how to connect SMM providers and import services to your panel.',
'# Adding SMM Providers

Providers are the backbone of your SMM panel. This guide shows you how to connect providers and import their services.

## What is a Provider?

A provider is an SMM service supplier that fulfills orders. HOME OF SMM supports integration with virtually any SMM panel API.

## Adding Your First Provider

### Step 1: Get Provider Credentials

From your provider, obtain:
- API URL (endpoint)
- API Key

### Step 2: Add Provider in Dashboard

1. Navigate to **Providers** in your panel dashboard
2. Click **Add Provider**
3. Enter the provider details:
   - Provider Name
   - API URL
   - API Key

### Step 3: Test Connection

Click "Test Connection" to verify your credentials work correctly.

### Step 4: Sync Services

After successful connection:
1. Click **Sync Services**
2. Wait for import to complete
3. Review imported services

## Managing Multiple Providers

You can add multiple providers to:
- Offer more services
- Create redundancy
- Compare pricing

## Provider Best Practices

- **Test orders first**: Always place test orders before going live
- **Monitor balances**: Set up low balance alerts
- **Regular syncs**: Re-sync services weekly to catch updates',
'server', 2, true, '6 min read',
'Adding SMM Providers - Provider Integration Guide',
'Learn how to connect SMM providers and import services to your HOME OF SMM panel.',
ARRAY['smm providers', 'api integration', 'import services', 'provider setup'], 'published'),

('Setting Up Payment Methods', 'payment-methods-setup', 'getting-started',
'Configure payment gateways to accept payments from your customers.',
'# Setting Up Payment Methods

Accept payments from customers by configuring payment gateways.

## Supported Payment Methods

HOME OF SMM supports multiple payment gateways:
- **PayPal** - Credit/Debit cards, PayPal balance
- **Stripe** - Credit/Debit cards
- **Cryptocurrency** - Bitcoin, USDT, and more
- **Manual Payments** - Bank transfer, etc.

## PayPal Setup

1. Go to **Settings > Payment Methods**
2. Select PayPal
3. Enter your PayPal email or API credentials
4. Enable and save

## Stripe Setup

1. Get your Stripe API keys from Stripe Dashboard
2. Enter Publishable Key and Secret Key
3. Configure webhook endpoint
4. Test with Stripe test mode first

## Cryptocurrency Setup

1. Choose your crypto processor (e.g., CoinGate, NOWPayments)
2. Enter API credentials
3. Select accepted cryptocurrencies
4. Configure minimum amounts

## Best Practices

- **Enable multiple methods**: More options = more sales
- **Test thoroughly**: Process test payments before going live
- **Set minimums**: Configure minimum deposit amounts
- **Auto-verification**: Enable for faster customer experience',
'credit-card', 3, false, '7 min read',
'Setting Up Payment Methods - SMM Panel Payments Guide',
'Configure payment gateways like PayPal, Stripe, and crypto for your SMM panel.',
ARRAY['payment methods', 'paypal setup', 'stripe integration', 'crypto payments'], 'published'),

('Customizing Your Storefront', 'storefront-customization', 'getting-started',
'Personalize your panel''s appearance with themes, colors, and branding.',
'# Customizing Your Storefront

Make your panel unique with custom branding and themes.

## Theme Selection

Choose from pre-built themes:
- **Default** - Clean, professional look
- **Ali Panel** - Modern gradient design
- **FLY SMM** - Bold, dynamic style
- **SMM Stay** - Minimal and elegant
- **TG Ref** - Tech-focused design

## Color Customization

Customize your brand colors:
1. Go to **Design > Customization**
2. Set Primary Color (main brand color)
3. Set Secondary Color (accents)
4. Preview changes in real-time

## Logo & Favicon

### Logo Requirements
- Format: PNG, SVG, or JPG
- Recommended size: 200x50px
- Transparent background preferred

### Favicon
- Format: ICO, PNG
- Size: 32x32px or 64x64px

## Custom CSS

For advanced customization, add custom CSS:
```css
/* Example: Custom button style */
.btn-primary {
  border-radius: 20px;
  font-weight: 600;
}
```

## Mobile Optimization

All themes are mobile-responsive, but you can:
- Preview mobile layout
- Adjust mobile-specific settings
- Test on real devices',
'palette', 4, false, '5 min read',
'Customizing Your Storefront - Panel Design Guide',
'Personalize your SMM panel with custom themes, colors, logos, and branding.',
ARRAY['storefront customization', 'panel themes', 'branding', 'design'], 'published'),

('Processing Your First Order', 'first-order', 'getting-started',
'Walk through the complete order lifecycle from customer purchase to completion.',
'# Processing Your First Order

Understand the complete order lifecycle in your SMM panel.

## Order Flow Overview

1. Customer places order
2. Payment is processed
3. Order sent to provider
4. Provider fulfills order
5. Order marked complete

## Test Order Walkthrough

### Step 1: Create Test Account

Create a buyer account to test the experience:
1. Open your panel in incognito mode
2. Register as a new user
3. Add test balance (use manual deposit)

### Step 2: Place an Order

1. Browse services
2. Select a service
3. Enter target URL
4. Enter quantity
5. Submit order

### Step 3: Monitor Order

In your admin dashboard:
1. Go to **Orders**
2. Find the new order
3. Check status updates

### Step 4: Verify Completion

Once the provider fulfills:
1. Order status changes to "Completed"
2. Customer is notified
3. Check the target URL for delivery

## Order Statuses

| Status | Description |
|--------|-------------|
| Pending | Order received, awaiting processing |
| In Progress | Order sent to provider |
| Completed | Order successfully fulfilled |
| Partial | Partially completed |
| Cancelled | Order cancelled |
| Refunded | Payment refunded |',
'shopping-cart', 5, false, '4 min read',
'Processing Your First Order - Order Management Guide',
'Learn the complete order lifecycle from customer purchase to fulfillment.',
ARRAY['order processing', 'order management', 'fulfillment', 'first order'], 'published'),

-- API REFERENCE (8 articles)
('API Overview', 'api-overview', 'api',
'Introduction to the HOME OF SMM REST API with authentication and basics.',
'# API Overview

The HOME OF SMM API allows you to integrate your panel with external systems.

## Base URL

```
https://your-panel.homeofsmm.com/api/v1
```

## Authentication

All API requests require an API key:

```bash
curl -X GET "https://your-panel.homeofsmm.com/api/v1/services" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Response Format

All responses are JSON:

```json
{
  "status": "success",
  "data": { ... }
}
```

## Error Handling

Errors return appropriate HTTP status codes:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid"
  }
}
```

## Rate Limiting

- 100 requests per minute
- Headers indicate remaining quota

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /services | List all services |
| POST | /order | Create new order |
| GET | /order/{id} | Get order status |
| GET | /balance | Check balance |
| POST | /refill | Request refill |
| POST | /cancel | Cancel order |',
'code', 0, true, '4 min read',
'API Overview - HOME OF SMM API Documentation',
'Introduction to the HOME OF SMM REST API with authentication, endpoints, and examples.',
ARRAY['api overview', 'rest api', 'api documentation', 'authentication'], 'published'),

('Services Endpoint', 'services-endpoint', 'api',
'Retrieve the list of available services from your panel API.',
'# Services Endpoint

Retrieve all available services from your panel.

## Endpoint

```
GET /api/v1/services
```

## Request

```bash
curl -X GET "https://your-panel.homeofsmm.com/api/v1/services" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Response

```json
{
  "status": "success",
  "data": [
    {
      "service": 1,
      "name": "Instagram Followers",
      "type": "Default",
      "category": "Instagram",
      "rate": "0.50",
      "min": 100,
      "max": 100000,
      "refill": true,
      "cancel": true,
      "description": "High quality Instagram followers"
    }
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| service | integer | Service ID |
| name | string | Service name |
| type | string | Service type |
| category | string | Service category |
| rate | string | Price per 1000 |
| min | integer | Minimum quantity |
| max | integer | Maximum quantity |
| refill | boolean | Refill available |
| cancel | boolean | Cancel available |

## Filtering (Optional)

```
GET /api/v1/services?category=instagram
```',
'list', 1, false, '3 min read',
'Services Endpoint - API Reference',
'API documentation for retrieving available services from your SMM panel.',
ARRAY['services api', 'get services', 'api endpoint', 'service list'], 'published'),

('Orders Endpoint', 'orders-endpoint', 'api',
'Create orders and check order status via the API.',
'# Orders Endpoint

Create new orders and check order status.

## Create Order

```
POST /api/v1/order
```

### Request Body

```json
{
  "service": 1,
  "link": "https://instagram.com/username",
  "quantity": 1000
}
```

### cURL Example

```bash
curl -X POST "https://your-panel.homeofsmm.com/api/v1/order" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d ''{"service": 1, "link": "https://instagram.com/username", "quantity": 1000}''
```

### Response

```json
{
  "status": "success",
  "data": {
    "order": 12345
  }
}
```

## Get Order Status

```
GET /api/v1/order/{id}
```

### Response

```json
{
  "status": "success",
  "data": {
    "order": 12345,
    "status": "In progress",
    "charge": "5.00",
    "start_count": 1000,
    "remains": 500
  }
}
```

## Order Status Values

| Status | Description |
|--------|-------------|
| Pending | Awaiting processing |
| In progress | Being fulfilled |
| Completed | Successfully completed |
| Partial | Partially completed |
| Cancelled | Order cancelled |
| Refunded | Payment refunded |',
'send', 2, true, '5 min read',
'Orders Endpoint - API Reference',
'API documentation for creating orders and checking order status.',
ARRAY['orders api', 'create order', 'order status', 'api endpoint'], 'published'),

('Balance Endpoint', 'balance-endpoint', 'api',
'Check your account balance via the API.',
'# Balance Endpoint

Check your current account balance.

## Endpoint

```
GET /api/v1/balance
```

## Request

```bash
curl -X GET "https://your-panel.homeofsmm.com/api/v1/balance" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Response

```json
{
  "status": "success",
  "data": {
    "balance": "150.50",
    "currency": "USD"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| balance | string | Current balance |
| currency | string | Currency code |

## Usage Notes

- Balance updates in real-time after orders
- Check balance before placing bulk orders
- Use for automated balance monitoring',
'wallet', 3, false, '2 min read',
'Balance Endpoint - API Reference',
'API documentation for checking your SMM panel account balance.',
ARRAY['balance api', 'check balance', 'api endpoint', 'account balance'], 'published'),

('Refill & Cancel', 'refill-cancel', 'api',
'Request order refills and cancellations via the API.',
'# Refill & Cancel Endpoints

Request refills for completed orders or cancel pending orders.

## Refill Order

```
POST /api/v1/refill
```

### Request

```json
{
  "order": 12345
}
```

### Response

```json
{
  "status": "success",
  "data": {
    "refill": 67890
  }
}
```

## Cancel Order

```
POST /api/v1/cancel
```

### Request

```json
{
  "order": 12345
}
```

### Response

```json
{
  "status": "success",
  "data": {
    "cancelled": true,
    "refunded": "5.00"
  }
}
```

## Important Notes

### Refill
- Only available for refill-enabled services
- Must be within refill period
- Original order must be completed

### Cancel
- Only available for cancel-enabled services
- Order must be pending or in progress
- Partial refunds may apply',
'refresh-cw', 4, false, '3 min read',
'Refill & Cancel Endpoints - API Reference',
'API documentation for requesting refills and cancelling orders.',
ARRAY['refill api', 'cancel order', 'api endpoint', 'order refill'], 'published'),

('Webhooks Guide', 'webhooks-guide', 'api',
'Set up webhooks to receive real-time order status updates.',
'# Webhooks Guide

Receive real-time notifications when order statuses change.

## Setting Up Webhooks

1. Go to **Settings > API > Webhooks**
2. Enter your webhook URL
3. Select events to receive
4. Save and test

## Webhook Payload

```json
{
  "event": "order.completed",
  "timestamp": "2025-01-20T10:30:00Z",
  "data": {
    "order_id": 12345,
    "status": "completed",
    "start_count": 1000,
    "remains": 0
  }
}
```

## Event Types

| Event | Description |
|-------|-------------|
| order.created | New order placed |
| order.started | Order processing started |
| order.completed | Order completed |
| order.partial | Order partially completed |
| order.cancelled | Order cancelled |
| order.refunded | Order refunded |

## Webhook Security

Verify webhook signatures:

```php
$signature = hash_hmac(''sha256'', $payload, $secret);
if ($signature !== $_SERVER[''HTTP_X_WEBHOOK_SIGNATURE'']) {
    http_response_code(401);
    exit;
}
```

## Retry Policy

- Failed webhooks retry 3 times
- Exponential backoff (1min, 5min, 30min)
- Check webhook logs for failures',
'webhook', 5, false, '5 min read',
'Webhooks Guide - Real-time Order Updates',
'Set up webhooks to receive real-time notifications for order status changes.',
ARRAY['webhooks', 'real-time updates', 'order notifications', 'api webhooks'], 'published'),

('Rate Limiting', 'rate-limiting', 'api',
'Understanding and working with API rate limits.',
'# Rate Limiting

Understanding API rate limits and best practices.

## Default Limits

| Endpoint | Limit |
|----------|-------|
| All endpoints | 100 requests/minute |
| Bulk endpoints | 10 requests/minute |

## Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705751400
```

## Handling Rate Limits

When exceeded, you receive:

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 45
  }
}
```

HTTP Status: `429 Too Many Requests`

## Best Practices

1. **Implement backoff**: Wait before retrying
2. **Cache responses**: Store service lists locally
3. **Batch requests**: Use bulk endpoints when available
4. **Monitor headers**: Track remaining quota

## Code Example

```javascript
async function apiRequest(endpoint, retries = 3) {
  try {
    const response = await fetch(endpoint);
    if (response.status === 429) {
      const retryAfter = response.headers.get(''Retry-After'');
      await sleep(retryAfter * 1000);
      return apiRequest(endpoint, retries - 1);
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return apiRequest(endpoint, retries - 1);
    }
    throw error;
  }
}
```',
'gauge', 6, false, '4 min read',
'Rate Limiting - API Best Practices',
'Understanding API rate limits and implementing best practices for reliable integration.',
ARRAY['rate limiting', 'api limits', 'throttling', 'best practices'], 'published'),

('Error Codes Reference', 'error-codes', 'api',
'Complete list of API error codes and their solutions.',
'# Error Codes Reference

Complete reference of API error codes and solutions.

## Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Authentication Errors

| Code | HTTP | Description | Solution |
|------|------|-------------|----------|
| INVALID_API_KEY | 401 | API key is invalid | Check your API key |
| EXPIRED_API_KEY | 401 | API key has expired | Generate new key |
| MISSING_API_KEY | 401 | No API key provided | Include Authorization header |

## Order Errors

| Code | HTTP | Description | Solution |
|------|------|-------------|----------|
| INVALID_SERVICE | 400 | Service ID not found | Check service list |
| INVALID_LINK | 400 | Link format is invalid | Verify URL format |
| QUANTITY_TOO_LOW | 400 | Below minimum | Increase quantity |
| QUANTITY_TOO_HIGH | 400 | Above maximum | Decrease quantity |
| INSUFFICIENT_BALANCE | 402 | Not enough balance | Add funds |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down | Try again later |

## Refill/Cancel Errors

| Code | HTTP | Description | Solution |
|------|------|-------------|----------|
| ORDER_NOT_FOUND | 404 | Order doesn''t exist | Check order ID |
| REFILL_NOT_AVAILABLE | 400 | Service has no refill | N/A |
| CANCEL_NOT_AVAILABLE | 400 | Cannot cancel | Check order status |
| ALREADY_REFILLED | 400 | Refill already requested | Wait for completion |

## Rate Limiting

| Code | HTTP | Description | Solution |
|------|------|-------------|----------|
| RATE_LIMIT_EXCEEDED | 429 | Too many requests | Wait and retry |',
'alert-triangle', 7, false, '4 min read',
'Error Codes Reference - API Troubleshooting',
'Complete reference of API error codes with descriptions and solutions.',
ARRAY['error codes', 'api errors', 'troubleshooting', 'error reference'], 'published'),

-- INTEGRATION (4 articles)
('Provider Integration Guide', 'provider-integration', 'integration',
'Complete guide to integrating SMM providers with your panel.',
'# Provider Integration Guide

Connect SMM providers to offer services on your panel.

## Supported Providers

HOME OF SMM works with any SMM panel that uses the standard SMM API format.

## Integration Steps

### 1. Obtain API Credentials

From your provider:
- API URL (usually ends with /api/v2)
- API Key (keep this secret!)

### 2. Add Provider

1. Navigate to **Providers**
2. Click **Add Provider**
3. Fill in details:
   - Name: Friendly name for reference
   - API URL: Provider''s API endpoint
   - API Key: Your API key

### 3. Test Connection

Click **Test Connection** to verify:
- API responds correctly
- Credentials are valid
- Balance can be retrieved

### 4. Import Services

After successful connection:
1. Click **Sync Services**
2. Wait for import (may take a few minutes)
3. Review imported services

## Service Mapping

Imported services include:
- Service ID (from provider)
- Name and description
- Category
- Min/Max quantities
- Provider price

## Multi-Provider Setup

Benefits of multiple providers:
- More service variety
- Backup for downtime
- Price comparison

## Troubleshooting

### Connection Failed
- Verify API URL format
- Check API key validity
- Ensure provider is online

### No Services Imported
- Provider may have no active services
- API format may differ
- Contact provider support',
'plug', 0, true, '7 min read',
'Provider Integration Guide - SMM Provider Setup',
'Complete guide to integrating SMM providers with your HOME OF SMM panel.',
ARRAY['provider integration', 'smm provider', 'api integration', 'provider setup'], 'published'),

('Payment Gateway Setup', 'payment-gateway-setup', 'integration',
'Configure payment processors to accept customer payments.',
'# Payment Gateway Setup

Set up payment processors to accept payments from your customers.

## Available Gateways

### PayPal
- Accept PayPal and cards
- Instant payments
- Worldwide availability

### Stripe
- Credit/Debit cards
- Apple Pay, Google Pay
- 135+ currencies

### Cryptocurrency
- Bitcoin, USDT, ETH
- Lower fees
- No chargebacks

## PayPal Configuration

1. **Get API Credentials**
   - Log in to PayPal Developer
   - Create REST API app
   - Copy Client ID and Secret

2. **Configure in Panel**
   - Go to Settings > Payment Methods
   - Select PayPal
   - Enter credentials
   - Set sandbox/live mode

3. **Webhook Setup**
   - Create webhook in PayPal
   - Point to your callback URL
   - Select relevant events

## Stripe Configuration

1. **Get API Keys**
   - Stripe Dashboard > Developers > API keys
   - Copy Publishable and Secret keys

2. **Add to Panel**
   - Enter keys in payment settings
   - Configure webhook endpoint

3. **Test Mode**
   - Use test keys first
   - Test with Stripe test cards

## Best Practices

- Enable multiple payment methods
- Set reasonable minimums
- Test before going live
- Monitor for failed payments',
'credit-card', 1, false, '8 min read',
'Payment Gateway Setup - Accept Customer Payments',
'Configure PayPal, Stripe, and cryptocurrency payment processors for your SMM panel.',
ARRAY['payment gateway', 'paypal setup', 'stripe', 'cryptocurrency payments'], 'published'),

('Custom Domain Configuration', 'custom-domain', 'integration',
'Set up a custom domain for your SMM panel.',
'# Custom Domain Configuration

Use your own domain instead of a subdomain.

## Overview

Replace `yourpanel.homeofsmm.com` with `yourpanel.com`.

## Prerequisites

- A registered domain name
- Access to DNS settings
- Active subscription (Professional or higher)

## Setup Steps

### 1. Add Domain

1. Go to **Settings > Domain**
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `yourpanel.com`)

### 2. Configure DNS

Add these DNS records at your registrar:

**For root domain (yourpanel.com):**
```
Type: A
Name: @
Value: [IP provided in dashboard]
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: yourpanel.homeofsmm.com
```

### 3. Verify Domain

1. Click **Verify Domain**
2. Wait for DNS propagation (up to 48 hours)
3. Verification status will update

### 4. SSL Certificate

SSL is automatically provisioned:
- Certificate issued within minutes
- Auto-renewed before expiry
- Enforced HTTPS

## Troubleshooting

### Domain Not Verifying
- Check DNS records are correct
- Wait for propagation (use dnschecker.org)
- Ensure no conflicting records

### SSL Not Working
- Domain must verify first
- Clear browser cache
- Wait up to 24 hours',
'globe', 2, false, '6 min read',
'Custom Domain Configuration - Domain Setup Guide',
'Set up a custom domain for your SMM panel with SSL certificate.',
ARRAY['custom domain', 'dns setup', 'ssl certificate', 'domain configuration'], 'published'),

('Webhook Configuration', 'webhook-configuration', 'integration',
'Set up webhooks for real-time notifications and integrations.',
'# Webhook Configuration

Receive real-time notifications for panel events.

## What Are Webhooks?

Webhooks send HTTP POST requests to your URL when events occur, enabling:
- Real-time order tracking
- External integrations
- Automated workflows

## Setting Up Webhooks

### 1. Create Webhook Endpoint

Your server needs an endpoint to receive webhooks:

```php
<?php
$payload = file_get_contents(''php://input'');
$data = json_decode($payload, true);

// Verify signature
$signature = hash_hmac(''sha256'', $payload, ''your_secret'');
if ($signature !== $_SERVER[''HTTP_X_WEBHOOK_SIGNATURE'']) {
    http_response_code(401);
    exit(''Invalid signature'');
}

// Process event
switch ($data[''event'']) {
    case ''order.completed'':
        // Handle completed order
        break;
}

http_response_code(200);
```

### 2. Register in Panel

1. Go to **Settings > Webhooks**
2. Enter your endpoint URL
3. Generate or set a secret key
4. Select events to receive

### 3. Test Webhook

Use the "Send Test" button to verify setup.

## Available Events

| Event | Trigger |
|-------|---------|
| order.created | New order placed |
| order.completed | Order finished |
| order.cancelled | Order cancelled |
| payment.received | Payment confirmed |
| user.registered | New user signup |

## Security

- Always verify signatures
- Use HTTPS endpoints
- Validate payload structure
- Implement idempotency',
'webhook', 3, false, '6 min read',
'Webhook Configuration - Real-time Integrations',
'Set up webhooks for real-time notifications and external integrations.',
ARRAY['webhooks', 'real-time', 'integrations', 'notifications'], 'published'),

-- CONFIGURATION (4 articles)
('Panel Settings Overview', 'panel-settings', 'configuration',
'Complete overview of all panel configuration options.',
'# Panel Settings Overview

Configure every aspect of your SMM panel.

## General Settings

### Basic Information
- **Panel Name**: Displayed in header and title
- **Description**: Used for SEO
- **Contact Email**: Support contact

### Localization
- **Timezone**: For timestamps
- **Default Language**: UI language
- **Currency**: Display currency

## Appearance

### Branding
- Logo (header)
- Favicon
- Brand colors

### Theme
- Select theme template
- Customize colors
- Custom CSS

## Security Settings

### Authentication
- Password requirements
- Session timeout
- Two-factor auth

### API Security
- Rate limiting
- IP whitelisting
- API key rotation

## Notification Settings

### Email
- SMTP configuration
- Email templates
- Notification triggers

### In-App
- Browser notifications
- Alert preferences

## Payment Settings

- Gateway configuration
- Minimum deposits
- Payment verification

## SEO Settings

- Meta titles
- Descriptions
- Open Graph tags
- Robots.txt
- Sitemap',
'settings', 0, false, '5 min read',
'Panel Settings Overview - Complete Configuration Guide',
'Complete overview of all SMM panel configuration options and settings.',
ARRAY['panel settings', 'configuration', 'settings overview', 'admin settings'], 'published'),

('Branding Customization', 'branding-customization', 'configuration',
'Customize your panel''s look with logos, colors, and themes.',
'# Branding Customization

Make your panel uniquely yours with custom branding.

## Logo Setup

### Primary Logo
- **Size**: 200x50px recommended
- **Format**: PNG, SVG, or JPG
- **Background**: Transparent preferred

### Favicon
- **Size**: 32x32px or 64x64px
- **Format**: ICO or PNG
- **Purpose**: Browser tab icon

## Color Scheme

### Primary Color
Your main brand color used for:
- Buttons
- Links
- Highlights
- Accents

### Secondary Color
Supporting color for:
- Hover states
- Gradients
- Secondary elements

### Setting Colors

1. Go to **Design > Customization**
2. Use color picker or enter HEX code
3. Preview changes live
4. Save when satisfied

## Theme Selection

### Available Themes
- **Default**: Clean and professional
- **Ali Panel**: Modern with gradients
- **FLY SMM**: Bold and dynamic
- **SMM Stay**: Minimal and elegant
- **TG Ref**: Tech-focused

### Customizing Themes
Each theme supports:
- Color overrides
- Font changes
- Layout adjustments

## Custom CSS

For advanced customization:

```css
/* Custom button styling */
.btn-primary {
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Custom header */
header {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
```',
'palette', 1, false, '5 min read',
'Branding Customization - Panel Design Guide',
'Customize your SMM panel with logos, colors, themes, and custom CSS.',
ARRAY['branding', 'customization', 'themes', 'design', 'colors'], 'published'),

('SEO Configuration', 'seo-configuration', 'configuration',
'Optimize your panel for search engines with meta tags and sitemaps.',
'# SEO Configuration

Improve your panel''s visibility in search engines.

## Meta Tags

### Title Tag
- Keep under 60 characters
- Include main keyword
- Brand name at end

```html
<title>Buy Instagram Followers | YourPanel</title>
```

### Meta Description
- 150-160 characters
- Include call to action
- Relevant keywords

```html
<meta name="description" content="Buy Instagram followers, likes, and views. Fast delivery, 24/7 support. Starting at $0.01 per 1000.">
```

## Open Graph Tags

For social media sharing:

```html
<meta property="og:title" content="YourPanel - SMM Services">
<meta property="og:description" content="...">
<meta property="og:image" content="https://...">
```

## Sitemap

Auto-generated sitemap includes:
- Homepage
- Service pages
- Category pages
- Blog posts

Access at: `yourpanel.com/sitemap.xml`

## Robots.txt

Control crawler access:

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Sitemap: https://yourpanel.com/sitemap.xml
```

## Best Practices

1. Unique titles per page
2. Descriptive URLs
3. Fast page load
4. Mobile-friendly design
5. Quality content
6. Internal linking',
'search', 2, false, '6 min read',
'SEO Configuration - Search Engine Optimization',
'Optimize your SMM panel for search engines with meta tags, sitemaps, and best practices.',
ARRAY['seo', 'search engine optimization', 'meta tags', 'sitemap'], 'published'),

('Security Settings', 'security-settings', 'configuration',
'Configure security features to protect your panel and users.',
'# Security Settings

Protect your panel and users with robust security measures.

## Password Policy

Configure requirements:
- Minimum length (8+ recommended)
- Require uppercase
- Require numbers
- Require special characters

## Two-Factor Authentication

Enable 2FA options:
- TOTP (Google Authenticator)
- Email verification
- SMS codes (coming soon)

## Session Security

### Session Timeout
- Set idle timeout (default: 30 min)
- Force re-login for sensitive actions

### Session Management
- View active sessions
- Revoke sessions remotely
- Single device mode option

## API Security

### Rate Limiting
- Requests per minute
- Burst allowance
- IP-based limits

### IP Whitelisting
- Restrict API to specific IPs
- Useful for server-to-server

### Key Rotation
- Regular key rotation
- Revoke compromised keys
- Key expiration dates

## Admin Security

### Admin IP Restriction
- Limit admin access to specific IPs

### Audit Logging
- Track admin actions
- Login attempts
- Setting changes

## SSL/TLS

- Automatic SSL provisioning
- Force HTTPS redirects
- HSTS enabled

## Best Practices

1. Strong admin passwords
2. Enable 2FA for admins
3. Regular security audits
4. Monitor suspicious activity
5. Keep software updated',
'shield', 3, false, '7 min read',
'Security Settings - Panel Security Configuration',
'Configure security features including passwords, 2FA, sessions, and API security.',
ARRAY['security', '2fa', 'password policy', 'session security', 'ssl'], 'published'),

-- TROUBLESHOOTING (3 articles)
('Common Issues & Solutions', 'common-issues', 'troubleshooting',
'Solutions to the most frequently encountered problems.',
'# Common Issues & Solutions

Quick fixes for the most common problems.

## Order Issues

### Orders Stuck on Pending
**Cause**: Provider not responding or insufficient balance

**Solutions**:
1. Check provider status
2. Verify provider balance
3. Re-sync services
4. Contact provider support

### Order Shows Wrong Status
**Cause**: Status not syncing from provider

**Solutions**:
1. Click "Refresh Status"
2. Check provider dashboard
3. Wait 5 minutes and check again

## Payment Issues

### Payment Not Credited
**Cause**: Webhook not received or processed

**Solutions**:
1. Check payment gateway dashboard
2. Verify webhook configuration
3. Check server logs for errors
4. Manually add balance if confirmed

### Gateway Connection Error
**Cause**: Invalid credentials or gateway downtime

**Solutions**:
1. Verify API credentials
2. Check gateway status page
3. Test with sandbox mode

## Service Issues

### Services Not Loading
**Cause**: Provider sync failed

**Solutions**:
1. Re-sync from provider
2. Check provider status
3. Clear browser cache

### Prices Show $0
**Cause**: Markup not configured

**Solutions**:
1. Set global markup
2. Configure per-service prices
3. Check pricing rules

## Account Issues

### Cannot Log In
**Solutions**:
1. Reset password
2. Check email for verification
3. Clear cookies
4. Try incognito mode

### 2FA Not Working
**Solutions**:
1. Check phone time sync
2. Use backup codes
3. Contact admin for reset',
'help-circle', 0, true, '8 min read',
'Common Issues & Solutions - Troubleshooting Guide',
'Quick solutions to the most frequently encountered SMM panel problems.',
ARRAY['troubleshooting', 'common issues', 'solutions', 'faq'], 'published'),

('API Error Reference', 'api-errors', 'troubleshooting',
'Detailed explanations and fixes for all API errors.',
'# API Error Reference

Understand and resolve API errors quickly.

## Error Format

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```

## Authentication Errors

### INVALID_API_KEY
Your API key is incorrect or disabled.

**Fix**:
- Copy key exactly (no extra spaces)
- Check key is active in settings
- Generate new key if needed

### UNAUTHORIZED
Request lacks valid authentication.

**Fix**:
- Include Authorization header
- Format: `Bearer YOUR_API_KEY`

## Request Errors

### INVALID_SERVICE
Service ID doesn''t exist.

**Fix**:
- Re-fetch services list
- Use correct service ID
- Service may have been removed

### INVALID_LINK
URL format is incorrect.

**Fix**:
- Use full URL with https://
- Ensure URL is accessible
- Check for special characters

### QUANTITY_OUT_OF_RANGE
Quantity below min or above max.

**Fix**:
- Check service min/max
- Adjust quantity accordingly

## Payment Errors

### INSUFFICIENT_BALANCE
Account balance too low.

**Fix**:
- Add funds to account
- Check order cost

## Server Errors

### INTERNAL_ERROR
Something went wrong on our end.

**Fix**:
- Wait and retry
- Contact support if persists

### SERVICE_UNAVAILABLE
Temporary maintenance.

**Fix**:
- Wait a few minutes
- Check status page',
'alert-circle', 1, false, '5 min read',
'API Error Reference - Error Codes & Fixes',
'Detailed explanations and fixes for all SMM panel API errors.',
ARRAY['api errors', 'error codes', 'troubleshooting', 'api reference'], 'published'),

('Frequently Asked Questions', 'faq', 'troubleshooting',
'Answers to the most commonly asked questions.',
'# Frequently Asked Questions

Quick answers to common questions.

## General Questions

### What is HOME OF SMM?
HOME OF SMM is a white-label SMM panel platform that allows you to create and run your own social media marketing business.

### How quickly can I get started?
You can have your panel running in under 5 minutes with our quick setup wizard.

### Do I need technical knowledge?
No! Our platform is designed to be user-friendly. No coding required.

## Pricing & Billing

### What are the subscription costs?
We offer multiple plans starting from $29/month. Visit our pricing page for details.

### Can I change plans?
Yes, upgrade or downgrade anytime. Changes apply immediately.

### What payment methods do you accept?
We accept PayPal, credit cards, and cryptocurrency.

## Services & Providers

### Where do services come from?
Services come from SMM providers you connect. You can use any provider with a compatible API.

### How do I set my prices?
Configure a global markup or set individual prices per service in your dashboard.

### What if a provider goes down?
Add multiple providers for redundancy. Orders can be routed to backup providers.

## Technical Questions

### Can I use my own domain?
Yes! Custom domains are supported on Professional plans and above.

### Is there an API?
Yes, we provide a full REST API for automation and integration.

### How secure is my data?
We use encryption, secure servers, and follow industry best practices.

## Support

### How do I get help?
Contact our support team via the dashboard or email support@homeofsmm.com.

### What are support hours?
Our team is available 24/7 for urgent issues.',
'message-circle', 2, true, '6 min read',
'Frequently Asked Questions - FAQ',
'Answers to the most commonly asked questions about HOME OF SMM.',
ARRAY['faq', 'frequently asked questions', 'help', 'support'], 'published');
