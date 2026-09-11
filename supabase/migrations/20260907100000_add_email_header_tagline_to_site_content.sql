-- Migration: Ensure email_header_tagline default in site_content
-- Timestamp: 20260907100000

DO $$
BEGIN
  -- Insert email_header_tagline if not present (empty by default or default tagline)
  -- Allows empty string or customized tagline (e.g. 'MODA & ELEGÂNCIA')
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES ('email_header_tagline', 'MODA & ELEGÂNCIA', NOW())
  ON CONFLICT (section_key) DO NOTHING;
END $$;
