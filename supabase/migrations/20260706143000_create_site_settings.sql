CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_site_settings" ON public.site_settings;
CREATE POLICY "allow_public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_site_settings" ON public.site_settings;
CREATE POLICY "admin_all_site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Initial seed for typography
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('main_font', 'Inter')
ON CONFLICT (setting_key) DO NOTHING;

-- Authentication seed
DO $DO$
DECLARE
  v_user_id uuid;
BEGIN
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

    INSERT INTO public.user_profiles (id, full_name, is_admin, updated_at)
    VALUES (v_user_id, 'Admin BRSolution', true, NOW())
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    UPDATE public.user_profiles
    SET is_admin = true
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com');
  END IF;
END $DO$;
