DO $$
BEGIN
  -- Set Banners to empty to fallback to default imports (which represent the local accurate assets)
  INSERT INTO public.site_content (section_key, content_value) VALUES 
    ('hero_banner_1', ''),
    ('hero_banner_2', ''),
    ('hero_banner_3', ''),
    ('hero_banner_4', '')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;

  -- Set Categories to the exact placeholders and labels matching the references
  INSERT INTO public.site_content (section_key, content_value) VALUES 
    ('category_1_label', 'Blusas/Bodys'),
    ('category_1_value', 'Blusas/Bodys'),
    ('category_1_image', 'https://img.usecurling.com/p/400/400?q=brown%20one%20shoulder%20top%20clothing&color=white'),
    ('category_2_label', 'Conjuntos'),
    ('category_2_value', 'Conjuntos'),
    ('category_2_image', 'https://img.usecurling.com/p/400/400?q=black%20button-down%20shirt%20shorts%20set&color=white'),
    ('category_3_label', 'Partes de baixo'),
    ('category_3_value', 'Partes de baixo'),
    ('category_3_image', 'https://img.usecurling.com/p/400/400?q=black%20mini%20skirt%20clothing&color=white'),
    ('category_4_label', 'Macaquinho'),
    ('category_4_value', 'Macaquinho'),
    ('category_4_image', 'https://img.usecurling.com/p/400/400?q=light%20green%20cape%20top%20clothing&color=white'),
    ('category_5_label', 'Jeans'),
    ('category_5_value', 'Jeans'),
    ('category_5_image', 'https://img.usecurling.com/p/400/400?q=denim%20jumpsuit%20clothing&color=white')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;
END $$;
