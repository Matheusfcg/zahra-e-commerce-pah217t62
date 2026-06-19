-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

-- Fix RLS for products, product_images, product_colors
DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
CREATE POLICY "allow_public_read_product_images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
CREATE POLICY "allow_public_read_product_colors" ON public.product_colors FOR SELECT USING (true);

DO $DO$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed admin user (idempotent: skip if email already exists)
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
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'BR Solution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
END $DO$;
