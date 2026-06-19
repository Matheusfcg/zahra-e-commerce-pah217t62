DO $$
DECLARE
  prod_id uuid;
BEGIN
  -- Seed non-basic products for two-by-two grid
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'vestido-longo-elegance') THEN
    prod_id := gen_random_uuid();
    INSERT INTO public.products (id, slug, name, price, description, is_featured, category, is_promotion, quantity)
    VALUES (prod_id, 'vestido-longo-elegance', 'Vestido Longo Elegance', 350.00, 'Vestido longo em tecido premium, caimento impecável e design atemporal.', false, 'Vestidos', false, 20);

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod_id, 'https://img.usecurling.com/p/1200/1600?q=elegant%20woman%20in%20long%20dress&color=black&dpr=2', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'conjunto-alfaiataria-terracota') THEN
    prod_id := gen_random_uuid();
    INSERT INTO public.products (id, slug, name, price, description, is_featured, category, is_promotion, quantity)
    VALUES (prod_id, 'conjunto-alfaiataria-terracota', 'Conjunto Alfaiataria', 420.00, 'Alfaiataria estruturada com tom terroso, ideal para um visual sofisticado e moderno.', false, 'Conjuntos', false, 15);

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod_id, 'https://img.usecurling.com/p/1200/1600?q=woman%20in%20tailored%20suit&color=orange&dpr=2', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'blazer-oversized-chocolate') THEN
    prod_id := gen_random_uuid();
    INSERT INTO public.products (id, slug, name, price, description, is_featured, category, is_promotion, quantity)
    VALUES (prod_id, 'blazer-oversized-chocolate', 'Blazer Oversized', 280.00, 'Blazer estruturado com corte oversized. Perfeito para sobreposições marcantes.', false, 'Casacos', false, 25);

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod_id, 'https://img.usecurling.com/p/1200/1600?q=fashion%20model%20blazer&color=gray&dpr=2', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'saia-midi-couro') THEN
    prod_id := gen_random_uuid();
    INSERT INTO public.products (id, slug, name, price, description, is_featured, category, is_promotion, quantity)
    VALUES (prod_id, 'saia-midi-couro', 'Saia Midi em Couro', 190.00, 'Saia midi de couro ecológico com fenda lateral. Atitude e elegância.', false, 'Saias', false, 10);

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod_id, 'https://img.usecurling.com/p/1200/1600?q=leather%20midi%20skirt%20fashion&color=black&dpr=2', 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 't-shirt-basico-branco') THEN
    prod_id := gen_random_uuid();
    INSERT INTO public.products (id, slug, name, price, description, is_featured, category, is_promotion, quantity)
    VALUES (prod_id, 't-shirt-basico-branco', 'T-Shirt Básico', 50.00, 'T-shirt básica para o dia a dia.', false, 'Camisetas', false, 50);

    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod_id, 'https://img.usecurling.com/p/800/1000?q=white%20t-shirt&dpr=2', 0);
  END IF;

END $$;
