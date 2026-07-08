import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  orderConfirmationHtml,
  statusChangeHtml,
  invoiceAvailableHtml,
  getStatusLabel,
} from '../_shared/email-templates.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { order_id, event_type = 'order_created' } = body
    if (!order_id) throw new Error('order_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing in environment')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()
    if (orderError || !order) throw new Error('Order not found')

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity, price_at_purchase, size_name, color_name,
        products (name, slug, product_images (url, display_order))
      `)
      .eq('order_id', order_id)
    if (itemsError) throw itemsError

    const customerEmail = order.customer_email
    const customerName = order.customer_name || 'Cliente'
    const shortId = order_id.split('-')[0]

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.log('RESEND_API_KEY not configured. Skipping email.')
      return new Response(JSON.stringify({ success: true, message: 'No email key configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let subject: string
    let html: string

    if (event_type === 'status_changed') {
      const statusLabel = getStatusLabel(body.new_status || order.status)
      subject = `Atualização do seu pedido na Zahrá - #${shortId}`
      html = statusChangeHtml(customerName, order_id, statusLabel)
    } else if (event_type === 'invoice_added') {
      subject = `Nota Fiscal disponível - Pedido #${shortId} na Zahrá`
      html = invoiceAvailableHtml(customerName, order_id, order.invoice_url)
    } else {
      subject = `Confirmação do seu pedido na Zahrá - #${shortId}`
      html = orderConfirmationHtml(customerName, order_id, items, order)
      await sendWhatsAppNotification(order, items, customerName, order_id)
    }

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
      console.error('Failed to send email:', await emailReq.text())
    }

    return new Response(JSON.stringify({ success: true, message: 'Notifications processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function sendWhatsAppNotification(
  order: any,
  items: any[],
  customerName: string,
  orderId: string,
) {
  const wpToken = Deno.env.get('WHATSAPP_API_TOKEN')
  const wpPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const adminPhone = '5511934160219'

  if (!wpToken || !wpPhoneId) {
    console.log('WhatsApp API not configured. Skipping admin notification.')
    return
  }

  const itemsListText = items
    .map(
      (i: any) =>
        `- ${i.quantity}x ${i.products?.name} (R$ ${Number(i.price_at_purchase).toFixed(2).replace('.', ',')})`,
    )
    .join('\n')
  const message = `*Novo Pedido Zahrá!*\n\n*ID:* ${orderId.split('-')[0]}\n*Cliente:* ${customerName}\n*Email:* ${order.customer_email}\n*Telefone:* ${order.customer_phone || 'Não informado'}\n*Total:* R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}\n\n*Itens:*\n${itemsListText}`

  const wpReq = await fetch(`https://graph.facebook.com/v17.0/${wpPhoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wpToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminPhone,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!wpReq.ok) {
    console.error('Failed to send WhatsApp:', await wpReq.text())
  }
}
