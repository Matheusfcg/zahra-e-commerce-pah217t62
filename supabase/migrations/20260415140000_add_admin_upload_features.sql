DO $DO$
BEGIN
  -- Create the product-images bucket if it does not exist
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;
END $DO$;

-- Storage objects policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Table policies for product_images
DROP POLICY IF EXISTS "allow_auth_insert_product_images" ON public.product_images;
CREATE POLICY "allow_auth_insert_product_images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_auth_update_product_images" ON public.product_images;
CREATE POLICY "allow_auth_update_product_images" ON public.product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_auth_delete_product_images" ON public.product_images;
CREATE POLICY "allow_auth_delete_product_images" ON public.product_images FOR DELETE TO authenticated USING (true);
