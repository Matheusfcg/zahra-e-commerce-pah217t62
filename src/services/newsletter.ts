import { supabase } from '@/lib/supabase/client'

export type NewsletterSubscriber = {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export async function subscribeToNewsletter(email: string) {
  const { data, error } = await supabase.from('newsletter_subscribers').insert([{ email }]).select()
  return { data, error }
}

export async function fetchSubscribers() {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return { data: data as NewsletterSubscriber[] | null, error }
}

export async function deleteSubscriber(id: string) {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  return { error }
}

export async function sendNewsletter(subject: string, content: string) {
  const { data, error } = await supabase.functions.invoke('send-newsletter', {
    body: { subject, content },
  })
  return { data, error }
}
