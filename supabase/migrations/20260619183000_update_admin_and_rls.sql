DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';

  -- Create admin user in auth.users if not exists
  IF admin_id IS NULL THEN
    admin_id := '00000000-0000-0000-0000-000000000000'::uuid;
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure the ID exists in profiles and is set as admin
  INSERT INTO public.user_profiles (id, full_name, is_admin, updated_at)
  VALUES (admin_id, 'Matheus Ferrari', true, now())
  ON CONFLICT (id) DO UPDATE SET is_admin = true, updated_at = now();
END $$;

-- Ensure RLS policies exist for `user_profiles` to allow read own profile and admins read all
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (is_admin());

-- Ensure public read for products
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products
  FOR SELECT TO public USING (true);
