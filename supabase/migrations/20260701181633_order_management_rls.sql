-- Order Management RLS: Admins can SELECT/UPDATE all orders, users can only SELECT their own

-- Orders: SELECT policy (admins see all, users see own, anon sees guest orders)
DROP POLICY IF EXISTS "allow_read_own_orders" ON public.orders;
CREATE POLICY "allow_read_own_orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR (user_id IS NULL AND auth.role() = 'anon')
  );

-- Orders: UPDATE policy (admins only)
DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;
CREATE POLICY "allow_update_orders" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: INSERT policy (unchanged - allow all)
DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
CREATE POLICY "allow_insert_orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Order items: SELECT policy (align with orders visibility)
DROP POLICY IF EXISTS "allow_read_order_items" ON public.order_items;
CREATE POLICY "allow_read_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        auth.uid() = orders.user_id
        OR public.is_admin()
        OR (orders.user_id IS NULL AND auth.role() = 'anon')
      )
    )
  );

-- Order items: INSERT policy (unchanged)
DROP POLICY IF EXISTS "allow_insert_order_items" ON public.order_items;
CREATE POLICY "allow_insert_order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Normalize any existing status values to 'pending' before adding the CHECK constraint
UPDATE public.orders
SET status = 'pending'
WHERE status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'canceled', 'paid');

-- Add CHECK constraint on status column (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check'
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'canceled', 'paid'));
  END IF;
END $$;
