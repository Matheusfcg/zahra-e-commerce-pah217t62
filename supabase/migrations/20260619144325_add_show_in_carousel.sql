ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_in_carousel BOOLEAN DEFAULT false;

DO $$
BEGIN
  -- Seeding logic: mark specific products or recent products to show in carousel
  UPDATE public.products SET show_in_carousel = true WHERE name ILIKE '%Trijunto Malibu%' OR name ILIKE '%Maxi Renda%' OR is_featured = true;

  -- Fallback if no products matched
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE show_in_carousel = true) THEN
    UPDATE public.products SET show_in_carousel = true
    WHERE id IN (
      SELECT id FROM public.products ORDER BY created_at DESC LIMIT 3
    );
  END IF;
END $$;
