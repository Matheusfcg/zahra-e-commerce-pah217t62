DO $do$
DECLARE
  new_user_id uuid;
BEGIN
  -- Update the featured product to match criteria and screenshot
  UPDATE public.products 
  SET name = 'T shirt Cowntry', price = 50.00 
  WHERE slug = 't-shirt-country';

  -- Add it if it doesn't exist just in case to avoid empty states
  INSERT INTO public.products (slug, name, price, quantity, description)
  VALUES ('t-shirt-country', 'T shirt Cowntry', 50.00, 50, 'T-shirt em algodão com estampa country exclusiva, modelagem confortável.')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;

  -- Add an image for it if none exists
  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=country%20t-shirt&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 't-shirt-country' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);

  -- Seed required admin user for testing and dashboard access
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
      '{"name": "BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'BR Solution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
END $do$;

-- Ensure RLS allows public read access for the catalog features
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
CREATE POLICY "allow_public_read_product_images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
CREATE POLICY "allow_public_read_product_colors" ON public.product_colors FOR SELECT USING (true);
