-- Add User Management and Panel API documentation articles
INSERT INTO public.platform_docs (title, slug, category, content, excerpt, read_time, order_index, status, is_popular, icon)
VALUES
('Customer Management Overview', 'customer-overview', 'user-management', 
'# Customer Management Overview

Your customers are the heart of your SMM panel business. This guide covers managing customer accounts effectively.

## Understanding Customer Accounts

Every customer gets a dedicated account with balance wallet, order history, custom pricing, and referral tracking.

## Quick Actions

From the customer list you can view details, edit customer, adjust balance, set pricing, and suspend/activate accounts.

## Best Practices

1. Monitor balances for unusual activity
2. Reward VIPs with better pricing
3. Clean up inactive accounts
4. Respond quickly to support requests',
'Learn how to effectively manage your SMM panel customers.', '5 min', 1, 'published', true, 'users'),

('Adding & Editing Customers', 'adding-customers', 'user-management',
'# Adding & Editing Customers

Learn how to manually add customer accounts and edit existing information.

## Adding a New Customer

1. Click Add Customer button
2. Fill email, username, password
3. Optionally set initial balance and discount

## Editing Customers

Click any customer row to edit their email, username, discount percentage, or VIP status.',
'How to create and modify customer accounts.', '4 min', 2, 'published', false, 'users'),

('Customer Pricing & Discounts', 'customer-pricing', 'user-management',
'# Customer Pricing & Discounts

Set up custom pricing for individual customers to maximize profits and reward loyalty.

## Pricing Hierarchy

1. Service-specific custom price (highest priority)
2. Customer discount percentage
3. Default service price

## Setting Custom Prices

Open customer profile, go to Pricing tab, search for service, and enter custom price.',
'Configure custom pricing and discounts for customers.', '6 min', 3, 'published', true, 'settings'),

('Customer Balance & Deposits', 'customer-balance', 'user-management',
'# Customer Balance & Deposits

Manage customer wallet balances, process deposits, and handle refunds.

## Manual Balance Adjustments

Open customer profile, click Adjust Balance, enter amount (positive to add, negative to remove), add note, and confirm.',
'Manage customer balances and deposits.', '5 min', 4, 'published', false, 'wallet'),

('Team Management Overview', 'team-overview', 'user-management',
'# Team Management Overview

Scale your SMM panel by adding team members with specific roles and permissions.

## Team Roles

- Owner: Full access
- Admin: Full access except billing
- Manager: Orders, customers, services
- Support: Tickets and chat only
- Viewer: Read-only access',
'Introduction to team features.', '4 min', 5, 'published', true, 'users'),

('Adding Team Members', 'adding-team-members', 'user-management',
'# Adding Team Members

Invite team members to help manage your panel.

## Inviting a Team Member

1. Go to Settings > Team Management
2. Click Invite Member
3. Enter email and select role
4. Send invitation',
'How to invite and set up team members.', '4 min', 6, 'published', false, 'users'),

('Roles & Permissions', 'roles-permissions', 'user-management',
'# Roles & Permissions

Configure exactly what each team member can access.

## Permission Categories

- Dashboard: view, analytics, export
- Orders: view, create, edit, cancel
- Customers: view, create, edit, balance
- Services: view, edit, pricing, sync
- Support: tickets, chat
- Settings: general, payment, team',
'Configure granular permissions for team roles.', '7 min', 7, 'published', true, 'shield'),

('Panel Owner API Overview', 'panel-api-overview', 'api',
'# Panel Owner API Overview

Build custom applications that integrate with your SMM panel for complete management control.

## API Capabilities

- Services: list, sync, update pricing
- Orders: list, create, cancel, refill
- Customers: manage accounts and balances
- Providers: check balances, sync services
- Statistics: revenue, orders, analytics

## Base URL

https://your-panel.com/functions/v1/panel-api

## Authentication

Include your panel API key in requests.',
'Build custom integrations with the Panel Owner API.', '5 min', 10, 'published', true, 'code'),

('Panel API Authentication', 'panel-api-auth', 'api',
'# Panel API Authentication

Secure your Panel Owner API requests with API keys.

## Getting Your API Key

1. Go to Settings > API Management
2. Click Generate New Key
3. Copy and store securely

## Making Requests

Include key in request body or Authorization header.',
'Learn to authenticate Panel API requests.', '4 min', 11, 'published', false, 'shield'),

('Services Management API', 'panel-services-api', 'api',
'# Services Management API

Manage panel services via API - list, update, sync, and configure pricing.

## Actions

- services: List all services
- services.update: Modify service settings
- services.sync: Pull from provider
- services.bulk_update: Update multiple services',
'API for managing services.', '6 min', 12, 'published', false, 'code'),

('Orders Management API', 'panel-orders-api', 'api',
'# Orders Management API

Manage orders via API - list, create, update status, refill, and cancel.

## Actions

- orders: List with filters
- orders.create: Place order for customer
- orders.cancel: Cancel and refund
- orders.refill: Request refill',
'API for order management.', '7 min', 13, 'published', true, 'code'),

('Customers API', 'panel-customers-api', 'api',
'# Customers API

Manage customers via API - create accounts, adjust balances, set pricing.

## Actions

- customers: List all customers
- customers.create: Add new customer
- customers.balance: Adjust funds
- customers.pricing: Set custom prices',
'API for customer management.', '6 min', 14, 'published', false, 'users'),

('Providers API', 'panel-providers-api', 'api',
'# Providers API

Manage SMM providers - list, check balances, sync services.

## Actions

- providers: List connected providers
- providers.balance: Check balance
- providers.sync: Sync services',
'API for provider management.', '5 min', 15, 'published', false, 'link'),

('Statistics API', 'panel-stats-api', 'api',
'# Statistics API

Access panel analytics - revenue, orders, customers.

## Actions

- stats: Dashboard overview
- stats.revenue: Revenue reports
- stats.orders: Order analytics
- stats.customers: Customer metrics',
'API for panel analytics.', '6 min', 16, 'published', false, 'chart'),

('Panel Webhooks', 'panel-webhooks', 'api',
'# Panel Webhooks

Receive real-time notifications for panel events.

## Events

- order.created, order.completed
- payment.received
- customer.created
- provider.low_balance',
'Set up webhooks for real-time notifications.', '7 min', 17, 'published', true, 'webhook'),

('Buyer API Overview', 'buyer-api-overview', 'api',
'# Buyer API Overview

The Buyer API allows your customers to place orders programmatically.

## Customer Actions

- services: Get available services
- add: Place new order
- status: Check order status
- balance: Check their balance',
'API for customer order placement.', '3 min', 18, 'published', false, 'code');