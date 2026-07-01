DO $DO$
BEGIN
  -- Admin policies on categories
  DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
  CREATE POLICY "admin_insert_categories" ON public.categories
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
  CREATE POLICY "admin_update_categories" ON public.categories
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
  CREATE POLICY "admin_delete_categories" ON public.categories
    FOR DELETE TO authenticated USING (public.is_admin());

  -- Admin policies on products
  DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
  CREATE POLICY "admin_insert_products" ON public.products
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_update_products" ON public.products;
  CREATE POLICY "admin_update_products" ON public.products
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
  CREATE POLICY "admin_delete_products" ON public.products
    FOR DELETE TO authenticated USING (public.is_admin());
END $DO$;
