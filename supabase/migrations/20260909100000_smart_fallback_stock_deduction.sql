-- Ensure stock deduction handles fallback stock correctly and prevents negative values
CREATE OR REPLACE FUNCTION public.deduct_product_stock()
RETURNS trigger AS $$
BEGIN
  -- Deduct from general product quantity (prevent negative)
  UPDATE public.products
  SET quantity = GREATEST(0, quantity - NEW.quantity)
  WHERE id = NEW.product_id;

  -- Deduct from variant if size and color are provided and variant exists
  IF NEW.size_name IS NOT NULL AND NEW.color_name IS NOT NULL THEN
    UPDATE public.product_variants
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id
      AND size_name = NEW.size_name
      AND color_name = NEW.color_name;
  END IF;

  -- Also deduct from product_sizes if present and size is provided
  IF NEW.size_name IS NOT NULL THEN
    UPDATE public.product_sizes
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE product_id = NEW.product_id
      AND size_name = NEW.size_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-ensure trigger is registered
DO $$
BEGIN
  DROP TRIGGER IF EXISTS deduct_stock_on_order_item ON public.order_items;
  CREATE TRIGGER deduct_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_product_stock();
END $$;
