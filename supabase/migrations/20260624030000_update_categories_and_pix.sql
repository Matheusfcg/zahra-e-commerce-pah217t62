DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert categories config
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'home_categories',
    '["Conjuntos", "Macaquinhos", "Blusas e Bodies", "Saias", "Calças", "Malhas", "Básicos"]',
    NOW()
  )
  ON CONFLICT (section_key) DO NOTHING;

  -- Insert pix config
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'pix_config',
    '{"nome": "ELLEN CRISTINA", "chave": "64278774000161", "instituicao": "InfinitePay", "merchantCity": "Sao Paulo"}',
    NOW()
  )
  ON CONFLICT (section_key) DO NOTHING;

  -- Seed admin user (idempotent)
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
      '', '', '',
      '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    -- Ensure existing user is admin
    UPDATE public.user_profiles
    SET is_admin = true
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com');
  END IF;

END $$;
