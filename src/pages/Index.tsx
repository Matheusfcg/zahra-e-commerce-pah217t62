import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Leaf, Star, Loader2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import {
  getProducts,
  getCarouselProducts,
  getMixedCollectionProducts,
  getTopStockProducts,
  type Product,
} from '@/services/products'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'

const getPrimaryImageUrl = (images?: Product['product_images']) => {
  if (!images || images.length === 0) return ''
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].url
}

const getFallbackImageUrl = (productName: string) => {
  return `https://img.usecurling.com/p/800/1000?q=${encodeURIComponent(productName.split(' ')[0] + ' clothing')}`
}

const Index = () => {
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [mixedCollection, setMixedCollection] = useState<Product[]>([])
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
  const [showcaseProduct, setShowcaseProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, carousel, mixed, top] = await Promise.all([
          getProducts(),
          getCarouselProducts(),
          getMixedCollectionProducts(),
          getTopStockProducts(),
        ])

        const uniqueTopStock: Product[] = []
        const topStockNames = new Set<string>()
        for (const p of top) {
          if (!topStockNames.has(p.name)) {
            topStockNames.add(p.name)
            uniqueTopStock.push(p)
          }
        }

        const uniquePromo: Product[] = []
        const promoNames = new Set<string>()
        for (const p of all.filter((p) => p.is_promotion)) {
          if (!promoNames.has(p.name)) {
            promoNames.add(p.name)
            uniquePromo.push(p)
          }
        }

        setPromoProducts(uniquePromo)

        let finalCarousel = carousel
        if (finalCarousel.length === 0) {
          finalCarousel = all.filter((p) => p.product_images?.length > 0).slice(0, 3)
          if (finalCarousel.length === 0) {
            finalCarousel = all.slice(0, 3)
          }
        }
        setCarouselProducts(finalCarousel)

        const trijunto =
          all.find((p) => p.name.toLowerCase().includes('trijunto malibu')) ||
          all.find((p) => p.is_featured) ||
          uniqueTopStock[1] ||
          all[1] ||
          null
        setShowcaseProduct(trijunto)

        setMixedCollection(mixed)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full pt-[64px] md:pt-[116px]">
      {/* Hero Carousel Section */}
      <section className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-116px)] bg-background overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : carouselProducts.length > 0 ? (
          <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full h-full relative group/carousel"
            opts={{ loop: true }}
          >
            <CarouselContent className="h-full -ml-0">
              {carouselProducts.map((product) => (
                <CarouselItem key={product.id} className="relative h-full w-full pl-0">
                  <div className="absolute inset-0 z-0">
                    <img
                      src={
                        getPrimaryImageUrl(product.product_images) ||
                        getFallbackImageUrl(product.name)
                      }
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/20 md:bg-transparent md:bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
                  </div>
                  <div className="absolute inset-0 z-10 flex flex-col items-center md:items-start justify-center text-center md:text-left px-4 md:px-24 max-w-5xl">
                    <p className="text-lg md:text-xl font-medium tracking-widest mb-2 uppercase text-white md:text-foreground/80 animate-fade-in-up drop-shadow-md md:drop-shadow-none">
                      {product.is_promotion ? 'SALE' : 'NEW DROP'}
                    </p>
                    <h1
                      className="text-5xl md:text-8xl font-black mb-2 uppercase tracking-tighter text-white md:text-foreground leading-none animate-fade-in-up drop-shadow-lg md:drop-shadow-none"
                      style={{ animationDelay: '100ms' }}
                    >
                      {product.name}
                    </h1>
                    <p
                      className="text-lg md:text-2xl mb-8 md:mb-12 font-light tracking-widest uppercase text-white/90 md:text-foreground/70 animate-fade-in-up drop-shadow-md md:drop-shadow-none"
                      style={{ animationDelay: '200ms' }}
                    >
                      BY ZAHRÁ
                    </p>
                    <div
                      className="mt-4 md:mt-auto md:pb-0 animate-fade-in-up"
                      style={{ animationDelay: '300ms' }}
                    >
                      <p className="hidden md:block text-md md:text-lg mb-4 font-medium uppercase tracking-widest text-foreground/80">
                        Já Disponível
                      </p>
                      <Button
                        asChild
                        size="lg"
                        className="bg-white text-black md:bg-foreground md:text-background hover:opacity-90 rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium transition-transform hover:scale-105 shadow-xl md:shadow-none"
                      >
                        <Link to={`/product/${product.slug}`}>Descubra Mais</Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none z-20">
              <CarouselPrevious className="relative pointer-events-auto translate-y-0 h-12 w-12 bg-background/50 hover:bg-foreground hover:text-background border-none shadow-md backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />
              <CarouselNext className="relative pointer-events-auto translate-y-0 h-12 w-12 bg-background/50 hover:bg-foreground hover:text-background border-none shadow-md backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />
            </div>
          </Carousel>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
            <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-4 text-center px-4 leading-tight animate-fade-in-up">
              Nenhuma peça em destaque
            </h1>
            <p
              className="text-muted-foreground animate-fade-in-up text-center px-4"
              style={{ animationDelay: '100ms' }}
            >
              Nossa nova coleção estará disponível em breve.
            </p>
          </div>
        )}
      </section>

      {/* Brand Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-background shadow-sm text-foreground">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Design Autoral</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-background shadow-sm text-foreground">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Qualidade Premium</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Seleção rigorosa de materiais para garantir durabilidade e sofisticação.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-background shadow-sm text-foreground">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium">Sustentabilidade</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showcaseProduct ? (
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 w-full lg:w-1/2 group overflow-hidden bg-muted">
                <Link to={`/product/${showcaseProduct.slug}`}>
                  <img
                    src={
                      getPrimaryImageUrl(showcaseProduct.product_images) ||
                      getFallbackImageUrl(showcaseProduct.name)
                    }
                    alt={showcaseProduct.name}
                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="flex-1 lg:pl-12 text-center lg:text-left">
                {(showcaseProduct.is_featured ||
                  showcaseProduct.name.toLowerCase().includes('trijunto malibu')) && (
                  <div className="mb-4">
                    <span className="inline-block bg-foreground text-background text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 shadow-sm">
                      Peça em destaque
                    </span>
                  </div>
                )}
                <h2 className="font-serif text-4xl mb-4">{showcaseProduct.name}</h2>
                <p className="text-xl font-medium mb-6">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    showcaseProduct.price,
                  )}
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                  {showcaseProduct.description}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-none px-12 py-6 text-sm uppercase tracking-widest"
                >
                  <Link to={`/product/${showcaseProduct.slug}`}>Comprar Agora</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum produto em destaque no momento.
            </div>
          )}
        </div>
      </section>

      {/* Nossa Coleção Collection */}
      {!isLoading && mixedCollection.length > 0 && (
        <section className="py-24 bg-muted/10" id="colecao">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-4 uppercase tracking-wider font-light">
                Nossa Coleção
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Seleção dinâmica de peças exclusivas, combinando o melhor do luxo acessível e da
                alta-costura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mixedCollection.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="overflow-hidden bg-muted mb-4 relative aspect-[3/4]">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={
                          getPrimaryImageUrl(product.product_images) ||
                          getFallbackImageUrl(product.name)
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="text-center pt-2">
                    <h3 className="font-serif text-xl mb-1">
                      <Link
                        to={`/product/${product.slug}`}
                        className="hover:text-foreground/80 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="font-medium text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button
                asChild
                variant="outline"
                className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                <Link to="/produtos">Ver Todas as Peças</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Promoção Section */}
      {!isLoading && promoProducts.length > 0 && (
        <section className="py-24 bg-red-50" id="promocao">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-4 text-[#D94F4F] uppercase tracking-wider font-light">
                Sale
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Seleção especial com preços irresistíveis. Aproveite as nossas ofertas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {promoProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="overflow-hidden bg-muted mb-4 relative aspect-[3/4]">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={
                          getPrimaryImageUrl(product.product_images) ||
                          getFallbackImageUrl(product.name)
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute top-3 right-3 bg-[#D94F4F] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 shadow-sm rounded-sm z-10">
                      Sale
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <h3 className="font-serif text-xl mb-1">
                      <Link
                        to={`/product/${product.slug}`}
                        className="hover:text-[#D94F4F] transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="font-medium text-[#D94F4F]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Index
