-- Migration: Seed first purchase email template (Primeira Compra)
-- Ensures idempotent insert for 'first_purchase' in email_templates

INSERT INTO public.email_templates (slug, name, subject, body_html, allowed_variables, description)
VALUES (
  'first_purchase',
  'Primeira Compra',
  'Parabéns pela sua primeira compra! 🎉 - Meyves',
  '<p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
  Olá, <strong>{{nome_cliente}}</strong>!
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 16px;">
  Seja muito bem-vinda à <strong>Meyves</strong>! É uma alegria enorme ter você com a gente. Ficamos honrados por você ter escolhido a nossa marca para fazer parte dos seus momentos especiais.
</p>
<p style="font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 16px;">
  Seu primeiro pedido <strong>#{{numero_pedido}}</strong> foi recebido com sucesso e nossa equipe já está cuidando de cada detalhe com muito carinho para que sua experiência seja inesquecível.
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
  <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666666;">
    <span>Método de Entrega:</span>
    <span style="font-weight: 500; color: #2D0B0B;">{{info_frete}}</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666666;">
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
<div style="margin: 32px 0 16px; text-align: center;">
  <a href="https://www.meyves.com.br/meus-pedidos" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2px;">
    Acompanhar Meu Pedido
  </a>
</div>
{{botao_nota_fiscal}}
<p style="font-size: 14px; line-height: 1.6; color: #7a6e65; margin: 24px 0 0; text-align: center;">
  Obrigado por confiar na Meyves. Esperamos que este seja o primeiro de muitos pedidos! ✨
</p>',
  '["nome_cliente", "numero_pedido", "valor_total", "forma_pagamento", "info_frete", "itens_pedido", "endereco_entrega", "bloco_data_estimada", "botao_nota_fiscal"]'::jsonb,
  'Enviado automaticamente quando uma cliente realiza seu primeiro pedido na loja.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  allowed_variables = EXCLUDED.allowed_variables,
  description = EXCLUDED.description,
  updated_at = NOW();
