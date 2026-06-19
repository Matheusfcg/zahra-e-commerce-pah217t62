DO $$
BEGIN
  -- Add category to products
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

  -- Create user_favorites
  CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  );

  -- RLS for user_favorites
  ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
  CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
  CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
  CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
END $$;

-- Seed data for categories (idempotent, won't overwrite existing categories)
DO $$
DECLARE
    prod RECORD;
    cat TEXT;
    idx INT := 0;
BEGIN
    FOR prod IN SELECT id, category FROM public.products WHERE category IS NULL LOOP
        IF idx % 3 = 0 THEN cat := 'Conjuntos';
        ELSIF idx % 3 = 1 THEN cat := 'Parte de Cima';
        ELSE cat := 'Parte de Baixo';
        END IF;
        
        UPDATE public.products SET category = cat WHERE id = prod.id;
        idx := idx + 1;
    END LOOP;
END $$;

-- Seed user brsolutiontransport@gmail.com
DO $do$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'brsolutiontransport@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'brsolutiontransport@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "BR Solution"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name)
    VALUES (new_user_id, 'BR Solution')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $do$;
