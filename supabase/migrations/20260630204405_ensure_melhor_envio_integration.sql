DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed admin user idempotently
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

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (v_user_id, 'Admin BRSolution', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';
    UPDATE public.user_profiles SET is_admin = true WHERE id = v_user_id;
  END IF;
END $$;

-- Ensure shipping_tokens table exists
CREATE TABLE IF NOT EXISTS public.shipping_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "Admin full access shipping_tokens" ON public.shipping_tokens;
DROP POLICY IF EXISTS "service_role read shipping_tokens" ON public.shipping_tokens;
DROP POLICY IF EXISTS "service_role insert shipping_tokens" ON public.shipping_tokens;
DROP POLICY IF EXISTS "service_role update shipping_tokens" ON public.shipping_tokens;

-- Allow service_role full access (used by Edge Functions)
CREATE POLICY "service_role read shipping_tokens" ON public.shipping_tokens
  FOR SELECT TO service_role USING (true);
CREATE POLICY "service_role insert shipping_tokens" ON public.shipping_tokens
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "service_role update shipping_tokens" ON public.shipping_tokens
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated admin users full access
CREATE POLICY "Admin full access shipping_tokens" ON public.shipping_tokens
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Ensure melhor_envio_settings exists in site_content
INSERT INTO public.site_content (section_key, content_value)
VALUES ('melhor_envio_settings', '{"from_cep": "01153000", "client_id": "26564"}')
ON CONFLICT (section_key) DO NOTHING;

-- Ensure is_admin function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.user_profiles
  WHERE id = auth.uid();
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
