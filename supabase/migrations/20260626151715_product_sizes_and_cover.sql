DO $$
BEGIN
  -- Add is_cover to product_images
  ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_cover BOOLEAN DEFAULT false;
  
  -- Create product_sizes table
  CREATE TABLE IF NOT EXISTS public.product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- Enable RLS
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_sizes
DROP POLICY IF EXISTS "allow_public_read_product_sizes" ON public.product_sizes;
CREATE POLICY "allow_public_read_product_sizes" ON public.product_sizes
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_insert_product_sizes" ON public.product_sizes;
CREATE POLICY "admin_insert_product_sizes" ON public.product_sizes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_product_sizes" ON public.product_sizes;
CREATE POLICY "admin_update_product_sizes" ON public.product_sizes
  FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_product_sizes" ON public.product_sizes;
CREATE POLICY "admin_delete_product_sizes" ON public.product_sizes
  FOR DELETE TO authenticated USING (public.is_admin());

-- Trigger to ensure only one cover image per product
CREATE OR REPLACE FUNCTION public.handle_product_image_cover()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_cover = true THEN
    UPDATE public.product_images
    SET is_cover = false
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_cover = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_cover_image ON public.product_images;
CREATE TRIGGER ensure_single_cover_image
  BEFORE INSERT OR UPDATE OF is_cover ON public.product_images
  FOR EACH ROW
  WHEN (NEW.is_cover = true)
  EXECUTE FUNCTION public.handle_product_image_cover();

-- Seed data for existing products: Create 'Tamanho Único' size for existing products
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN SELECT id, quantity FROM public.products
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.product_sizes WHERE product_id = prod.id) THEN
      INSERT INTO public.product_sizes (product_id, size_name, quantity)
      VALUES (prod.id, 'Tamanho Único', COALESCE(prod.quantity, 0));
    END IF;
    
    -- Also ensure at least one image is cover if there are images but none is cover
    IF EXISTS (SELECT 1 FROM public.product_images WHERE product_id = prod.id) AND 
       NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = prod.id AND is_cover = true) THEN
      UPDATE public.product_images 
      SET is_cover = true 
      WHERE id = (
        SELECT id FROM public.product_images 
        WHERE product_id = prod.id 
        ORDER BY display_order ASC 
        LIMIT 1
      );
    END IF;
  END LOOP;
END $$;
