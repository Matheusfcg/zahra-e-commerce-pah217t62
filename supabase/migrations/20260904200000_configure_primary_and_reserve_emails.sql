-- Migration: Update email templates and settings to establish meyvesbr@gmail.com as primary customer email and contato@meyves.com.br as reserve
-- Timestamp: 20260904200000

DO $$
BEGIN
  -- 1. Ensure any legacy email references in public.email_templates point to meyvesbr@gmail.com as primary
  UPDATE public.email_templates
  SET
    body_html = REPLACE(
      REPLACE(body_html, 'contato@meyves.com.br', 'meyvesbr@gmail.com'),
      'contato@zahrabrasil.com.br', 'meyvesbr@gmail.com'
    )
  WHERE body_html ILIKE '%contato@meyves.com.br%' OR body_html ILIKE '%contato@zahrabrasil.com.br%';

  -- 2. Store email configuration in site_settings for dynamic lookup and transparency
  INSERT INTO public.site_settings (setting_key, setting_value)
  VALUES
    ('primary_email', 'meyvesbr@gmail.com'),
    ('reserve_email', 'contato@meyves.com.br')
  ON CONFLICT (setting_key) DO UPDATE
  SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

END $$;
