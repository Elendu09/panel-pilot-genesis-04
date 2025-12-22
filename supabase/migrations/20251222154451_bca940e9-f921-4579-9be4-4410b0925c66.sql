-- Activate the istock panel to 'active' status
UPDATE panels 
SET status = 'active', 
    is_approved = true,
    updated_at = now()
WHERE subdomain = 'istock';