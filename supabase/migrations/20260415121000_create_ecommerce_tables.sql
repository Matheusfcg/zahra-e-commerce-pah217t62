CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  composition TEXT,
  measurements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  hex_value TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_products" ON public.products;
CREATE POLICY "allow_public_read_products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_colors" ON public.product_colors;
CREATE POLICY "allow_public_read_product_colors" ON public.product_colors FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_public_read_product_images" ON public.product_images;
CREATE POLICY "allow_public_read_product_images" ON public.product_images FOR SELECT USING (true);

-- Seed Initial Product Data
DO $$
DECLARE
  v_product_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'zahra-signature-tote') THEN
    v_product_id := gen_random_uuid();
    
    INSERT INTO public.products (id, slug, name, price, description, composition, measurements)
    VALUES (
      v_product_id,
      'zahra-signature-tote',
      'Zahrá Signature Tote',
      890.00,
      'A essência do estilo minimalista e da funcionalidade. Confeccionada com materiais premium e design autoral, perfeita para acompanhar a mulher moderna em todas as ocasiões.',
      '100% Couro Vegano Premium. Forro em sarja de algodão.',
      'Altura: 32cm | Largura: 45cm | Profundidade: 15cm | Alça: 25cm'
    );
    
    INSERT INTO public.product_colors (product_id, name, hex_value, image_url) VALUES
      (v_product_id, 'Vinho', '#2D0B0B', 'https://img.usecurling.com/p/800/1000?q=burgundy%20leather%20tote%20bag'),
      (v_product_id, 'Creme', '#FAF9F6', 'https://img.usecurling.com/p/800/1000?q=cream%20leather%20tote%20bag'),
      (v_product_id, 'Preto', '#1A1A1A', 'https://img.usecurling.com/p/800/1000?q=black%20leather%20tote%20bag');
      
    INSERT INTO public.product_images (product_id, url, display_order) VALUES
      (v_product_id, 'https://img.usecurling.com/p/800/1000?q=burgundy%20leather%20tote%20bag%20fashion', 1),
      (v_product_id, 'https://img.usecurling.com/p/800/1000?q=tote%20bag%20interior%20detail', 2),
      (v_product_id, 'https://img.usecurling.com/p/800/1000?q=woman%20holding%20elegant%20bag', 3),
      (v_product_id, 'https://img.usecurling.com/p/800/1000?q=premium%20bag%20texture', 4);
  END IF;
END $$;

-- Seed Default Admin User
DO $$
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
      '{"name": "Admin Zahrá"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,  
      '', '', ''
    );
  END IF;
END $$;
