-- Migration: Ensure brand_name default in site_content without overwriting existing settings
-- Timestamp: 20260906100000

DO $$
BEGIN
  -- Insert brand_name if not present
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES ('brand_name', 'MEYVES', NOW())
  ON CONFLICT (section_key) DO NOTHING;

  -- Ensure primary font default if not present
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES ('brand_font_size', '32px', NOW())
  ON CONFLICT (section_key) DO NOTHING;

  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES ('brand_color', '#2D0B0B', NOW())
  ON CONFLICT (section_key) DO NOTHING;
END $$;
