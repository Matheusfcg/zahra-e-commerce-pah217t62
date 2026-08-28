-- Migration: Update email templates and footer content text to Meyves
UPDATE public.email_templates
SET 
  subject = REPLACE(subject, 'Mayve', 'Meyves'),
  body_html = REPLACE(body_html, 'Mayve', 'Meyves'),
  description = REPLACE(description, 'Mayve', 'Meyves'),
  updated_at = NOW();

-- Also update any email addresses in templates if present
UPDATE public.email_templates
SET 
  body_html = REPLACE(body_html, 'mayvesbr@gmail.com', 'meyvesbr@gmail.com'),
  updated_at = NOW();

-- Update site_content footer_copyright if it contains Mayve
UPDATE public.site_content
SET 
  content_value = REPLACE(content_value, 'Mayve', 'Meyves'),
  updated_at = NOW()
WHERE section_key = 'footer_copyright';
