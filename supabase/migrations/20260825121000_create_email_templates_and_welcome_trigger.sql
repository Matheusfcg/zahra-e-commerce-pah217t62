-- Migration: Create email_templates table, seed default templates, and configure welcome email trigger

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  allowed_variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_public_read_email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "admin_insert_email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "admin_update_email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "admin_delete_email_templates" ON public.email_templates;

-- Public/Anon/Authenticated can read email templates (or functions with service_role/anon)
CREATE POLICY "allow_public_read_email_templates" ON public.email_templates
  FOR SELECT USING (true);

-- Admin full management
CREATE POLICY "admin_insert_email_templates" ON public.email_templates
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_email_templates" ON public.email_templates
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_email_templates" ON public.email_templates
  FOR DELETE TO authenticated USING (public.is_admin());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial templates
INSERT INTO public.email_templates (slug, name, subject, body_html, allowed_variables, description)
VALUES
(
  'welcome',
  'Boas-vindas / Criação de Conta',
  'Bem-vinda à Zahrá, {{nome_cliente}}! ✨',
  '<p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>! É um enorme prazer ter você conosco.
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Sua conta na <strong>Zahrá</strong> foi criada com sucesso com o e-mail <strong>{{email_cliente}}</strong>. Agora você tem acesso exclusivo aos nossos lançamentos, novidades em primeira mão e uma experiência de compra única e sofisticada.
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 24px;">
  Explore nosso catálogo e apaixone-se por peças cuidadosamente desenvolvidas para realçar sua beleza e estilo com elegância atemporal.
</p>
<div style="margin: 32px 0; text-align: center;">
  <a href="https://www.zahrabrasil.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Explorar Coleção Zahrá
  </a>
</div>',
  '["nome_cliente", "email_cliente", "nome_loja"]'::jsonb,
  'Enviado automaticamente quando um novo cliente cria conta ou se cadastra na loja.'
),
(
  'order_created',
  'Confirmação de Pedido Criado',
  'Obrigado por comprar na Zahrá! Pedido #{{numero_pedido}}',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>! Ficamos muito felizes com a sua compra. Seu pedido foi recebido com sucesso e estamos cuidando de cada detalhe com muito carinho.
</p>
{{bloco_data_estimada}}
<div style="background-color: #fdfbf7; border: 1px solid #f0ede8; border-radius: 4px; padding: 4px 16px; margin: 20px 0;">
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="border-bottom: 2px solid #eae6e1;">
        <th style="text-align: left; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Item</th>
        <th style="text-align: center; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Qtd</th>
        <th style="text-align: right; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Subtotal</th>
      </tr>
    </thead>
    <tbody>{{itens_pedido}}</tbody>
  </table>
</div>
<div style="margin-top: 16px; padding: 12px 16px; background-color: #faf9f6; border-radius: 4px;">
  <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666;">
    <span>Método de Entrega:</span>
    <span style="font-weight: 500; color: #2D0B0B;">{{info_frete}}</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666;">
    <span>Forma de Pagamento:</span>
    <span style="font-weight: 500; color: #2D0B0B; text-transform: uppercase;">{{forma_pagamento}}</span>
  </div>
  <hr style="border: none; border-top: 1px solid #eae6e1; margin: 8px 0;" />
  <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 700; color: #2D0B0B;">
    <span>Valor Total:</span>
    <span>R$ {{valor_total}}</span>
  </div>
</div>
{{endereco_entrega}}
{{botao_nota_fiscal}}',
  '["nome_cliente", "numero_pedido", "valor_total", "forma_pagamento", "info_frete", "itens_pedido", "endereco_entrega", "bloco_data_estimada", "botao_nota_fiscal"]'::jsonb,
  'Enviado logo após a criação de um novo pedido.'
),
(
  'order_paid',
  'Status: Pagamento Confirmado',
  'Pagamento Confirmado! Pedido #{{numero_pedido}} na Zahrá',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Seu pagamento referente ao pedido <strong>#{{numero_pedido}}</strong> foi confirmado com sucesso. Nossas costureiras e equipe de embalagem já estão preparando o seu pacote com todo o carinho.
</p>
<div style="margin-top: 30px; text-align: center;">
  <a href="https://www.zahrabrasil.com.br/meus-pedidos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Acompanhar Meu Pedido
  </a>
</div>',
  '["nome_cliente", "numero_pedido", "status_pedido"]'::jsonb,
  'Enviado quando o status do pedido é alterado para Pago.'
),
(
  'order_shipped',
  'Status: Pedido Enviado / Rastreamento',
  'Seu Pedido #{{numero_pedido}} foi Enviado! - Zahrá',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Seu pedido <strong>#{{numero_pedido}}</strong> foi despachado e já está em rota para o seu endereço de entrega.
</p>
{{bloco_rastreamento}}
{{bloco_data_estimada}}
<div style="margin-top: 30px; text-align: center;">
  <a href="https://www.zahrabrasil.com.br/meus-pedidos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Acompanhar Entrega
  </a>
</div>',
  '["nome_cliente", "numero_pedido", "codigo_rastreio", "transportadora", "bloco_rastreamento", "bloco_data_estimada"]'::jsonb,
  'Enviado quando o pedido é despachado com código de rastreamento.'
),
(
  'order_delivered',
  'Status: Pedido Entregue',
  'Seu Pedido #{{numero_pedido}} foi Entregue! - Zahrá',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Temos uma ótima notícia! O seu pedido <strong>#{{numero_pedido}}</strong> foi entregue no seu endereço. Esperamos que você ame as suas peças da Zahrá!
</p>
<div style="margin-top: 30px; text-align: center;">
  <a href="https://www.zahrabrasil.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Ver Mais Peças
  </a>
</div>',
  '["nome_cliente", "numero_pedido"]'::jsonb,
  'Enviado quando a entrega do pedido é confirmada.'
),
(
  'order_canceled',
  'Status: Pedido Cancelado',
  'Cancelamento do Pedido #{{numero_pedido}} na Zahrá',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
  Lamentamos informar que o seu pedido <strong>#{{numero_pedido}}</strong> foi cancelado. Caso tenha qualquer dúvida ou acredite que isto seja um equívoco, nossa equipe de suporte está à sua total disposição.
</p>',
  '["nome_cliente", "numero_pedido"]'::jsonb,
  'Enviado caso o pedido seja cancelado.'
),
(
  'invoice_available',
  'Nota Fiscal Disponível',
  'Nota Fiscal disponível - Pedido #{{numero_pedido}} na Zahrá',
  '<p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
  Olá <strong>{{nome_cliente}}</strong>,
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 20px;">
  A nota fiscal referente ao seu pedido <strong>#{{numero_pedido}}</strong> na Zahrá já foi emitida e está disponível para download.
</p>
<div style="margin: 28px 0; text-align: center;">
  <a href="{{link_nota_fiscal}}" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Visualizar / Baixar Nota Fiscal
  </a>
</div>
<p style="font-size: 13px; color: #777; text-align: center;">
  Caso tenha alguma dúvida referente à sua nota fiscal, entre em contato com a nossa equipe.
</p>',
  '["nome_cliente", "numero_pedido", "link_nota_fiscal"]'::jsonb,
  'Enviado assim que a nota fiscal do pedido é anexada.'
),
(
  'newsletter_broadcast',
  'Modelo Base de Newsletter',
  'Novidades e Destaques Exclusivos Zahrá',
  '<div style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 24px; white-space: pre-line;">
  {{conteudo_newsletter}}
</div>
<div style="margin: 32px 0 20px; text-align: center;">
  <a href="https://www.zahrabrasil.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
    Conferir Novidades
  </a>
</div>',
  '["conteudo_newsletter", "assunto_newsletter"]'::jsonb,
  'Modelo padrão utilizado nos envios de comunicados e newsletter.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  allowed_variables = EXCLUDED.allowed_variables,
  description = EXCLUDED.description;

-- Ensure trigger for welcome email on new user in user_profiles
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS trigger AS $$
DECLARE
  v_url text := 'https://onfkaptmtujiihiunsnu.supabase.co/functions/v1/process-order-notifications';
  v_key text := '<redacted>';
  v_headers jsonb;
  v_user_email text;
  v_user_name text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.id;
  
  v_user_name := COALESCE(NEW.full_name, split_part(v_user_email, '@', 1), 'Cliente');
  
  IF v_user_email IS NOT NULL AND v_user_email <> '' THEN
    v_headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    );

    PERFORM net.http_post(
      url := v_url,
      headers := v_headers,
      body := jsonb_build_object(
        'event_type', 'welcome_email',
        'customer_email', v_user_email,
        'customer_name', v_user_name,
        'user_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never fail user creation if HTTP fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_created_send_welcome ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_send_welcome
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email();
