-- Migration: Update email templates text and subjects to Mayve (Stage 2)

UPDATE public.email_templates
SET 
  subject = REPLACE(REPLACE(subject, 'Zahrá', 'Mayve'), 'Zahra', 'Mayve'),
  body_html = REPLACE(REPLACE(body_html, 'Zahrá', 'Mayve'), 'Zahra', 'Mayve'),
  updated_at = NOW()
WHERE 
  subject ILIKE '%zahr%' 
  OR body_html ILIKE '%zahr%';
