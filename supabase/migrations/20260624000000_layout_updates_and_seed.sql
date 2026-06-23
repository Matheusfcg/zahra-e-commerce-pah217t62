DO $$
DECLARE
  v_user_id uuid;
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
      '{"name": "Admin BRSolution"}',
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

  -- Add specific site content for the new layout texts if needed
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('footer_newsletter_title', 'Assine a nossa Newsletter e fique por dentro'),
    ('footer_newsletter_desc', 'Receba os nossos lançamentos e novidades exclusivas.'),
    ('benefit_1_title', 'Entrega para todo o Brasil'),
    ('benefit_2_title', 'Troca fácil'),
    ('benefit_3_title', 'Pagamento seguro'),
    ('benefit_4_title', 'Suporte rápido'),
    ('benefit_4_desc', 'Suporte rápido de segunda à sexta das 09h às 17h.')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;
END $$;
