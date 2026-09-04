import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import {
  replaceVariables,
  wrapInLayout,
  getSendersList,
  REPLY_TO_ADDRESS,
} from '../_shared/email-templates.ts'

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
      throw new Error('Configuração do Supabase ausente no backend.')
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
      console.warn('RESEND_API_KEY não configurada. Disparo de newsletter ignorado.')
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
      customSubject || dbTemplate?.subject || 'Novidades e Destaques Exclusivos Meyves'
    const baseBody =
      dbTemplate?.body_html ||
      `
      <div style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 24px; white-space: pre-line;">
        {{conteudo_newsletter}}
      </div>
      <div style="margin: 32px 0 20px; text-align: center;">
        <a href="https://www.meyves.com.br/produtos" style="display: inline-block; background-color: #2D0B0B; color: #fff; text-decoration: none; padding: 14px 32px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
          Conferir Novidades
        </a>
      </div>
    `

    const vars = {
      conteudo_newsletter: content,
      assunto_newsletter: baseSubject,
      nome_loja: 'Meyves',
    }

    const finalSubject = replaceVariables(baseSubject, vars)
    const formattedContent = replaceVariables(baseBody, vars)
    const finalHtml = wrapInLayout(finalSubject, undefined, formattedContent)

    const emails = subscribers.map((s: { email: string }) => s.email).filter(Boolean)
    const sendersToTry = getSendersList()

    let sent = 0
    let failed = 0
    let successfulSender = ''
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
            reply_to: REPLY_TO_ADDRESS,
            bcc: emails,
            subject: finalSubject,
            html: finalHtml,
          }),
        })

        if (emailReq.ok) {
          sent = emails.length
          failed = 0
          successfulSender = sender
          break
        } else {
          lastError = await emailReq.text()
          console.warn(`[send-newsletter] Tentativa via '${sender}' falhou: ${lastError}`)
        }
      } catch (err: any) {
        lastError = err.message || 'Erro de rede'
      }
    }

    // Log to email_logs
    try {
      await supabase.from('email_logs').insert({
        template_slug: 'newsletter_broadcast',
        recipient_email: `${emails.length} assinantes (BCC)`,
        subject: finalSubject,
        from_address: successfulSender || null,
        status: sent > 0 ? 'sent' : 'error',
        error_message: sent > 0 ? null : lastError,
        metadata: { total_subscribers: emails.length },
      })
    } catch (logErr) {
      console.warn('Erro ao registrar log de newsletter:', logErr)
    }

    return new Response(
      JSON.stringify({
        success: sent > 0,
        sent,
        failed: sent > 0 ? 0 : emails.length,
        from: successfulSender,
        error: sent > 0 ? null : lastError,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Error sending newsletter:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
