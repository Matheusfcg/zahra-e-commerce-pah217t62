DO $DO$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed test admin user idempotently
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'brsolutiontransport@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin, updated_at)
    VALUES (new_user_id, 'Admin BR Solution', true, NOW())
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    -- Ensure user has admin rights if they already exist
    UPDATE public.user_profiles
    SET is_admin = true
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com');
  END IF;
END $DO$;

-- Fix any missing RLS policies just in case
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
    
  -- Admin policies on shipping_tokens
  DROP POLICY IF EXISTS "Admin full access shipping_tokens" ON public.shipping_tokens;
  CREATE POLICY "Admin full access shipping_tokens" ON public.shipping_tokens
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $DO$;
