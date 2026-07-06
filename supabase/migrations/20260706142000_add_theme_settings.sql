DO $DO$
BEGIN
  INSERT INTO public.site_content (section_key, content_value)
  VALUES ('theme_settings', '{"font": "Inter"}')
  ON CONFLICT (section_key) DO NOTHING;
END $DO$;
