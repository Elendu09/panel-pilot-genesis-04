-- Add floating chat widget settings to panel_settings
ALTER TABLE panel_settings 
ADD COLUMN IF NOT EXISTS floating_chat_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS floating_chat_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS floating_chat_telegram TEXT,
ADD COLUMN IF NOT EXISTS floating_chat_position TEXT DEFAULT 'bottom-right',
ADD COLUMN IF NOT EXISTS floating_chat_message TEXT DEFAULT 'Need help? Chat with us!';