DO $$
BEGIN
  -- Insert or Update PIX details
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'pix_details',
    '{"name":"64.278.774 ELLEN CRISTINA","key":"64278774000161","institution":"InfinitePay","formattedKey":"64.278.774/0001-61"}',
    NOW()
  )
  ON CONFLICT (section_key) DO UPDATE
  SET content_value = EXCLUDED.content_value,
      updated_at = EXCLUDED.updated_at;

  -- Insert or Update default categories
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'homepage_categories',
    '["CONJUNTOS","PARTES DE CIMA","PARTES DE BAIXO","ACESSÓRIOS"]',
    NOW()
  )
  ON CONFLICT (section_key) DO NOTHING;
END $$;

DO $$
DECLARE
  admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'brsolutiontransport@gmail.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin BRSolution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (admin_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    UPDATE public.user_profiles
    SET is_admin = true
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com');
  END IF;
END $$;
