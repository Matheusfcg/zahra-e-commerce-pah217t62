DO $$
DECLARE
  prod_id uuid;
  cat text;
  idx int;
  img_url text;
BEGIN
  -- Ensure site_content text matches the required UI
  INSERT INTO public.site_content (section_key, content_value)
  VALUES ('hero_title', E'ESSÊNCIA DA\nELEGÂNCIA')
  ON CONFLICT (section_key) DO UPDATE SET content_value = E'ESSÊNCIA DA\nELEGÂNCIA';

  INSERT INTO public.site_content (section_key, content_value)
  VALUES ('hero_button', 'EXPLORAR COLEÇÃO')
  ON CONFLICT (section_key) DO UPDATE SET content_value = 'EXPLORAR COLEÇÃO';

  -- Insert required products for the carousel
  FOREACH cat IN ARRAY ARRAY['Conjuntos', 'Partes de Cima', 'Partes de Baixo']
  LOOP
    FOR idx IN 1..2 LOOP
      IF cat = 'Conjuntos' THEN
        img_url := 'https://img.usecurling.com/p/800/1200?q=fashion%20set&seed=' || (idx * 10);
      ELSIF cat = 'Partes de Cima' THEN
        img_url := 'https://img.usecurling.com/p/800/1200?q=fashion%20top&seed=' || (idx * 10);
      ELSE
        img_url := 'https://img.usecurling.com/p/800/1200?q=fashion%20pants&seed=' || (idx * 10);
      END IF;

      INSERT INTO public.products (id, name, slug, price, quantity, category, description)
      VALUES (
        gen_random_uuid(),
        cat || ' Exemplo ' || idx,
        lower(replace(cat, ' ', '-')) || '-exemplo-' || idx,
        199.90,
        10,
        cat,
        'Produto de exemplo da categoria ' || cat
      ) ON CONFLICT (slug) DO NOTHING;

      SELECT id INTO prod_id FROM public.products WHERE slug = lower(replace(cat, ' ', '-')) || '-exemplo-' || idx;

      IF NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = prod_id AND url = img_url) THEN
        INSERT INTO public.product_images (product_id, url, display_order)
        VALUES (prod_id, img_url, 0);
      END IF;
    END LOOP;
  END LOOP;
END $$;
