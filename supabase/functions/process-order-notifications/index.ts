import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  getStatusLabel,
  replaceVariables,
  wrapInLayout,
  formatShippingAddress,
  formatDate,
  getSendersList,
  REPLY_TO_ADDRESS,
  getResendApiKey,
} from '../_shared/email-templates.ts'

interface EmailRequestBody {
  order_id?: string
  event_type?: string
  new_status?: string
  estimated_delivery_date?: string
  customer_email?: string
  customer_name?: string
  user_id?: string
  test_mode?: boolean
}

interface ResendSendResult {
  success: boolean
  id?: string
  from?: string
  error?: string
  attempts: number
}

// Helper to send email via Resend with multiple fallbacks and retry
async function sendEmailWithFallback(
  resendKey: string,
  sendersToTry: string[],
  recipient: string,
  subject: string,
  html: string,
): Promise<ResendSendResult> {
  let lastError = ''
  let attempts = 0

  for (const sender of sendersToTry) {
    attempts++
    console.log(
      `[sendEmailWithFallback] Tentativa ${attempts}: enviando para ${recipient} via '${sender}'`,
    )
    try {
      const emailReq = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: recipient,
          reply_to: REPLY_TO_ADDRESS,
          subject,
          html,
        }),
      })

      if (emailReq.ok) {
        const json = await emailReq.json()
        console.log(
          `[sendEmailWithFallback] Sucesso com sender '${sender}', ID Resend: ${json?.id}`,
        )
        return {
          success: true,
          id: json?.id,
          from: sender,
          attempts,
        }
      } else {
        lastError = await emailReq.text()
        console.warn(`[sendEmailWithFallback] Falha com sender '${sender}': ${lastError}`)
      }
    } catch (fetchErr: any) {
      lastError = fetchErr.message || 'Erro de rede na chamada ao Resend'
      console.warn(`[sendEmailWithFallback] Exceção com sender '${sender}':`, lastError)
    }

    // Small backoff before trying fallback sender
    await new Promise((r) => setTimeout(r, 150))
  }

  return {
    success: false,
    error: lastError,
    attempts,
  }
}

// Log execution to public.email_logs table
async function logEmailAttempt(
  supabase: any,
  data: {
    template_slug: string
    recipient_email: string
    recipient_name?: string
    subject: string
    from_address?: string
    status: 'sent' | 'error' | 'skipped'
    resend_id?: string
    error_message?: string
    attempts?: number
    metadata?: Record<string, any>
  },
) {
  try {
    const { error } = await supabase.from('email_logs').insert({
      template_slug: data.template_slug,
      recipient_email: data.recipient_email,
      recipient_name: data.recipient_name || null,
      subject: data.subject,
      from_address: data.from_address || null,
      status: data.status,
      resend_id: data.resend_id || null,
      error_message: data.error_message || null,
      attempts: data.attempts || 1,
      metadata: data.metadata || {},
    })
    if (error) {
      console.warn('[logEmailAttempt] Aviso ao salvar log no banco:', error.message)
    }
  } catch (err) {
    console.warn('[logEmailAttempt] Exceção ao gravar email_logs:', err)
  }
}

function isValidEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
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
      console.error('Configuração do Supabase ausente nas variáveis de ambiente.')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuração do Supabase não encontrada no ambiente.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // =========================================================================
    // 1. FLUXO: BOAS-VINDAS (CADASTRO DE NOVO CLIENTE)
    // =========================================================================
    if (event_type === 'welcome_email') {
      const targetEmail = incomingEmail?.trim()
      if (!isValidEmail(targetEmail)) {
        console.warn(`[welcome_email] E-mail de cliente inválido: ${targetEmail}`)
        return new Response(
          JSON.stringify({ success: false, error: 'E-mail do cliente inválido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const clientName = incomingName?.trim() || 'Cliente'

      // Fetch dynamic template from database
      const { data: dbTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('slug', 'welcome')
        .single()

      const defaultSubject = `Você acaba de se tornar uma MEYVE GIRL`
      const defaultBody = `
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          HEY, MEYVE GIRL! 💋
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Você acaba de entrar oficialmente para o nosso universo.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Bem-vinda à Meyve!
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Por aqui, a gente acredita que look bom é aquele que faz você se olhar no espelho e pensar: <em>"Nossa, eu fiquei maravilhosa."</em> Sem esforço, com presença, elegância e aquele toque sofisticado que não passa despercebido.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Então já prepara o coração, porque você vai receber primeiro:
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          •Novidades antes de todo mundo<br />
          •Peças exclusivas que mal chegam e já têm fila<br />
          •Lançamentos pensados para virar desejo<br />
          •Ofertas e condições exclusivas<br />
          •Inspirações para montar aquele look que parece caro, pensado e impecável
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          E um aviso:<br />você provavelmente vai entrar “só para dar uma olhadinha” e sair querendo tudo.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Mas faz parte. A gente não julga. 🤝🏻
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="https://www.meyves.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
            Explorar Coleção Meyves
          </a>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Agora conta pra gente: o que você está mais ansiosa para encontrar por aqui?<br />
          Um vestido marcante? Uma alfaiataria impecável? Ou aquele look que resolve seu final de semana em segundos?
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Bem-vinda ao universo Meyve.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">
          Com amor,<br />Sua nova melhor amiga de compras 🤍
        </p>
      `

      const rawSubject = dbTemplate?.subject || defaultSubject
      const rawBody = dbTemplate?.body_html || defaultBody

      const vars = {
        nome_cliente: clientName,
        email_cliente: targetEmail!,
        nome_loja: 'Meyves',
      }

      const finalSubject = replaceVariables(rawSubject, vars)
      const filledBody = replaceVariables(rawBody, vars)
      const finalHtml = wrapInLayout('Boas-vindas à Meyves', undefined, filledBody)

      const resendKey = await getResendApiKey(supabase)
      if (!resendKey) {
        console.warn('[welcome_email] RESEND_API_KEY não configurada no ambiente.')
        await logEmailAttempt(supabase, {
          template_slug: 'welcome',
          recipient_email: targetEmail!,
          recipient_name: clientName,
          subject: finalSubject,
          status: 'skipped',
          error_message: 'RESEND_API_KEY não configurada no backend nem em site_settings',
        })
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Chave RESEND_API_KEY não configurada no backend ou banco de dados.',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const sendersToTry = getSendersList()
      const sendResult = await sendEmailWithFallback(
        resendKey,
        sendersToTry,
        targetEmail!,
        finalSubject,
        finalHtml,
      )

      await logEmailAttempt(supabase, {
        template_slug: 'welcome',
        recipient_email: targetEmail!,
        recipient_name: clientName,
        subject: finalSubject,
        from_address: sendResult.from,
        status: sendResult.success ? 'sent' : 'error',
        resend_id: sendResult.id,
        error_message: sendResult.error,
        attempts: sendResult.attempts,
        metadata: { clientName, event_type },
      })

      return new Response(
        JSON.stringify({
          success: sendResult.success,
          message: sendResult.success
            ? 'E-mail de boas-vindas enviado com sucesso!'
            : 'Falha ao enviar e-mail de boas-vindas.',
          data: sendResult.id ? { id: sendResult.id, from: sendResult.from } : null,
          error: sendResult.success ? null : sendResult.error,
        }),
        {
          status: sendResult.success ? 200 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // =========================================================================
    // 2. FLUXOS RELACIONADOS A PEDIDOS OU TESTES DE MODELO
    // =========================================================================
    const isTestMode = Boolean(body.test_mode)
    const targetEmail = incomingEmail?.trim()

    if (!order_id && !isTestMode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'O campo order_id é obrigatório para notificações de pedidos.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Se for modo de teste de modelo (disparado pelo painel administrativo)
    if (isTestMode) {
      if (!isValidEmail(targetEmail)) {
        return new Response(
          JSON.stringify({ success: false, error: 'E-mail de destino para teste inválido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const clientName = incomingName?.trim() || 'Cliente Teste'
      const templateSlug = event_type || 'order_created'

      const { data: dbTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('slug', templateSlug)
        .maybeSingle()

      const resendKey = await getResendApiKey(supabase)
      if (!resendKey) {
        await logEmailAttempt(supabase, {
          template_slug: templateSlug,
          recipient_email: targetEmail!,
          recipient_name: clientName,
          subject: dbTemplate?.subject || `Teste ${templateSlug}`,
          status: 'skipped',
          error_message: 'RESEND_API_KEY não configurada no backend nem em site_settings',
          metadata: { test_mode: true },
        })
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Chave RESEND_API_KEY não configurada no backend ou banco de dados.',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const dummyVars: Record<string, any> = {
        nome_cliente: clientName,
        numero_pedido: 'TESTE-1234',
        id_pedido: 'test-uuid-1234',
        email_cliente: targetEmail,
        valor_total: '189,90',
        forma_pagamento: 'PIX',
        info_frete: 'Sedex — Grátis (2 dias úteis)',
        status_pedido: 'Em processamento',
        codigo_rastreio: 'BR123456789MEY',
        transportadora: 'Correios',
        link_nota_fiscal: 'https://www.meyves.com.br',
        itens_pedido: `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">Vestido Elegance Meyves</td><td style="text-align: center;">1</td><td style="text-align: right;">R$ 189,90</td></tr>`,
        endereco_entrega: 'Rua Oscar Freire, 1000 - Cerqueira César, São Paulo - SP, CEP: 01426-001',
        bloco_data_estimada: '<p style="padding: 10px; background: #fdfbf7; border-left: 3px solid #2D0B0B;">Previsão de entrega: 3 a 5 dias úteis</p>',
        bloco_rastreamento: '<div style="padding: 14px; background: #f0f7f4;">Código: BR123456789MEY</div>',
        botao_nota_fiscal: '<div style="text-align: center; margin-top: 20px;"><a href="https://www.meyves.com.br" style="background: #2D0B0B; color: #fff; padding: 10px 20px; text-decoration: none;">Ver Pedido</a></div>',
        conteudo_newsletter: 'Esta é uma prévia de demonstração do conteúdo de newsletter da Meyves.',
        assunto_newsletter: 'Novidades Exclusivas Meyves',
        nome_loja: 'Meyves',
      }

      const rawSubject = dbTemplate?.subject || `[Teste Meyves] Modelo: ${templateSlug}`
      const rawBody = dbTemplate?.body_html || `<p>Este é um teste do modelo ${templateSlug}.</p>`
      const finalSubject = replaceVariables(rawSubject, dummyVars)
      const finalBody = replaceVariables(rawBody, dummyVars)
      const finalHtml = wrapInLayout('Teste de Notificação Meyves', `Modelo: ${templateSlug}`, finalBody)

      const sendersToTry = getSendersList()
      const sendResult = await sendEmailWithFallback(
        resendKey,
        sendersToTry,
        targetEmail!,
        finalSubject,
        finalHtml,
      )

      await logEmailAttempt(supabase, {
        template_slug: templateSlug,
        recipient_email: targetEmail!,
        recipient_name: clientName,
        subject: finalSubject,
        from_address: sendResult.from,
        status: sendResult.success ? 'sent' : 'error',
        resend_id: sendResult.id,
        error_message: sendResult.error,
        attempts: sendResult.attempts,
        metadata: { test_mode: true },
      })

      return new Response(
        JSON.stringify({
          success: sendResult.success,
          message: sendResult.success
            ? `E-mail de teste (${templateSlug}) enviado com sucesso!`
            : `Falha ao enviar e-mail de teste: ${sendResult.error}`,
          data: sendResult.id ? { id: sendResult.id, from: sendResult.from } : null,
          error: sendResult.success ? null : sendResult.error,
        }),
        {
          status: sendResult.success ? 200 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id!)
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
      .eq('order_id', order_id!)

    if (itemsError) {
      console.warn(`[order_email] Erro ao buscar itens do pedido ${order_id}:`, itemsError.message)
    }

    const customerEmail = (order.customer_email || incomingEmail)?.trim()
    if (!isValidEmail(customerEmail)) {
      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: 'E-mail do cliente inválido ou ausente.',
        })
        .eq('id', order_id!)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'O cliente não possui um endereço de e-mail válido cadastrado.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const customerName = (order.customer_name || incomingName)?.trim() || 'Cliente'
    const shortId = order_id!.split('-')[0].toUpperCase()

    const resendKey = await getResendApiKey(supabase)
    if (!resendKey) {
      console.warn('[order_email] RESEND_API_KEY não configurada no ambiente.')
      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: 'Chave RESEND_API_KEY não configurada no ambiente nem em site_settings.',
        })
        .eq('id', order_id!)

      await logEmailAttempt(supabase, {
        template_slug: event_type,
        recipient_email: customerEmail!,
        recipient_name: customerName,
        subject: `Pedido #${shortId}`,
        status: 'skipped',
        error_message: 'Chave RESEND_API_KEY não configurada no backend nem em site_settings.',
        metadata: { order_id },
      })

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
                <div style="font-weight: 600; color: #2D0B0B; font-size: 14px;">${item.products?.name || 'Produto Meyves'}</div>
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
          <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background-color: #2D0B0B; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Visualizar Nota Fiscal</a>
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

    // Check if this is the customer's very first purchase
    let isFirstPurchase = false
    if (event_type === 'order_created' || event_type === 'resend_confirmation' || !event_type) {
      try {
        let previousOrdersQuery = supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .neq('id', order_id)

        if (order.user_id) {
          previousOrdersQuery = previousOrdersQuery.or(
            `user_id.eq.${order.user_id},customer_email.ilike.${customerEmail.trim()}`,
          )
        } else {
          previousOrdersQuery = previousOrdersQuery.ilike('customer_email', customerEmail.trim())
        }

        const { count: previousCount, error: countErr } = await previousOrdersQuery
        if (!countErr && (previousCount === 0 || previousCount === null)) {
          isFirstPurchase = true
          console.log(`[order_email] Primeira compra identificada para o cliente ${customerEmail}`)
        }
      } catch (countError) {
        console.warn('[order_email] Erro ao verificar histórico de primeira compra:', countError)
      }
    }

    // Slug and header mappings for all order statuses
    let templateSlug = 'order_created'
    let headerTitle = 'Obrigado por comprar na Meyves!'
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
      // Order created / resend: If first purchase, trigger first_purchase template
      if (isFirstPurchase) {
        templateSlug = 'first_purchase'
        headerTitle = 'Parabéns pela sua primeira compra!'
      } else {
        templateSlug = 'order_created'
        headerTitle = 'Obrigado por comprar na Meyves!'
      }
    }

    // Query database for template
    const { data: dbTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .single()

    // Complete variable map covering all templates
    const templateVariables: Record<string, string | number | null | undefined> = {
      nome_cliente: customerName,
      numero_pedido: shortId,
      id_pedido: order_id,
      email_cliente: customerEmail,
      valor_total: totalAmount.toFixed(2).replace('.', ','),
      forma_pagamento: (order.payment_method || 'PIX').toUpperCase(),
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
      nome_loja: 'Meyves',
    }

    let rawSubject = dbTemplate?.subject
    let rawBody = dbTemplate?.body_html

    // Fallbacks if no template exists in database
    if (!rawSubject) {
      if (templateSlug === 'first_purchase')
        rawSubject = `Parabéns pela sua primeira compra! 🎉 - Meyves`
      else if (templateSlug === 'order_paid')
        rawSubject = `Pagamento Confirmado! Pedido #{{numero_pedido}} na Meyves`
      else if (templateSlug === 'order_shipped')
        rawSubject = `Seu Pedido #{{numero_pedido}} foi Enviado! - Meyves`
      else if (templateSlug === 'order_delivered')
        rawSubject = `Seu Pedido #{{numero_pedido}} foi Entregue! - Meyves`
      else if (templateSlug === 'order_canceled')
        rawSubject = `Cancelamento do Pedido #{{numero_pedido}} na Meyves`
      else if (templateSlug === 'invoice_available')
        rawSubject = `Nota Fiscal disponível - Pedido #{{numero_pedido}} na Meyves`
      else rawSubject = `Obrigado por comprar na Meyves! Pedido #{{numero_pedido}}`
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

    const sendersToTry = getSendersList()
    const sendResult = await sendEmailWithFallback(
      resendKey,
      sendersToTry,
      customerEmail!,
      finalSubject,
      finalHtml,
    )

    // Update order confirmation status
    if (sendResult.success) {
      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'sent',
          email_confirmation_sent_at: new Date().toISOString(),
          email_confirmation_error: null,
        })
        .eq('id', order_id)
    } else {
      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: `Falha no envio Resend: ${sendResult.error}`,
        })
        .eq('id', order_id)
    }

    // Always log attempt in public.email_logs
    await logEmailAttempt(supabase, {
      template_slug: templateSlug,
      recipient_email: customerEmail!,
      recipient_name: customerName,
      subject: finalSubject,
      from_address: sendResult.from,
      status: sendResult.success ? 'sent' : 'error',
      resend_id: sendResult.id,
      error_message: sendResult.error,
      attempts: sendResult.attempts,
      metadata: { order_id, event_type, is_first_purchase: isFirstPurchase },
    })

    if (!sendResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha no envio do e-mail: ${sendResult.error}`,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail enviado com sucesso com base no modelo dinâmico.',
        data: { id: sendResult.id, from: sendResult.from },
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
