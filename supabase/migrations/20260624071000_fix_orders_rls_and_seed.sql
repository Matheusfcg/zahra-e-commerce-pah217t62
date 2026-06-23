-- Fix RLS policies to allow anon and authenticated users to successfully create and read orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
CREATE POLICY "allow_insert_orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_order_items" ON public.order_items;
CREATE POLICY "allow_insert_order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_own_orders" ON public.orders;
CREATE POLICY "allow_read_own_orders" ON public.orders FOR SELECT USING (
  (auth.uid() = user_id) OR (user_id IS NULL AND auth.role() = 'anon')
);

DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;
CREATE POLICY "allow_update_orders" ON public.orders FOR UPDATE USING (
  (auth.uid() = user_id) OR (user_id IS NULL AND auth.role() = 'anon')
);

DROP POLICY IF EXISTS "allow_read_order_items" ON public.order_items;
CREATE POLICY "allow_read_order_items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id)
);

-- Seed missing admin user requirements
DO $DO$
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
      '{"name": "Admin BRSolution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    UPDATE public.user_profiles 
    SET is_admin = true 
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com');
  END IF;
END $DO$;
