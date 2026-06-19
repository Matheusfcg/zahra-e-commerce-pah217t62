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

const Checkout = () => {
  const { items, subtotal } = useCart()
  const { session } = useAuth()
  const shipping = items.length > 0 ? 35.0 : 0
  const total = subtotal + shipping

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit')
  const [guestEmail, setGuestEmail] = useState('')
  const [pixPayload, setPixPayload] = useState('')
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [pixGenerated, setPixGenerated] = useState(false)

  const userEmail = session?.user?.email
  const displayEmail = userEmail || guestEmail || 'Convidado'

  useEffect(() => {
    if (userEmail && step === 1) {
      setStep(2)
    }
  }, [userEmail, step])

  const handleGeneratePix = () => {
    setIsGeneratingPix(true)
    try {
      const payload = generatePixPayload({
        pixKey: 'contato@zahrabrasil.com.br',
        merchantName: 'Zahra Brasil',
        merchantCity: 'Sao Paulo',
        amount: total,
      })
      setPixPayload(payload)
      setPixGenerated(true)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar o código PIX. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingPix(false)
    }
  }

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
                          <Input id="firstName" className="rounded-none h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Sobrenome</Label>
                          <Input id="lastName" className="rounded-none h-12" />
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
                          href="https://whatsapp.com/dl/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Falar com Atendimento
                        </a>
                      </Button>
                    </div>
                  ) : pixGenerated ? (
                    <div className="space-y-6 flex flex-col items-center py-4 animate-fade-in">
                      <p className="font-medium text-lg">Escaneie o QR Code abaixo</p>
                      <div className="bg-white p-4 rounded-lg border">
                        <img
                          src={`https://quickchart.io/qr?size=250&text=${encodeURIComponent(pixPayload)}`}
                          alt="PIX QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <div className="w-full max-w-sm space-y-2">
                        <Label>Ou copie a chave PIX Copia e Cola:</Label>
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
                      <Button
                        className="w-full rounded-none h-14 text-lg flex items-center justify-center gap-2"
                        onClick={handleGeneratePix}
                        disabled={isGeneratingPix}
                      >
                        <Lock className="h-4 w-4" />
                        {isGeneratingPix ? 'Gerando...' : 'Finalizar Pedido com Pix'}
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
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4">
                    <div className="h-20 w-16 bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
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
                ))}
              </div>

              <Separator className="mb-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
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
