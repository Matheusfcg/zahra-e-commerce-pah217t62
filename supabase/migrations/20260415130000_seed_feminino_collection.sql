DO $$
DECLARE
  v_prod1_id uuid;
  v_prod2_id uuid := gen_random_uuid();
  v_prod3_id uuid := gen_random_uuid();
  v_prod4_id uuid := gen_random_uuid();
BEGIN
  -- 1. Ensure the original product has an image for the product page
  SELECT id INTO v_prod1_id FROM public.products WHERE slug = 'bolsa-zahra-brazil';
  
  IF v_prod1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = v_prod1_id) THEN
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (v_prod1_id, 'https://img.usecurling.com/p/800/1000?q=burgundy%20handbag%20minimalist&color=red&dpr=2', 0);
  END IF;

  -- 2. Add new products for the "Feminino" section using the requested image style
  -- "bolsa sozinha com o fundo minimalista, penduarada na parade ou porta"
  
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'bolsa-zahra-luna') THEN
    INSERT INTO public.products (id, slug, name, price, description, composition, measurements)
    VALUES (
      v_prod2_id, 
      'bolsa-zahra-luna', 
      'Bolsa Zahrá Luna', 
      249.90, 
      'Elegância em formato de meia-lua. Perfeita para qualquer ocasião, combinando com o seu estilo minimalista.', 
      'Couro Vegano Premium', 
      '30cm x 25cm x 10cm'
    );
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (v_prod2_id, 'https://img.usecurling.com/p/800/1000?q=leather%20bag%20hanging%20on%20wall%20minimalist&dpr=2', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'bolsa-zahra-tote') THEN
    INSERT INTO public.products (id, slug, name, price, description, composition, measurements)
    VALUES (
      v_prod3_id, 
      'bolsa-zahra-tote', 
      'Bolsa Zahrá Tote', 
      289.90, 
      'Espaçosa e sofisticada. A companheira ideal para o seu dia a dia de trabalho ou lazer.', 
      'Couro Vegano Premium', 
      '45cm x 35cm x 15cm'
    );
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (v_prod3_id, 'https://img.usecurling.com/p/800/1000?q=tote%20bag%20hanging%20on%20door%20minimalist&dpr=2', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'bolsa-zahra-clutch') THEN
    INSERT INTO public.products (id, slug, name, price, description, composition, measurements)
    VALUES (
      v_prod4_id, 
      'bolsa-zahra-clutch', 
      'Bolsa Zahrá Clutch', 
      159.90, 
      'Pequena, prática e inesquecível. O toque final perfeito para o seu visual noturno.', 
      'Sintético de Alta Qualidade', 
      '20cm x 15cm x 5cm'
    );
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (v_prod4_id, 'https://img.usecurling.com/p/800/1000?q=small%20purse%20hanging%20hook%20minimalist&dpr=2', 0);
  END IF;

END $$;
