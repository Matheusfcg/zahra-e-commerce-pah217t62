DO $BODY$
BEGIN
  -- allow admin update products
  DROP POLICY IF EXISTS "allow_auth_update_products" ON public.products;
  CREATE POLICY "allow_auth_update_products" ON public.products
    FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );

  -- allow admin delete products
  DROP POLICY IF EXISTS "allow_auth_delete_products" ON public.products;
  CREATE POLICY "allow_auth_delete_products" ON public.products
    FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );

  -- Fix product_colors RLS
  DROP POLICY IF EXISTS "allow_auth_insert_product_colors" ON public.product_colors;
  CREATE POLICY "allow_auth_insert_product_colors" ON public.product_colors
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );
    
  DROP POLICY IF EXISTS "allow_auth_update_product_colors" ON public.product_colors;
  CREATE POLICY "allow_auth_update_product_colors" ON public.product_colors
    FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );
    
  DROP POLICY IF EXISTS "allow_auth_delete_product_colors" ON public.product_colors;
  CREATE POLICY "allow_auth_delete_product_colors" ON public.product_colors
    FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );

  -- Fix product_images RLS
  DROP POLICY IF EXISTS "allow_auth_delete_product_images" ON public.product_images;
  CREATE POLICY "allow_auth_delete_product_images" ON public.product_images
    FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );

  DROP POLICY IF EXISTS "allow_auth_update_product_images" ON public.product_images;
  CREATE POLICY "allow_auth_update_product_images" ON public.product_images
    FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
    );
END $BODY$;
