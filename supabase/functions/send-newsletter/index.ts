import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { replaceVariables, wrapInLayout } from '../_shared/email-templates.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject: customSubject, content } = await req.json()
    if (!content) {
      throw new Error('O conteúdo da mensagem é obrigatório.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)

    if (subError) throw subError
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum assinante ativo encontrado.', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.log('RESEND_API_KEY not configured. Skipping email.')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'RESEND_API_KEY não configurada no backend.',
          sent: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fetch dynamic newsletter template from database
    const { data: dbTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', 'newsletter_broadcast')
      .single()

    const baseSubject =
      customSubject || dbTemplate?.subject || 'Novidades e Destaques Exclusivos Mayve'
    const baseBody =
      dbTemplate?.body_html ||
      `
      <div style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 24px; white-space: pre-line;">
        {{conteudo_newsletter}}
      </div>
      <div style="margin: 32px 0 20px; text-align: center;">
        <a href="https://www.mayves.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
          Conferir Novidades
        </a>
      </div>
    `

    const vars = {
      conteudo_newsletter: content,
      assunto_newsletter: baseSubject,
      nome_loja: 'Mayve',
    }

    const finalSubject = replaceVariables(baseSubject, vars)
    const formattedContent = replaceVariables(baseBody, vars)
    const finalHtml = wrapInLayout(finalSubject, undefined, formattedContent)

    const emails = subscribers.map((s: { email: string }) => s.email)
    const fromAddress = Deno.env.get('RESEND_NEWSLETTER_FROM_EMAIL') || 'Mayve <mayvesbr@gmail.com>'
    const replyToAddress = 'mayvesbr@gmail.com'

    const sendersToTry = [fromAddress]
    if (!sendersToTry.includes('Mayve <mayvesbr@gmail.com>')) {
      sendersToTry.unshift('Mayve <mayvesbr@gmail.com>')
    }

    let sent = 0
    let failed = 0

    for (const sender of sendersToTry) {
      const emailReq = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          reply_to: replyToAddress,
          bcc: emails,
          subject: finalSubject,
          html: finalHtml,
        }),
      })

      if (emailReq.ok) {
        sent = emails.length
        failed = 0
        break
      } else {
        failed = emails.length
        console.error(`Failed to send newsletter with sender ${sender}:`, await emailReq.text())
      }
    }

    return new Response(JSON.stringify({ success: true, sent, failed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error sending newsletter:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
