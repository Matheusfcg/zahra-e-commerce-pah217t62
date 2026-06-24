DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('hero_banner_1', ''),
    ('hero_banner_2', ''),
    ('hero_banner_3', ''),
    ('hero_banner_4', ''),
    ('category_1_label', 'Blusas/Bodys'),
    ('category_1_image', 'https://img.usecurling.com/p/400/400?q=brown%20one%20shoulder%20top%20clothing&color=white'),
    ('category_1_title', 'Blusas/Bodys'),
    ('category_1_desc', 'Descubra nossa coleção de blusas e bodys.'),
    ('category_2_label', 'Conjuntos'),
    ('category_2_image', 'https://img.usecurling.com/p/400/400?q=black%20button-down%20shirt%20shorts%20set&color=white'),
    ('category_2_title', 'Conjuntos'),
    ('category_2_desc', 'Descubra nossa coleção de conjuntos elegantes.'),
    ('category_3_label', 'Partes de baixo'),
    ('category_3_image', 'https://img.usecurling.com/p/400/400?q=black%20mini%20skirt%20clothing&color=white'),
    ('category_3_title', 'Partes de Baixo'),
    ('category_3_desc', 'Descubra nossa coleção de partes de baixo.'),
    ('category_4_label', 'Macaquinho'),
    ('category_4_image', 'https://img.usecurling.com/p/400/400?q=light%20green%20cape%20top%20clothing&color=white'),
    ('category_4_title', 'Macaquinho'),
    ('category_4_desc', 'Descubra nossa coleção de macaquinhos.'),
    ('category_5_label', 'Jeans'),
    ('category_5_image', 'https://img.usecurling.com/p/400/400?q=denim%20jumpsuit%20clothing&color=white'),
    ('category_5_title', 'Jeans'),
    ('category_5_desc', 'Descubra nossa coleção de jeans.')
  ON CONFLICT (section_key) DO NOTHING;
END $$;
