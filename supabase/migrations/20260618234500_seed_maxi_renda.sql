DO $do$
BEGIN
  -- Add the Maxi Renda product if it doesn't exist
  INSERT INTO public.products (slug, name, price, quantity, description)
  VALUES ('maxi-renda', 'Maxi Renda', 150.00, 20, 'Lindo vestido de renda maxi para ocasiões especiais. Peça essencial para um look sofisticado e inesquecível.')
  ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    price = EXCLUDED.price,
    description = EXCLUDED.description;

  -- Add an image for it if none exists
  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=lace%20dress&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 'maxi-renda' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);
END $do$;
