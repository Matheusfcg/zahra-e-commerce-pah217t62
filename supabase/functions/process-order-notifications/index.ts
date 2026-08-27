import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  getStatusLabel,
  replaceVariables,
  wrapInLayout,
  formatShippingAddress,
  formatDate,
} from '../_shared/email-templates.ts'

interface EmailRequestBody {
  order_id?: string
  event_type?:
    | 'order_created'
    | 'status_changed'
    | 'invoice_added'
    | 'resend_confirmation'
    | 'welcome_email'
  new_status?: string
  estimated_delivery_date?: string
  customer_email?: string
  customer_name?: string
  user_id?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body: EmailRequestBody
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de corpo da requisição inválido (JSON esperado).',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const {
      order_id,
      event_type = 'order_created',
      new_status,
      estimated_delivery_date,
      customer_email: incomingEmail,
      customer_name: incomingName,
    } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuração do Supabase não encontrada no ambiente.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handler for welcome email (sent when a new customer registers)
    if (event_type === 'welcome_email') {
      const targetEmail = incomingEmail
      if (!targetEmail || !targetEmail.includes('@')) {
        return new Response(
          JSON.stringify({ success: false, error: 'E-mail do cliente inválido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const clientName = incomingName || 'Cliente'

      // Fetch dynamic template from database
      const { data: dbTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('slug', 'welcome')
        .single()

      const defaultSubject = `Bem-vinda à Mayve, ${clientName}! ✨`
      const defaultBody = `
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 16px;">
          Olá, <strong>{{nome_cliente}}</strong>! É um enorme prazer ter você conosco.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
          Sua conta na <strong>Mayve</strong> foi criada com sucesso com o e-mail <strong>{{email_cliente}}</strong>. Agora você tem acesso exclusivo aos nossos lançamentos, novidades em primeira mão e uma experiência de compra única e sofisticada.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 24px;">
          Explore nosso catálogo e apaixone-se por peças cuidadosamente desenvolvidas para realçar sua beleza e estilo com elegância atemporal.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="https://www.mayves.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
            Explorar Coleção Mayve
          </a>
        </div>
      `

      const rawSubject = dbTemplate?.subject || defaultSubject
      const rawBody = dbTemplate?.body_html || defaultBody

      const vars = {
        nome_cliente: clientName,
        email_cliente: targetEmail,
        nome_loja: 'Mayve',
      }

      const finalSubject = replaceVariables(rawSubject, vars)
      const filledBody = replaceVariables(rawBody, vars)
      const finalHtml = wrapInLayout('Boas-vindas à Mayve', undefined, filledBody)

      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (!resendKey) {
        console.warn('RESEND_API_KEY não configurada no ambiente.')
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Chave RESEND não configurada, e-mail ignorado com segurança.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'Mayve <mayvesbr@gmail.com>'
      const replyToAddress = 'mayvesbr@gmail.com'

      const sendersToTry = [fromAddress]
      if (!sendersToTry.includes('Mayve <mayvesbr@gmail.com>')) {
        sendersToTry.unshift('Mayve <mayvesbr@gmail.com>')
      }

      let emailRes = null
      let sendSuccess = false
      let lastError = ''

      for (const sender of sendersToTry) {
        try {
          const emailReq = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: sender,
              to: targetEmail,
              reply_to: replyToAddress,
              subject: finalSubject,
              html: finalHtml,
            }),
          })

          if (emailReq.ok) {
            emailRes = await emailReq.json()
            sendSuccess = true
            break
          } else {
            lastError = await emailReq.text()
            console.warn(`Tentativa de envio de boas-vindas via '${sender}' falhou: ${lastError}`)
          }
        } catch (fetchErr: any) {
          lastError = fetchErr.message || 'Erro de rede'
        }
      }

      return new Response(
        JSON.stringify({
          success: sendSuccess,
          message: sendSuccess
            ? 'E-mail de boas-vindas enviado com sucesso!'
            : 'Falha ao enviar e-mail de boas-vindas.',
          data: emailRes,
          error: sendSuccess ? null : lastError,
        }),
        {
          status: sendSuccess ? 200 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Otherwise, order-related event
    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'O campo order_id é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: `Pedido #${order_id} não encontrado no sistema.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity, price_at_purchase, size_name, color_name,
        products (name, slug, product_images (url, display_order))
      `)
      .eq('order_id', order_id)

    if (itemsError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao buscar itens do pedido: ${itemsError.message}`,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const customerEmail = order.customer_email || incomingEmail
    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'O cliente não possui um endereço de e-mail válido cadastrado.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const customerName = order.customer_name || incomingName || 'Cliente'
    const shortId = order_id.split('-')[0].toUpperCase()

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.warn('RESEND_API_KEY não configurada no ambiente.')
      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: 'Chave RESEND_API_KEY não configurada.',
        })
        .eq('id', order_id)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'A chave da API Resend (RESEND_API_KEY) não está configurada.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const orderWithDate = {
      ...order,
      estimated_delivery_date: estimated_delivery_date || order.estimated_delivery_date,
    }

    const totalAmount = Number(order.total_amount ?? 0)
    const invoiceUrl = order.invoice_url ?? ''
    const shippingCost = Number(order.shipping_cost ?? 0)
    const shippingMethod = order.shipping_method || ''
    const deliveryDays = order.delivery_days
    const estimatedDate = orderWithDate.estimated_delivery_date
      ? formatDate(orderWithDate.estimated_delivery_date)
      : ''

    const itemsHtml = (items || [])
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
                <div style="font-weight: 600; color: #2D0B0B; font-size: 14px;">${item.products?.name || 'Produto Mayve'}</div>
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

    const invoiceBtn = invoiceUrl
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

    const estimatedDateBlock = estimatedDate
      ? `<p style="font-size: 14px; background: #fdfbf7; padding: 10px 14px; border-left: 3px solid #2D0B0B; color: #2D0B0B; margin: 16px 0;"><strong>Previsão de envio/entrega:</strong> ${estimatedDate}</p>`
      : ''

    const trackingBlock = order.tracking_code
      ? `
        <div style="margin: 24px 0; padding: 18px; background-color: #f0f7f4; border: 1px solid #cce5d9; border-radius: 4px;">
          <h4 style="margin: 0 0 8px; color: #1b5e20; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Código de Rastreamento</h4>
          <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2D0B0B;">${order.tracking_code}</p>
          ${order.carrier_name ? `<p style="margin: 6px 0 0; font-size: 13px; color: #555;">Transportadora: <strong>${order.carrier_name}</strong></p>` : ''}
        </div>
      `
      : ''

    // Map template slug according to event_type
    let templateSlug = 'order_created'
    let headerTitle = 'Obrigado por comprar na Mayve!'
    const currentStatus = new_status || order.status

    if (event_type === 'status_changed') {
      if (currentStatus === 'paid') {
        templateSlug = 'order_paid'
        headerTitle = 'Pagamento Confirmado!'
      } else if (currentStatus === 'shipped') {
        templateSlug = 'order_shipped'
        headerTitle = 'Seu pedido está a caminho!'
      } else if (currentStatus === 'delivered') {
        templateSlug = 'order_delivered'
        headerTitle = 'Seu pedido foi entregue com sucesso!'
      } else if (currentStatus === 'canceled') {
        templateSlug = 'order_canceled'
        headerTitle = 'Cancelamento de Pedido'
      } else {
        templateSlug = 'order_created'
        headerTitle = 'Atualização do Pedido'
      }
    } else if (event_type === 'invoice_added') {
      templateSlug = 'invoice_available'
      headerTitle = 'Nota Fiscal Disponível'
    } else {
      templateSlug = 'order_created'
      headerTitle = 'Obrigado por comprar na Mayve!'
    }

    // Query database for template
    const { data: dbTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .single()

    // Variable map
    const templateVariables: Record<string, string | number | null | undefined> = {
      nome_cliente: customerName,
      numero_pedido: shortId,
      id_pedido: order_id,
      email_cliente: customerEmail,
      valor_total: totalAmount.toFixed(2).replace('.', ','),
      forma_pagamento: order.payment_method || 'PIX',
      info_frete: shippingInfo,
      status_pedido: getStatusLabel(currentStatus),
      codigo_rastreio: order.tracking_code || '',
      transportadora: order.carrier_name || '',
      link_nota_fiscal: invoiceUrl,
      itens_pedido: itemsHtml,
      endereco_entrega: shippingAddressSection,
      bloco_data_estimada: estimatedDateBlock,
      bloco_rastreamento: trackingBlock,
      botao_nota_fiscal: invoiceBtn,
    }

    let rawSubject = dbTemplate?.subject
    let rawBody = dbTemplate?.body_html

    // Fallbacks if no template exists in database
    if (!rawSubject) {
      if (templateSlug === 'order_paid')
        rawSubject = `Pagamento Confirmado! Pedido #{{numero_pedido}} na Mayve`
      else if (templateSlug === 'order_shipped')
        rawSubject = `Seu Pedido #{{numero_pedido}} foi Enviado! - Mayve`
      else if (templateSlug === 'order_delivered')
        rawSubject = `Seu Pedido #{{numero_pedido}} foi Entregue! - Mayve`
      else if (templateSlug === 'order_canceled')
        rawSubject = `Cancelamento do Pedido #{{numero_pedido}} na Mayve`
      else if (templateSlug === 'invoice_available')
        rawSubject = `Nota Fiscal disponível - Pedido #{{numero_pedido}} na Mayve`
      else rawSubject = `Obrigado por comprar na Mayve! Pedido #{{numero_pedido}}`
    }

    if (!rawBody) {
      rawBody = `
        <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 16px;">
          Olá, <strong>{{nome_cliente}}</strong>!
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px;">
          Seu pedido <strong>#{{numero_pedido}}</strong> está com o status: <strong>{{status_pedido}}</strong>.
        </p>
        {{bloco_rastreamento}}
        {{bloco_data_estimada}}
      `
    }

    const finalSubject = replaceVariables(rawSubject, templateVariables)
    const finalBody = replaceVariables(rawBody, templateVariables)
    const finalHtml = wrapInLayout(headerTitle, `Pedido #${shortId}`, finalBody)

    // Sender config
    const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'Mayve <mayvesbr@gmail.com>'
    const replyToAddress = 'mayvesbr@gmail.com'

    const sendersToTry = [fromAddress]
    if (!sendersToTry.includes('Mayve <mayvesbr@gmail.com>')) {
      sendersToTry.unshift('Mayve <mayvesbr@gmail.com>')
    }

    let emailRes: any = null
    let sendSuccess = false
    let lastError = ''

    for (const sender of sendersToTry) {
      try {
        const emailReq = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: sender,
            to: customerEmail,
            reply_to: replyToAddress,
            subject: finalSubject,
            html: finalHtml,
          }),
        })

        if (emailReq.ok) {
          emailRes = await emailReq.json()
          sendSuccess = true
          break
        } else {
          lastError = await emailReq.text()
          console.warn(`Tentativa de envio via '${sender}' falhou: ${lastError}`)
        }
      } catch (fetchErr: any) {
        lastError = fetchErr.message || 'Erro de rede na requisição'
        console.warn(`Exceção ao tentar envio via '${sender}':`, fetchErr)
      }
    }

    if (!sendSuccess) {
      console.error('Erro final ao enviar e-mail via Resend:', lastError)

      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: `Falha no envio Resend: ${lastError}`,
        })
        .eq('id', order_id)

      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha no envio do e-mail: ${lastError}`,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Mark email as sent
    await supabase
      .from('orders')
      .update({
        email_confirmation_status: 'sent',
        email_confirmation_sent_at: new Date().toISOString(),
        email_confirmation_error: null,
      })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail enviado com sucesso com base no modelo dinâmico.',
        data: emailRes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Erro inesperado no envio de notificações:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Ocorreu um erro interno ao processar a notificação.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
