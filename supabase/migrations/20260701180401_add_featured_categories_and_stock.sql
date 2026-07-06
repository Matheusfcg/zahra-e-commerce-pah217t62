-- Migration: Add featured categories, image_url, order item specs, and stock triggers

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS size_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color_name TEXT;

-- Seed some featured categories to not break existing UI immediately
UPDATE public.categories SET is_featured = true, image_url = 'https://img.usecurling.com/p/400/400?q=brown%20one%20shoulder%20top%20clothing&color=white' WHERE slug = 'blusas-e-bodies';
UPDATE public.categories SET is_featured = true, image_url = 'https://img.usecurling.com/p/400/400?q=black%20button-down%20shirt%20shorts%20set&color=white' WHERE slug = 'conjuntos';
UPDATE public.categories SET is_featured = true, image_url = 'https://img.usecurling.com/p/400/400?q=black%20mini%20skirt%20clothing&color=white' WHERE slug = 'saias';
UPDATE public.categories SET is_featured = true, image_url = 'https://img.usecurling.com/p/400/400?q=light%20green%20cape%20top%20clothing&color=white' WHERE slug = 'macaquinhos';
UPDATE public.categories SET is_featured = true, image_url = 'https://img.usecurling.com/p/400/400?q=denim%20jumpsuit%20clothing&color=white' WHERE slug = 'jeans';

-- Trigger to deduct stock
CREATE OR REPLACE FUNCTION public.deduct_product_stock()
RETURNS trigger AS $$
BEGIN
  -- Deduct from product_sizes
  IF NEW.size_name IS NOT NULL THEN
    UPDATE public.product_sizes
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id AND size_name = NEW.size_name;
  END IF;

  -- Also deduct from total products quantity
  UPDATE public.products
  SET quantity = GREATEST(0, quantity - NEW.quantity)
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deduct_stock_on_order ON public.order_items;
CREATE TRIGGER deduct_stock_on_order
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_product_stock();

-- Ensure site-assets bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access site-assets" ON storage.objects;
CREATE POLICY "Public Access site-assets" ON storage.objects 
  FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admin Upload Access site-assets" ON storage.objects;
CREATE POLICY "Admin Upload Access site-assets" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());
  
DROP POLICY IF EXISTS "Admin Update Access site-assets" ON storage.objects;
CREATE POLICY "Admin Update Access site-assets" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Access site-assets" ON storage.objects;
CREATE POLICY "Admin Delete Access site-assets" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());

-- Default hero images
INSERT INTO public.site_content (section_key, content_value) VALUES 
('hero_images', '["https://img.usecurling.com/p/800/1200?q=elegant%20fashion&dpr=2", "https://img.usecurling.com/p/800/1200?q=sophisticated%20clothing&dpr=2"]')
ON CONFLICT (section_key) DO NOTHING;
