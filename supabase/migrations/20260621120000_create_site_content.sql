CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_site_content" ON public.site_content;
CREATE POLICY "allow_public_read_site_content" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_insert_site_content" ON public.site_content;
CREATE POLICY "admin_insert_site_content" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_site_content" ON public.site_content;
CREATE POLICY "admin_update_site_content" ON public.site_content
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_site_content" ON public.site_content;
CREATE POLICY "admin_delete_site_content" ON public.site_content
  FOR DELETE TO authenticated USING (is_admin());

INSERT INTO public.site_content (section_key, content_value) VALUES
  ('hero_title', 'Essência da Elegância'),
  ('hero_description', 'Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza natural.'),
  ('hero_button', 'Explorar Coleção'),
  ('values_1_title', 'Design Autoral'),
  ('values_1_desc', 'Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.'),
  ('values_2_title', 'Qualidade Premium'),
  ('values_2_desc', 'Seleção rigorosa de materiais para garantir durabilidade e sofisticação.'),
  ('values_3_title', 'Sustentabilidade'),
  ('values_3_desc', 'Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.')
ON CONFLICT (section_key) DO NOTHING;
