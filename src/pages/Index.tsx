import { Link } from 'react-router-dom'
import { Loader2, Star, ShieldCheck, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProducts, type Product } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'
import { supabase } from '@/lib/supabase/client'

const Index = () => {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [siteContent, setSiteContent] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, contentResponse] = await Promise.all([
          getProducts(),
          supabase.from('site_content').select('*'),
        ])

        if (contentResponse.data) {
          const contentMap = contentResponse.data.reduce(
            (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
            {} as Record<string, string>,
          )
          setSiteContent(contentMap)
        }

        const all = productsData || []

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
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D0B0B]" />
        </div>
      ) : (
        <>
          {/* Two-Column Hero Section with Integrated Central Overlay */}
          <section className="relative w-full flex flex-col md:flex-row min-h-[75vh] lg:min-h-[85vh] bg-[#F9F8F6]">
            {/* Left Image */}
            <Link
              to="/produtos"
              className="group relative w-full md:w-1/2 h-[50vh] md:h-auto overflow-hidden block"
            >
              <img
                src={getText(
                  'hero_left_image',
                  'https://img.usecurling.com/p/800/1200?q=elegant%20fashion&dpr=2',
                )}
                alt="Coleção Elegance"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>

            {/* Right Image */}
            <Link
              to="/produtos"
              className="group relative w-full md:w-1/2 h-[50vh] md:h-auto overflow-hidden block"
            >
              <img
                src={getText(
                  'hero_right_image',
                  'https://img.usecurling.com/p/800/1200?q=sophisticated%20clothing&dpr=2',
                )}
                alt="Coleção Sofisticada"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500" />
            </Link>

            {/* Central Overlay Legend */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 md:p-8 z-20">
              <div className="px-8 py-10 md:px-14 md:py-16 flex flex-col items-center text-center max-w-[90%] md:max-w-md pointer-events-auto transition-transform duration-500 hover:scale-[1.02]">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-[#2D0B0B] mb-4 md:mb-6 uppercase tracking-[0.1em] leading-tight">
                  {getText('hero_title', 'Essência da Elegância')
                    .split('\n')
                    .map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                </h1>
                <p className="text-[#5C4B4B] text-sm md:text-base mb-6 md:mb-8 max-w-[260px] tracking-wide">
                  {getText(
                    'hero_description',
                    'Descubra nossa nova coleção. Peças exclusivas pensadas para evidenciar a sua beleza natural.',
                  )}
                </p>
                <Link
                  to="/produtos"
                  className="border border-[#2D0B0B] text-[#2D0B0B] px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2D0B0B] hover:text-[#F9F8F6] transition-colors bg-white/50 backdrop-blur-sm"
                >
                  {getText('hero_button', 'Explorar Coleção')}
                </Link>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="w-full py-20 md:py-28 bg-[#F9F8F6] px-4 md:px-8 border-t border-[#E5E0D8]">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Star className="w-6 h-6 text-[#2D0B0B]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#2D0B0B] mb-4">
                  {getText('values_1_title', 'Design Autoral')}
                </h3>
                <p className="text-[#5C4B4B] text-sm md:text-base max-w-[280px]">
                  {getText(
                    'values_1_desc',
                    'Peças exclusivas desenhadas no Brasil com foco no minimalismo atemporal.',
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#2D0B0B]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#2D0B0B] mb-4">
                  {getText('values_2_title', 'Qualidade Premium')}
                </h3>
                <p className="text-[#5C4B4B] text-sm md:text-base max-w-[280px]">
                  {getText(
                    'values_2_desc',
                    'Seleção rigorosa de materiais para garantir durabilidade e sofisticação.',
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Leaf className="w-6 h-6 text-[#2D0B0B]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-[#2D0B0B] mb-4">
                  {getText('values_3_title', 'Sustentabilidade')}
                </h3>
                <p className="text-[#5C4B4B] text-sm md:text-base max-w-[280px]">
                  {getText(
                    'values_3_desc',
                    'Compromisso com o meio ambiente utilizando couro vegano de alta tecnologia.',
                  )}
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
