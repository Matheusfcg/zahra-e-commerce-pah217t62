import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { newsletterHtml } from '../_shared/email-templates.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject, content } = await req.json()
    if (!subject || !content) {
      throw new Error('subject and content are required')
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
        JSON.stringify({ success: true, message: 'No active subscribers', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.log('RESEND_API_KEY not configured. Skipping email.')
      return new Response(
        JSON.stringify({ success: true, message: 'No email key configured', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const emails = subscribers.map((s: { email: string }) => s.email)
    const html = newsletterHtml(subject, content)
    const configuredFrom =
      Deno.env.get('RESEND_NEWSLETTER_FROM_EMAIL') || 'Zahrá <sac@zahrabrasil.com.br>'

    const sendersToTry = [configuredFrom]
    if (!sendersToTry.includes('Zahrá <sac@zahrabrasil.com.br>')) {
      sendersToTry.unshift('Zahrá <sac@zahrabrasil.com.br>')
    }
    if (!sendersToTry.includes('Zahrá <onboarding@resend.dev>')) {
      sendersToTry.push('Zahrá <onboarding@resend.dev>')
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
          reply_to: 'sac@zahrabrasil.com.br',
          bcc: emails,
          subject: subject,
          html: html,
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
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
