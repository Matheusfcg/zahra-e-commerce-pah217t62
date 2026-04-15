DO $$
DECLARE
  v_product_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'bolsa-zahra-brazil') THEN
    INSERT INTO public.products (
      id, slug, name, price, description, composition, measurements
    ) VALUES (
      v_product_id,
      'bolsa-zahra-brazil',
      'Bolsa Zahrá Brazil',
      199.90,
      'Bolsa exclusiva Zahrá, com design minimalista e elegante. A peça fundamental para carregar o essencial e ser inesquecível, seguindo nossa paleta neutra e vinho.',
      'Material Sintético Premium',
      '40cm x 38cm x 12cm'
    );
  END IF;
END $$;
