DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('hero_title', 'Essência da\nElegância'),
    ('hero_description', 'Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza natural.'),
    ('hero_button', 'Explorar Coleção'),
    ('values_1_title', 'Design Autoral'),
    ('values_1_desc', 'Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.'),
    ('values_2_title', 'Qualidade Premium'),
    ('values_2_desc', 'Seleção rigorosa de materiais para garantir durabilidade e sofisticação.'),
    ('values_3_title', 'Sustentabilidade'),
    ('values_3_desc', 'Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.'),
    ('footer_about', 'A essência do estilo minimalista. Peças autorais desenhadas no Brasil com materiais premium e compromisso com a excelência.'),
    ('footer_copyright', '© 2024 Zahra Brasil. Todos os direitos reservados.'),
    ('footer_whatsapp', 'WhatsApp: (11) 93416-0219')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;
END $$;
