-- Migration: Ensure both admin users (meyvesbr@gmail.com and matheusfcg250@gmail.com) have verified credentials, correct identities and admin role
-- Timestamp: 20260910120000

DO $$
DECLARE
  v_admin1_id uuid;
  v_admin2_id uuid;
  v_identity_id uuid;
BEGIN
  -- 1. Setup / Refresh meyvesbr@gmail.com
  SELECT id INTO v_admin1_id FROM auth.users WHERE lower(email) = 'meyvesbr@gmail.com';

  IF v_admin1_id IS NULL THEN
    v_admin1_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change,
      phone_change_token, reauthentication_token
    ) VALUES (
      v_admin1_id,
      '00000000-0000-0000-0000-000000000000',
      'meyvesbr@gmail.com',
      crypt('Meyves@br', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin Meyves", "name": "Admin Meyves"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
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
      )
    WHERE id = v_admin1_id;
  END IF;

  -- Identity for meyvesbr@gmail.com
  SELECT id INTO v_identity_id FROM auth.identities WHERE user_id = v_admin1_id AND provider = 'email';
  IF v_identity_id IS NULL THEN
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_admin1_id::text,
      v_admin1_id,
      json_build_object('sub', v_admin1_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
      'email',
      NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.identities
    SET
      identity_data = json_build_object('sub', v_admin1_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
      updated_at = NOW()
    WHERE id = v_identity_id;
  END IF;

  -- Admin profile for meyvesbr@gmail.com
  INSERT INTO public.user_profiles (id, full_name, is_admin)
  VALUES (v_admin1_id, 'Admin Meyves', true)
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Admin Meyves',
    is_admin = true,
    updated_at = NOW();

  -- 2. Setup / Refresh matheusfcg250@gmail.com (merchant Matheus)
  SELECT id INTO v_admin2_id FROM auth.users WHERE lower(email) = 'matheusfcg250@gmail.com';

  IF v_admin2_id IS NULL THEN
    v_admin2_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change,
      phone_change_token, reauthentication_token
    ) VALUES (
      v_admin2_id,
      '00000000-0000-0000-0000-000000000000',
      'matheusfcg250@gmail.com',
      crypt('Teteu@250', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Matheus Admin", "name": "Matheus Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
    WHERE id = v_admin2_id;
  END IF;

  -- Identity for matheusfcg250@gmail.com
  SELECT id INTO v_identity_id FROM auth.identities WHERE user_id = v_admin2_id AND provider = 'email';
  IF v_identity_id IS NULL THEN
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_admin2_id::text,
      v_admin2_id,
      json_build_object('sub', v_admin2_id::text, 'email', 'matheusfcg250@gmail.com', 'email_verified', true),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;

  -- Admin profile for matheusfcg250@gmail.com
  INSERT INTO public.user_profiles (id, full_name, is_admin)
  VALUES (v_admin2_id, 'Matheus Admin', true)
  ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();

END $$;
