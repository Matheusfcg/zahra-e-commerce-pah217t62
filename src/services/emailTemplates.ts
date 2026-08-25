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
  return await supabase.functions.invoke('process-order-notifications', {
    body: {
      event_type: templateSlug === 'welcome' ? 'welcome_email' : 'welcome_email',
      customer_email: targetEmail,
      customer_name: customVariables?.nome_cliente || 'Cliente Teste',
    },
  })
}
