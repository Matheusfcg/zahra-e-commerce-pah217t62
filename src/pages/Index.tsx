import { Link } from 'react-router-dom'
import { Loader2, Truck, RefreshCcw, ShieldCheck, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getProducts,
  getFeaturedProducts,
  getCarouselProducts,
  type Product,
} from '@/services/products'

const defaultCategories = [
  'CONJUNTOS',
  'MACAQUINHOS',
  'BLUSAS E BODIES',
  'SAIAS',
  'CALÇAS',
  'MALHAS',
  'BÁSICOS',
]

const Index = () => {
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const [productsData, featuredData, carouselData, contentData] = await Promise.all([
          getProducts(),
          getFeaturedProducts(),
          getCarouselProducts(),
          supabase
            .from('site_content')
            .select('*')
            .eq('section_key', 'homepage_categories')
            .single(),
        ])

        let loadedCategories = defaultCategories
        if (contentData.data && contentData.data.content_value) {
          try {
            loadedCategories = JSON.parse(contentData.data.content_value)
            setCategories(loadedCategories)
          } catch {
            /* intentionally ignored */
          }
        }

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
        for (const cat of loadedCategories) {
          const catProduct = all.find(
            (p) =>
              p.category?.toLowerCase() === cat.toLowerCase() ||
              p.category?.toLowerCase().includes(cat.toLowerCase()),
          )
          if (catProduct && catProduct.product_images && catProduct.product_images.length > 0) {
            catImages[cat] = catProduct.product_images[0].url
          } else {
            catImages[cat] =
              `https://img.usecurling.com/p/600/800?q=${encodeURIComponent(cat + ' fashion')}&seed=${cat.length}`
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
          {featuredProducts.length > 0 && (
            <section className="bg-white w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
                {featuredProducts.slice(0, 4).map((item) => {
                  const imageUrl =
                    item.product_images?.[0]?.url ||
                    `https://img.usecurling.com/p/600/800?q=fashion&seed=${item.id}`
                  return (
                    <Link
                      to={`/product/${item.slug}`}
                      key={item.id}
                      className="group block relative overflow-hidden aspect-[3/4]"
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-6 left-4 right-4 text-center">
                        <h3 className="text-white font-serif text-sm md:text-lg tracking-[0.1em] drop-shadow-md uppercase">
                          {item.name}
                        </h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Essência da Elegância Banner */}
          {carouselProducts.length > 0 && (
            <section className="py-20 md:py-28 bg-[#F9F8F6] border-b border-[#E5E0D8]">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                    Essência da Elegância
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {carouselProducts.map((item) => {
                    const imageUrl =
                      item.product_images?.[0]?.url ||
                      `https://img.usecurling.com/p/600/800?q=elegance&seed=${item.id}`
                    return (
                      <Link
                        to={`/product/${item.slug}`}
                        key={item.id}
                        className="group flex flex-col items-center"
                      >
                        <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted mb-4">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {item.is_promotion && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm z-10">
                              Sale
                            </div>
                          )}
                        </div>
                        <h3 className="text-xs md:text-sm font-medium text-[#2D0B0B] text-center uppercase tracking-wider mb-2 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs md:text-sm font-semibold text-muted-foreground">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.price)}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Session 2: Categories Grid */}
          <section className="py-20 md:py-28 bg-white border-b border-[#E5E0D8]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <div className="text-center mb-16">
                <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                  Compre por Categoria
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/produtos?category=${encodeURIComponent(cat)}`}
                    className="group relative block overflow-hidden aspect-[3/4] bg-muted shadow-sm"
                  >
                    <img
                      src={categoryImages[cat]}
                      alt={cat}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center p-4 text-center">
                      <span className="text-white font-serif text-lg md:text-2xl tracking-[0.1em] uppercase drop-shadow-md">
                        {cat}
                      </span>
                    </div>
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
