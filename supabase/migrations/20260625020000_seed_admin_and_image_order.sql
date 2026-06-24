-- Ensure brsolutiontransport@gmail.com has is_admin = true and password is Skip@Pass
DO $$
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
      '{"name": "Admin BRSolution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';
    UPDATE auth.users 
    SET encrypted_password = crypt('Skip@Pass', gen_salt('bf'))
    WHERE id = new_user_id;

    UPDATE public.user_profiles SET is_admin = true WHERE id = new_user_id;
  END IF;
END $$;

-- Make sure product_images has display_order column
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Drop and recreate RLS policies for admin_update_product_images
DROP POLICY IF EXISTS admin_update_product_images ON public.product_images;
CREATE POLICY admin_update_product_images ON public.product_images
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS admin_insert_product_images ON public.product_images;
CREATE POLICY admin_insert_product_images ON public.product_images
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS admin_delete_product_images ON public.product_images;
CREATE POLICY admin_delete_product_images ON public.product_images
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  );
