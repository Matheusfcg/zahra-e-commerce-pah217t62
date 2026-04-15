import { useState } from 'react'
import { FLAGSHIP_PRODUCT } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const Product = () => {
  const product = FLAGSHIP_PRODUCT
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: selectedColor.image,
        color: selectedColor.name,
      })
      setIsAdding(false)
    }, 600) // Simulate network delay for feeling
  }

  return (
    <div className="w-full bg-background pt-20">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left: Images */}
        <div className="w-full lg:w-3/5 lg:border-r">
          <div className="hidden lg:grid grid-cols-2 gap-1 p-1">
            {product.gallery.map((img, idx) => (
              <div key={idx} className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={img}
                  alt={`${product.name} detail ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
          {/* Mobile Gallery (Simple scroll snap) */}
          <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory">
            {product.gallery.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-full h-auto aspect-[3/4] object-cover snap-center flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Right: Product Details (Sticky on desktop) */}
        <div className="w-full lg:w-2/5 p-6 md:p-12 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <nav className="text-xs tracking-widest uppercase text-muted-foreground mb-8">
            <span className="hover:text-primary cursor-pointer transition-colors">Home</span> /
            <span className="hover:text-primary cursor-pointer transition-colors ml-2">
              Acessórios
            </span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl mb-4">{product.name}</h1>
          <p className="text-xl font-medium mb-8">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Cor: {selectedColor.name}</span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    selectedColor.name === color.name
                      ? 'border-primary scale-110'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Selecionar cor ${color.name}`}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-none text-base uppercase tracking-widest mb-12 relative overflow-hidden group"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <span className={cn('transition-opacity', isAdding ? 'opacity-0' : 'opacity-100')}>
              Adicionar à Sacola
            </span>
            {isAdding && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </Button>

          <Accordion type="multiple" defaultValue={['desc']} className="w-full border-t">
            <AccordionItem value="desc" className="border-b-border/50">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wider py-5 hover:no-underline">
                Descrição
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="comp" className="border-b-border/50">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wider py-5 hover:no-underline">
                Composição
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.composition}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="measure" className="border-b-border/50">
              <AccordionTrigger className="text-sm font-medium uppercase tracking-wider py-5 hover:no-underline">
                Guia de Medidas
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {product.measurements}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export default Product
