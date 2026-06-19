import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/services/products'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ProductCard } from '@/components/ProductCard'

const Index = () => {
  const [heroProducts, setHeroProducts] = useState<Product[]>([])
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null)
  const [soffiProducts, setSoffiProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getProducts()

        // Hero: Grab top products for the high-impact carousel
        setHeroProducts(all.slice(0, 6))

        // Featured: Target "Trijunto Malibu" explicitly, or fallback to any featured
        const featured =
          all.find((p) => p.slug === 'trijunto-malibu') || all.find((p) => p.is_featured) || all[0]
        setFeaturedProduct(featured || null)

        // Soffi Grid: Exclude T-shirts, avoid repeating the featured product, ensure mixed prices
        const soffi = all.filter(
          (p) =>
            !p.name.toLowerCase().includes('t-shirt') &&
            !p.category?.toLowerCase().includes('t-shirt') &&
            p.id !== featured?.id,
        )
        setSoffiProducts(soffi.slice(0, 8))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full pt-[80px] md:pt-[120px] pb-20 bg-background">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* Hero Carousel Section */}
          <section className="relative w-full max-w-[1600px] mx-auto min-h-[60vh] flex flex-col lg:flex-row items-center pt-8 pb-16 lg:pb-24">
            <div className="w-full lg:w-1/3 px-8 lg:px-16 z-10 mb-12 lg:mb-0 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans tracking-tighter text-[#8A8888] leading-[0.9] font-medium mix-blend-multiply">
                sua nova
                <br className="hidden lg:block" /> jaqueta
                <br className="hidden lg:block" /> favorita
                <br className="hidden lg:block" /> está aqui
              </h1>
            </div>
            <div className="w-full lg:w-2/3 px-4 md:px-12 lg:pr-16">
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {heroProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2">
                      <Link to={`/product/${product.slug}`} className="block group">
                        <div className="relative aspect-[4/5] overflow-hidden bg-white shadow-sm">
                          <img
                            src={
                              product.product_images?.[0]?.url ||
                              'https://img.usecurling.com/p/800/1000?q=high%20fashion%20minimalist%20clothing&dpr=2'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-5 text-center px-4">
                          <h3 className="font-serif text-lg text-[#2D0B0B]">{product.name}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 border-b border-gray-300 pb-1 inline-block">
                            Conheça a Peça
                          </p>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden lg:block">
                  <CarouselPrevious className="-left-6 border-none bg-transparent hover:bg-transparent text-[#8A8888] hover:text-[#2D0B0B] scale-150 transition-colors" />
                  <CarouselNext className="-right-6 border-none bg-transparent hover:bg-transparent text-[#8A8888] hover:text-[#2D0B0B] scale-150 transition-colors" />
                </div>
              </Carousel>
            </div>
          </section>

          {/* Peça em Destaque Block */}
          {featuredProduct && (
            <section className="py-20 px-4 flex justify-center bg-background">
              <div className="max-w-md w-full flex flex-col items-center text-center animate-fade-in-up">
                <div className="bg-[#2D0B0B] text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 mb-8">
                  Peça em Destaque
                </div>
                <h2 className="text-4xl font-serif text-[#2D0B0B] mb-4">{featuredProduct.name}</h2>
                <p className="text-xl font-medium text-[#2D0B0B] mb-6">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    featuredProduct.price,
                  )}
                </p>
                <p className="text-[#5A5858] text-sm mb-10 max-w-sm font-sans leading-relaxed">
                  {featuredProduct.description ||
                    `${featuredProduct.name}, versátil e confortável.`}
                </p>
                <Button
                  asChild
                  className="bg-[#2D0B0B] hover:bg-black text-white rounded-none px-12 py-6 uppercase tracking-widest text-[11px] font-bold transition-all"
                >
                  <Link to={`/product/${featuredProduct.slug}`}>Comprar Agora</Link>
                </Button>
              </div>
            </section>
          )}

          {/* CONFECÇÃO SÔFFI Grid Section */}
          <section className="py-16 md:py-24 px-4 md:px-8 bg-background">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                CONFECÇÃO SÔFFI
              </h2>
            </div>

            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
                {soffiProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Index
