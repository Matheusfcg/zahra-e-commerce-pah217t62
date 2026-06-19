import { Link } from 'react-router-dom'
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
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getProducts()

        // Hero: Grab top products for the high-impact carousel
        setHeroProducts(all.slice(0, 6))

        // Exclude basics for remaining sections
        const nonBasics = all.filter(
          (p) =>
            !p.name.toLowerCase().includes('t-shirt') &&
            !p.category?.toLowerCase().includes('t-shirt') &&
            !p.slug?.toLowerCase().includes('t-shirt') &&
            !p.name.toLowerCase().includes('básico') &&
            !p.name.toLowerCase().includes('basico') &&
            !p.slug?.toLowerCase().includes('basico'),
        )

        // Curated Grid: Mixed prices, remaining products
        const curated = nonBasics.slice(0, 8)
        setCuratedProducts(curated)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full pt-[80px] md:pt-[120px] pb-0 bg-[#FAFAFA]">
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
                              'https://img.usecurling.com/p/800/1000?q=high%20fashion%20clothing&color=black&dpr=2'
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

          {/* Split-Screen Banner Section */}
          <section className="w-full flex flex-col md:flex-row min-h-[60vh] lg:min-h-[80vh]">
            <Link
              to="/produtos?q=vestido"
              className="group relative w-full md:w-1/2 overflow-hidden block aspect-[4/5] md:aspect-auto"
            >
              <img
                src="https://img.usecurling.com/p/1200/1600?q=elegant%20woman%20forest%20dress&dpr=2"
                alt="Vestido Longo Elegance"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#F4F1ED] mb-6 uppercase tracking-widest drop-shadow-lg max-w-[80%]">
                  VESTIDO LONGO ELEGANCE
                </h2>
                <span className="text-[#F4F1ED] border border-[#F4F1ED] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium transition-colors hover:bg-[#F4F1ED] hover:text-[#2D0B0B]">
                  DESCUBRA
                </span>
              </div>
            </Link>

            <Link
              to="/produtos?q=conjunto"
              className="group relative w-full md:w-1/2 overflow-hidden block aspect-[4/5] md:aspect-auto"
            >
              <img
                src="https://img.usecurling.com/p/1200/1600?q=woman%20tailoring%20vintage%20workshop&dpr=2"
                alt="Conjunto Alfaiataria"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#F4F1ED] mb-6 uppercase tracking-widest drop-shadow-lg max-w-[80%]">
                  CONJUNTO ALFAIATARIA
                </h2>
                <span className="text-[#F4F1ED] border border-[#F4F1ED] px-10 py-3 text-xs uppercase tracking-[0.3em] font-medium transition-colors hover:bg-[#F4F1ED] hover:text-[#2D0B0B]">
                  DESCUBRA
                </span>
              </div>
            </Link>
          </section>

          {/* Curated Product Grid */}
          <section className="py-20 md:py-32 px-4 md:px-8 bg-[#FAFAFA]">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                Curadoria Exclusiva
              </h2>
            </div>

            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
                {curatedProducts.map((product) => (
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
