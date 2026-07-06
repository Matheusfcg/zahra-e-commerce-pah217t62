ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_days INTEGER;
