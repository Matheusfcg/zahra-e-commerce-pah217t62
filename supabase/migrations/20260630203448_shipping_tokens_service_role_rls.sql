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

-- Drop existing policies before recreating
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

-- Also recreate admin access for authenticated admin users
CREATE POLICY "Admin full access shipping_tokens" ON public.shipping_tokens
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
