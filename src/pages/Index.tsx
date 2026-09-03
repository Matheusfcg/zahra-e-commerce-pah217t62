import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Truck, RefreshCw, ShieldCheck, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { optimizeImage, getOptimizedSrcSet } from '@/lib/image'
import {
  getSiteContentCached,
  getFeaturedCategoriesCached,
  smartCache,
} from '@/services/siteContent'

export default function Index() {
  const [content, setContent] = useState<Record<string, string>>(() => {
    return smartCache.get<Record<string, string>>('site_content_cache_v2') || {}
  })
  const [featuredCategories, setFeaturedCategories] = useState<any[]>(() => {
    return smartCache.get<any[]>('featured_categories_cache_v2') || []
  })
  const [isLoading, setIsLoading] = useState(() => {
    const cachedContent = smartCache.get<Record<string, string>>('site_content_cache_v2')
    const cachedCats = smartCache.get<any[]>('featured_categories_cache_v2')
    return !cachedContent || !cachedCats
  })

  useEffect(() => {
    Promise.all([getFeaturedCategoriesCached(), getSiteContentCached()])
      .then(([cats, siteContentMap]) => {
        if (cats && cats.length > 0) {
          setFeaturedCategories(cats)
        }
        if (siteContentMap && Object.keys(siteContentMap).length > 0) {
          setContent(siteContentMap)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  const dynamicHeroBannerImages = useMemo(() => {
    if (content.hero_images) {
      try {
        const parsed = JSON.parse(content.hero_images)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        /* ignore */
      }
    }
    const legacy = [
      content.hero_banner_1,
      content.hero_banner_2,
      content.hero_banner_3,
      content.hero_banner_4,
    ].filter(Boolean) as string[]

    if (legacy.length > 0) return legacy

    return [
      'https://img.usecurling.com/p/600/900?q=elegant%20fashion',
      'https://img.usecurling.com/p/600/900?q=sophisticated%20clothing',
    ]
  }, [content])

  // Inject preload link for LCP hero banner image
  useEffect(() => {
    const lcpImage = dynamicHeroBannerImages[0]
    if (!lcpImage) return

    const lcpUrl = optimizeImage(lcpImage, {
      width: 800,
      quality: 80,
      format: 'webp',
    })
    const lcpSrcSet = getOptimizedSrcSet(lcpImage, [480, 800, 1200], {
      quality: 80,
      format: 'webp',
    })

    const linkId = 'lcp-hero-preload'
    let link = document.getElementById(linkId) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'preload'
      link.as = 'image'
      link.setAttribute('fetchpriority', 'high')
      if (lcpSrcSet) {
        link.setAttribute('imagesrcset', lcpSrcSet)
        link.setAttribute('imagesizes', '(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw')
      }
      document.head.appendChild(link)
    }
    link.href = lcpUrl
    if (lcpSrcSet) {
      link.setAttribute('imagesrcset', lcpSrcSet)
      link.setAttribute('imagesizes', '(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw')
    }

    return () => {
      // Keep preload during life of page
    }
  }, [dynamicHeroBannerImages])

  const dynamicCategoryNavItems = useMemo(() => {
    return featuredCategories.map((cat) => ({
      label: cat.name,
      value: cat.name,
      image: optimizeImage(
        cat.image_url || 'https://img.usecurling.com/p/200/200?q=clothing&color=white',
        { width: 200, height: 200, quality: 80, format: 'webp' },
      ),
    }))
  }, [featuredCategories])

  // Preload category images eagerly as soon as category data is available
  useEffect(() => {
    if (!dynamicCategoryNavItems || dynamicCategoryNavItems.length === 0) return

    dynamicCategoryNavItems.forEach((item, index) => {
      if (!item.image) return

      // Preload via standard Image object for instant in-memory cache
      const img = new Image()
      img.src = item.image

      // Also inject <link rel="preload"> tags for early browser network pipeline discovery
      const linkId = `cat-img-preload-${index}`
      let link = document.getElementById(linkId) as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.id = linkId
        link.rel = 'preload'
        link.as = 'image'
        link.href = item.image
        document.head.appendChild(link)
      } else {
        link.href = item.image
      }
    })
  }, [dynamicCategoryNavItems])

  return (
    <div className="w-full pt-[80px] md:pt-[96px] pb-0 bg-white">
      {/* Section 1: Hero Banner */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-[#f2eee9] overflow-hidden group/banner">
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
            {dynamicHeroBannerImages.map((imageUrl, index) => {
              const isFirst = index === 0
              const targetWidth = isFirst ? 800 : 500
              const optimizedSrc = optimizeImage(imageUrl, {
                width: targetWidth,
                quality: 80,
                format: 'webp',
              })
              const heroSrcSet = getOptimizedSrcSet(imageUrl, [360, 600, 900, 1200], {
                quality: 80,
                format: 'webp',
              })

              return (
                <div
                  key={index}
                  className="w-[85vw] sm:w-1/2 md:w-1/4 shrink-0 h-full relative overflow-hidden block snap-center md:snap-align-none"
                >
                  <ProgressiveImage
                    src={optimizedSrc}
                    srcSet={heroSrcSet || undefined}
                    alt={`Hero Image ${index + 1}`}
                    priority={isFirst}
                    loading={isFirst ? 'eager' : 'lazy'}
                    decoding={isFirst ? 'sync' : 'async'}
                    width={targetWidth}
                    height={1200}
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                    blurColor="bg-[#e4dfdb]"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover/banner:scale-105"
                  />
                </div>
              )
            })}
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
      </section>

      {/* Section 2: Categories Grid */}
      {dynamicCategoryNavItems.length > 0 && (
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
                        <ProgressiveImage
                          src={item.image}
                          srcSet={
                            getOptimizedSrcSet(item.image, [140, 200, 340], {
                              quality: 80,
                              format: 'webp',
                            }) || undefined
                          }
                          alt={item.label}
                          priority
                          loading="eager"
                          decoding="async"
                          width={170}
                          height={170}
                          aspectRatio="1/1"
                          sizes="(max-width: 768px) 140px, 170px"
                          containerClassName="w-full h-full rounded-full"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-base md:text-lg font-medium text-[#2D0B0B] text-center mt-3">
                        {item.label}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Featured Products */}
      <FeaturedProducts />

      {/* Section 4: Benefits */}
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
    </div>
  )
}
