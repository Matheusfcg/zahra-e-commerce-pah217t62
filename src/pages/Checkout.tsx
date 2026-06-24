import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Lock, Copy } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { generatePixPayload } from '@/lib/pix'
import { supabase } from '@/lib/supabase/client'
import { useCartProductImages } from '@/hooks/use-cart-images'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

const Checkout = () => {
  const { items, subtotal } = useCart()
  const { session } = useAuth()
  const shipping = 0
  const total = subtotal + shipping

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit')
  const [guestEmail, setGuestEmail] = useState('')
  const [pixPayload, setPixPayload] = useState('')
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [pixGenerated, setPixGenerated] = useState(false)
  const [pixDetails, setPixDetails] = useState({
    name: 'ELLEN CRISTINA',
    key: '64278774000161',
    institution: 'InfinitePay',
    formattedKey: '64.278.774/0001-61',
  })
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [pixError, setPixError] = useState(false)
  const [profile, setProfile] = useState<{
    full_name: string | null
    document_number: string | null
    phone: string | null
  } | null>(null)

  const userEmail = session?.user?.email
  const userId = session?.user?.id
  const displayEmail = userEmail || guestEmail || 'Convidado'

  const imagesMap = useCartProductImages(items)

  useEffect(() => {
    if (userId) {
      supabase
        .from('user_profiles')
        .select('full_name, document_number, phone')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data)
        })
    }
  }, [userId])

  useEffect(() => {
    if (userEmail && step === 1) {
      setStep(2)
    }
  }, [userEmail, step])

  useEffect(() => {
    // Dynamically fix WhatsApp links to prevent ERR_BLOCKED_BY_RESPONSE
    const fixWhatsAppLinks = () => {
      const links = document.querySelectorAll('a[href*="api.whatsapp.com"]')
      links.forEach((link) => {
        const href = link.getAttribute('href') || ''
        if (href.includes('api.whatsapp.com')) {
          try {
            const urlString = href.startsWith('http') ? href : `https://${href}`
            const url = new URL(urlString)
            let phone = url.searchParams.get('phone')
            const text =
              url.searchParams.get('text') || 'Olá, preciso de ajuda para finalizar minha compra'

            if (!phone) {
              const match = href.match(/phone=([0-9]+)/)
              if (match) phone = match[1]
            }

            if (phone) {
              link.setAttribute('href', `https://wa.me/${phone}?text=${encodeURIComponent(text)}`)
              link.setAttribute('target', '_blank')
              link.setAttribute('rel', 'noopener noreferrer')
            }
          } catch (e) {
            const newHref = href
              .replace('api.whatsapp.com/send/?phone=', 'wa.me/')
              .replace('api.whatsapp.com/send?phone=', 'wa.me/')
            link.setAttribute('href', newHref)
          }
        }
      })
    }

    fixWhatsAppLinks()
    const observer = new MutationObserver(fixWhatsAppLinks)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [step])

  useEffect(() => {
    supabase
      .from('site_content')
      .select('*')
      .eq('section_key', 'pix_details')
      .single()
      .then(({ data }) => {
        if (data && data.content_value) {
          try {
            const parsed = JSON.parse(data.content_value)
            setPixDetails((prev) => ({ ...prev, ...parsed }))
          } catch {
            /* intentionally ignored */
          }
        }
      })
  }, [])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const handleGeneratePix = async () => {
    if (items.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos antes de finalizar.',
        variant: 'destructive',
      })
      return
    }

    const pixKey = pixDetails.key || '64278774000161'
    const merchantName = pixDetails.name || 'ELLEN CRISTINA'
    const merchantCity = 'SAO PAULO'
    const formattedKey = pixDetails.formattedKey || '64.278.774/0001-61'

    if (createdOrderId && pixPayload) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('SHOW_PIX_MODAL', {
            detail: { payload: pixPayload, pixKey: formattedKey, merchantName, amount: total },
          }),
        )
      }
      return
    }

    setIsGeneratingPix(true)
    setPixError(false)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('START_PIX_FLOW'))
    }

    try {
      // Create Order
      const customerName =
        profile?.full_name || (firstName ? `${firstName} ${lastName}` : 'Cliente')
      const customerEmail = displayEmail
      const customerPhone = profile?.phone || phone

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          total_amount: total,
          status: 'pending',
          payment_method: 'pix',
        })
        .select()
        .single()

      if (orderError) throw orderError

      setCreatedOrderId(order.id)

      // Insert Items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) throw itemsError

      // Trigger Edge Function Notification Asynchronously
      supabase.functions
        .invoke('process-order-notifications', {
          body: { order_id: order.id },
        })
        .catch((err) => console.error('Edge function trigger error:', err))

      // Update UI for PIX Flow
      const payload = generatePixPayload({
        pixKey,
        merchantName,
        merchantCity,
        amount: total,
      })
      setPixPayload(payload)
      setPixGenerated(true)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('SHOW_PIX_MODAL', {
            detail: { payload, pixKey: formattedKey, merchantName, amount: total },
          }),
        )
      }
    } catch (error: any) {
      console.error(error)
      setPixError(true)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('PIX_ERROR'))
      }
      toast({
        title: 'Erro ao gerar Pix',
        description: error.message || 'Falha ao processar o pedido. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingPix(false)
    }
  }

  useEffect(() => {
    const handleRetryPix = () => {
      handleGeneratePix()
    }
    window.addEventListener('RETRY_PIX_FLOW', handleRetryPix)
    return () => window.removeEventListener('RETRY_PIX_FLOW', handleRetryPix)
  }, [
    items,
    subtotal,
    total,
    profile,
    firstName,
    lastName,
    phone,
    guestEmail,
    paymentMethod,
    createdOrderId,
    pixPayload,
  ])

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixPayload)
    toast({
      title: 'Copiado!',
      description: 'Chave PIX copiada para a área de transferência.',
    })
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          {/* Left Column: Form Steps */}
          <div className="flex-1 space-y-8">
            <div className="mb-8">
              <h1 className="font-serif text-3xl">Finalizar Compra</h1>
            </div>

            {/* Step 1: Identificação */}
            <div className={`border p-6 transition-opacity ${step !== 1 && 'opacity-60'}`}>
              <h2 className="text-lg font-medium mb-4 flex justify-between items-center">
                <span>1. Identificação</span>
                {step > 1 && (
                  <Button variant="link" onClick={() => setStep(1)} className="p-0 h-auto">
                    Editar
                  </Button>
                )}
              </h2>
              {step === 1 ? (
                <div className="space-y-4 animate-fade-in">
                  {userEmail ? (
                    <div className="space-y-4">
                      <p className="text-sm font-medium">Você está logado como: {userEmail}</p>
                      {profile?.full_name && (
                        <p className="text-sm text-muted-foreground">Nome: {profile.full_name}</p>
                      )}
                      {profile?.phone && (
                        <p className="text-sm text-muted-foreground">Telefone: {profile.phone}</p>
                      )}
                      <Button className="w-full rounded-none h-12 mt-4" onClick={() => setStep(2)}>
                        Continuar para Entrega
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="rounded-none h-12"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nome</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="rounded-none h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Sobrenome</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="rounded-none h-12"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="rounded-none h-12"
                          />
                        </div>
                      </div>
                      <Button className="w-full rounded-none h-12 mt-4" onClick={() => setStep(2)}>
                        Continuar para Entrega
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{displayEmail}</p>
              )}
            </div>

            {/* Step 2: Entrega */}
            <div className={`border p-6 transition-opacity ${step !== 2 && 'opacity-60'}`}>
              <h2 className="text-lg font-medium mb-4 flex justify-between items-center">
                <span>2. Entrega</span>
                {step > 2 && (
                  <Button variant="link" onClick={() => setStep(2)} className="p-0 h-auto">
                    Editar
                  </Button>
                )}
              </h2>
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" className="rounded-none h-12 w-1/3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" className="rounded-none h-12" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input id="number" className="rounded-none h-12" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" className="rounded-none h-12" />
                    </div>
                  </div>
                  <Button className="w-full rounded-none h-12 mt-4" onClick={() => setStep(3)}>
                    Continuar para Pagamento
                  </Button>
                </div>
              )}
            </div>

            {/* Step 3: Pagamento */}
            <div className={`border p-6 transition-opacity ${step !== 3 && 'opacity-60'}`}>
              <h2 className="text-lg font-medium mb-4">3. Pagamento</h2>
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex border rounded-none overflow-hidden">
                    <button
                      className={`flex-1 py-3 text-sm font-medium ${paymentMethod === 'credit' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      onClick={() => setPaymentMethod('credit')}
                    >
                      Cartão de Crédito
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium ${paymentMethod === 'pix' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      onClick={() => setPaymentMethod('pix')}
                    >
                      Pix
                    </button>
                  </div>

                  {paymentMethod === 'credit' ? (
                    <div className="space-y-4 text-center py-6">
                      <p className="text-lg font-medium mb-4">Conclua sua compra em crédito aqui</p>
                      <Button
                        asChild
                        className="w-full rounded-none h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
                      >
                        <a
                          href="https://wa.me/5511995831518?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20finalizar%20minha%20compra"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Falar com Atendente
                        </a>
                      </Button>
                    </div>
                  ) : pixGenerated ? (
                    <div className="space-y-6 flex flex-col items-center py-4 animate-fade-in">
                      <div className="bg-green-50 text-green-700 p-4 rounded-lg w-full text-center mb-2 font-medium">
                        Pedido criado com sucesso!
                      </div>
                      <p className="font-medium text-lg text-center">
                        Abra o aplicativo do seu banco e escaneie o QR Code para pagar
                      </p>
                      <div className="bg-white p-4 rounded-lg border">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`}
                          alt="PIX QR Code"
                          className="w-48 h-48 mix-blend-multiply"
                        />
                      </div>
                      <div className="w-full max-w-sm space-y-2">
                        <Label>Ou copie o código Pix:</Label>
                        <div className="flex gap-2">
                          <Input value={pixPayload} readOnly className="font-mono text-xs" />
                          <Button variant="outline" onClick={copyPixKey} title="Copiar">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-6">
                      <p className="text-2xl font-medium text-primary mb-2">
                        Total a pagar: R$ {total.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Chave Pix será gerada com o valor exato da compra.
                      </p>

                      {pixError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                          Houve um erro ao gerar seu pedido. Por favor, tente novamente.
                        </div>
                      )}

                      <Button
                        className="w-full rounded-none h-14 text-lg flex items-center justify-center gap-2"
                        onClick={handleGeneratePix}
                        disabled={isGeneratingPix}
                      >
                        <Lock className="h-4 w-4" />
                        {isGeneratingPix
                          ? 'Processando...'
                          : pixError
                            ? 'Tentar novamente'
                            : 'Finalizar Compra'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-cream-dark/20 border p-6 sticky top-28">
              <h3 className="font-serif text-xl mb-6">Resumo do Pedido</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const itemImages = imagesMap[`${item.id}-${item.color}`] || [item.image]
                  return (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4">
                      <div className="h-24 w-20 bg-muted flex-shrink-0 group relative">
                        <Carousel opts={{ loop: true, align: 'start' }} className="w-full h-full">
                          <CarouselContent className="-ml-0 h-full">
                            {itemImages.map((img, i) => (
                              <CarouselItem key={i} className="pl-0 basis-full h-full">
                                <img
                                  src={img}
                                  alt={`${item.name} ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {itemImages.length > 1 && (
                            <>
                              <CarouselPrevious className="left-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
                              <CarouselNext className="right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
                            </>
                          )}
                        </Carousel>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Cor: {item.color} | Tam: {item.size} | Qtd: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="mb-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600 font-medium">
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
