DO $$
BEGIN
  -- Drop existing auth policies for product_colors
  DROP POLICY IF EXISTS "allow_auth_delete_product_colors" ON public.product_colors;
  DROP POLICY IF EXISTS "allow_auth_insert_product_colors" ON public.product_colors;
  DROP POLICY IF EXISTS "allow_auth_update_product_colors" ON public.product_colors;

  -- Create admin policies ensuring RLS for product_colors allows INSERT, UPDATE, DELETE for is_admin = true
  CREATE POLICY "admin_insert_product_colors" ON public.product_colors
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = true));

  CREATE POLICY "admin_update_product_colors" ON public.product_colors
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = true));

  CREATE POLICY "admin_delete_product_colors" ON public.product_colors
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = true));
END $$;
