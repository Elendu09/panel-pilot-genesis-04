ALTER TABLE orders ADD COLUMN IF NOT EXISTS drip_feed_runs integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS drip_feed_interval integer;