INSERT INTO public.site_content (section_key, content_value) VALUES
  ('exchange_return_policy', '**Trocar ou devolver**

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
ON CONFLICT (section_key) DO NOTHING;
