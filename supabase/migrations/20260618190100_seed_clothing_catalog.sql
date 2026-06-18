DO $$
DECLARE
  prod_id uuid;
BEGIN
  -- Product 1
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('conj-savanna', 'Conj. Savanna', 190.00, 5, 'P-M-G', 'Lindo conjunto Savanna com cores exclusivas.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'conj-savanna';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom café') THEN
    INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom café', '#5C4033', '');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Caramelo') THEN
    INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Caramelo', '#C68E17', '');
  END IF;

  -- Product 2
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('blusa-renda-floral', 'Blusa renda floral', 95.00, 2, 'M', 'Blusa de renda floral delicada e sofisticada.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'blusa-renda-floral';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preta') THEN
    INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preta', '#000000', '');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom café') THEN
    INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom café', '#5C4033', '');
  END IF;

  -- Product 3
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('conj-dominique', 'Conj. Dominique', 220.00, 6, 'Tam. Único', 'Conjunto Dominique elegante e versátil.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'conj-dominique';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom café') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom café', '#5C4033', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marsala') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marsala', '#982A3A', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Caramelo') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Caramelo', '#C68E17', ''); END IF;

  -- Product 4
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('conj-elegance', 'Conj. Elegance', 180.00, 5, 'P-M-G', 'O Conjunto Elegance é perfeito para ocasiões especiais.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'conj-elegance';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom', '#8B4513', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 5
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('trijunto-malibu', 'Trijunto Malibu', 120.00, 6, 'Tam. Único', 'Trijunto Malibu, estilo e conforto em três peças.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'trijunto-malibu';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 6
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('saia-riviera', 'Saia Riviera', 130.00, 3, 'P', 'Saia Riviera para um look moderno e chic.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'saia-riviera';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 7
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('blusa-assimetrica', 'Blusa assimetrica', 95.00, 3, 'Tam. Único', 'Blusa com corte assimétrico contemporâneo.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'blusa-assimetrica';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom', '#8B4513', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Branca') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Branca', '#FFFFFF', ''); END IF;

  -- Product 8
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('maxi-renda', 'Maxi Renda', 95.00, 5, 'Tam. Único', 'Peça maxi renda, esbanja feminilidade e charme.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'maxi-renda';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preta') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preta', '#000000', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom', '#8B4513', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Branca') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Branca', '#FFFFFF', ''); END IF;

  -- Product 9
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('t-shirt-basica', 'T shirt Basica', 50.00, 3, 'P-M', 'T-shirt básica, essencial no seu guarda-roupa.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 't-shirt-basica';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preta') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preta', '#000000', ''); END IF;

  -- Product 10
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('trico', 'Tricô', 110.00, 3, 'Tam. Único', 'Peça de tricô aconchegante para dias frescos.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'trico';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 11
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('conj-suede', 'Conj. Suede', 160.00, 3, 'M-G', 'Conjunto em Suede, toque macio e caimento perfeito.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'conj-suede';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom', '#8B4513', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 12
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('t-shirt-cowntry', 'T shirt Cowntry', 50.00, 4, 'Tam. Único', 'T-shirt country para compor um visual despojado.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 't-shirt-cowntry';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Branca') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Branca', '#FFFFFF', ''); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preta') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preta', '#000000', ''); END IF;

  -- Product 13
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('calca-jeans', 'Calça Jeans', 170.00, 2, '40-44', 'Calça jeans tradicional com excelente modelagem.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'calca-jeans';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Jeans') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Jeans', '#5D7B9D', ''); END IF;

  -- Product 14
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('jaqueta-jeans', 'Jaqueta Jeans', 210.00, 3, 'P-M-G', 'Jaqueta jeans, a terceira peça curinga.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'jaqueta-jeans';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Jeans') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Jeans', '#5D7B9D', ''); END IF;

  -- Product 15
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('conj-maison', 'Conj. Maison', 160.00, 2, 'M-G', 'Conjunto Maison sofisticado e exclusivo.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'conj-maison';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Preto') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Preto', '#000000', ''); END IF;

  -- Product 16
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('macaquinho-luna', 'Macaquinho Luna', 150.00, 3, 'Tam. Único', 'Macaquinho Luna, conforto e estilo para os dias quentes.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'macaquinho-luna';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Verde') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Verde', '#228B22', ''); END IF;

  -- Product 17
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('body-renda', 'Body Renda', 70.00, 2, 'M', 'Body com detalhes em renda, ousado e elegante.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'body-renda';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Marrom') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Marrom', '#8B4513', ''); END IF;

  -- Product 18
  INSERT INTO public.products (slug, name, price, quantity, measurements, description)
  VALUES ('body-maya', 'Body Maya', 95.00, 3, 'M-G', 'Body Maya, estruturado e moderno.')
  ON CONFLICT (slug) DO NOTHING;
  SELECT id INTO prod_id FROM public.products WHERE slug = 'body-maya';
  IF NOT EXISTS (SELECT 1 FROM public.product_colors WHERE product_id = prod_id AND name = 'Branca') THEN INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES (prod_id, 'Branca', '#FFFFFF', ''); END IF;

END $$;
