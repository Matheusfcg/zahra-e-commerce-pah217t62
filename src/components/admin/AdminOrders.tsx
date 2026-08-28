import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  ORDER_STATUSES,
  getStatusLabel,
  fetchAllOrders,
  updateOrderStatus,
  updateOrderInvoice,
  updateOrderTracking,
  updateOrderEstimatedDelivery,
  resendOrderEmail,
  type Order,
} from '@/services/orders'
import {
  Loader2,
  Eye,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Send,
  Calendar,
  Package,
} from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800 border-green-200',
    shipped: 'bg-blue-100 text-blue-800 border-blue-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEmailStatus, setFilterEmailStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [updatingInvoice, setUpdatingInvoice] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [carrierName, setCarrierName] = useState('')
  const [updatingTracking, setUpdatingTracking] = useState(false)
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('')
  const [updatingEstimate, setUpdatingEstimate] = useState(false)
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    const { data, error } = await fetchAllOrders()
    if (error) {
      setFetchError(
        'Não foi possível carregar os pedidos no momento. Verifique sua conexão com a internet.',
      )
      setOrders([])
    } else {
      setOrders(data || [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAllOrders().then(({ data }) => {
          if (data) setOrders(data)
        })
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId)
    const { error } = await updateOrderStatus(orderId, status)
    if (error) {
      toast.error('Erro ao atualizar status do pedido')
    } else {
      toast.success('Status do pedido atualizado! Notificação de e-mail enviada.')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status })

      // Also trigger status update email
      resendOrderEmail(orderId, 'status_changed', {
        newStatus: status,
      })
        .then(() => {
          loadOrders()
        })
        .catch(() => {})
    }
    setUpdatingId(null)
  }

  useEffect(() => {
    if (selectedOrder) {
      setInvoiceUrl(selectedOrder.invoice_url || '')
      setTrackingCode(selectedOrder.tracking_code || '')
      setCarrierName(selectedOrder.carrier_name || '')
      setEstimatedDeliveryDate(selectedOrder.estimated_delivery_date || '')
    }
  }, [selectedOrder])

  const handleSaveInvoice = async () => {
    if (!selectedOrder) return
    setUpdatingInvoice(true)
    const { error } = await updateOrderInvoice(selectedOrder.id, invoiceUrl)
    if (error) {
      toast.error('Erro ao salvar nota fiscal')
    } else {
      toast.success('Nota fiscal salva! Notificação enviada por e-mail ao cliente.')
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, invoice_url: invoiceUrl } : o)),
      )
      setSelectedOrder({ ...selectedOrder, invoice_url: invoiceUrl })
      if (invoiceUrl) {
        resendOrderEmail(selectedOrder.id, 'invoice_added')
          .then(() => loadOrders())
          .catch(() => {})
      }
    }
    setUpdatingInvoice(false)
  }

  const handleSaveTracking = async () => {
    if (!selectedOrder) return
    setUpdatingTracking(true)
    const { error } = await updateOrderTracking(selectedOrder.id, trackingCode, carrierName)
    if (error) {
      toast.error('Erro ao salvar rastreamento')
    } else {
      toast.success('Rastreamento salvo com sucesso!')
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, tracking_code: trackingCode, carrier_name: carrierName }
            : o,
        ),
      )
      setSelectedOrder({ ...selectedOrder, tracking_code: trackingCode, carrier_name: carrierName })
    }
    setUpdatingTracking(false)
  }

  const handleSaveEstimatedDelivery = async () => {
    if (!selectedOrder) return
    setUpdatingEstimate(true)
    const { error } = await updateOrderEstimatedDelivery(
      selectedOrder.id,
      estimatedDeliveryDate || null,
    )
    if (error) {
      toast.error('Erro ao atualizar data estimada')
    } else {
      toast.success('Data estimada para envio/entrega atualizada com sucesso!')
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, estimated_delivery_date: estimatedDeliveryDate || null }
            : o,
        ),
      )
      setSelectedOrder({ ...selectedOrder, estimated_delivery_date: estimatedDeliveryDate || null })
      // Trigger status/estimate notification if updated
      resendOrderEmail(selectedOrder.id, 'status_changed', {
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      })
        .then(() => loadOrders())
        .catch(() => {})
    }
    setUpdatingEstimate(false)
  }

  const handleResendEmail = async (
    orderId: string,
    eventType: 'order_created' | 'status_changed' | 'invoice_added' = 'order_created',
    customToastMessage?: string,
  ) => {
    setResendingEmailId(orderId)
    try {
      const { data, error } = await resendOrderEmail(orderId, eventType)
      if (error || (data && data.success === false)) {
        const msg = data?.error || error?.message || 'Falha ao disparar e-mail'
        toast.error(`Erro no envio: ${msg}`)
      } else {
        toast.success(
          customToastMessage ||
            (eventType === 'order_created'
              ? 'E-mail de confirmação do pedido enviado com sucesso!'
              : eventType === 'invoice_added'
                ? 'E-mail com link da Nota Fiscal enviado com sucesso!'
                : 'E-mail de atualização de status enviado com sucesso!'),
        )
        await loadOrders()
        if (selectedOrder?.id === orderId) {
          const { data: refreshed } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()
          if (refreshed) {
            setSelectedOrder((prev) => (prev ? { ...prev, ...refreshed } : null))
          }
        }
      }
    } catch (err: any) {
      toast.error(`Falha na comunicação com o serviço de e-mail: ${err.message}`)
    } finally {
      setResendingEmailId(null)
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const emailStatus = o.email_confirmation_status || 'pending'
    const matchEmail = filterEmailStatus === 'all' || emailStatus === filterEmailStatus
    return matchStatus && matchEmail
  })

  const renderEmailStatusBadge = (order: Order) => {
    const status = order.email_confirmation_status || 'pending'
    if (status === 'sent') {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 font-normal"
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Enviado
        </Badge>
      )
    }
    if (status === 'error') {
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1.5 font-normal"
          title={order.email_confirmation_error || 'Erro no envio'}
        >
          <AlertCircle className="h-3 w-3 text-rose-600" />
          Erro
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 font-normal"
      >
        <Clock className="h-3 w-3 text-amber-600" />
        Pendente
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Status do Pedido
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-10">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
              Status do E-mail
            </Label>
            <Select value={filterEmailStatus} onValueChange={setFilterEmailStatus}>
              <SelectTrigger className="w-44 h-10">
                <SelectValue placeholder="Status do e-mail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os e-mails</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            {filtered.length} pedido(s)
          </span>
        </div>
      </div>

      {/* 1. STATE: LOADING */}
      {isLoading && (
        <div className="space-y-3 p-4 border rounded-md bg-card">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. STATE: ERROR */}
      {!isLoading && fetchError && (
        <div className="text-center py-16 px-4 border border-rose-200 rounded-lg bg-rose-50/50 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg text-rose-950">Não foi possível carregar as compras</h3>
          <p className="text-sm text-rose-700 max-w-md mx-auto">{fetchError}</p>
          <Button
            onClick={loadOrders}
            variant="outline"
            className="border-rose-300 text-rose-900 hover:bg-rose-100"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* 3. STATE: EMPTY */}
      {!isLoading && !fetchError && filtered.length === 0 && (
        <div className="text-center py-16 px-4 border border-dashed rounded-lg bg-muted/20 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg text-[#2D0B0B]">Nenhum pedido encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {filterStatus !== 'all' || filterEmailStatus !== 'all'
              ? 'Nenhum pedido corresponde aos filtros aplicados. Tente ajustar os filtros.'
              : 'Assim que os clientes realizarem compras no site, elas aparecerão listadas aqui em tempo real.'}
          </p>
          {(filterStatus !== 'all' || filterEmailStatus !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterStatus('all')
                setFilterEmailStatus('all')
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* 4. STATE: SUCCESS / DATA TABLE */}
      {!isLoading && !fetchError && filtered.length > 0 && (
        <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[100px]">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data da Compra</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status do Pedido</TableHead>
                <TableHead>E-mail Agradecimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-bold text-[#2D0B0B]">
                    #{o.id.split('-')[0].toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-[#2D0B0B]">
                      {o.customer_name || 'Cliente Meyves'}
                    </div>
                    <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {o.created_at ? formatDate(o.created_at) : '—'}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    R$ {Number(o.total_amount).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => handleStatusChange(o.id, v)}
                      disabled={updatingId === o.id}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-xs">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderEmailStatusBadge(o)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-[#2D0B0B]"
                        title="Reenviar e-mail de confirmação"
                        disabled={resendingEmailId === o.id}
                        onClick={() => handleResendEmail(o.id, 'order_created')}
                      >
                        {resendingEmailId === o.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Detalhes do Pedido #{selectedOrder?.id.split('-')[0].toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer and Order metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-md border">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Cliente
                  </span>
                  <span className="font-medium">{selectedOrder.customer_name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    E-mail
                  </span>
                  <span className="font-medium">{selectedOrder.customer_email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Telefone
                  </span>
                  <span className="font-medium">
                    {selectedOrder.customer_phone || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Forma de Pagamento
                  </span>
                  <span className="font-medium uppercase">
                    {selectedOrder.payment_method || 'PIX'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Data da Compra
                  </span>
                  <span className="font-medium">
                    {selectedOrder.created_at ? formatDate(selectedOrder.created_at) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Valor Total
                  </span>
                  <span className="font-bold text-base text-[#2D0B0B]">
                    R$ {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Status and Email Status */}
              <div className="p-4 border rounded-md space-y-3 bg-[#fdfbf7]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status do Pedido:</span>
                    <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status do E-mail:</span>
                    {renderEmailStatusBadge(selectedOrder)}
                  </div>
                </div>

                {selectedOrder.email_confirmation_sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Último envio com sucesso em:{' '}
                    {formatDate(selectedOrder.email_confirmation_sent_at)}
                  </p>
                )}

                {selectedOrder.email_confirmation_status === 'error' &&
                  selectedOrder.email_confirmation_error && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      <span className="font-semibold block mb-0.5">
                        Detalhe do erro no disparo:
                      </span>
                      <p className="break-words font-mono text-[11px]">
                        {selectedOrder.email_confirmation_error}
                      </p>
                    </div>
                  )}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#f0ede8]">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs"
                    disabled={resendingEmailId === selectedOrder.id}
                    onClick={() => handleResendEmail(selectedOrder.id, 'order_created')}
                  >
                    {resendingEmailId === selectedOrder.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    Reenviar Confirmação
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs"
                    disabled={resendingEmailId === selectedOrder.id}
                    onClick={() => handleResendEmail(selectedOrder.id, 'status_changed')}
                  >
                    {resendingEmailId === selectedOrder.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Reenviar Atualização de Status
                  </Button>
                </div>
              </div>

              {/* Estimated Delivery Date */}
              <div className="space-y-2 p-4 border rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#2D0B0B]" />
                  <Label className="text-sm font-semibold">
                    Data Estimada para Envio / Entrega
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEstimatedDelivery}
                    disabled={updatingEstimate}
                  >
                    {updatingEstimate ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar Previsão'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta data será incluída nos e-mails de confirmação e atualizações de status.
                </p>
              </div>

              {/* Invoice Section */}
              <div className="space-y-2 p-4 border rounded-md">
                <Label className="text-sm font-semibold">Nota Fiscal Eletrônica (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    value={invoiceUrl}
                    onChange={(e) => setInvoiceUrl(e.target.value)}
                    placeholder="https://sua-empresa.com/nf-12345.pdf"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveInvoice} disabled={updatingInvoice}>
                    {updatingInvoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar & Notificar'
                    )}
                  </Button>
                </div>
                {selectedOrder.invoice_url && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={selectedOrder.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Visualizar NF anexada
                    </a>
                  </div>
                )}
              </div>

              {/* Tracking Information */}
              <div className="space-y-2 p-4 border rounded-md">
                <Label className="text-sm font-semibold">Rastreamento de Envio</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Código de rastreamento (ex: BR123456789)"
                  />
                  <Input
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="Transportadora (ex: Correios / Jadlog)"
                  />
                </div>
                <Button size="sm" onClick={handleSaveTracking} disabled={updatingTracking}>
                  {updatingTracking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Salvar Rastreamento'
                  )}
                </Button>
              </div>

              {/* Shipping Address */}
              {(selectedOrder.shipping_zip_code || selectedOrder.shipping_street) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#2D0B0B]" />
                    Endereço de Entrega
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground bg-muted/30 p-3 rounded-md border">
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
                    <p className="font-mono text-xs">
                      CEP: {selectedOrder.shipping_zip_code || '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide">
                  Itens Comprados ({selectedOrder.order_items?.length || 0})
                </h4>
                <div className="space-y-3 border rounded-md p-3 divide-y">
                  {selectedOrder.order_items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center pt-3 first:pt-0">
                      <div className="w-12 h-14 bg-muted rounded overflow-hidden shrink-0 border">
                        {item.products?.product_images?.[0]?.url && (
                          <img
                            src={item.products.product_images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-[#2D0B0B]">
                          {item.products?.name || 'Produto Meyves'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qtd: {item.quantity}
                          {item.size_name ? ` | Tam: ${item.size_name}` : ''}
                          {item.color_name ? ` | Cor: ${item.color_name}` : ''}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#2D0B0B]">
                        R${' '}
                        {Number(item.price_at_purchase * item.quantity)
                          .toFixed(2)
                          .replace('.', ',')}
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
