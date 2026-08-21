export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Recebido e aguardando confirmação',
    processing: 'Em separação / processamento',
    paid: 'Pagamento confirmado com sucesso',
    shipped: 'Enviado para transporte',
    delivered: 'Entregue com sucesso',
    canceled: 'Cancelado',
  }
  return labels[status] || status
}

const buildHeader = (title: string, subtitle?: string): string => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D0B0B; background-color: #ffffff; padding: 32px 24px; border: 1px solid #f0ede8;">
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #2D0B0B;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; letter-spacing: 0.2em; color: #2D0B0B; margin: 0 0 8px; text-transform: uppercase; font-weight: 700;">ZAHRÁ</h1>
      <p style="font-size: 11px; letter-spacing: 0.15em; color: #7a6e65; text-transform: uppercase; margin: 0;">Moda & Elegância</p>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #2D0B0B; font-weight: 600; margin: 0 0 6px; font-size: 22px;">${title}</h2>
      ${subtitle ? `<p style="color: #666; font-size: 14px; margin: 0;">${subtitle}</p>` : ''}
    </div>
`

const buildFooter = (): string => `
    <hr style="border: none; border-top: 1px solid #eae6e1; margin: 36px 0 20px;" />
    <div style="text-align: center; font-size: 13px; color: #7a6e65; line-height: 1.6;">
      <p style="margin: 0 0 8px;">Dúvidas sobre o seu pedido? Fale com a gente pelo WhatsApp ou responda a este e-mail.</p>
      <p style="margin: 0 0 12px; font-weight: 500;">
        <a href="https://wa.me/5511934160219" style="color: #2D0B0B; text-decoration: underline; margin-right: 12px;">WhatsApp (11) 93416-0219</a>
        <a href="mailto:contato@zahrabrasil.com.br" style="color: #2D0B0B; text-decoration: underline;">contato@zahrabrasil.com.br</a>
      </p>
      <p style="margin: 12px 0 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">
        Zahrá Brasil © ${new Date().getFullYear()} — Todos os direitos reservados.
      </p>
    </div>
  </div>
