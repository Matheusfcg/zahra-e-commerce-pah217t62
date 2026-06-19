DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INT NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- RLS for orders
  ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "allow_insert_orders" ON public.orders;
  CREATE POLICY "allow_insert_orders" ON public.orders
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "allow_read_own_orders" ON public.orders;
  CREATE POLICY "allow_read_own_orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

  -- RLS for order_items
  ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "allow_insert_order_items" ON public.order_items;
  CREATE POLICY "allow_insert_order_items" ON public.order_items
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "allow_read_order_items" ON public.order_items;
  CREATE POLICY "allow_read_order_items" ON public.order_items
    FOR SELECT USING (
      order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) 
      OR public.is_admin()
    );
END $$;
