DO $DO$
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
      '{"name": "BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    -- Update or insert profile just in case there's no trigger or it fails
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'BR Solution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;

  -- Set a few products to show_in_carousel = true if none are set
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE show_in_carousel = true) THEN
    UPDATE public.products
    SET show_in_carousel = true
    WHERE id IN (
      SELECT id FROM public.products LIMIT 3
    );
  END IF;
END $DO$;
