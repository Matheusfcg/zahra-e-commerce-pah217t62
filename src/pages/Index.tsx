import { Link } from 'react-router-dom'
import { Loader2, Truck, RefreshCcw, ShieldCheck, Clock } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { getProducts, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { supabase } from '@/lib/supabase/client'

const appCategories = [
  'Conjuntos',
  'Macaquinhos',
  'Blusas e Bodies',
  'Saias',
  'Calças',
  'Malhas',
  'Básicos',
]

const Index = () => {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [siteContent, setSiteContent] = useState<Record<string, string>>({})

  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, contentResponse] = await Promise.all([
          getProducts(),
          supabase.from('site_content').select('*'),
        ])

        let contentMap: Record<string, string> = {}
        if (contentResponse.data) {
          contentMap = contentResponse.data.reduce(
            (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
            {} as Record<string, string>,
          )
          setSiteContent(contentMap)
        }

        const all = productsData || []

        // Extract Hero Images
        let heroUrls: string[] = []
        for (const cat of ['Conjuntos', 'Partes de Cima', 'Partes de Baixo']) {
          const catProducts = all.filter((p) =>
            p.category?.toLowerCase().includes(cat.toLowerCase()),
          )
          for (const p of catProducts) {
            if (p.product_images && p.product_images.length > 0) {
              heroUrls.push(p.product_images[0].url)
              break
            }
          }
        }

        while (heroUrls.length < 6) {
          heroUrls.push(`https://img.usecurling.com/p/1600/900?q=fashion&seed=${heroUrls.length}`)
        }
        setHeroImages(heroUrls.slice(0, 6))

        // Extract Category Images for Session 2
        const catImages: Record<string, string> = {}
        for (const cat of appCategories) {
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

        // Exclude basics for curated
        const nonBasics = all.filter(
          (p) =>
            !p.name.toLowerCase().includes('t-shirt') && !p.name.toLowerCase().includes('básico'),
        )

        setCuratedProducts(nonBasics.slice(0, 8))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getText = (key: string, fallback: string) => siteContent[key] || fallback

  return (
    <div className="w-full pt-[80px] md:pt-[100px] pb-0 bg-[#FAFAFA]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh] opacity-[1] shadow-[0px_0px_6px_0px_transparent] border-[inherit]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* Edge-to-Edge Hero Section */}
          <section className="relative w-full h-[70vh] lg:h-[85vh] bg-white overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-0">
              <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true, watchDrag: false }}
              >
                <CarouselContent className="ml-0 h-[70vh] lg:h-[85vh]">
                  {heroImages.map((img, i) => (
                    <CarouselItem key={i} className="pl-0 w-full h-full">
                      <img src={img} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none" />

            <div className="relative z-20 flex flex-col items-center justify-center p-4 md:p-8 w-full h-full pointer-events-none">
              <div className="px-8 py-10 md:px-14 flex flex-col items-center text-center max-w-[90%] md:max-w-xl pointer-events-auto transition-transform duration-500 hover:scale-[1.02]">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#2D0B0B] mb-4 md:mb-6 uppercase tracking-[0.1em] leading-tight drop-shadow-md bg-white/60 p-4 backdrop-blur-sm rounded-sm">
                  {getText('hero_title', 'ESSÊNCIA DA\nELEGÂNCIA')
                    .split('\n')
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </h1>
                <Link
                  to="/produtos"
                  className="bg-[#2D0B0B] text-white border border-[#2D0B0B] px-10 py-4 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold hover:bg-black hover:border-black transition-all shadow-xl mt-4"
                >
                  {getText('hero_button', 'COMPRE AGORA')}
                </Link>
              </div>
            </div>
          </section>

          {/* Session 2: Categories Grid */}
          <section className="py-20 md:py-28 bg-white border-b border-[#E5E0D8]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <div className="text-center mb-16">
                <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                  Compre por Categoria
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {appCategories.map((cat) => (
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

          {/* Curated Product Grid */}
          <section className="py-20 md:py-32 px-4 md:px-8 bg-[#FAFAFA]">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.2em] text-[#2D0B0B]">
                {getText('curated_title', 'Curadoria Exclusiva')}
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
