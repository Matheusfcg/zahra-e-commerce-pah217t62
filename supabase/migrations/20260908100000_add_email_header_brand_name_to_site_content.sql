-- Migration: Ensure email_header_brand_name default in site_content
-- Timestamp: 20260908100000

DO $$
BEGIN
  -- Insert email_header_brand_name if not present
  -- If not present, default to 'MEYVES' or value of brand_name if already set
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'email_header_brand_name',
    COALESCE((SELECT content_value FROM public.site_content WHERE section_key = 'brand_name' LIMIT 1), 'MEYVES'),
    NOW()
  )
  ON CONFLICT (section_key) DO NOTHING;
END $$;
