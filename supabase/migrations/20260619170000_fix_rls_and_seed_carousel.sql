-- Fix RLS Policies for anon and authenticated SELECT
DO $$
BEGIN
  -- Products
  DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
  CREATE POLICY "allow_public_read_products" ON public.products 
    FOR SELECT USING (true);
  
  -- Product Images
  DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
  CREATE POLICY "allow_public_read_product_images" ON public.product_images 
    FOR SELECT USING (true);
  
  -- Product Colors
  DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
  CREATE POLICY "allow_public_read_product_colors" ON public.product_colors 
    FOR SELECT USING (true);
END $$;

-- Seed Carousel Products
DO $$
DECLARE
  prod1_id uuid := gen_random_uuid();
  prod2_id uuid := gen_random_uuid();
  prod3_id uuid := gen_random_uuid();
BEGIN
  -- Product 1: BRAZUCA
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'brazuca') THEN
    INSERT INTO public.products (id, slug, name, price, quantity, description, category, is_promotion, show_in_carousel)
    VALUES (prod1_id, 'brazuca', 'BRAZUCA', 259.90, 10, 'O conjunto Brazuca é a escolha perfeita para quem busca estilo e conforto em uma peça única. Desenvolvido com materiais de alta qualidade e um design autoral que acompanha as últimas tendências.', 'CONJUNTOS', true, true);
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod1_id, 'https://onfkaptmtujiihiunsnu.supabase.co/storage/v1/object/public/product-images/44d215b3-4433-4722-973f-cf5cc8435e6d-1781823348677-0.jpg', 0);
  ELSE
    UPDATE public.products SET show_in_carousel = true, is_promotion = true, quantity = GREATEST(quantity, 10) WHERE slug = 'brazuca';
  END IF;

  -- Product 2: CONJUNTO ATEMPORAL
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'conjunto-atemporal-promocao') THEN
    INSERT INTO public.products (id, slug, name, price, quantity, description, category, is_promotion, show_in_carousel)
    VALUES (prod2_id, 'conjunto-atemporal-promocao', 'ATEMPORAL', 199.90, 15, 'Conjunto clássico que nunca sai de moda. Versátil para qualquer ocasião.', 'CONJUNTOS', true, true);
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod2_id, 'https://img.usecurling.com/p/800/1000?q=fashion%20model&color=white', 0);
  END IF;

  -- Product 3: VESTIDO MAXI
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'vestido-maxi-promocao') THEN
    INSERT INTO public.products (id, slug, name, price, quantity, description, category, is_promotion, show_in_carousel)
    VALUES (prod3_id, 'vestido-maxi-promocao', 'VESTIDO MAXI', 179.90, 20, 'Vestido Maxi confortável, ideal para dias quentes e eventos casuais.', 'PARTES DE BAIXO', true, true);
    
    INSERT INTO public.product_images (product_id, url, display_order)
    VALUES (prod3_id, 'https://img.usecurling.com/p/800/1000?q=dress&color=white', 0);
  END IF;

END $$;
