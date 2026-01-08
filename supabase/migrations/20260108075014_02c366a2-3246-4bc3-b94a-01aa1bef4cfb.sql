-- =====================================================
-- PART 1: PAYMENT INVOICES MODULE
-- =====================================================

-- Create invoices table for storing all invoice data
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES client_users(id) ON DELETE SET NULL,
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('panel_funding', 'buyer_funding', 'order')),
  payment_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Amount fields
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Immutable snapshots at invoice creation time
  company_snapshot JSONB NOT NULL DEFAULT '{}',
  customer_snapshot JSONB NOT NULL DEFAULT '{}',
  
  -- Invoice details
  line_items JSONB NOT NULL DEFAULT '[]',
  payment_method TEXT,
  notes TEXT,
  
  -- PDF storage
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled', 'refunded')),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer ON invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_panel ON invoices(panel_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Create invoice_settings table for panel-specific invoice configuration
CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID UNIQUE REFERENCES panels(id) ON DELETE CASCADE,
  
  -- Company details
  company_name TEXT,
  company_address TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_logo_url TEXT,
  company_vat_id TEXT,
  
  -- Tax configuration
  tax_enabled BOOLEAN DEFAULT false,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_label TEXT DEFAULT 'TAX',
  
  -- Invoice preferences
  invoice_prefix TEXT DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  invoice_language TEXT DEFAULT 'en',
  invoice_footer_text TEXT,
  
  -- Auto-generation settings
  auto_generate_on_payment BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add invoice fields to client_users (buyer profile)
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS invoice_company_name TEXT;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS invoice_address TEXT;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS invoice_vat_id TEXT;

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Panel owners can view their invoices" ON invoices
  FOR SELECT USING (
    panel_id IN (
      SELECT p.id FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can insert invoices" ON invoices
  FOR INSERT WITH CHECK (
    panel_id IN (
      SELECT p.id FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can update invoices" ON invoices
  FOR UPDATE USING (
    panel_id IN (
      SELECT p.id FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view their own invoices" ON invoices
  FOR SELECT USING (
    buyer_id IN (
      SELECT id FROM client_users
      WHERE id::text = (current_setting('request.jwt.claims', true)::json->>'buyer_id')::text
    )
  );

CREATE POLICY "System can insert invoices" ON invoices
  FOR INSERT WITH CHECK (true);

-- RLS policies for invoice_settings
CREATE POLICY "Panel owners can manage their invoice settings" ON invoice_settings
  FOR ALL USING (
    panel_id IN (
      SELECT p.id FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

-- =====================================================
-- PART 2: HIDDEN / PRIVATE SERVICES MODULE
-- =====================================================

-- Add hidden service columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES profiles(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Create service_access table for granting hidden service access
CREATE TABLE IF NOT EXISTS public.service_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  
  UNIQUE(service_id, buyer_id)
);

-- Create indexes for service_access
CREATE INDEX IF NOT EXISTS idx_service_access_service ON service_access(service_id);
CREATE INDEX IF NOT EXISTS idx_service_access_buyer ON service_access(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_access_panel ON service_access(panel_id);
CREATE INDEX IF NOT EXISTS idx_service_access_expires ON service_access(expires_at);

-- Create index on services for hidden field
CREATE INDEX IF NOT EXISTS idx_services_hidden ON services(is_hidden);

-- Enable RLS on service_access
ALTER TABLE service_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_access
CREATE POLICY "Panel owners can manage service access" ON service_access
  FOR ALL USING (
    panel_id IN (
      SELECT p.id FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view their own access grants" ON service_access
  FOR SELECT USING (
    buyer_id IN (
      SELECT id FROM client_users
      WHERE id::text = (current_setting('request.jwt.claims', true)::json->>'buyer_id')::text
    )
  );

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_panel_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INTEGER;
  v_invoice_number TEXT;
BEGIN
  -- Get prefix and next number from settings
  SELECT 
    COALESCE(invoice_prefix, 'INV'),
    COALESCE(next_invoice_number, 1)
  INTO v_prefix, v_next_num
  FROM invoice_settings
  WHERE panel_id = p_panel_id;
  
  -- If no settings exist, use defaults
  IF v_prefix IS NULL THEN
    v_prefix := 'INV';
    v_next_num := 1;
    
    -- Create default settings
    INSERT INTO invoice_settings (panel_id, invoice_prefix, next_invoice_number)
    VALUES (p_panel_id, v_prefix, v_next_num + 1)
    ON CONFLICT (panel_id) DO UPDATE SET next_invoice_number = v_next_num + 1;
  ELSE
    -- Update the next number
    UPDATE invoice_settings
    SET next_invoice_number = v_next_num + 1,
        updated_at = now()
    WHERE panel_id = p_panel_id;
  END IF;
  
  -- Generate invoice number: PREFIX-YYYYMM-NNNN
  v_invoice_number := v_prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(v_next_num::TEXT, 4, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if buyer has access to hidden service
CREATE OR REPLACE FUNCTION public.buyer_has_service_access(p_service_id UUID, p_buyer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM service_access sa
    WHERE sa.service_id = p_service_id
    AND sa.buyer_id = p_buyer_id
    AND (sa.expires_at IS NULL OR sa.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;