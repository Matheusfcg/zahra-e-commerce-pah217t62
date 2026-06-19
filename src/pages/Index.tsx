import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { getProducts, type Product } from '@/services/products'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/ProductCard'
import imgBrand1 from '@/assets/image-048b7.png'
import imgBrand2 from '@/assets/image-43b69.png'

const getPrimaryImageUrl = (images?: Product['product_images']) => {
  if (!images || images.length === 0) return ''
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].url
}

const Index = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getProducts()
        setAllProducts(all)

        const heroCandidates = all.filter((p) => p.show_in_carousel === true)
        setCarouselProducts(
          heroCandidates.length > 0 ? heroCandidates.slice(0, 5) : all.slice(0, 5),
        )

        const cats = [...new Set(all.map((p) => p.category).filter(Boolean))] as string[]
        setCategories(cats)

        setPromoProducts(all.filter((p) => p.is_promotion).slice(0, 4))
        setFeaturedProducts(all.filter((p) => p.is_featured).slice(0, 8))
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
            <Loader2 className="h-8 w-8 animate-spin text-[#3c6e47]" />
          </div>
        ) : carouselProducts.length > 0 ? (
          <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full h-full relative"
            opts={{ loop: true }}
          >
            <CarouselContent className="h-full -ml-0">
              {carouselProducts.map((product) => (
                <CarouselItem key={product.id} className="relative h-full w-full pl-0 bg-[#FCFAF8]">
                  <div className="flex flex-col md:flex-row h-full w-full">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col justify-center px-6 md:pl-24 md:pr-8 relative z-10 h-[45%] md:h-full order-2 md:order-1 pb-10 md:pb-0">
                      <div className="flex flex-col text-[#3c6e47] mt-auto md:mt-0 w-full animate-fade-in-up">
                        <p className="text-sm md:text-2xl font-medium tracking-wide mb-1 md:mb-2 uppercase opacity-80">
                          {product.category || (product.is_promotion ? 'SALE' : 'NEW DROP')}
                        </p>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.85] mb-2 md:mb-0 text-[#3c6e47]">
                          {product.name}
                        </h1>
                        <p className="text-lg md:text-3xl lg:text-4xl font-medium tracking-widest uppercase md:text-right text-[#3c6e47] w-full md:pr-4 opacity-80">
                          BY ZAHRÁ
                        </p>
                      </div>

                      <div
                        className="mt-6 md:mt-auto md:mb-24 flex items-center justify-between text-[#3c6e47] w-full animate-fade-in-up"
                        style={{ animationDelay: '200ms' }}
                      >
                        <p className="text-xs md:text-lg lg:text-xl font-medium uppercase tracking-widest">
                          Já Disponível
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="border-[#3c6e47] text-[#3c6e47] hover:bg-[#3c6e47] hover:text-[#FCFAF8] rounded-none px-6 py-4 md:px-8 md:py-6 text-[10px] md:text-sm uppercase tracking-widest font-bold transition-colors bg-transparent"
                        >
                          <Link to={`/product/${product.slug}`}>Descubra Mais</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="flex-1 relative h-[55%] md:h-full overflow-hidden flex items-center justify-center bg-[#FCFAF8] order-1 md:order-2">
                      <img
                        src={getPrimaryImageUrl(product.product_images)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center md:object-contain md:p-12 animate-fade-in"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : null}
      </section>

      {/* Categorized Product Carousel */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#3c6e47] mb-4">
              Coleções
            </h2>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto">
              Nossas categorias exclusivas
            </p>
          </div>
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-center bg-transparent mb-8 h-auto gap-2">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="data-[state=active]:bg-[#3c6e47] data-[state=active]:text-white rounded-none border border-[#3c6e47] px-6 py-2 uppercase text-xs font-bold text-[#3c6e47] bg-transparent transition-colors"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => {
              const catProducts = allProducts.filter((p) => p.category === cat).slice(0, 2)
              return (
                <TabsContent key={cat} value={cat} className="mt-0">
                  <Carousel className="w-full max-w-5xl mx-auto">
                    <CarouselContent>
                      {catProducts.map((product) => (
                        <CarouselItem key={product.id} className="md:basis-1/2">
                          <ProductCard product={product} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {catProducts.length > 1 && (
                      <>
                        <CarouselPrevious className="hidden md:flex -left-12 text-[#3c6e47] border-[#3c6e47]" />
                        <CarouselNext className="hidden md:flex -right-12 text-[#3c6e47] border-[#3c6e47]" />
                      </>
                    )}
                  </Carousel>
                </TabsContent>
              )
            })}
          </Tabs>
        </section>
      )}

      {/* Brand Concept Section 1 */}
      <section className="py-16 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 overflow-hidden aspect-[4/5] relative flex items-center justify-center">
              <img
                src={imgBrand1}
                alt="Coleção Zahrá"
                className="w-full h-full object-cover rounded-sm"
                loading="lazy"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
              <p className="text-[#3c6e47] text-xs md:text-sm font-bold tracking-[0.3em] mb-4 uppercase opacity-80">
                O Novo Clássico
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-[#3c6e47] mb-6 leading-[0.85]">
                Essência <br /> Zahrá
              </h2>
              <div className="w-12 h-1 bg-[#3c6e47] mb-8 mx-auto md:mx-0"></div>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed mb-10 font-medium max-w-md mx-auto md:mx-0">
                Descubra a harmonia perfeita entre o design contemporâneo e o conforto absoluto.
                Nossas peças são cuidadosamente elaboradas para a mulher que busca elegância e
                versatilidade em cada detalhe.
              </p>
              <div className="flex justify-center md:justify-start">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#3c6e47] text-[#3c6e47] hover:bg-[#3c6e47] hover:text-white rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300"
                >
                  <Link to="/produtos">Explorar Coleção</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Concept Section 2 (Restored) */}
      <section className="py-16 md:py-32 bg-[#FCFAF8]">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 overflow-hidden aspect-[4/5] relative flex items-center justify-center">
              <img
                src={imgBrand2}
                alt="Coleção Exclusiva"
                className="w-full h-full object-cover rounded-sm"
                loading="lazy"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
              <p className="text-[#3c6e47] text-xs md:text-sm font-bold tracking-[0.3em] mb-4 uppercase opacity-80">
                Design Exclusivo
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-[#3c6e47] mb-6 leading-[0.85]">
                Sofisticação <br /> Atemporal
              </h2>
              <div className="w-12 h-1 bg-[#3c6e47] mb-8 mx-auto md:mx-0"></div>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed mb-10 font-medium max-w-md mx-auto md:mx-0">
                Nossas coleções refletem um compromisso inabalável com a qualidade e o caimento
                perfeito. Sinta a diferença de vestir uma peça que foi feita pensando em realçar a
                sua beleza natural.
              </p>
              <div className="flex justify-center md:justify-start">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#3c6e47] text-[#3c6e47] hover:bg-[#3c6e47] hover:text-white rounded-none px-10 py-7 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 bg-transparent"
                >
                  <Link to="/produtos?category=Conjuntos">Ver Conjuntos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Promo Section */}
      {promoProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-[#FCFAF8] px-4 md:px-8 max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#3c6e47] mb-4">
              Promoções
            </h2>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto">
              Aproveite Nossas Ofertas Exclusivas
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#3c6e47] mb-4">
              Destaques
            </h2>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto">
              As Peças Mais Desejadas
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              variant="outline"
              className="border-[#3c6e47] text-[#3c6e47] hover:bg-[#3c6e47] hover:text-white rounded-none px-8 py-6 uppercase tracking-widest font-bold"
            >
              <Link to="/produtos">Ver Coleção Completa</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Index
