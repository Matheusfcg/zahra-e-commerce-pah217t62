DO $DO$
BEGIN
  -- Create product_variants table
  CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size_name TEXT NOT NULL,
    color_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

  -- Create RLS Policies for product_variants
  DROP POLICY IF EXISTS "allow_public_read_product_variants" ON public.product_variants;
  CREATE POLICY "allow_public_read_product_variants" ON public.product_variants FOR SELECT USING (true);

  DROP POLICY IF EXISTS "admin_insert_product_variants" ON public.product_variants;
  CREATE POLICY "admin_insert_product_variants" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_update_product_variants" ON public.product_variants;
  CREATE POLICY "admin_update_product_variants" ON public.product_variants FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_delete_product_variants" ON public.product_variants;
  CREATE POLICY "admin_delete_product_variants" ON public.product_variants FOR DELETE TO authenticated USING (public.is_admin());

  -- Create Storage Bucket for category images
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('category-images', 'category-images', true)
  ON CONFLICT (id) DO NOTHING;

  -- Storage Policies for category-images
  DROP POLICY IF EXISTS "Public Access Category Images" ON storage.objects;
  CREATE POLICY "Public Access Category Images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

  DROP POLICY IF EXISTS "Auth Insert Category Images" ON storage.objects;
  CREATE POLICY "Auth Insert Category Images" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'category-images');

  DROP POLICY IF EXISTS "Auth Update Category Images" ON storage.objects;
  CREATE POLICY "Auth Update Category Images" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'category-images');

  DROP POLICY IF EXISTS "Auth Delete Category Images" ON storage.objects;
  CREATE POLICY "Auth Delete Category Images" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'category-images');
END $DO$;

-- Update trigger to deduct stock from product_variants
CREATE OR REPLACE FUNCTION public.deduct_product_stock()
RETURNS trigger AS $DO$
BEGIN
  -- Deduct from general product quantity
  UPDATE public.products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;

  -- Deduct from variant if size and color are provided
  IF NEW.size_name IS NOT NULL AND NEW.color_name IS NOT NULL THEN
    UPDATE public.product_variants
    SET quantity = quantity - NEW.quantity
    WHERE product_id = NEW.product_id
      AND size_name = NEW.size_name
      AND color_name = NEW.color_name;
  END IF;

  RETURN NEW;
END;
$DO$ LANGUAGE plpgsql SECURITY DEFINER;

DO $DO$
BEGIN
  DROP TRIGGER IF EXISTS deduct_stock_on_order_item ON public.order_items;
  CREATE TRIGGER deduct_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_product_stock();
END $DO$;
