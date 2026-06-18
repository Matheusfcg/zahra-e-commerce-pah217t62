DO $do$
BEGIN
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES
    ('t-shirt-country', 'T-shirt Country', 89.90, 50, 'T-shirt em algodão com estampa country exclusiva, modelagem confortável.'),
    ('vestido-luxo-seda', 'Vestido Luxo', 899.90, 5, 'Vestido longo de seda com bordados manuais perfeitos para ocasiões especiais.'),
    ('jaqueta-premium-couro', 'Jaqueta Premium', 1200.00, 2, 'Jaqueta de couro legítimo premium com acabamento impecável.'),
    ('bolsa-exclusiva-ouro', 'Bolsa Exclusiva', 1500.00, 3, 'Bolsa de grife com detalhes folheados a ouro.'),
    ('brinco-simples-prata', 'Brinco Simples', 19.90, 100, 'Brinco pequeno de prata 925.'),
    ('pulseira-basica-fina', 'Pulseira Básica', 25.00, 80, 'Pulseira fina trançada ajustável.'),
    ('anel-minimalista-aco', 'Anel Minimalista', 30.00, 90, 'Anel liso minimalista em aço inoxidável.')
  ON CONFLICT (slug) DO NOTHING;

  -- Add images dynamically if they don't have any
  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=country%20t-shirt&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 't-shirt-country' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);

  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=luxury%20silk%20dress&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 'vestido-luxo-seda' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);

  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=premium%20leather%20jacket&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 'jaqueta-premium-couro' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);
  
  INSERT INTO public.product_images (product_id, url, display_order)
  SELECT p.id, 'https://img.usecurling.com/p/800/1000?q=minimalist%20silver%20ring&dpr=2', 0
  FROM public.products p
  WHERE p.slug = 'anel-minimalista-aco' AND NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id);
END $do$;
