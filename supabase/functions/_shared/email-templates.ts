export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'recebido e está pendente de confirmação',
    processing: 'em processamento',
    paid: 'confirmado e pago',
    shipped: 'enviado',
    delivered: 'entregue',
    canceled: 'cancelado',
  }
  return labels[status] || status
}

const buildHeader = (title: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://img.usecurling.com/i?q=zahra%20logo&shape=outline&color=solid-black" alt="Zahrá Logo" width="120" style="margin-bottom: 20px;" />
      <h2 style="color: #111; font-weight: 400; margin: 0; font-size: 24px;">${title}</h2>
    </div>
`

const buildFooter = (): string => `
  <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;" />
  <p style="text-align: center; font-size: 14px; color: #888;">
    Este é um e-mail automático, por favor não responda.<br/>
    Zahrá Brasil © ${new Date().getFullYear()}
  </p>
</div>
`

export function orderConfirmationHtml(
  customerName: string,
  orderId: string,
  items: any[],
  totalAmount: number,
  invoiceUrl: string | null,
): string {
  const itemsHtml = items.map((item: any) => {
    const images = item.products?.product_images || []
    images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const imageUrl = images[0]?.url || 'https://img.usecurling.com/p/100/100?q=clothing'
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${imageUrl}" alt="${item.products?.name || ''}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
            <span style="font-weight: 500;">${item.products?.name || 'Produto'}</span>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${Number(item.price_at_purchase).toFixed(2).replace('.', ',')}</td>
      </tr>
    `
  }).join('')

  const invoiceHtml = invoiceUrl
    ? `<div style="margin-top: 20px; text-align: center;"><a href="${invoiceUrl}" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">Visualizar Nota Fiscal</a></div>`
    : ''

  return `
    ${buildHeader('Obrigado por comprar na Zahrá!')}
    <p style="font-size: 16px; line-height: 1.5;">Olá <strong>${customerName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">Seu pedido foi recebido com sucesso. Aqui estão os detalhes da sua compra:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 30px; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f9f9f9;">
          <th style="text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-weight: 600;">Produto</th>
          <th style="text-align: center; padding: 12px; border-bottom: 2px solid #ddd; font-weight: 600;">Qtd</th>
          <th style="text-align: right; padding: 12px; border-bottom: 2px solid #ddd; font-weight: 600;">Preço</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="text-align: right; margin-top: 20px; font-size: 16px;">
      <p style="margin: 5px 0;"><strong>Frete:</strong> <span style="color: #2e7d32; font-weight: 600;">Frete Grátis</span></p>
      <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> R$ ${Number(totalAmount).toFixed(2).replace('.', ',')}</p>
    </div>
    ${invoiceHtml}
    ${buildFooter()}
  `
}

export function statusChangeHtml(
  customerName: string,
  orderId: string,
  statusLabel: string,
): string {
  return `
    ${buildHeader('Atualização do seu pedido na Zahrá')}
    <p style="font-size: 16px; line-height: 1.5;">Olá <strong>${customerName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">Seu pedido <strong>#${orderId.split('-')[0]}</strong> foi ${statusLabel}.</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">Acompanhe o status do seu pedido a qualquer momento na página "Meus Pedidos" do nosso site.</p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="https://www.zahrabrasil.com.br/meus-pedidos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">Acompanhar Pedido</a>
    </div>
    ${buildFooter()}
  `
}

export function invoiceAvailableHtml(
  customerName: string,
  orderId: string,
  invoiceUrl: string | null,
): string {
  return `
    ${buildHeader('Nota Fiscal disponível')}
    <p style="font-size: 16px; line-height: 1.5;">Olá <strong>${customerName}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">A nota fiscal do seu pedido <strong>#${orderId.split('-')[0]}</strong> já está disponível.</p>
    <p style="font-size: 16px; line-height: 1.5; color: #555;">Clique no botão abaixo para visualizá-la:</p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="${invoiceUrl || '#'}" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500;">Visualizar Nota Fiscal</a>
    </div>
    ${buildFooter()}
  `
}
