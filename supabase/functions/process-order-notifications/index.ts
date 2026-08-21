import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  orderConfirmationHtml,
  statusChangeHtml,
  invoiceAvailableHtml,
} from '../_shared/email-templates.ts'

interface EmailRequestBody {
  order_id: string
  event_type?: 'order_created' | 'status_changed' | 'invoice_added' | 'resend_confirmation'
  new_status?: string
  estimated_delivery_date?: string
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

    const { order_id, event_type = 'order_created', new_status, estimated_delivery_date } = body
    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'O campo order_id é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

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

    const customerEmail = order.customer_email
    if (!customerEmail || !customerEmail.includes('@')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'O cliente não possui um endereço de e-mail válido cadastrado.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const customerName = order.customer_name || 'Cliente'
    const shortId = order_id.split('-')[0].toUpperCase()

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.warn('RESEND_API_KEY não configurada no ambiente.')
      // Update order status as pending_key
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

    let subject: string
    let html: string

    if (event_type === 'status_changed') {
      const currentStatus = new_status || order.status
      if (currentStatus === 'canceled') {
        subject = `Cancelamento do Pedido #${shortId} na Zahrá`
      } else if (currentStatus === 'shipped') {
        subject = `Seu Pedido #${shortId} foi Enviado! - Zahrá`
      } else if (currentStatus === 'delivered') {
        subject = `Seu Pedido #${shortId} foi Entregue! - Zahrá`
      } else {
        subject = `Atualização do seu pedido #${shortId} na Zahrá`
      }

      html = statusChangeHtml(customerName, order_id, currentStatus, {
        trackingCode: order.tracking_code,
        carrierName: order.carrier_name,
        estimatedDeliveryDate: estimated_delivery_date || order.estimated_delivery_date,
      })
    } else if (event_type === 'invoice_added') {
      subject = `Nota Fiscal disponível - Pedido #${shortId} na Zahrá`
      html = invoiceAvailableHtml(customerName, order_id, order.invoice_url)
    } else {
      // order_created or resend_confirmation
      subject = `Obrigado por comprar na Zahrá! Pedido #${shortId}`
      html = orderConfirmationHtml(customerName, order_id, items || [], order)
    }

    // Call Resend API
    const emailReq = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Zahrá <pedidos@zahrabrasil.com.br>',
        to: customerEmail,
        subject,
        html,
      }),
    })

    if (!emailReq.ok) {
      const errorText = await emailReq.text()
      console.error('Erro ao enviar e-mail via Resend:', errorText)

      await supabase
        .from('orders')
        .update({
          email_confirmation_status: 'error',
          email_confirmation_error: `Falha no envio Resend: ${errorText}`,
        })
        .eq('id', order_id)

      return new Response(
        JSON.stringify({
          success: false,
          error: `Falha no envio do e-mail: ${errorText}`,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const emailRes = await emailReq.json()

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
        message: 'E-mail enviado com sucesso com todos os detalhes do pedido.',
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
