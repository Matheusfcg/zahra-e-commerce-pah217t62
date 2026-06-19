import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2, Star, ShieldCheck, Leaf } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { getProducts, type Product } from '@/services/products'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/ProductCard'

const getPrimaryImageUrl = (images?: Product['product_images']) => {
  if (!images || images.length === 0) return ''
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0].url
}

const Index = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
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
        // Ensure some default categories are present if they exist in the dataset
        setCategories(cats.length > 0 ? cats : ['CONJUNTOS', 'PARTES DE CIMA', 'PARTES DE BAIXO'])

        setPromoProducts(all.filter((p) => p.is_promotion).slice(0, 4))
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
            <Loader2 className="h-8 w-8 animate-spin text-[#3A2222]" />
          </div>
        ) : carouselProducts.length > 0 ? (
          <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full h-full relative"
            opts={{ loop: true }}
          >
            <CarouselContent className="h-full -ml-0">
              {carouselProducts.map((product) => (
                <CarouselItem key={product.id} className="relative h-full w-full pl-0 bg-[#FAFAF8]">
                  <div className="flex flex-col md:flex-row h-full w-full">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col justify-center px-6 md:pl-24 md:pr-8 relative z-10 h-[45%] md:h-full order-2 md:order-1 pb-10 md:pb-0">
                      <div className="flex flex-col text-[#3A2222] mt-auto md:mt-0 w-full animate-fade-in-up">
                        <p className="text-sm md:text-2xl font-medium tracking-wide mb-1 md:mb-2 uppercase opacity-80">
                          {product.category || (product.is_promotion ? 'SALE' : 'NEW DROP')}
                        </p>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[130px] font-black uppercase tracking-tighter leading-[0.85] mb-2 md:mb-0 text-[#3A2222]">
                          {product.name}
                        </h1>
                        <p className="text-lg md:text-3xl lg:text-4xl font-medium tracking-widest uppercase md:text-right text-[#3A2222] w-full md:pr-4 opacity-80">
                          BY ZAHRÁ
                        </p>
                      </div>

                      <div
                        className="mt-6 md:mt-auto md:mb-24 flex items-center justify-between text-[#3A2222] w-full animate-fade-in-up"
                        style={{ animationDelay: '200ms' }}
                      >
                        <p className="text-xs md:text-lg lg:text-xl font-medium uppercase tracking-widest">
                          Já Disponível
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="border-[#3A2222] text-[#3A2222] hover:bg-[#3A2222] hover:text-[#FAFAF8] rounded-none px-6 py-4 md:px-8 md:py-6 text-[10px] md:text-sm uppercase tracking-widest font-bold transition-colors bg-transparent"
                        >
                          <Link to={`/product/${product.slug}`}>Descubra Mais</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="flex-1 relative h-[55%] md:h-full overflow-hidden flex items-center justify-center bg-[#FAFAF8] order-1 md:order-2">
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

      {/* Brand Pillars Section */}
      <section className="py-12 md:py-20 bg-[#FAFAF8] border-b border-muted">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Star className="h-6 w-6 text-[#3A2222]" />
              <h3 className="font-serif text-[13px] uppercase tracking-widest text-[#3A2222]">
                Design Autoral
              </h3>
              <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-[#3A2222]" />
              <h3 className="font-serif text-[13px] uppercase tracking-widest text-[#3A2222]">
                Qualidade Premium
              </h3>
              <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                Seleção rigorosa de materiais para garantir durabilidade e sofisticação.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Leaf className="h-6 w-6 text-[#3A2222]" />
              <h3 className="font-serif text-[13px] uppercase tracking-widest text-[#3A2222]">
                Sustentabilidade
              </h3>
              <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Block (Bloco 2) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-16">
            <div className="w-full max-w-[400px] md:w-1/2 aspect-[4/5] overflow-hidden">
              <img
                src="https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2&seed=10"
                alt="Trijunto Malibu"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start text-left max-w-md">
              <div className="bg-[#3A2222] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-4">
                Peça em destaque
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#3A2222] mb-2">
                Trijunto Malibu
              </h2>
              <p className="text-base font-bold text-[#3A2222] mb-4">R$ 120,00</p>
              <p className="text-xs text-muted-foreground mb-8">
                Trijunto Malibu, versátil e confortável.
              </p>
              <Button
                asChild
                className="bg-[#3A2222] hover:bg-[#2A1818] text-white rounded-none px-8 py-5 uppercase tracking-widest text-[10px] font-bold transition-all"
              >
                <Link to="/produtos">Comprar Agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Coleção */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 bg-[#FAFAF8] px-4 md:px-8 border-t border-muted/50">
          <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-wider text-[#3A2222] mb-4">
              Nossa Coleção
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest leading-relaxed">
              Seleção dinâmica de peças exclusivas, combinando o melhor do luxo acessível e da
              alta-costura.
            </p>
          </div>
          <Tabs defaultValue={categories[0]} className="w-full max-w-5xl mx-auto">
            <TabsList className="w-full flex flex-wrap justify-center bg-transparent mb-12 h-auto gap-4 md:gap-8">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#3A2222] data-[state=active]:text-[#3A2222] rounded-none border-b-2 border-transparent px-2 py-2 uppercase text-[10px] md:text-[11px] font-bold text-muted-foreground bg-transparent transition-all shadow-none"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => {
              // Exact 2 items per category
              const catProducts = allProducts.filter((p) => p.category === cat).slice(0, 2)
              return (
                <TabsContent key={cat} value={cat} className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 max-w-3xl mx-auto">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {catProducts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      Nenhum produto encontrado nesta categoria.
                    </div>
                  )}
                  <div className="mt-16 text-center">
                    <Button
                      asChild
                      variant="outline"
                      className="border-[#3A2222] text-[#3A2222] hover:bg-[#3A2222] hover:text-white rounded-none px-8 py-5 uppercase tracking-widest text-[10px] font-bold transition-all bg-transparent"
                    >
                      <Link to={`/produtos?category=${encodeURIComponent(cat)}`}>
                        Ver todas as peças
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </section>
      )}

      {/* Sale Section */}
      {promoProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#FFF5F5] px-4 md:px-8">
          <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-[#D94F4F] mb-4 uppercase tracking-wider">
              SALE
            </h2>
            <p className="text-xs md:text-sm text-[#D94F4F]/80 uppercase tracking-widest leading-relaxed">
              Seleção especial com preços irresistíveis. Aproveite as nossas ofertas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
            {promoProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Index
