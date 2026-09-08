-- Migration: Override legacy hero site_content with the exact Meyve hero banner content
-- Timestamp: 20260905100000

DO $$
BEGIN
  -- 1. Insert or update the official hero banner fields
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES
    ('hero_eyebrow', 'HEY, GIRL!', NOW()),
    ('hero_title', 'BEM-VINDA À MEYVE.', NOW()),
    ('hero_button_text', 'COMPRE AGORA', NOW()),
    ('hero_button_link', '/produtos', NOW()),
    ('hero_banner_image', '', NOW()),
    ('hero_banner_1', '', NOW()),
    ('hero_banner_2', '', NOW()),
    ('hero_banner_3', '', NOW()),
    ('hero_banner_4', '', NOW()),
    ('hero_images', '[]', NOW())
  ON CONFLICT (section_key) DO UPDATE
  SET
    content_value = EXCLUDED.content_value,
    updated_at = NOW();

  -- 2. Clear or overwrite legacy keys that still had "Essência da Elegância" or "Explorar Coleção"
  UPDATE public.site_content
  SET content_value = 'BEM-VINDA À MEYVE.', updated_at = NOW()
  WHERE section_key = 'hero_title' AND (content_value ILIKE '%Essência%' OR content_value ILIKE '%Elegância%');

  UPDATE public.site_content
  SET content_value = 'COMPRE AGORA', updated_at = NOW()
  WHERE section_key = 'hero_button' OR section_key = 'hero_button_text';

  -- Clean legacy hero images / carousels so they don't override the primary banner
  UPDATE public.site_content
  SET content_value = '', updated_at = NOW()
  WHERE section_key IN ('hero_banner_image', 'hero_banner_1', 'hero_banner_2', 'hero_banner_3', 'hero_banner_4');

  UPDATE public.site_content
  SET content_value = '[]', updated_at = NOW()
  WHERE section_key = 'hero_images';

END $$;
