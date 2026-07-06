import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  ORDER_STATUSES,
  getStatusLabel,
  fetchAllOrders,
  updateOrderStatus,
  updateOrderInvoice,
  type Order,
} from '@/services/orders'
import { Loader2, Eye, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800 border-green-200',
    shipped: 'bg-blue-100 text-blue-800 border-blue-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
  }
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [updatingInvoice, setUpdatingInvoice] = useState(false)

  const loadOrders = useCallback(async () => {
    const { data } = await fetchAllOrders()
    setOrders(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadOrders])

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    const { error } = await updateOrderStatus(orderId, status)
    if (error) {
      toast.error('Erro ao atualizar status')
    } else {
      toast.success('Status atualizado com sucesso!')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status })
    }
    setUpdatingId(null)
  }

  useEffect(() => {
    if (selectedOrder) {
      setInvoiceUrl(selectedOrder.invoice_url || '')
    }
  }, [selectedOrder])

  const handleSaveInvoice = async () => {
    if (!selectedOrder) return
    setUpdatingInvoice(true)
    const { error } = await updateOrderInvoice(selectedOrder.id, invoiceUrl)
    if (error) {
      toast.error('Erro ao salvar nota fiscal')
    } else {
      toast.success('Nota fiscal salva com sucesso!')
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, invoice_url: invoiceUrl } : o)),
      )
      setSelectedOrder({ ...selectedOrder, invoice_url: invoiceUrl })
    }
    setUpdatingInvoice(false)
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} pedido(s)</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">
                    {o.id.split('-')[0].toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{o.customer_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {o.created_at ? formatDate(o.created_at) : '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(o.total_amount).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => handleStatusChange(o.id, v)}
                      disabled={updatingId === o.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
                  <span className="text-muted-foreground">Cliente:</span>{' '}
                  {selectedOrder.customer_name || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">E-mail:</span>{' '}
                  {selectedOrder.customer_email}
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>{' '}
                  {selectedOrder.customer_phone || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Pagamento:</span>{' '}
                  {selectedOrder.payment_method || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>{' '}
                  {selectedOrder.created_at ? formatDate(selectedOrder.created_at) : '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span> R${' '}
                  {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Nota Fiscal (URL):</span>
                <div className="flex gap-2">
                  <Input
                    value={invoiceUrl}
                    onChange={(e) => setInvoiceUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveInvoice} disabled={updatingInvoice}>
                    {updatingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                  </Button>
                </div>
                {selectedOrder.invoice_url && (
                  <a
                    href={selectedOrder.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver NF atual
                  </a>
                )}
              </div>
              {selectedOrder.shipping_zip_code && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Endereço de Entrega
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground bg-muted/30 p-3 rounded-md">
                    <p>
                      {selectedOrder.shipping_street || '—'}
                      {selectedOrder.shipping_number ? `, ${selectedOrder.shipping_number}` : ''}
                    </p>
                    {selectedOrder.shipping_complement && (
                      <p>Complemento: {selectedOrder.shipping_complement}</p>
                    )}
                    <p>Bairro: {selectedOrder.shipping_neighborhood || '—'}</p>
                    <p>
                      {selectedOrder.shipping_city || '—'}
                      {selectedOrder.shipping_state ? ` - ${selectedOrder.shipping_state}` : ''}
                    </p>
                    <p>CEP: {selectedOrder.shipping_zip_code}</p>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide">Itens</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                        {item.products?.product_images?.[0]?.url && (
                          <img
                            src={item.products.product_images[0].url}
                            alt=""
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
