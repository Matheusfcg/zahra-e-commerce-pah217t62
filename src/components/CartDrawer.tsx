import { Link, useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, items, updateQuantity, removeFromCart, subtotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-0">
        <SheetHeader className="p-6 border-b text-left flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="font-serif text-2xl font-normal">Sua Sacola</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20">
              <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">Sua sacola está vazia.</p>
              <Button variant="outline" onClick={closeDrawer} className="mt-4 rounded-none">
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.color}`} className="flex gap-4">
                  <div className="h-28 w-24 bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.color)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Cor: {item.color}</p>
                      <p className="font-medium mt-2">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center border w-max">
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-6 bg-background border-t space-y-4">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Frete e impostos calculados no checkout.
            </p>
            <Button className="w-full rounded-none h-12 text-base" onClick={handleCheckout}>
              Finalizar Compra
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
