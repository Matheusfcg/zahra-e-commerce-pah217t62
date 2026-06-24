DO $$
DECLARE
  jeans_id uuid;
BEGIN
  -- Update old categories to new taxonomy for the visual navigation
  UPDATE public.products 
  SET category = 'Partes de Baixo' 
  WHERE category IN ('SAIAS', 'CALÇAS', 'Saias', 'Calças');

  UPDATE public.products 
  SET category = 'Blusas e Bodies' 
  WHERE category IN ('BLUSAS E BODIES', 'Blusas', 'Bodys');

  UPDATE public.products 
  SET category = 'Conjuntos' 
  WHERE category = 'CONJUNTOS';

  UPDATE public.products 
  SET category = 'Macaquinhos' 
  WHERE category IN ('MACAQUINHOS', 'Macaquinho');

  -- Seed a Jeans product if none exists to avoid empty states
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE category = 'Jeans') THEN
    jeans_id := gen_random_uuid();
    
    INSERT INTO public.products (id, name, slug, description, price, quantity, is_promotion, category, is_featured, show_in_carousel)
    VALUES (
      jeans_id,
      'Calça Jeans Wide Leg',
      'calca-jeans-wide-leg',
      'Calça jeans com modelagem wide leg, cintura alta e lavagem clássica.',
      229.90,
      10,
      false,
      'Jeans',
      true,
      true
    );

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (
      jeans_id,
      'https://img.usecurling.com/p/600/800?q=wide%20leg%20jeans&color=blue&seed=1',
      0
    );
  END IF;
END $$;
