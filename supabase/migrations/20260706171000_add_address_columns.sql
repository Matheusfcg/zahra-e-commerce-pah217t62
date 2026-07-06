ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_zip_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_street TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_complement TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_neighborhood TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS number TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS state TEXT;
