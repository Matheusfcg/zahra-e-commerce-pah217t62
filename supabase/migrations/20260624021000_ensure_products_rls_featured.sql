-- Products policies for RLS and is_featured feature

-- Select public
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products
  FOR SELECT USING (true);

-- Update admin
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insert admin
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admin_insert_products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Delete admin
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admin_delete_products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());
