-- Migration: Ensure Meyves official hero banner defaults and clean any stale images
-- Timestamp: 20260905110000

DO $$
BEGIN
  -- Insert or update the official hero banner fields
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES
    ('hero_eyebrow', 'HEY, GIRL!', NOW()),
    ('hero_title', 'BEM-VINDA À MEYVE.', NOW()),
    ('hero_button_text', 'COMPRE AGORA', NOW()),
    ('hero_button_link', '/produtos', NOW()),
    ('hero_banner_image', '', NOW()),
    ('hero_images', '[]', NOW())
  ON CONFLICT (section_key) DO UPDATE
  SET
    content_value = EXCLUDED.content_value,
    updated_at = NOW();

  -- Reset legacy keys that held outdated text or image URLs
  UPDATE public.site_content
  SET content_value = 'HEY, GIRL!', updated_at = NOW()
  WHERE section_key = 'hero_eyebrow' AND (content_value IS NULL OR content_value = '');

  UPDATE public.site_content
  SET content_value = 'BEM-VINDA À MEYVE.', updated_at = NOW()
  WHERE section_key = 'hero_title' AND (content_value ILIKE '%Essência%' OR content_value ILIKE '%Elegância%' OR content_value IS NULL OR content_value = '');

  UPDATE public.site_content
  SET content_value = 'COMPRE AGORA', updated_at = NOW()
  WHERE section_key IN ('hero_button', 'hero_button_text') AND (content_value ILIKE '%explorar%' OR content_value IS NULL OR content_value = '');

  UPDATE public.site_content
  SET content_value = '', updated_at = NOW()
  WHERE section_key IN ('hero_banner_1', 'hero_banner_2', 'hero_banner_3', 'hero_banner_4');

END $$;
