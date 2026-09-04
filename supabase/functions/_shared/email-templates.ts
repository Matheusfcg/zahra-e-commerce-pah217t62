export interface EmailTemplateRow {
  id: string
  slug: string
  name: string
  subject: string
  body_html: string
  allowed_variables: string[] | any
  description?: string | null
}

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

export const buildHeader = (title: string, subtitle?: string): string => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D0B0B; background-color: #ffffff; padding: 32px 24px; border: 1px solid #f0ede8;">
    <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #2D0B0B;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; letter-spacing: 0.2em; color: #2D0B0B; margin: 0 0 8px; text-transform: uppercase; font-weight: 700;">MEYVES</h1>
      <p style="font-size: 11px; letter-spacing: 0.15em; color: #7a6e65; text-transform: uppercase; margin: 0;">Moda & Elegância</p>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #2D0B0B; font-weight: 600; margin: 0 0 6px; font-size: 22px;">${title}</h2>
      ${subtitle ? `<p style="color: #666; font-size: 14px; margin: 0;">${subtitle}</p>` : ''}
    </div>
`

export const buildFooter = (): string => `
    <hr style="border: none; border-top: 1px solid #eae6e1; margin: 36px 0 20px;" />
    <div style="text-align: center; font-size: 13px; color: #7a6e65; line-height: 1.6;">
      <p style="margin: 0 0 8px;">Dúvidas ou atendimento? Responda a este e-mail diretamente ou chame no WhatsApp.</p>
      <p style="margin: 0 0 6px; font-weight: 500;">
        <a href="mailto:meyvesbr@gmail.com" style="color: #2D0B0B; text-decoration: underline;">E-mail Principal: meyvesbr@gmail.com</a>
      </p>
      <p style="margin: 0 0 12px; font-size: 12px; color: #7a6e65;">
        <a href="https://wa.me/5511934160219" style="color: #2D0B0B; text-decoration: underline; margin-right: 12px;">WhatsApp (11) 93416-0219</a>
        <span style="color: #999;">•</span>
        <span style="margin-left: 12px;">E-mail Reserva: contato@meyves.com.br</span>
      </p>
      <p style="margin: 4px 0 0; font-size: 12px; color: #7a6e65;">
        Instagram: <a href="https://www.instagram.com/mayve__brasil" target="_blank" style="color: #2D0B0B; text-decoration: underline;">@mayve__brasil</a>
      </p>
      <p style="margin: 12px 0 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.1em;">
        Meyves © ${new Date().getFullYear()} — Todos os direitos reservados.
      </p>
    </div>
  </div>
`

/**
 * Robust variable replacement supporting {{var}}, {{ var }}, and single {var}
 */
export function replaceVariables(
  text: string,
  variables: Record<string, string | number | null | undefined>,
): string {
  if (!text) return ''
  let result = text
  for (const [key, val] of Object.entries(variables)) {
    const stringVal = val === null || val === undefined ? '' : String(val)
    // Replace {{key}} or {{ key }}
    const regexWithSpaces = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
    result = result.replace(regexWithSpaces, stringVal)
  }
  return result
}

export function wrapInLayout(
  title: string,
  subtitle: string | undefined,
  bodyContent: string,
): string {
  // If the body already contains the full document wrapper, return as is
  if (bodyContent.includes('MEYVES') && bodyContent.includes('font-family')) {
    return bodyContent
  }
  return `
    ${buildHeader(title, subtitle)}
    ${bodyContent}
    ${buildFooter()}
  `
}

export function formatShippingAddress(order: any): string {
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

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * Primary reply-to and customer care email address.
 * ALL incoming replies and customer responses MUST arrive here.
 */
export const PRIMARY_CUSTOMER_EMAIL = 'meyvesbr@gmail.com'
export const SECONDARY_RESERVE_EMAIL = 'contato@meyves.com.br'

/**
 * Global Reply-To header address across 100% of transaction flows.
 */
export const REPLY_TO_ADDRESS = PRIMARY_CUSTOMER_EMAIL

/**
 * Generates an ordered array of viable sender addresses to try with Resend.
 *
 * Requirements:
 * 1. contato@meyves.com.br is the default From sender (domain-verified requirement on Resend).
 * 2. Automatic fallbacks: if contato@ fails, fallback to pedidos@meyves.com.br and atendimento@meyves.com.br.
 * 3. As a test/fail-safe fallback, onboarding@resend.dev is available if custom domain is unverified.
 */
export function getSendersList(customSender?: string | null): string[] {
  const envSender = Deno.env.get('RESEND_FROM_EMAIL')?.trim()
  const list: string[] = []

  // 1. Prioritize custom sender or environment override if provided
  if (customSender?.trim()) {
    list.push(customSender.trim())
  }
  if (envSender && !list.includes(envSender)) {
    list.push(envSender)
  }

  // 2. Default sender: contato@meyves.com.br
  if (!list.includes('Meyves <contato@meyves.com.br>')) {
    list.push('Meyves <contato@meyves.com.br>')
  }

  // 3. Fallback domain addresses on meyves.com.br
  if (!list.includes('Meyves <pedidos@meyves.com.br>')) {
    list.push('Meyves <pedidos@meyves.com.br>')
  }
  if (!list.includes('Meyves <atendimento@meyves.com.br>')) {
    list.push('Meyves <atendimento@meyves.com.br>')
  }

  // 4. Fail-safe fallback sandbox sender provided by Resend (useful if domain is not yet verified in DNS)
  list.push('Meyves <onboarding@resend.dev>')

  return Array.from(new Set(list.filter(Boolean)))
}

/**
 * Checks verification status of domains on Resend account.
 */
export async function checkResendDomainStatus(
  resendKey: string,
  domainName = 'meyves.com.br',
): Promise<{
  found: boolean
  status?: string
  raw?: any
  error?: string
}> {
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${resendKey}`,
      },
    })
    if (!res.ok) {
      const errTxt = await res.text()
      return { found: false, error: `HTTP ${res.status}: ${errTxt}` }
    }
    const data = await res.json()
    const domains: any[] = data?.data || []
    const match = domains.find((d: any) => d.name?.toLowerCase() === domainName.toLowerCase())
    if (!match) {
      return { found: false, raw: domains }
    }
    return { found: true, status: match.status, raw: match }
  } catch (err: any) {
    return { found: false, error: err.message || 'Erro ao consultar domínios no Resend' }
  }
}

/**
 * Standard email headers to guarantee Reply-To: meyvesbr@gmail.com
 * and proper store metadata.
 */
export function getStandardEmailHeaders(): Record<string, string> {
  return {
    'Reply-To': PRIMARY_CUSTOMER_EMAIL,
    'X-Entity-Ref-ID': 'meyves-store',
  }
}

/**
 * Retrieves the Resend API Key dynamically:
 * 1. From Edge Function environment variable RESEND_API_KEY
 * 2. Fallback from public.site_settings table where setting_key = 'resend_api_key'
 */
export async function getResendApiKey(supabaseClient?: any): Promise<string | null> {
  const envKey = Deno.env.get('RESEND_API_KEY')?.trim()
  if (envKey) return envKey

  if (supabaseClient) {
    try {
      const { data } = await supabaseClient
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'resend_api_key')
        .maybeSingle()
      if (data?.setting_value?.trim()) {
        return data.setting_value.trim()
      }
    } catch (err) {
      console.warn('[getResendApiKey] Erro ao consultar site_settings:', err)
    }
  }

  return null
}
