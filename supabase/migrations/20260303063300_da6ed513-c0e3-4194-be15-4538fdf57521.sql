
-- Fix orders.buyer_id FK: change from profiles to client_users
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey 
  FOREIGN KEY (buyer_id) REFERENCES client_users(id) ON DELETE CASCADE;

-- Fix RLS policies on orders table for panel owners
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their orders" ON orders;

-- Panel owners can view orders for their panel
CREATE POLICY "Panel owners can view their orders"
ON orders FOR SELECT
TO authenticated
USING (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Panel owners can update orders for their panel
CREATE POLICY "Panel owners can update their orders"
ON orders FOR UPDATE
TO authenticated
USING (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Service role can insert orders (buyer-order edge function uses service_role)
CREATE POLICY "Service role can insert orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Service role can update orders
CREATE POLICY "Service role can update orders"
ON orders FOR UPDATE
USING (true);
