DO $$
DECLARE
  v_product_id uuid;
BEGIN
  SELECT id INTO v_product_id FROM public.products WHERE slug = 'bolsa-zahra-brazil' LIMIT 1;

  IF v_product_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = v_product_id AND name = 'Vinho') THEN
      INSERT INTO public.product_colors (id, product_id, name, hex_value, image_url)
      VALUES (gen_random_uuid(), v_product_id, 'Vinho', '#310A14', '/assets/1produto-67ee8.png');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = v_product_id AND url = '/assets/1produto-67ee8.png') THEN
      INSERT INTO public.product_images (id, product_id, url, display_order)
      VALUES 
        (gen_random_uuid(), v_product_id, '/assets/1produto-67ee8.png', 1),
        (gen_random_uuid(), v_product_id, '/assets/image-048b7.png', 2);
    END IF;
  END IF;
END $$;
