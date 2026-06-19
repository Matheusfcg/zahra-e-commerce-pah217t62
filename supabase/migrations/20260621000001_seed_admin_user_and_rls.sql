DO $$
DECLARE
  v_user_id uuid;
  t text;
BEGIN
  -- Seed user idempotent
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'brsolutiontransport@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (v_user_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';
    UPDATE public.user_profiles SET is_admin = true WHERE id = v_user_id;
  END IF;

  -- Ensure RLS is enabled on all tables in public schema
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.user_profiles
  WHERE id = auth.uid();
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products Policies
DROP POLICY IF EXISTS "allow_read_products" ON public.products;
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;

CREATE POLICY "allow_public_read_products" ON public.products FOR SELECT USING (true);
CREATE POLICY "admin_insert_products" ON public.products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_products" ON public.products FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE TO authenticated USING (is_admin());

-- Product Images Policies
DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
DROP POLICY IF EXISTS "admin_insert_product_images" ON public.product_images;
DROP POLICY IF EXISTS "admin_update_product_images" ON public.product_images;
DROP POLICY IF EXISTS "admin_delete_product_images" ON public.product_images;

CREATE POLICY "allow_public_read_product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "admin_insert_product_images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_product_images" ON public.product_images FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_product_images" ON public.product_images FOR DELETE TO authenticated USING (is_admin());

-- Product Colors Policies
DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "admin_insert_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "admin_update_product_colors" ON public.product_colors;
DROP POLICY IF EXISTS "admin_delete_product_colors" ON public.product_colors;

CREATE POLICY "allow_public_read_product_colors" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "admin_insert_product_colors" ON public.product_colors FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_product_colors" ON public.product_colors FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_product_colors" ON public.product_colors FOR DELETE TO authenticated USING (is_admin());
