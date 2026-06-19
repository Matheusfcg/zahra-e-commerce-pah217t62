import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id } = await req.json()
    if (!order_id) throw new Error('order_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing in environment')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error('Order not found')

    // Fetch order items with product details and real images
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price_at_purchase,
        products (
          name, 
          slug,
          product_images (url, display_order)
        )
      `)
      .eq('order_id', order_id)

    if (itemsError) throw itemsError

    const customerEmail = order.customer_email;
    const customerName = order.customer_name || 'Cliente';

    // 1. Send Post-Purchase Receipt Email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      const itemsHtml = items.map((item: any) => {
        // Sort images to get the primary one and maintain carousel logic consistency
        const images = item.products?.product_images || [];
        images.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        const imageUrl = images[0]?.url || 'https://img.usecurling.com/p/100/100?q=clothing';
        
        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${imageUrl}" alt="${item.products?.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
              <span style="font-weight: 500;">${item.products?.name}</span>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${Number(item.price_at_purchase).toFixed(2).replace('.', ',')}</td>
        </tr>
      `}).join('')

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://img.usecurling.com/i?q=zahra%20logo&shape=outline&color=solid-black" alt="Zahrá Logo" width="120" style="margin-bottom: 20px;" />
            <h2 style="color: #111; font-weight: 400; margin: 0; font-size: 24px;">Obrigado por comprar na Zahrá!</h2>
          </div>
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
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px; font-size: 16px;">
            <p style="margin: 5px 0;"><strong>Frete:</strong> <span style="color: #2e7d32; font-weight: 600;">Frete Grátis</span></p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px;" />
          <p style="text-align: center; font-size: 14px; color: #888;">
            Este é um e-mail automático, por favor não responda.<br/>
            Zahrá Brasil © ${new Date().getFullYear()}
          </p>
        </div>
      `

      const emailReq = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Zahrá <pedidos@zahrabrasil.com.br>',
          to: customerEmail,
          subject: `Confirmação do seu pedido na Zahrá - #${order_id.split('-')[0]}`,
          html: html
        })
      })
      
      if (!emailReq.ok) {
        console.error('Failed to send email:', await emailReq.text())
      }
    } else {
      console.log('RESEND_API_KEY not configured. Skipping email.');
    }

    // 2. Send WhatsApp Notification to Store Admin
    const wpToken = Deno.env.get('WHATSAPP_API_TOKEN')
    const wpPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const adminPhone = '5511934160219'
    
    if (wpToken && wpPhoneId) {
      const itemsListText = items.map((i: any) => `- ${i.quantity}x ${i.products?.name} (R$ ${Number(i.price_at_purchase).toFixed(2).replace('.', ',')})`).join('\n')
      const message = `*Novo Pedido Zahrá!*\n\n*ID:* ${order_id.split('-')[0]}\n*Cliente:* ${customerName}\n*Email:* ${customerEmail}\n*Telefone:* ${order.customer_phone || 'Não informado'}\n*Total:* R$ ${Number(order.total_amount).toFixed(2).replace('.', ',')}\n\n*Itens:*\n${itemsListText}`

      const wpReq = await fetch(`https://graph.facebook.com/v17.0/${wpPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wpToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: adminPhone,
          type: 'text',
          text: { body: message }
        })
      })
      
      if (!wpReq.ok) {
        console.error('Failed to send WhatsApp:', await wpReq.text())
      }
    } else {
      console.log('WhatsApp API not configured. Skipping admin notification.');
    }

    return new Response(JSON.stringify({ success: true, message: 'Notifications processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Error processing notifications:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
