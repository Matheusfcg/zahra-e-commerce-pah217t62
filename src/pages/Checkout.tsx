import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Lock } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const Checkout = () => {
  const { items, subtotal } = useCart()
  const shipping = items.length > 0 ? 35.0 : 0
  const total = subtotal + shipping

  const [step, setStep] = useState<1 | 2 | 3>(1)

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
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
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
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">cliente@email.com</p>
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
                    <button className="flex-1 py-3 text-sm font-medium bg-primary text-primary-foreground">
                      Cartão de Crédito
                    </button>
                    <button className="flex-1 py-3 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80">
                      Pix
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input id="cardName" className="rounded-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        className="rounded-none h-12"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Validade (MM/AA)</Label>
                        <Input id="expiry" placeholder="MM/AA" className="rounded-none h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="rounded-none h-12" />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full rounded-none h-14 text-lg flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" /> Finalizar Pedido
                  </Button>
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
                  <div key={`${item.id}-${item.color}`} className="flex gap-4">
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
                        Cor: {item.color} | Qtd: {item.quantity}
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
