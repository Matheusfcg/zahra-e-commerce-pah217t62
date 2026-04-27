import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import { getProductBySlug, type Product, type ProductColor } from '@/services/products'
import { Loader2 } from 'lucide-react'

import img1 from '@/assets/1produto-67ee8.png'
import img2 from '@/assets/image-048b7.png'

const getImageUrl = (url: string) => {
  if (url === '/assets/1produto-67ee8.png') return img1
  if (url === '/assets/image-048b7.png') return img2
  return url
}

const ProductPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      getProductBySlug(id)
        .then((data) => {
          setProduct(data)
          if (data.product_colors?.length > 0) {
            setSelectedColor(data.product_colors[0])
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-2xl font-serif">Produto não encontrado</h2>
        <Button asChild variant="outline" className="rounded-none">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (product.product_colors && product.product_colors.length > 0 && !selectedColor) return
    setIsAdding(true)
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: selectedColor
          ? getImageUrl(selectedColor.image_url)
          : getImageUrl(sortedImages[0]?.url || ''),
        color: selectedColor?.name || 'Padrão',
      })
      setIsAdding(false)
    }, 600) // Simulate network delay for feeling
  }

  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.display_order - b.display_order,
  )

  return (
    <div className="w-full bg-background pt-20">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left: Images */}
        <div className="w-full lg:w-3/5 lg:border-r">
          <div className="hidden lg:grid grid-cols-2 gap-1 p-1">
            {sortedImages.map((img) => (
              <div key={img.id} className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={getImageUrl(img.url)}
                  alt={`${product.name} detail`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
          {/* Mobile Gallery (Simple scroll snap) */}
          <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory">
            {sortedImages.map((img) => (
              <img
                key={img.id}
                src={getImageUrl(img.url)}
                alt=""
                className="w-full h-auto aspect-[3/4] object-cover snap-center flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Right: Product Details (Sticky on desktop) */}
        <div className="w-full lg:w-2/5 p-6 md:p-12 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <nav className="text-xs tracking-widest uppercase text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>{' '}
            /<span className="ml-2">Acessórios</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl mb-4">{product.name}</h1>
          <p className="text-xl font-medium mb-8">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </p>

          {product.product_colors && product.product_colors.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Cor: {selectedColor?.name || 'Selecione'}</span>
              </div>
              <div className="flex gap-3">
                {product.product_colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      selectedColor?.id === color.id
                        ? 'border-primary scale-110'
                        : 'border-transparent',
                    )}
                    style={{ backgroundColor: color.hex_value }}
                    aria-label={`Selecionar cor ${color.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full h-14 rounded-none text-base uppercase tracking-widest mb-12 relative overflow-hidden group"
            onClick={handleAddToCart}
            disabled={
              isAdding ||
              (product.product_colors && product.product_colors.length > 0 && !selectedColor)
            }
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
              <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            {product.composition && (
              <AccordionItem value="comp" className="border-b-border/50">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wider py-5 hover:no-underline">
                  Composição
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.composition}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.measurements && (
              <AccordionItem value="measure" className="border-b-border/50">
                <AccordionTrigger className="text-sm font-medium uppercase tracking-wider py-5 hover:no-underline">
                  Guia de Medidas
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.measurements}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
