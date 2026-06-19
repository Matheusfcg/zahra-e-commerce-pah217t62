DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('main_title', 'Todas as Peças'),
    ('sets_title', 'Conjuntos'),
    ('tops_title', 'Partes de Cima'),
    ('bottoms_title', 'Partes de Baixo')
  ON CONFLICT (section_key) DO NOTHING;
END $$;
