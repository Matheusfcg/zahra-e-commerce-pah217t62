DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('tab_name_principal', 'Principal'),
    ('tab_name_conjuntos', 'Conjuntos'),
    ('tab_name_partes_de_cima', 'Partes de Cima'),
    ('tab_name_partes_de_baixo', 'Partes de Baixo')
  ON CONFLICT (section_key) DO NOTHING;
END $$;
