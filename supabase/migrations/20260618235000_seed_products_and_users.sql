DO $do$
DECLARE
  v_user_id uuid;
  v_maxi_renda_id uuid;
  v_tshirt_basica_id uuid;
BEGIN
  -- 1. Create seed user
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
      crypt('Skip@Pass123', gen_salt('bf')),
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
  END IF;

  -- 2. Seed Maxi Renda
  INSERT INTO public.products (id, slug, name, price, quantity, description, is_promotion)
  VALUES (gen_random_uuid(), 'maxi-renda', 'Maxi Renda', 150.00, 20, 'Lindo vestido de renda maxi para ocasiões especiais. Peça essencial para um look sofisticado e inesquecível.', false)
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_maxi_renda_id FROM public.products WHERE slug = 'maxi-renda';

  IF v_maxi_renda_id IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, display_order)
    SELECT v_maxi_renda_id, 'https://img.usecurling.com/p/800/1000?q=lace%20dress&dpr=2', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = v_maxi_renda_id);
  END IF;

  -- 3. Seed T-shirt Básica
  INSERT INTO public.products (id, slug, name, price, quantity, description, is_promotion)
  VALUES (gen_random_uuid(), 't-shirt-basica', 'T-shirt Básica', 89.90, 50, 'A t-shirt básica perfeita para o dia a dia, com tecido confortável e caimento impecável.', false)
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_tshirt_basica_id FROM public.products WHERE slug = 't-shirt-basica';

  IF v_tshirt_basica_id IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, display_order)
    SELECT v_tshirt_basica_id, 'https://img.usecurling.com/p/800/1000?q=basic%20t-shirt&dpr=2', 0
    WHERE NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = v_tshirt_basica_id);
  END IF;
END $do$;

-- 4. RLS Policies (Idempotent overrides)
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
CREATE POLICY "allow_public_read_product_images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
CREATE POLICY "allow_public_read_product_colors" ON public.product_colors
  FOR SELECT USING (true);
