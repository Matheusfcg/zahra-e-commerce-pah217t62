CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products
DROP POLICY IF EXISTS "allow_auth_insert_products" ON public.products;
DROP POLICY IF EXISTS "allow_auth_update_products" ON public.products;
DROP POLICY IF EXISTS "allow_auth_delete_products" ON public.products;

CREATE POLICY "admin_insert_products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin_update_products" ON public.products FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE TO authenticated USING (public.is_admin());

-- Product Images
DROP POLICY IF EXISTS "allow_auth_insert_product_images" ON public.product_images;
DROP POLICY IF EXISTS "allow_auth_update_product_images" ON public.product_images;
DROP POLICY IF EXISTS "allow_auth_delete_product_images" ON public.product_images;

CREATE POLICY "admin_insert_product_images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin_update_product_images" ON public.product_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_delete_product_images" ON public.product_images FOR DELETE TO authenticated USING (public.is_admin());

-- Product Colors
DROP POLICY IF EXISTS "admin_insert_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "admin_update_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "admin_delete_product_colors" ON public.product_colors;

CREATE POLICY "admin_insert_product_colors" ON public.product_colors FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin_update_product_colors" ON public.product_colors FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_delete_product_colors" ON public.product_colors FOR DELETE TO authenticated USING (public.is_admin());
