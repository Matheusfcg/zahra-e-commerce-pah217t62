INSERT INTO public.site_content (section_key, content_value) VALUES
  ('hero_left_image', 'https://img.usecurling.com/p/800/1200?q=elegant%20fashion&dpr=2'),
  ('hero_right_image', 'https://img.usecurling.com/p/800/1200?q=sophisticated%20clothing&dpr=2')
ON CONFLICT (section_key) DO NOTHING;
