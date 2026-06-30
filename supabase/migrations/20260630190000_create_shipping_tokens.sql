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
  END IF;
END $$;

-- Create shipping_tokens table
CREATE TABLE IF NOT EXISTS public.shipping_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_tokens ENABLE ROW LEVEL SECURITY;

-- Create Admin Policy
DROP POLICY IF EXISTS "Admin full access shipping_tokens" ON public.shipping_tokens;
CREATE POLICY "Admin full access shipping_tokens" ON public.shipping_tokens
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
