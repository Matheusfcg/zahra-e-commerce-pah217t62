INSERT INTO public.site_content (section_key, content_value)
VALUES ('primary_font', 'Inter')
ON CONFLICT (section_key) DO NOTHING;
