import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'

const Index = () => {
  const [heroProducts, setHeroProducts] = useState<Product[]>([])
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await getProducts()

        // Exclude basics for hero and curated
        const nonBasics = all.filter(
          (p) =>
            !p.name.toLowerCase().includes('t-shirt') &&
            !p.category?.toLowerCase().includes('t-shirt') &&
            !p.slug?.toLowerCase().includes('t-shirt') &&
            !p.name.toLowerCase().includes('básico') &&
            !p.name.toLowerCase().includes('basico') &&
            !p.slug?.toLowerCase().includes('basico'),
        )

        // Hero: Grab top 2 products for the 3-column layout
        setHeroProducts(nonBasics.slice(0, 2))

        // Curated Grid: Remaining products
        const curated = nonBasics.slice(2, 10)
        setCuratedProducts(curated)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const heroLeft = heroProducts[0]
  const heroRight = heroProducts[1]

  return (
    <div className="w-full pt-[80px] md:pt-[120px] pb-0 bg-[#FAFAFA]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* Three-Column Hero Section */}
          <section className="w-full flex flex-col lg:grid lg:grid-cols-3 min-h-[75vh] lg:min-h-[85vh] bg-[#FAFAFA]">
            {/* Left Image */}
            <Link
              to={heroLeft ? `/product/${heroLeft.slug}` : '/produtos'}
              className="group relative w-full h-[50vh] lg:h-auto overflow-hidden block order-1 lg:order-1"
            >
              <img
                src={
                  heroLeft?.product_images?.[0]?.url ||
                  'https://img.usecurling.com/p/800/1200?q=elegant%20fashion&dpr=2'
                }
                alt={heroLeft?.name || 'Coleção Elegance'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center w-full z-10 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <span className="text-[#F4F1ED] border border-[#F4F1ED] px-8 py-2 text-xs uppercase tracking-[0.2em] font-medium backdrop-blur-sm bg-black/20">
                  {heroLeft ? 'Ver Peça' : 'Ver Coleção'}
                </span>
              </div>
            </Link>

            {/* Central Legend */}
            <div className="flex flex-col items-center justify-center p-12 lg:p-16 text-center bg-[#F4F1ED] order-2 lg:order-2 min-h-[40vh] lg:min-h-0 border-y lg:border-y-0 lg:border-x border-[#E5E0D8]">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2D0B0B] mb-6 uppercase tracking-[0.1em] leading-tight">
                Essência <br className="hidden lg:block" /> da <br className="hidden lg:block" />{' '}
                Elegância
              </h1>
              <p className="text-[#5C4B4B] text-sm md:text-base mb-8 max-w-[280px] lg:max-w-xs tracking-wide">
                Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza
                natural.
              </p>
              <Link
                to="/produtos"
                className="border border-[#2D0B0B] text-[#2D0B0B] px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2D0B0B] hover:text-[#F4F1ED] transition-colors"
              >
                Explorar Coleção
              </Link>
            </div>

            {/* Right Image */}
            <Link
              to={heroRight ? `/product/${heroRight.slug}` : '/produtos'}
              className="group relative w-full h-[50vh] lg:h-auto overflow-hidden block order-3 lg:order-3"
            >
              <img
                src={
                  heroRight?.product_images?.[0]?.url ||
                  'https://img.usecurling.com/p/800/1200?q=sophisticated%20clothing&dpr=2'
                }
                alt={heroRight?.name || 'Coleção Sofisticada'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center w-full z-10 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <span className="text-[#F4F1ED] border border-[#F4F1ED] px-8 py-2 text-xs uppercase tracking-[0.2em] font-medium backdrop-blur-sm bg-black/20">
                  {heroRight ? 'Ver Peça' : 'Ver Coleção'}
                </span>
              </div>
            </Link>
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
