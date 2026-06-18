-- 1. Create the 'avatars' storage bucket
DO $DO$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
END $DO$;

-- 2. Storage objects policies for 'avatars' bucket
-- Allow public select
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow auth insert to own folder (folder name = user id)
DROP POLICY IF EXISTS "Auth Insert Avatars" ON storage.objects;
CREATE POLICY "Auth Insert Avatars" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow auth update to own folder
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow auth delete to own folder
DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Avatars" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Seed users and set as admins
DO $DO$
DECLARE
  v_matheus_id uuid;
  v_br_id uuid;
BEGIN
  -- Handle matheusfcg250@gmail.com
  SELECT id INTO v_matheus_id FROM auth.users WHERE email = 'matheusfcg250@gmail.com';

  IF v_matheus_id IS NULL THEN
    v_matheus_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_matheus_id,
      '00000000-0000-0000-0000-000000000000',
      'matheusfcg250@gmail.com',
      crypt('SenhaTeteu@250', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Matheus"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Upsert profile for matheus
  INSERT INTO public.user_profiles (id, full_name, is_admin)
  VALUES (v_matheus_id, 'Matheus', true)
  ON CONFLICT (id) DO UPDATE SET is_admin = true;

  -- Handle brsolutiontransport@gmail.com
  SELECT id INTO v_br_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';

  IF v_br_id IS NULL THEN
    v_br_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_br_id,
      '00000000-0000-0000-0000-000000000000',
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Upsert profile for brsolutiontransport
  INSERT INTO public.user_profiles (id, full_name, is_admin)
  VALUES (v_br_id, 'BR Solution Transport', true)
  ON CONFLICT (id) DO UPDATE SET is_admin = true;

END $DO$;
