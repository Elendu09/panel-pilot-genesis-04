ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
CREATE UNIQUE INDEX IF NOT EXISTS idx_panel_domains_domain_unique ON panel_domains (domain);