DO $$
BEGIN
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('blusa-assimetrica', 'Blusa assimetrica', 95.00, 10, 'Blusa assimetrica') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('blusa-renda-floral', 'Blusa renda floral', 95.00, 10, 'Blusa renda floral') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('body-maya', 'Body Maya', 95.00, 10, 'Body Maya') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('body-renda', 'Body Renda', 70.00, 10, 'Body Renda') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('bolsa-zahra-brazil', 'Bolsa Zahrá Brazil', 250.00, 10, 'Bolsa Zahrá Brazil') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('bolsa-zahra-clutch', 'Bolsa Zahrá Clutch', 180.00, 10, 'Bolsa Zahrá Clutch') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('bolsa-zahra-luna', 'Bolsa Zahrá Luna', 220.00, 10, 'Bolsa Zahrá Luna') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('bolsa-zahra-tote', 'Bolsa Zahrá Tote', 280.00, 10, 'Bolsa Zahrá Tote') ON CONFLICT (slug) DO NOTHING;
  INSERT INTO public.products (slug, name, price, quantity, description) VALUES ('calca-jeans', 'Calça Jeans', 170.00, 10, 'Calça Jeans') ON CONFLICT (slug) DO NOTHING;
END $$;
