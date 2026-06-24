DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed site content
  INSERT INTO public.site_content (section_key, content_value) VALUES
  ('exchange_policy', '**Trocar ou devolver**

**Trocas e Devoluções**
Todas as solicitações são feitas exclusivamente pelo link: https://lamagieclothes.troque.app.br/
Não aceitamos trocas de peças promocionais.

**Prazo**
Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução. Em caso de defeito de fabricação, o prazo é de 30 dias.
Observação: Em compras realizadas com cupom ou promoção, o valor do cupom de troca será referente ao valor pago na compra, e não ao valor original do produto.

**Condições**
A peça deve estar nova, com etiqueta e na embalagem original. Não aceitamos trocas ou devoluções de produtos usados, sujos ou manchados.
O frete de envio até a gente é por nossa conta. O frete de reenvio da nova peça é de responsabilidade da cliente.

**Como Trocar ou Devolver**
Acesse: https://lamagieclothes.troque.app.br/
Preencha os dados: número do pedido e tipo de solicitação (troca ou devolução).
Siga as instruções para envio do produto.
Após o recebimento e aprovação, o processo será concluído conforme sua escolha.
Todas as atualizações chegam por e-mail.

**Cupom de Troca**
O cupom deve ser usado integralmente em uma única compra e é válido por 90 dias a partir do envio por e-mail.

**Reembolso**
Cartão de Crédito: O estorno é feito diretamente na fatura — parcelado conforme as parcelas, à vista de forma integral. O prazo pode variar conforme a operadora, geralmente em até 10 dias úteis.
Pix: O valor é devolvido diretamente na sua conta em até 3 dias úteis.

**Exceções**
Não realizamos trocas ou devoluções de produtos personalizados ou feitos sob encomenda, como ajustes de comprimento ou modificações de modelagem.')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;

  -- Ensure brsolutiontransport@gmail.com has the right password
  UPDATE auth.users 
  SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')) 
  WHERE email = 'brsolutiontransport@gmail.com';

  -- Seed products requested in AC
  -- Conjuntos
  INSERT INTO public.products (id, slug, name, price, description, category, quantity) VALUES
  (gen_random_uuid(), 'dominique', 'Dominique', 189.90, 'Conjunto Dominique', 'Conjuntos', 10),
  (gen_random_uuid(), 'conj-elegance', 'Conj. Elegance', 219.90, 'Conjunto Elegance', 'Conjuntos', 10),
  (gen_random_uuid(), 'conj-suede', 'Conj. Suede', 199.90, 'Conjunto Suede', 'Conjuntos', 10),
  (gen_random_uuid(), 'conj-maison', 'Conj. Maison', 249.90, 'Conjunto Maison', 'Conjuntos', 10),
  (gen_random_uuid(), 'trijunto-malibu', 'Trijunto Malibu', 289.90, 'Trijunto Malibu', 'Conjuntos', 10),
  (gen_random_uuid(), 'conj-savanna', 'Conj. Savanna', 179.90, 'Conjunto Savanna', 'Conjuntos', 10)
  ON CONFLICT (slug) DO NOTHING;

  -- Macaquinhos
  INSERT INTO public.products (id, slug, name, price, description, category, quantity) VALUES
  (gen_random_uuid(), 'luna-macaquinho', 'Luna', 159.90, 'Macaquinho Luna', 'Macaquinhos', 10)
  ON CONFLICT (slug) DO NOTHING;

  -- Blusas e Bodies
  INSERT INTO public.products (id, slug, name, price, description, category, quantity) VALUES
  (gen_random_uuid(), 't-shirt-cowntry', 'T-shirt Cowntry', 89.90, 'T-shirt Cowntry', 'Blusas e Bodies', 10),
  (gen_random_uuid(), 'body-renda', 'Body Renda', 129.90, 'Body Renda', 'Blusas e Bodies', 10),
  (gen_random_uuid(), 'body-maya', 'Body Maya', 119.90, 'Body Maya', 'Blusas e Bodies', 10),
  (gen_random_uuid(), 't-shirt-basica', 'T-shirt básica', 69.90, 'T-shirt básica', 'Blusas e Bodies', 10),
  (gen_random_uuid(), 'blusa-renda-floral', 'Blusa renda floral', 139.90, 'Blusa renda floral', 'Blusas e Bodies', 10),
  (gen_random_uuid(), 'maxi-renda', 'Maxi Renda', 149.90, 'Maxi Renda', 'Blusas e Bodies', 10)
  ON CONFLICT (slug) DO NOTHING;

  -- Saias
  INSERT INTO public.products (id, slug, name, price, description, category, quantity) VALUES
  (gen_random_uuid(), 'saia-riviera', 'Saia Riviera', 139.90, 'Saia Riviera', 'Saias', 10)
  ON CONFLICT (slug) DO NOTHING;

  -- Jeans
  INSERT INTO public.products (id, slug, name, price, description, category, quantity) VALUES
  (gen_random_uuid(), 'jaqueta-jeans', 'Jaqueta jeans', 229.90, 'Jaqueta jeans', 'Jeans', 10),
  (gen_random_uuid(), 'calca-jeans', 'Calça jeans', 189.90, 'Calça jeans', 'Jeans', 10)
  ON CONFLICT (slug) DO NOTHING;

  -- Update category mapping in site_content to match the requested labels
  INSERT INTO public.site_content (section_key, content_value) VALUES
    ('category_1_label', 'Blusas/Bodys'),
    ('category_1_value', 'Blusas e Bodies'),
    ('category_2_label', 'Conjuntos'),
    ('category_2_value', 'Conjuntos'),
    ('category_3_label', 'Partes de baixo'),
    ('category_3_value', 'Saias'),
    ('category_4_label', 'Macaquinho'),
    ('category_4_value', 'Macaquinhos'),
    ('category_5_label', 'Jeans'),
    ('category_5_value', 'Jeans')
  ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;
  
END $$;
