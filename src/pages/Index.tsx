import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { getProducts, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { supabase } from '@/lib/supabase/client'

const Index = () => {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
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

        let heroUrls: string[] = []
        const categories = ['Conjuntos', 'Partes de Cima', 'Partes de Baixo']

        for (const cat of categories) {
          const catProducts = all
            .filter(
              (p) =>
                p.category?.toLowerCase() === cat.toLowerCase() ||
                p.category?.toLowerCase().includes(cat.toLowerCase()),
            )
            .sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
            )

          let catImagesAdded = 0
          for (const p of catProducts) {
            const images = p.product_images
              ? [...p.product_images].sort((a, b) => a.display_order - b.display_order)
              : []
            if (images.length > 0) {
              heroUrls.push(images[0].url)
              catImagesAdded++
              if (catImagesAdded === 2) break
            }
          }
        }

        if (heroUrls.length < 6) {
          for (const p of all) {
            if (heroUrls.length >= 6) break
            const images = p.product_images
              ? [...p.product_images].sort((a, b) => a.display_order - b.display_order)
              : []
            if (images.length > 0 && !heroUrls.includes(images[0].url)) {
              heroUrls.push(images[0].url)
            }
          }
        }

        while (heroUrls.length < 6) {
          heroUrls.push(`https://img.usecurling.com/p/1600/900?q=fashion&seed=${heroUrls.length}`)
        }

        setHeroImages(heroUrls.slice(0, 6))

        // Exclude basics for curated
        const nonBasics = all.filter(
          (p) =>
            !p.name.toLowerCase().includes('t-shirt') &&
            !p.category?.toLowerCase().includes('t-shirt') &&
            !p.slug?.toLowerCase().includes('t-shirt') &&
            !p.name.toLowerCase().includes('básico') &&
            !p.name.toLowerCase().includes('basico') &&
            !p.slug?.toLowerCase().includes('basico'),
        )

        // Curated Grid: top 8 products
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

  const getText = (key: string, fallback: string) => siteContent[key] || fallback

  return (
    <div className="w-full pt-[80px] md:pt-[120px] pb-0 bg-[#FAFAFA]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh] opacity-[1] shadow-[0px_0px_6px_0px_transparent] border-[inherit]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* Edge-to-Edge Hero Section with Background Carousel */}
          <section className="relative w-full h-[75vh] lg:h-[85vh] bg-white overflow-hidden flex items-center justify-center">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0">
              <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true, watchDrag: false }}
              >
                <CarouselContent className="ml-0 h-[75vh] lg:h-[85vh]">
                  {heroImages.map((img, i) => (
                    <CarouselItem key={i} className="pl-0 w-full h-full">
                      <img
                        src={img}
                        alt={`Hero Carousel Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Optional subtle overlay to ensure text contrast over any image */}
            <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none" />

            {/* Central Overlay Legend - Static Position */}
            <div className="relative z-20 flex flex-col items-center justify-center p-4 md:p-8 w-full h-full pointer-events-none">
              <div className="px-8 py-10 md:px-14 md:py-16 flex flex-col items-center text-center max-w-[90%] md:max-w-md pointer-events-auto transition-transform duration-500 hover:scale-[1.02]">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-[#2D0B0B] mb-4 md:mb-6 uppercase tracking-[0.1em] leading-tight drop-shadow-sm">
                  {getText('hero_title', 'ESSÊNCIA DA\nELEGÂNCIA')
                    .split('\n')
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </h1>
                <p className="text-[#2D0B0B]/90 text-sm md:text-base mb-6 md:mb-8 max-w-[260px] tracking-wide font-medium drop-shadow-sm">
                  {getText(
                    'hero_description',
                    'Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza natural.',
                  )}
                </p>
                <Link
                  to="/produtos"
                  className="border border-[#2D0B0B] text-[#2D0B0B] px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2D0B0B] hover:text-[#F9F8F6] transition-colors"
                >
                  {getText('hero_button', 'EXPLORAR COLEÇÃO')}
                </Link>
              </div>
            </div>
          </section>

          {/* Delivery Banner */}
          <section className="w-full py-16 bg-[#F9F8F6] border-t border-[#E5E0D8]">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 text-center">
              <div className="flex items-center justify-center text-[#2D0B0B]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17h4V5H6v6" />
                  <path d="M14 17h2.5a1 1 0 0 0 1-1v-4.5l-3.5-3.5H14" />
                  <circle cx="8" cy="17" r="2" />
                  <circle cx="16" cy="17" r="2" />
                  <path d="M2 13h4" />
                  <path d="M1 9h5" />
                  <path d="M3 5h3" />
                </svg>
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-[#2D0B0B]">
                {getText('delivery_banner_text', 'Entregamos para todo Brasil')}
              </h3>
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
