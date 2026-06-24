-- Enable guest and authenticated checkout for orders
DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
CREATE POLICY "allow_insert_orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_own_orders" ON public.orders;
CREATE POLICY "allow_read_own_orders" ON public.orders
  FOR SELECT TO anon, authenticated USING (
    auth.uid() = user_id OR user_id IS NULL
  );

DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;
CREATE POLICY "allow_update_orders" ON public.orders
  FOR UPDATE TO anon, authenticated USING (
    auth.uid() = user_id OR user_id IS NULL
  ) WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Enable guest and authenticated checkout for order_items
DROP POLICY IF EXISTS "allow_insert_order_items" ON public.order_items;
CREATE POLICY "allow_insert_order_items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_order_items" ON public.order_items;
CREATE POLICY "allow_read_order_items" ON public.order_items
  FOR SELECT TO anon, authenticated USING (true);

-- Seed test user
DO $DO_BLOCK$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'BR Solution Admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $DO_BLOCK$;
