-- Ensure admin user exists with password Skip@Pass
DO $BODY$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"full_name": "Admin BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name)
    VALUES (new_user_id, 'Admin BR Solution')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $BODY$;

-- Enable RLS and setup policies for storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Ensure products table allows update for authenticated users
DROP POLICY IF EXISTS "allow_auth_update_products" ON public.products;
CREATE POLICY "allow_auth_update_products" ON public.products
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Ensure product_images allows insert, update, delete for authenticated
DROP POLICY IF EXISTS "allow_auth_insert_product_images" ON public.product_images;
CREATE POLICY "allow_auth_insert_product_images" ON public.product_images
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_auth_update_product_images" ON public.product_images;
CREATE POLICY "allow_auth_update_product_images" ON public.product_images
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_auth_delete_product_images" ON public.product_images;
CREATE POLICY "allow_auth_delete_product_images" ON public.product_images
FOR DELETE TO authenticated USING (true);
