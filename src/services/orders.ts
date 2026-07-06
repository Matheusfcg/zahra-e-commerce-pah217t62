import { supabase } from '@/lib/supabase/client'

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'processing', label: 'Em Processamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'canceled', label: 'Cancelado' },
] as const

export const getStatusLabel = (status: string): string => {
  const found = ORDER_STATUSES.find((s) => s.value === status)
  return found?.label || status
}

export type OrderItem = {
  quantity: number
  price_at_purchase: number
  product_id: string | null
  size_name: string | null
  color_name: string | null
  products: { name: string; product_images: { url: string }[] } | null
}

export type Order = {
  id: string
  created_at: string | null
  status: string
  total_amount: number
  payment_method: string | null
  customer_name: string | null
  customer_email: string
  customer_phone: string | null
  user_id: string | null
  invoice_url: string | null
  order_items: OrderItem[]
}

const ORDER_SELECT = `
  id, created_at, status, total_amount, payment_method,
  customer_name, customer_email, customer_phone, user_id, invoice_url,
  order_items (
    quantity, price_at_purchase, product_id, size_name, color_name,
    products (name, product_images(url))
  )
`

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false })
  return { data: data as unknown as Order[] | null, error }
}

export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data as unknown as Order[] | null, error }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
  return { data, error }
}

export async function updateOrderInvoice(orderId: string, invoiceUrl: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ invoice_url: invoiceUrl })
    .eq('id', orderId)
    .select()
  return { data, error }
}