`

function formatShippingAddress(order: any): string {
  const parts: string[] = []
  if (order.shipping_street)
    parts.push(`${order.shipping_street}, ${order.shipping_number || 'S/N'}`)
  if (order.shipping_complement) parts.push(order.shipping_complement)
  if (order.shipping_neighborhood) parts.push(`Bairro: ${order.shipping_neighborhood}`)
  if (order.shipping_city || order.shipping_state) {
    parts.push(
      `${order.shipping_city || ''} ${order.shipping_state ? '- ' + order.shipping_state : ''}`.trim(),
    )
  }
  if (order.shipping_zip_code) parts.push(`CEP: ${order.shipping_zip_code}`)
  return parts.join('<br/>')
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function orderConfirmationHtml(
  customerName: string,
  orderId: string,
  items: any[],
  order: any,
): string {
  const shortId = orderId.split('-')[0].toUpperCase()
  const totalAmount = Number(order.total_amount ?? 0)
  const invoiceUrl = order.invoice_url ?? null
  const shippingCost = Number(order.shipping_cost ?? 0)
  const shippingMethod = order.shipping_method || ''
  const deliveryDays = order.delivery_days
  const estimatedDate = order.estimated_delivery_date
    ? formatDate(order.estimated_delivery_date)
    : null

  const itemsHtml = items
    .map((item: any) => {
      const images = item.products?.product_images || []
      images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
      const imageUrl = images[0]?.url || 'https://img.usecurling.com/p/100/100?q=clothing'
      const variantDetails = [
        item.size_name ? `Tam: ${item.size_name}` : '',
        item.color_name ? `Cor: ${item.color_name}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      return `
      <tr>
        <td style="padding: 14px 12px; border-bottom: 1px solid #f0ede8;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${imageUrl}" alt="${item.products?.name || ''}" style="width: 54px; height: 68px; object-fit: cover; border-radius: 2px; border: 1px solid #eee;" />
            <div>
              <div style="font-weight: 600; color: #2D0B0B; font-size: 14px;">${item.products?.name || 'Produto Zahrá'}</div>
              ${variantDetails ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${variantDetails}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #f0ede8; text-align: center; font-size: 14px; color: #555;">${item.quantity}</td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #f0ede8; text-align: right; font-size: 14px; font-weight: 500; color: #2D0B0B;">R$ ${Number(
          item.price_at_purchase * item.quantity,
        )
          .toFixed(2)
          .replace('.', ',')}</td>
      </tr>
    `
    })
    .join('')

  const invoiceHtml = invoiceUrl
    ? `<div style="margin-top: 24px; text-align: center;">
        <a href="${invoiceUrl}" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 0; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Visualizar Nota Fiscal</a>
      </div>`
    : ''

  const shippingLabel =
    shippingCost > 0 ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'Grátis'
  const shippingInfo = shippingMethod
    ? `${shippingMethod} — ${shippingLabel}${deliveryDays ? ` (${deliveryDays} dias úteis)` : ''}`
    : shippingLabel

  const addressHtml = formatShippingAddress(order)
  const shippingAddressSection = addressHtml
    ? `
      <div style="margin-top: 24px; padding: 18px; background-color: #fdfbf7; border: 1px solid #f0ede8; border-radius: 4px;">
        <h3 style="font-size: 12px; font-weight: 700; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #2D0B0B;">Endereço de Entrega</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #555; margin: 0;">${addressHtml}</p>
      </div>
    `
    : ''

  return `
    ${buildHeader('Obrigado por comprar na Zahrá!', `Pedido #${shortId}`)}
    <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
      Olá, <strong>${customerName}</strong>! Ficamos muito felizes com a sua compra. Seu pedido foi recebido com sucesso e estamos cuidando de cada detalhe com muito carinho.
    </p>
    ${estimatedDate ? `<p style="font-size: 14px; background: #fdfbf7; padding: 10px 14px; border-left: 3px solid #2D0B0B; color: #2D0B0B; margin: 16px 0;"><strong>Previsão de envio/entrega:</strong> ${estimatedDate}</p>` : ''}
    <div style="background-color: #fdfbf7; border: 1px solid #f0ede8; border-radius: 4px; padding: 4px 16px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #eae6e1;">
            <th style="text-align: left; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Item</th>
            <th style="text-align: center; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Qtd</th>
            <th style="text-align: right; padding: 12px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7a6e65;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <div style="margin-top: 16px; padding: 12px 16px; background-color: #faf9f6; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666;">
        <span>Método de Entrega:</span>
        <span style="font-weight: 500; color: #2D0B0B;">${shippingInfo}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; color: #666;">
        <span>Forma de Pagamento:</span>
        <span style="font-weight: 500; color: #2D0B0B; text-transform: uppercase;">${order.payment_method || 'PIX'}</span>
      </div>
      <hr style="border: none; border-top: 1px solid #eae6e1; margin: 8px 0;" />
      <div style="display: flex; justify-content: space-between; font-size: 17px; font-weight: 700; color: #2D0B0B;">
        <span>Valor Total:</span>
        <span>R$ ${totalAmount.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>

    ${shippingAddressSection}
    ${invoiceHtml}
    ${buildFooter()}
  `
}

export function statusChangeHtml(
  customerName: string,
  orderId: string,
  status: string,
  options?: {
    trackingCode?: string | null
    carrierName?: string | null
    estimatedDeliveryDate?: string | null
  },
): string {
  const shortId = orderId.split('-')[0].toUpperCase()
  const statusLabel = getStatusLabel(status)
  const isCanceled = status === 'canceled'
  const isShipped = status === 'shipped'
  const isDelivered = status === 'delivered'

  let extraContent = ''

  if (isShipped && options?.trackingCode) {
    extraContent = `
      <div style="margin: 24px 0; padding: 18px; background-color: #f0f7f4; border: 1px solid #cce5d9; border-radius: 4px;">
        <h4 style="margin: 0 0 8px; color: #1b5e20; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Código de Rastreamento</h4>
        <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2D0B0B;">${options.trackingCode}</p>
        ${options.carrierName ? `<p style="margin: 6px 0 0; font-size: 13px; color: #555;">Transportadora: <strong>${options.carrierName}</strong></p>` : ''}
      </div>
    `
  }

  if (options?.estimatedDeliveryDate) {
    extraContent += `
      <p style="font-size: 14px; background: #fdfbf7; padding: 12px; border-left: 3px solid #2D0B0B; color: #2D0B0B; margin: 16px 0;">
        <strong>Data estimada para envio / entrega:</strong> ${formatDate(options.estimatedDeliveryDate)}
      </p>
    `
  }

  const title = isCanceled
    ? 'Cancelamento de Pedido'
    : isDelivered
      ? 'Seu pedido foi entregue com sucesso!'
      : isShipped
        ? 'Seu pedido está a caminho!'
        : status === 'paid'
          ? 'Pagamento Confirmado!'
          : status === 'processing'
            ? 'Pedido em Separação!'
            : 'Atualização do seu pedido'

  let messageBody = `Informamos que o seu pedido <strong>#${shortId}</strong> agora está com o status: <strong style="color: #2D0B0B;">${statusLabel}</strong>.`
  if (isCanceled) {
    messageBody = `Lamentamos informar que o seu pedido <strong>#${shortId}</strong> foi cancelado. Caso tenha qualquer dúvida ou acredite que isto seja um equívoco, nossa equipe de suporte está à sua total disposição.`
  } else if (isDelivered) {
    messageBody = `Temos uma ótima notícia! O seu pedido <strong>#${shortId}</strong> foi entregue no seu endereço. Esperamos que você ame as suas peças da Zahrá!`
  } else if (isShipped) {
    messageBody = `Seu pedido <strong>#${shortId}</strong> foi despachado e já está em rota para o seu endereço de entrega.`
  } else if (status === 'paid') {
    messageBody = `Seu pagamento referente ao pedido <strong>#${shortId}</strong> foi confirmado com sucesso. Nossas costureiras e equipe de embalagem já estão preparando o seu pacote com todo o carinho.`
  }

  return `
    ${buildHeader(title, `Pedido #${shortId}`)}
    <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
      Olá, <strong>${customerName}</strong>!
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
      ${messageBody}
    </p>
    ${extraContent}
    <div style="margin-top: 30px; text-align: center;">
      <a href="https://www.zahrabrasil.com.br/meus-pedidos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
        Acompanhar Meu Pedido
      </a>
    </div>
    ${buildFooter()}
  `
}

export function invoiceAvailableHtml(
  customerName: string,
  orderId: string,
  invoiceUrl: string | null,
): string {
  const shortId = orderId.split('-')[0].toUpperCase()

  return `
    ${buildHeader('Nota Fiscal Disponível', `Pedido #${shortId}`)}
    <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
      Olá <strong>${customerName}</strong>,
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 20px;">
      A nota fiscal referente ao seu pedido <strong>#${shortId}</strong> na Zahrá já foi emitida e está disponível para download.
    </p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="${invoiceUrl || '#'}" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 0; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
        Visualizar / Baixar Nota Fiscal
      </a>
    </div>
    <p style="font-size: 13px; color: #777; text-align: center;">
      Caso tenha alguma dúvida referente à sua nota fiscal, entre em contato com a nossa equipe.
    </p>
    ${buildFooter()}
  `
}

export function newsletterHtml(subject: string, content: string): string {
  return `
    ${buildHeader(subject)}
    <div style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 24px; white-space: pre-line;">
      ${content}
    </div>
    <div style="margin: 32px 0 20px; text-align: center;">
      <a href="https://www.zahrabrasil.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 0; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
        Conferir Novidades
      </a>
    </div>
    ${buildFooter()}
  `
}
