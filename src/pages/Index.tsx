import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Truck, RefreshCw, ShieldCheck, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import logo from '@/assets/logozahra-e51d5.png'

const defaultCategoryNavItems = [
  {
    label: 'Blusas/Bodys',
    value: 'Blusas e Bodies',
    image:
      'https://img.usecurling.com/p/400/400?q=brown%20one%20shoulder%20top%20clothing&color=white',
  },
  {
    label: 'Conjuntos',
    value: 'Conjuntos',
    image:
      'https://img.usecurling.com/p/400/400?q=black%20button-down%20shirt%20shorts%20set&color=white',
  },
  {
    label: 'Partes de baixo',
    value: 'Saias',
    image: 'https://img.usecurling.com/p/400/400?q=black%20mini%20skirt%20clothing&color=white',
  },
  {
    label: 'Macaquinho',
    value: 'Macaquinhos',
    image:
      'https://img.usecurling.com/p/400/400?q=light%20green%20cape%20top%20clothing&color=white',
  },
  {
    label: 'Jeans',
    value: 'Jeans',
    image: 'https://img.usecurling.com/p/400/400?q=denim%20jumpsuit%20clothing&color=white',
  },
]

export default function Index() {
  const [content, setContent] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('section_key, content_value')
      .then(({ data }) => {
        if (data) {
          const map = data.reduce(
            (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
            {} as Record<string, string>,
          )
          setContent(map)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const dynamicHeroBannerImages = [
    content.hero_banner_1,
    content.hero_banner_2,
    content.hero_banner_3,
    content.hero_banner_4,
  ].filter(Boolean) as string[]

  const dynamicCategoryNavItems = defaultCategoryNavItems.map((item, index) => ({
    ...item,
    label: content[`category_${index + 1}_label`] || item.label,
    value: content[`category_${index + 1}_value`] || item.value,
    image: content[`category_${index + 1}_image`] || item.image,
  }))

  return (
    <div className="w-full pt-[80px] md:pt-[96px] pb-0 bg-white">
      {/* Section 1: Hero Banner */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-white overflow-hidden group/banner">
        {isLoading ? (
          <div className="flex overflow-hidden w-full h-full gap-1 md:gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="w-[85vw] sm:w-1/2 md:w-1/4 h-full rounded-none shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full gap-1 md:gap-2 no-scrollbar">
            {dynamicHeroBannerImages.map((imageUrl, index) => (
              <div
                key={index}
                className="w-[85vw] sm:w-1/2 md:w-1/4 shrink-0 h-full relative overflow-hidden block snap-center md:snap-align-none"
              >
                <img
                  src={imageUrl}
                  alt={`Hero Image ${index + 1}`}
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover/banner:scale-105 bg-[#e4dfdb]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Link
            to="/produtos"
            className="pointer-events-auto bg-[#2D0B0B] text-white font-serif uppercase tracking-[0.15em] text-sm md:text-base py-4 px-10 border border-[#2D0B0B] hover:bg-white hover:text-[#2D0B0B] transition-colors duration-300 shadow-lg"
          >
            Compre agora
          </Link>
        </div>

        {/* Overlay Logo */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-12 pointer-events-none z-10">
          <img
            src={logo}
            alt="Zahra Logo"
            className="w-[140px] md:w-[240px] object-contain drop-shadow-2xl opacity-90"
          />
        </div>
      </section>

      {/* Section 1.5: Benefits */}
      <section className="w-full bg-[#FAFAFA] border-y border-muted/30 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <Truck className="h-7 w-7 text-[#2D0B0B]" strokeWidth={1.5} />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#2D0B0B]">
                Entrega para todo o Brasil
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-7 w-7 text-[#2D0B0B]" strokeWidth={1.5} />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#2D0B0B]">
                Troca fácil
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[#2D0B0B]" strokeWidth={1.5} />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#2D0B0B]">
                Pagamento seguro
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Clock className="h-7 w-7 text-[#2D0B0B]" strokeWidth={1.5} />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#2D0B0B]">
                Suporte rápido
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground mt-1 max-w-[200px]">
                Suporte rápido de segunda à sexta das 09h às 17h.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Categories Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-8 md:gap-14 pb-4 justify-start lg:justify-center items-end">
            {isLoading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center snap-center shrink-0 w-[140px] md:w-[170px]"
                  >
                    <Skeleton className="w-[140px] h-[140px] md:w-[170px] md:h-[170px] rounded-full mb-5" />
                    <Skeleton className="w-24 h-8" />
                  </div>
                ))
              : dynamicCategoryNavItems.map((item) => (
                  <Link
                    key={item.value}
                    to={`/produtos?category=${encodeURIComponent(item.value)}`}
                    className="group flex flex-col items-center snap-center shrink-0 w-[140px] md:w-[170px]"
                  >
                    <div className="w-[140px] h-[140px] md:w-[170px] md:h-[170px] rounded-full overflow-hidden bg-white mb-5 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center border border-gray-200 shadow-sm">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-script text-[36px] md:text-[44px] text-wine whitespace-nowrap tracking-wide text-center leading-none">
                      {item.label}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>
    </div>
  )
}
