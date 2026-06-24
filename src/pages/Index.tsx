import { Link } from 'react-router-dom'
import { Loader2, Truck, RefreshCcw, ShieldCheck, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getProducts,
  getFeaturedProducts,
  getCarouselProducts,
  type Product,
} from '@/services/products'

const categoryNavItems = [
  { label: 'Blusas / Bodys', value: 'Blusas e Bodies' },
  { label: 'Conjuntos', value: 'Conjuntos' },
  { label: 'Partes de baixo', value: 'Partes de Baixo' },
  { label: 'Macaquinho', value: 'Macaquinhos' },
  { label: 'Jeans', value: 'Jeans' },
]

const Index = () => {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const [productsData, featuredData, carouselData] = await Promise.all([
          getProducts(),
          getFeaturedProducts(),
          getCarouselProducts(),
        ])

        const all = productsData || []
        setFeaturedProducts(featuredData || [])

        let carousel = carouselData || []
        if (carousel.length < 4) {
          const needed = 4 - carousel.length
          const additional = all
            .filter((p) => !carousel.find((c) => c.id === p.id))
            .slice(0, needed)
          carousel = [...carousel, ...additional]
        }
        setCarouselProducts(carousel.slice(0, 4))

        // Extract Category Images for Session 2
        const catImages: Record<string, string> = {}
        for (const item of categoryNavItems) {
          const cat = item.value
          const catProduct = all.find(
            (p) =>
              p.category?.toLowerCase() === cat.toLowerCase() ||
              p.category?.toLowerCase().includes(cat.toLowerCase()),
          )
          if (catProduct && catProduct.product_images && catProduct.product_images.length > 0) {
            catImages[cat] = catProduct.product_images[0].url
          } else {
            catImages[cat] =
              `https://img.usecurling.com/p/400/400?q=${encodeURIComponent(cat + ' clothing isolated')}&color=white&seed=${cat.length}`
          }
        }
        setCategoryImages(catImages)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full pt-[80px] md:pt-[100px] pb-0 bg-[#FAFAFA]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* New 4-column Hero Banner */}
          {featuredProducts.length > 0 && <section className="bg-white w-full"></section>}

          {/* Lookbook Banner */}
          {carouselProducts.length > 0 && (
            <section className="relative w-full bg-[#F9F8F6] border-b border-[#E5E0D8] overflow-hidden">
              <div className="flex flex-wrap md:flex-nowrap w-full">
                {carouselProducts.slice(0, 4).map((item) => {
                  const imageUrl =
                    item.product_images?.[0]?.url ||
                    `https://img.usecurling.com/p/600/800?q=elegance&seed=${item.id}`
                  return (
                    <div
                      key={item.id}
                      className="w-1/2 md:w-1/4 relative group overflow-hidden aspect-[3/4] md:aspect-[2/3]"
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <Link to="/produtos" className="pointer-events-auto">
                  <button className="bg-[#2D0B0B] hover:bg-[#1A0606] text-white px-8 py-4 text-sm md:text-base font-medium tracking-widest uppercase transition-all duration-300 shadow-2xl hover:scale-105 border border-[#2D0B0B]/20 rounded-none">
                    Ver lançamento
                  </button>
                </Link>
              </div>
            </section>
          )}

          {/* Session 2: Categories Grid (Updated Circular) */}
          <section className="py-16 md:py-24 bg-[#FAFAFA] border-b border-[#E5E0D8]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-6 md:gap-12 pb-8 justify-start md:justify-center items-center">
                {categoryNavItems.map((item) => (
                  <Link
                    key={item.value}
                    to={`/produtos?category=${encodeURIComponent(item.value)}`}
                    className="group flex flex-col items-center snap-center shrink-0 w-[120px] md:w-[160px] lg:w-[180px]"
                  >
                    <div className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] rounded-full overflow-hidden bg-white shadow-sm mb-4 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center border border-[#E5E0D8]/50">
                      <img
                        src={categoryImages[item.value]}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className="text-2xl md:text-3xl text-[#2D0B0B] whitespace-nowrap tracking-wide"
                      style={{ fontFamily: "'Caveat', cursive", fontWeight: 600 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Session 3: Benefits Banner */}
          <section className="w-full py-16 bg-[#F9F8F6] border-b border-[#E5E0D8]">
            <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
              <div className="flex flex-col items-center justify-start text-[#2D0B0B]">
                <Truck className="h-10 w-10 mb-4 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#2D0B0B] tracking-wide uppercase">
                  Entrega para todo o Brasil
                </h3>
              </div>
              <div className="flex flex-col items-center justify-start text-[#2D0B0B]">
                <RefreshCcw className="h-10 w-10 mb-4 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#2D0B0B] tracking-wide uppercase">
                  Troca fácil
                </h3>
              </div>
              <div className="flex flex-col items-center justify-start text-[#2D0B0B]">
                <ShieldCheck className="h-10 w-10 mb-4 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#2D0B0B] tracking-wide uppercase">
                  Pagamento seguro
                </h3>
              </div>
              <div className="flex flex-col items-center justify-start text-[#2D0B0B]">
                <Clock className="h-10 w-10 mb-4 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#2D0B0B] tracking-wide uppercase mb-2">
                  Suporte rápido
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                  Suporte rápido de segunda à sexta das 09h às 17h.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Index
