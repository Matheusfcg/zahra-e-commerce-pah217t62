DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert site_content values with DO NOTHING
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('curated_title', 'Curadoria Exclusiva'),
    ('hero_left_image', 'https://img.usecurling.com/p/800/1200?q=fashion&seed=left'),
    ('hero_right_image', 'https://img.usecurling.com/p/800/1200?q=fashion&seed=right'),
    ('sets_description', 'Descubra nossa coleção de conjuntos elegantes.'),
    ('tops_description', 'Partes de cima versáteis para qualquer ocasião.'),
    ('bottoms_description', 'Calças e saias com caimento perfeito.'),
    ('hero_button', 'EXPLORAR COLEÇÃO'),
    ('hero_description', 'Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza natural.'),
    ('hero_title', 'ESSÊNCIA DA ELEGÂNCIA'),
    ('values_1_title', 'Design Autoral'),
    ('values_1_desc', 'Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.'),
    ('values_2_title', 'Qualidade Premium'),
    ('values_2_desc', 'Seleção rigorosa de materiais para garantir durabilidade e sofisticação.'),
    ('values_3_title', 'Sustentabilidade'),
    ('values_3_desc', 'Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.'),
    ('footer_about', 'A essência do estilo minimalista. Peças autorais desenhadas no Brasil com materiais premium e compromisso com a excelência.'),
    ('footer_copyright', '© 2024 Zahra Brasil. Todos os direitos reservados.'),
    ('footer_whatsapp', 'WhatsApp: (11) 93416-0219')
  ON CONFLICT (section_key) DO NOTHING;

  -- Ensure Admin user brsolutiontransport@gmail.com exists
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
      '{"name": "Admin"}',
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
END $$;
