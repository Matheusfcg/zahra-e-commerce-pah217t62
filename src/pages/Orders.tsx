import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  FileText,
  MapPin,
  Eye,
  PackageCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { optimizeImage } from '@/lib/image'

type OrderItem = {
  quantity: number
  price_at_purchase: number
  product_id: string
  size_name: string | null
  color_name: string | null
  products: { name: string; product_images: { url: string }[] } | null
}

type Order = {
  id: string
  created_at: string
  status: string
  total_amount: number
  payment_method: string | null
  invoice_url: string | null
  tracking_code: string | null
  carrier_name: string | null
  shipping_method: string | null
  shipping_cost: number | null
  delivery_days: number | null
  shipping_zip_code: string | null
  shipping_street: string | null
  shipping_number: string | null
  shipping_complement: string | null
  shipping_neighborhood: string | null
  shipping_city: string | null
  shipping_state: string | null
  order_items: OrderItem[]
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Em Processamento',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  }
  return map[status] || status
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4 mr-1.5" />
    case 'shipped':
      return <Truck className="w-4 h-4 mr-1.5" />
    case 'canceled':
      return <XCircle className="w-4 h-4 mr-1.5" />
    default:
      return <Clock className="w-4 h-4 mr-1.5" />
  }
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }
    const fetchOrders = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, created_at, status, total_amount, payment_method, invoice_url,
          shipping_zip_code, shipping_street, shipping_number, shipping_complement,
          shipping_neighborhood, shipping_city, shipping_state,
          tracking_code, carrier_name, shipping_method, shipping_cost, delivery_days,
          order_items (quantity, price_at_purchase, product_id, size_name, color_name, products (name, product_images(url)))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) console.error('Error fetching orders:', error)
      if (data) setOrders(data as unknown as Order[])
      setIsLoading(false)
    }
    fetchOrders()
    const channel = supabase
      .channel('user-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => fetchOrders(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 bg-background">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" strokeWidth={1} />
        <h1 className="font-sans font-light tracking-tight text-3xl mb-4 text-foreground">
          Meus Pedidos
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md font-sans">
          Faça login ou crie uma conta para visualizar o histórico das suas compras e acompanhar o
          status dos seus pedidos.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-2 text-foreground">Meus Pedidos</h1>
        <p className="text-muted-foreground mb-8">
          Acompanhe o status e histórico de todas as suas compras.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-muted/10 border border-dashed rounded-xl p-12 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium mb-2">Você ainda não tem nenhum pedido</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Quando você realizar uma compra, os detalhes e o status de entrega aparecerão aqui.
            </p>
            <Link
              to="/produtos"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-none text-sm font-medium transition-colors"
            >
              Começar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-muted/20 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Pedido realizado em
                    </p>
                    <p className="font-medium text-sm">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Valor Total
                    </p>
                    <p className="font-medium text-sm">
                      R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      ID do Pedido
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {order.id.split('-')[0].toUpperCase()}
                    </p>
                  </div>
                  <div className="sm:ml-auto">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 font-medium flex items-center ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                      Itens do Pedido
                    </h4>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 mr-1.5" /> Ver Detalhes
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {order.order_items.map((item, idx) => {
                      let imageUrl = 'https://img.usecurling.com/p/200/200?q=clothing'
                      if (
                        item.products?.product_images &&
                        item.products.product_images.length > 0
                      ) {
                        imageUrl = item.products.product_images[0].url
                      }
                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-16 h-20 bg-muted shrink-0 rounded overflow-hidden">
                            <ProgressiveImage
                              src={optimizeImage(imageUrl, {
                                width: 120,
                                height: 150,
                                quality: 80,
                                format: 'webp',
                              })}
                              alt={item.products?.name || 'Produto'}
                              loading="lazy"
                              decoding="async"
                              width={64}
                              height={80}
                              containerClassName="w-full h-full"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${item.product_id}`}
                              className="font-medium text-sm hover:underline hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.products?.name || 'Produto indisponível'}
                            </Link>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                              {item.color_name && <span>Cor: {item.color_name}</span>}
                              {item.size_name && <span>Tam: {item.size_name}</span>}
                              <span>Qtd: {item.quantity}</span>
                            </div>
                            <div className="mt-2 text-sm font-medium">
                              R$ {Number(item.price_at_purchase).toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {order.tracking_code && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                      <PackageCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-muted-foreground">Rastreamento:</span>
                      <span className="font-medium">{order.tracking_code}</span>
                      {order.carrier_name && (
                        <span className="text-muted-foreground">({order.carrier_name})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Pedido {selectedOrder?.id.split('-')[0].toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>{' '}
                  {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="text-muted-foreground">Pagamento:</span>{' '}
                  {selectedOrder.payment_method || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span> R${' '}
                  {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>
              {selectedOrder.shipping_method && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Frete:</span>{' '}
                  {selectedOrder.shipping_method}
                  {selectedOrder.shipping_cost != null && Number(selectedOrder.shipping_cost) > 0
                    ? ` — R$ ${Number(selectedOrder.shipping_cost).toFixed(2).replace('.', ',')}`
                    : ' — Grátis'}
                  {selectedOrder.delivery_days && ` (${selectedOrder.delivery_days} dias úteis)`}
                </div>
              )}
              {selectedOrder.tracking_code && (
                <div className="text-sm flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-muted-foreground">Rastreamento:</span>
                  <span className="font-medium">{selectedOrder.tracking_code}</span>
                  {selectedOrder.carrier_name && (
                    <span className="text-muted-foreground">({selectedOrder.carrier_name})</span>
                  )}
                </div>
              )}
              {(selectedOrder.shipping_street || selectedOrder.shipping_zip_code) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> Endereço de Entrega
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground bg-muted/30 p-3 rounded-md">
                    <p>
                      {selectedOrder.shipping_street || '—'},{' '}
                      {selectedOrder.shipping_number || 'S/N'}
                    </p>
                    {selectedOrder.shipping_complement && (
                      <p>{selectedOrder.shipping_complement}</p>
                    )}
                    <p>{selectedOrder.shipping_neighborhood || '—'}</p>
                    <p>
                      {selectedOrder.shipping_city || '—'} - {selectedOrder.shipping_state || '—'}
                    </p>
                    <p>CEP: {selectedOrder.shipping_zip_code || '—'}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide">Itens</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                        {item.products?.product_images?.[0]?.url && (
                          <ProgressiveImage
                            src={optimizeImage(item.products.product_images[0].url, {
                              width: 96,
                              height: 96,
                              quality: 80,
                              format: 'webp',
                            })}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width={48}
                            height={48}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.products?.name || 'Produto indisponível'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity}
                          {item.size_name ? ` | Tam: ${item.size_name}` : ''}
                          {item.color_name ? ` | Cor: ${item.color_name}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        R$ {Number(item.price_at_purchase).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.invoice_url && (
                <a
                  href={selectedOrder.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Ver Nota Fiscal
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
