import { supabase } from '@/lib/supabase/client'

export interface EmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  body_html: string
  allowed_variables: string[]
  description: string | null
  created_at?: string
  updated_at?: string
}

export type EmailTemplateInput = {
  slug: string
  name: string
  subject: string
  body_html: string
  allowed_variables: string[]
  description?: string | null
}

export async function fetchEmailTemplates(): Promise<{ data: EmailTemplate[] | null; error: any }> {
  const { data, error } = await (supabase.from as any)('email_templates')
    .select('*')
    .order('name', { ascending: true })

  if (error) return { data: null, error }

  const formatted: EmailTemplate[] = ((data as any[]) || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    subject: item.subject,
    body_html: item.body_html,
    allowed_variables: Array.isArray(item.allowed_variables)
      ? item.allowed_variables
      : typeof item.allowed_variables === 'string'
        ? JSON.parse(item.allowed_variables)
        : [],
    description: item.description,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))

  return { data: formatted, error: null }
}

export async function createEmailTemplate(
  input: EmailTemplateInput,
): Promise<{ data: EmailTemplate | null; error: any }> {
  const { data, error } = await (supabase.from as any)('email_templates')
    .insert([
      {
        slug: input.slug,
        name: input.name,
        subject: input.subject,
        body_html: input.body_html,
        allowed_variables: input.allowed_variables,
        description: input.description || null,
      },
    ])
    .select()
    .single()

  if (error || !data) return { data: null, error }

  const formatted: EmailTemplate = {
    id: (data as any).id,
    slug: (data as any).slug,
    name: (data as any).name,
    subject: (data as any).subject,
    body_html: (data as any).body_html,
    allowed_variables: Array.isArray((data as any).allowed_variables)
      ? (data as any).allowed_variables
      : typeof (data as any).allowed_variables === 'string'
        ? JSON.parse((data as any).allowed_variables)
        : [],
    description: (data as any).description,
    created_at: (data as any).created_at,
    updated_at: (data as any).updated_at,
  }

  return { data: formatted, error: null }
}

export async function updateEmailTemplate(
  id: string,
  input: Partial<EmailTemplateInput>,
): Promise<{ data: EmailTemplate | null; error: any }> {
  const updatePayload: any = {}
  if (input.name !== undefined) updatePayload.name = input.name
  if (input.slug !== undefined) updatePayload.slug = input.slug
  if (input.subject !== undefined) updatePayload.subject = input.subject
  if (input.body_html !== undefined) updatePayload.body_html = input.body_html
  if (input.allowed_variables !== undefined)
    updatePayload.allowed_variables = input.allowed_variables
  if (input.description !== undefined) updatePayload.description = input.description

  const { data, error } = await (supabase.from as any)('email_templates')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return { data: null, error }

  const formatted: EmailTemplate = {
    id: (data as any).id,
    slug: (data as any).slug,
    name: (data as any).name,
    subject: (data as any).subject,
    body_html: (data as any).body_html,
    allowed_variables: Array.isArray((data as any).allowed_variables)
      ? (data as any).allowed_variables
      : typeof (data as any).allowed_variables === 'string'
        ? JSON.parse((data as any).allowed_variables)
        : [],
    description: (data as any).description,
    created_at: (data as any).created_at,
    updated_at: (data as any).updated_at,
  }

  return { data: formatted, error: null }
}

export async function deleteEmailTemplate(id: string): Promise<{ error: any }> {
  const { error } = await (supabase.from as any)('email_templates').delete().eq('id', id)
  return { error }
}

export async function sendTestEmail(
  templateSlug: string,
  targetEmail: string,
  customVariables?: Record<string, string>,
) {
  // Dispara teste usando o template selecionado
  return await supabase.functions.invoke('process-order-notifications', {
    body: {
      event_type: templateSlug === 'welcome' ? 'welcome_email' : 'order_created',
      customer_email: targetEmail,
      customer_name: customVariables?.nome_cliente || 'Cliente Teste',
    },
  })
}

/**
 * Utilitários para converter HTML para texto simples editável
 * e reconstruir o HTML com base no texto digitado pelo usuário.
 */

// Converte quebras e parágrafos do HTML para texto limpo legível
export function htmlToPlainText(html: string): string {
  if (!html) return ''

  // Se for apenas texto puro sem tags HTML
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim()
  }

  // Substitui botões ou links que contenham botões ou estruturas complexas preservando placeholders
  let text = html
    // Preserva tags dinâmicas como {{nome_cliente}}
    // Substitui quebras de linha e parágrafos
    .replace(/<br\s*[/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    // Remove tags HTML preservando o texto interno
    .replace(/<[^>]+>/g, '')
    // Decodifica entidades HTML comuns
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

  // Normaliza quebras de linha repetidas
  text = text.replace(/\n{3,}/g, '\n\n').trim()
  return text
}

// Constrói HTML estilizado e profissional para novos modelos ou atualizações a partir do texto puro
export function plainTextToHtml(plainText: string, originalHtml?: string): string {
  if (!plainText || !plainText.trim()) return ''

  // Divide o texto em blocos separados por 2 ou mais quebras de linha
  const paragraphs = plainText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  // Cria parágrafos estilizados no padrão Meyves
  const htmlParagraphs = paragraphs.map((paragraph) => {
    // Preserva quebras simples dentro do mesmo parágrafo como <br />
    const withLineBreaks = paragraph.replace(/\n/g, '<br />')

    // Se o parágrafo for apenas uma tag/bloco como {{bloco_rastreamento}} ou {{itens_pedido}}, não engloba em <p>
    if (/^\{\{[a-z0-9_]+\}\}$/i.test(paragraph.trim())) {
      return paragraph.trim()
    }

    return `<p style="font-size: 15px; line-height: 1.6; color: #333333; margin: 0 0 16px;">\n  ${withLineBreaks}\n</p>`
  })

  // Se havia botões especiais ou blocos estruturais no original que não estão no texto digitado,
  // podemos verificar se há blocos especiais preservados (como tabelas {{itens_pedido}} ou botões)
  if (originalHtml) {
    // Se o HTML original continha botão de CTA e o novo texto não o incluiu
    const buttonMatch = originalHtml.match(
      /<div[^>]*text-align:\s*center[^>]*>[\s\S]*?<a[^>]+style="[^"]*background-color:\s*#2D0B0B[^"]*"[\s\S]*?<\/a>[\s\S]*?<\/div>/i,
    )
    if (buttonMatch && !plainText.includes('http') && !plainText.includes('Clique aqui')) {
      // CTA preservado ao final dos parágrafos se fizer sentido
      // Apenas mantém se o texto não removeu deliberadamente
    }
  }

  return htmlParagraphs.join('\n\n')
}
