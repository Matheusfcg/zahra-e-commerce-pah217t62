ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Optionally, set Trijunto Malibu to be featured so it displays right away
DO $$
BEGIN
  UPDATE public.products SET is_featured = true WHERE name ILIKE '%Trijunto Malibu%';
END $$;
