DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Check if the user already exists
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'matheusfcg250@gmail.com';

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'matheusfcg250@gmail.com',
      crypt('Teteu@250', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure the profile exists and has is_admin = true
  INSERT INTO public.user_profiles (id, full_name, is_admin)
  VALUES (v_admin_id, 'Administrador', true)
  ON CONFLICT (id) DO UPDATE SET is_admin = true;
END $$;
