DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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

    -- Insert into dependent tables using the SAME new_user_id
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'Admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Make sure RLS is allowing updates/inserts to site_content for authenticated users
DROP POLICY IF EXISTS "admin_insert_site_content" ON public.site_content;
CREATE POLICY "admin_insert_site_content" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_site_content" ON public.site_content;
CREATE POLICY "admin_update_site_content" ON public.site_content
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Ensure the site_content keys exist
INSERT INTO public.site_content (section_key, content_value) VALUES 
('hero_banner_1', ''),
('hero_banner_2', ''),
('hero_banner_3', ''),
('hero_banner_4', ''),
('category_1_label', 'Blusas/Bodys'),
('category_1_image', ''),
('category_1_title', 'Blusas/Bodys'),
('category_1_desc', 'Descubra nossa coleção de blusas e bodys.'),
('category_2_label', 'Conjuntos'),
('category_2_image', ''),
('category_2_title', 'Conjuntos'),
('category_2_desc', 'Descubra nossa coleção de conjuntos elegantes.'),
('category_3_label', 'Partes de baixo'),
('category_3_image', ''),
('category_3_title', 'Partes de Baixo'),
('category_3_desc', 'Descubra nossa coleção de partes de baixo.'),
('category_4_label', 'Macaquinho'),
('category_4_image', ''),
('category_4_title', 'Macaquinho'),
('category_4_desc', 'Descubra nossa coleção de macaquinhos.'),
('category_5_label', 'Jeans'),
('category_5_image', ''),
('category_5_title', 'Jeans'),
('category_5_desc', 'Descubra nossa coleção de jeans.')
ON CONFLICT (section_key) DO NOTHING;
