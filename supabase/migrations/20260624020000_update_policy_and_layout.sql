DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (new_user_id, 'Admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

INSERT INTO public.site_content (section_key, content_value, updated_at)
VALUES (
  'exchange_policy',
  '**Política de Trocas e Devoluções**

**Prazo para Solicitação**
As solicitações de troca deverão ser realizadas no prazo máximo de 7 (sete) dias úteis contados a partir da data de recebimento do produto.

**Condições para Aceitação da Troca**
Para que a solicitação seja analisada, o produto deverá ser devolvido observando integralmente as seguintes condições:
- Estar sem qualquer indício de uso;
- Permanecer com a etiqueta original afixada;
- Ser encaminhado na mesma embalagem em que foi entregue;
- Não apresentar manchas, sujeiras, odores, avarias ou quaisquer sinais de utilização inadequada.
A empresa não realizará a troca de produtos que não atendam aos requisitos acima descritos.

**Produtos Promocionais**
Não serão aceitas solicitações de troca ou devolução de produtos adquiridos em promoção, liquidação, ofertas especiais ou campanhas promocionais, salvo nos casos expressamente previstos na legislação aplicável.

**Solicitação de Troca ou Devolução**
Para solicitar uma troca ou devolução, o cliente deverá entrar em contato com nossa equipe de suporte por meio do WhatsApp:
Suporte: https://wa.me/5511934160219
Após o contato, serão fornecidas as orientações necessárias para o envio do produto e prosseguimento da solicitação.

**Análise e Aprovação**
Após o recebimento do produto, será realizada uma vistoria técnica para verificar o cumprimento das condições estabelecidas nesta política.
A aprovação da troca ou devolução está condicionada ao resultado dessa análise. Caso sejam constatadas divergências, sinais de uso, ausência de etiqueta, embalagem inadequada ou qualquer outra irregularidade, a solicitação poderá ser recusada, sendo o produto devolvido ao cliente.

**Reembolso**
**Compras realizadas via Pix**
Após a aprovação da devolução, o reembolso será efetuado na mesma conta utilizada para o pagamento, em até 4 (quatro) dias úteis.
**Compras realizadas via Cartão de Crédito**
O estorno será solicitado à administradora do cartão de crédito após a aprovação da devolução. O valor será creditado diretamente na fatura do cartão, observando os prazos e procedimentos estabelecidos pela instituição financeira responsável.

**Disposições Finais**
Ao solicitar a troca ou devolução de um produto, o cliente declara estar ciente e de acordo com os termos desta Política de Trocas e Devoluções.
Esta política não afasta nem limita os direitos assegurados ao consumidor pela legislação vigente, especialmente aqueles previstos no Código de Defesa do Consumidor.',
  NOW()
)
ON CONFLICT (section_key) DO UPDATE 
SET content_value = EXCLUDED.content_value, updated_at = NOW();
