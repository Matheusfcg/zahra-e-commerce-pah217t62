-- Migration: Migrate URLs from mayves.com.br to meyves.com.br
-- Updates email_templates (subject and body_html) and site_content (content_value)

-- 1. Update email_templates URLs
UPDATE public.email_templates
SET 
  subject = REPLACE(REPLACE(subject, 'www.mayves.com.br', 'www.meyves.com.br'), 'mayves.com.br', 'meyves.com.br'),
  body_html = REPLACE(REPLACE(body_html, 'www.mayves.com.br', 'www.meyves.com.br'), 'mayves.com.br', 'meyves.com.br'),
  updated_at = NOW()
WHERE 
  subject LIKE '%mayves.com.br%' 
  OR body_html LIKE '%mayves.com.br%';

-- 2. Update site_content in case any section contains mayves.com.br
UPDATE public.site_content
SET 
  content_value = REPLACE(REPLACE(content_value, 'www.mayves.com.br', 'www.meyves.com.br'), 'mayves.com.br', 'meyves.com.br'),
  updated_at = NOW()
WHERE 
  content_value LIKE '%mayves.com.br%';
