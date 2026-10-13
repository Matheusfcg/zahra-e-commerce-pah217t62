-- Migration: Update brand branding in site_content and email_templates to Meyve
-- Timestamp: 20260910120000

-- 1. Ensure brand_name, email_header_brand_name are set to 'Meyve' and email_header_tagline is empty string
INSERT INTO public.site_content (section_key, content_value, updated_at)
VALUES 
  ('brand_name', 'Meyve', NOW()),
  ('email_header_brand_name', 'Meyve', NOW()),
  ('email_header_tagline', '', NOW())
ON CONFLICT (section_key) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- 2. Update welcome template subject and body_html
-- Replace references to "Meyves" with "Meyve" in subject and body_html
UPDATE public.email_templates
SET
  subject = REPLACE(REPLACE(subject, 'Meyves', 'Meyve'), 'MEYVES', 'MEYVE'),
  body_html = REPLACE(REPLACE(body_html, 'Meyves', 'Meyve'), 'MEYVES', 'MEYVE'),
  updated_at = NOW()
WHERE slug = 'welcome';

-- 3. Also update any other email templates that still reference Meyves in subject or body_html
UPDATE public.email_templates
SET
  subject = REPLACE(subject, 'Meyves', 'Meyve'),
  body_html = REPLACE(body_html, 'Meyves', 'Meyve'),
  updated_at = NOW()
WHERE slug IN ('order_created', 'order_paid', 'order_shipped', 'order_delivered', 'order_canceled', 'invoice_available', 'first_purchase', 'newsletter_broadcast');
