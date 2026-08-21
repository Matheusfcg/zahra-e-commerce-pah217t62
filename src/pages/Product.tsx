import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import { getProductBySlug, type Product, type ProductColor } from '@/services/products'
import { Loader2, Plus, Minus } from 'lucide-react'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { optimizeImage } from '@/lib/image'

const getImageUrl = (url: string | undefined | null) => {
  if (!url) return 'https://img.usecurling.com/p/800/1000?q=fashion%20clothing'
  return optimizeImage(url, { width: 800, quality: 80, format: 'webp' })
}

const ProductPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      getProductBySlug(id)
        .then((data) => {
          setProduct(data)
          if (data.product_colors?.length > 0) {
            const availableColor =
              data.product_colors.find((c) => {
                if (data.product_variants?.length) {
                  return data.product_variants.some(
                    (v) => v.color_name === c.name && v.quantity > 0,
                  )
                }
                return true
              }) || data.product_colors[0]
            setSelectedColor(availableColor)
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [id])

  useEffect(() => {
    setSelectedSize('')
    setQuantity(1)
  }, [selectedColor])

  useEffect(() => {
    setQuantity(1)
  }, [selectedSize])

  const sortedImages = useMemo(() => {
    if (!product) return []
    return [...(product.product_images || [])].sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1
      if (!a.is_cover && b.is_cover) return 1
      return (a.display_order || 0) - (b.display_order || 0)
    })
  }, [product])

  const availableSizes = useMemo(() => {
    if (!product) return []

    if (product.product_variants?.length) {
      const variantsForColor = selectedColor
        ? product.product_variants.filter((v) => v.color_name === selectedColor.name)
        : product.product_variants

      const sizeMap = new Map<string, number>()
      for (const v of variantsForColor) {
        const current = sizeMap.get(v.size_name) ?? 0
        sizeMap.set(v.size_name, current + v.quantity)
      }

      return Array.from(sizeMap.entries())
        .map(([sizeName, qty]) => ({
          id: sizeName,
          size_name: sizeName,
          quantity: qty,
        }))
        .sort((a, b) => {
          if (a.size_name === 'Tamanho Único') return -1
          if (b.size_name === 'Tamanho Único') return 1
          return a.size_name.localeCompare(b.size_name)
        })
    }

    return (product.product_sizes || []).sort((a, b) => {
      if (a.size_name === 'Tamanho Único') return -1
      if (b.size_name === 'Tamanho Único') return 1
      return a.size_name.localeCompare(b.size_name)
    })
  }, [product, selectedColor])

  const effectiveStock = useMemo(() => {
    if (!product) return 0
    if (selectedColor && selectedSize && product.product_variants?.length) {
      const variant = product.product_variants.find(
        (v) => v.color_name === selectedColor.name && v.size_name === selectedSize,
      )
      if (variant) return variant.quantity
    }
    if (selectedSize && !product.product_variants?.length && product.product_sizes?.length) {
      const size = product.product_sizes.find((s) => s.size_name === selectedSize)
      if (size) return size.quantity
    }
    return product.quantity
  }, [product, selectedColor, selectedSize])

  const isTotalOutOfStock = useMemo(() => {
    if (!product) return true
    if (product.product_variants && product.product_variants.length > 0) {
      return product.product_variants.every((v) => v.quantity <= 0)
    }
    if (product.product_sizes && product.product_sizes.length > 0) {
      return product.product_sizes.every((s) => s.quantity <= 0)
    }
    return product.quantity <= 0
  }, [product])

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

  const isVariantOutOfStock = !!selectedSize && effectiveStock <= 0
  const canAddToCart =
    !isAdding &&
    !isTotalOutOfStock &&
    (!product.product_colors?.length || !!selectedColor) &&
    !!selectedSize &&
    !isVariantOutOfStock

  const handleAddToCart = () => {
    if (!canAddToCart) return
    setIsAdding(true)
    setTimeout(() => {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: selectedColor
            ? getImageUrl(selectedColor.image_url)
            : getImageUrl(sortedImages[0]?.url),
          color: selectedColor?.name || 'Padrão',
          size: selectedSize || 'Único',
          maxQuantity: effectiveStock,
        },
        quantity,
      )
      setIsAdding(false)
    }, 600)
  }

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return
    if (effectiveStock > 0 && newQty > effectiveStock) return
    setQuantity(newQty)
  }

  return (
    <div className="w-full bg-background pt-20">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left: Images */}
        <div className="w-full lg:w-3/5 lg:border-r overflow-hidden relative group">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {sortedImages.map((img, idx) => {
                const isFirst = idx === 0
                return (
                  <CarouselItem key={img.id}>
                    <div className="aspect-[3/4] overflow-hidden bg-[#f4f1ee] lg:h-full lg:aspect-auto relative min-h-[400px]">
                      <ProgressiveImage
                        src={getImageUrl(img.url)}
                        alt={`${product.name} detail ${idx + 1}`}
                        priority={isFirst}
                        loading={isFirst ? 'eager' : 'lazy'}
                        decoding={isFirst ? 'sync' : 'async'}
                        width={800}
                        height={1067}
                        aspectRatio="3/4"
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            {sortedImages.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CarouselPrevious className="relative pointer-events-auto left-0 translate-y-0 h-10 w-10 bg-white/70 hover:bg-white" />
                <CarouselNext className="relative pointer-events-auto right-0 translate-y-0 h-10 w-10 bg-white/70 hover:bg-white" />
              </div>
            )}
          </Carousel>
        </div>

        {/* Right: Product Details (Sticky on desktop) */}
        <div className="w-full lg:w-2/5 p-6 md:p-12 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
          <nav className="text-xs tracking-widest uppercase text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>{' '}
            /<span className="ml-2">{product.category || 'Produtos'}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
            {isTotalOutOfStock && (
              <span className="bg-destructive/10 text-destructive text-xs uppercase tracking-widest px-3 py-1 rounded">
                Esgotado
              </span>
            )}
          </div>
          <p className="text-xl font-medium mb-8">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </p>

          {product.product_colors && product.product_colors.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Cor: {selectedColor?.name || 'Selecione'}</span>
              </div>
              <div className="flex gap-3">
                {product.product_colors.map((color) => {
                  const isColorOutOfStock = product.product_variants?.length
                    ? !product.product_variants.some(
                        (v) => v.color_name === color.name && v.quantity > 0,
                      )
                    : false

                  return (
                    <button
                      key={color.id}
                      onClick={() => !isColorOutOfStock && setSelectedColor(color)}
                      disabled={isColorOutOfStock}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all relative overflow-hidden',
                        selectedColor?.id === color.id
                          ? 'border-primary scale-110'
                          : 'border-transparent',
                        isColorOutOfStock && 'opacity-40 cursor-not-allowed',
                      )}
                      style={{ backgroundColor: color.hex_value }}
                      aria-label={`Selecionar cor ${color.name}`}
                      title={isColorOutOfStock ? 'Cor esgotada' : color.name}
                    >
                      {isColorOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[2px] bg-red-600/70 rotate-45 transform origin-center" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Tamanho: {selectedSize || 'Selecione'}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {availableSizes.length > 0 ? (
                availableSizes.map((size) => {
                  const isOutOfStock = size.quantity <= 0
                  return (
                    <button
                      key={size.id}
                      onClick={() => !isOutOfStock && setSelectedSize(size.size_name)}
                      disabled={isOutOfStock}
                      title={isOutOfStock ? 'Sem estoque' : `${size.quantity} em estoque`}
                      className={cn(
                        'px-4 h-10 border flex items-center justify-center text-sm transition-all',
                        selectedSize === size.size_name
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary',
                        isOutOfStock && 'opacity-40 cursor-not-allowed hover:border-input',
                      )}
                    >
                      {size.size_name}
                    </button>
                  )
                })
              ) : (
                <span className="text-sm text-muted-foreground">Tamanho não disponível</span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {selectedSize && !isVariantOutOfStock && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Quantidade</span>
                {effectiveStock <= 5 && effectiveStock > 0 && (
                  <span className="text-xs text-orange-600">
                    Apenas {effectiveStock} em estoque
                  </span>
                )}
              </div>
              <div className="flex items-center border w-max">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={quantity >= effectiveStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <Button
            className="w-full h-14 rounded-none text-base uppercase tracking-widest mb-12 relative overflow-hidden group"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
          >
            <span className={cn('transition-opacity', isAdding ? 'opacity-0' : 'opacity-100')}>
              {isTotalOutOfStock
                ? 'Esgotado'
                : isVariantOutOfStock
                  ? 'Variação Esgotada'
                  : 'Adicionar à Sacola'}
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
