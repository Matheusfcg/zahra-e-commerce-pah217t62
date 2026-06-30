-- Ensure shipping_tokens table exists with correct structure
CREATE TABLE IF NOT EXISTS public.shipping_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_tokens ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they exist and are correct
DROP POLICY IF EXISTS "Admin full access shipping_tokens" ON public.shipping_tokens;
CREATE POLICY "Admin full access shipping_tokens" ON public.shipping_tokens
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
