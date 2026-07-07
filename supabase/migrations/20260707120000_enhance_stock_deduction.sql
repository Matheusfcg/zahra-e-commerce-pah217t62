-- Enhance the stock deduction trigger to prevent negative inventory
CREATE OR REPLACE FUNCTION public.deduct_product_stock()
RETURNS trigger AS $$
BEGIN
  -- Deduct from general product quantity (prevent negative)
  UPDATE public.products
  SET quantity = GREATEST(0, quantity - NEW.quantity)
  WHERE id = NEW.product_id;

  -- Deduct from variant if size and color are provided
  IF NEW.size_name IS NOT NULL AND NEW.color_name IS NOT NULL THEN
    UPDATE public.product_variants
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id
      AND size_name = NEW.size_name
      AND color_name = NEW.color_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DO $$
BEGIN
  DROP TRIGGER IF EXISTS deduct_stock_on_order_item ON public.order_items;
  CREATE TRIGGER deduct_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_product_stock();
END $$;

-- Ensure RLS policies allow admin updates on product_variants (idempotent)
DO $$
BEGIN
  DROP POLICY IF EXISTS "allow_public_read_product_variants" ON public.product_variants;
  CREATE POLICY "allow_public_read_product_variants" ON public.product_variants
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "admin_insert_product_variants" ON public.product_variants;
  CREATE POLICY "admin_insert_product_variants" ON public.product_variants
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_update_product_variants" ON public.product_variants;
  CREATE POLICY "admin_update_product_variants" ON public.product_variants
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

  DROP POLICY IF EXISTS "admin_delete_product_variants" ON public.product_variants;
  CREATE POLICY "admin_delete_product_variants" ON public.product_variants
    FOR DELETE TO authenticated USING (public.is_admin());
END $$;

-- Ensure RLS policies allow admin updates on products (idempotent)
DO $$
BEGIN
  DROP POLICY IF EXISTS "admin_update_products" ON public.products;
  CREATE POLICY "admin_update_products" ON public.products
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;
