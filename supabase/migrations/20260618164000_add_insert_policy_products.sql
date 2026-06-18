-- Allow authenticated users to insert products
DROP POLICY IF EXISTS "allow_auth_insert_products" ON public.products;
CREATE POLICY "allow_auth_insert_products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);
