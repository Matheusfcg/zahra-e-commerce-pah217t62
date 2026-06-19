DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('hero_carousel_1', 'https://img.usecurling.com/p/1600/900?q=elegant%20fashion%20set&dpr=2'),
    ('hero_carousel_2', 'https://img.usecurling.com/p/1600/900?q=sophisticated%20clothing%20set&dpr=2'),
    ('hero_carousel_3', 'https://img.usecurling.com/p/1600/900?q=elegant%20blouse&dpr=2'),
    ('hero_carousel_4', 'https://img.usecurling.com/p/1600/900?q=sophisticated%20shirt&dpr=2'),
    ('hero_carousel_5', 'https://img.usecurling.com/p/1600/900?q=elegant%20pants&dpr=2'),
    ('hero_carousel_6', 'https://img.usecurling.com/p/1600/900?q=sophisticated%20skirt&dpr=2')
  ON CONFLICT (section_key) DO NOTHING;
END $$;
