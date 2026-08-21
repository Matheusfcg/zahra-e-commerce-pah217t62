-- Migration: Add birth_date to user_profiles and email status tracking to orders
-- Also ensure handle_new_user trigger maps birth_date from raw_user_meta_data

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add email delivery status tracking to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email_confirmation_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_confirmation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_confirmation_error TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Update handle_new_user trigger to save birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone,
    document_number,
    birth_date
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'document_number',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' <> ''
      THEN (NEW.raw_user_meta_data->>'birth_date')::date
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    document_number = EXCLUDED.document_number,
    birth_date = COALESCE(EXCLUDED.birth_date, public.user_profiles.birth_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for orders so update works properly
DROP POLICY IF EXISTS "allow_update_orders" ON public.orders;
CREATE POLICY "allow_update_orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Ensure indexes for orders performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
