DO $$
DECLARE
  v_admin_id uuid;
  v_identity_id uuid;
BEGIN
  -- 1. Downgrade any old "Zahra" admin accounts without deleting user data or order history
  UPDATE public.user_profiles
  SET is_admin = false
  WHERE id IN (
    SELECT id FROM auth.users WHERE lower(email) LIKE '%zahra%'
  );

  -- 2. Check if meyvesbr@gmail.com already exists in auth.users
  SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'meyvesbr@gmail.com';

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'meyvesbr@gmail.com',
      crypt('Meyves@br', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin Meyves", "name": "Admin Meyves"}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      '',
      '',
      NULL,
      '',
      '',
      ''
    );
  ELSE
    -- If already exists, update password and ensure email confirmation
    UPDATE auth.users
    SET
      encrypted_password = crypt('Meyves@br', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
      raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        '"Admin Meyves"'
      ),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = v_admin_id;
  END IF;

  -- 3. Ensure identity record exists in auth.identities
  SELECT id INTO v_identity_id FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email';
  IF v_identity_id IS NULL THEN
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_admin_id::text,
      v_admin_id,
      json_build_object('sub', v_admin_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  ELSE
    UPDATE auth.identities
    SET
      identity_data = json_build_object('sub', v_admin_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
      updated_at = NOW()
    WHERE id = v_identity_id;
  END IF;

  -- 4. Upsert admin role in public.user_profiles
  INSERT INTO public.user_profiles (
    id,
    full_name,
    is_admin
  ) VALUES (
    v_admin_id,
    'Admin Meyves',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Admin Meyves',
    is_admin = true,
    updated_at = NOW();

END $$;
