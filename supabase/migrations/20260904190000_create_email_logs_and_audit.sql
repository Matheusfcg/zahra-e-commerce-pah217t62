-- Migration: Create email_logs table, enhance email triggers, and audit templates
-- Timestamp: 20260904190000

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_slug TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT,
  from_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'sent', 'error', 'skipped'
  resend_id TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies for email_logs
DROP POLICY IF EXISTS "allow_admins_read_email_logs" ON public.email_logs;
CREATE POLICY "allow_admins_read_email_logs" ON public.email_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "service_role_all_email_logs" ON public.email_logs;
CREATE POLICY "service_role_all_email_logs" ON public.email_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Index on created_at, recipient_email, template_slug
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_slug ON public.email_logs(template_slug);

-- Ensure all email_templates have consistent Meyves branding and replace any stray mayve / zahrabrasil remnants
UPDATE public.email_templates
SET
  subject = REPLACE(REPLACE(subject, 'www.mayves.com.br', 'www.meyves.com.br'), 'mayves.com.br', 'meyves.com.br'),
  body_html = REPLACE(REPLACE(body_html, 'www.mayves.com.br', 'www.meyves.com.br'), 'mayves.com.br', 'meyves.com.br');

UPDATE public.email_templates
SET
  subject = REPLACE(REPLACE(subject, 'www.zahrabrasil.com.br', 'www.meyves.com.br'), 'zahrabrasil.com.br', 'meyves.com.br'),
  body_html = REPLACE(REPLACE(body_html, 'www.zahrabrasil.com.br', 'www.meyves.com.br'), 'zahrabrasil.com.br', 'meyves.com.br');

-- Ensure welcome template has full allowed_variables and description
UPDATE public.email_templates
SET
  allowed_variables = '["nome_cliente", "email_cliente", "nome_loja"]'::jsonb,
  description = 'E-mail enviado automaticamente para novos clientes ao realizarem o cadastro na Meyves.'
WHERE slug = 'welcome';
