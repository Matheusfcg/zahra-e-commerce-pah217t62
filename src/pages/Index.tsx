import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Truck, RefreshCw, ShieldCheck, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { optimizeImage, getOptimizedSrcSet } from '@/lib/image'
import { HeroBanner } from '@/components/HeroBanner'
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

  const heroConfig = useMemo(() => {
    // If a custom banner image or hero_banner_image is provided in site_content
    let bannerImg: string | undefined = content.hero_banner_image || undefined
    if (!bannerImg && content.hero_images) {
      try {
        const parsed = JSON.parse(content.hero_images)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          bannerImg = parsed[0]
        }
      } catch {
        /* ignore */
      }
    }
    if (!bannerImg && content.hero_banner_1) {
      bannerImg = content.hero_banner_1
    }

    // Check if hero_title has legacy text "Essência da Elegância" or empty
    const rawTitle = content.hero_title
    const title =
      !rawTitle ||
      rawTitle.toLowerCase().includes('essência') ||
      rawTitle.toLowerCase().includes('elegância')
        ? 'BEM-VINDA À MEYVE.'
        : rawTitle

    const rawButton = content.hero_button_text || content.hero_button
    const buttonText =
      !rawButton || rawButton.toLowerCase().includes('explorar') ? 'COMPRE AGORA' : rawButton

    return {
      bannerImage: bannerImg,
      eyebrow: content.hero_eyebrow || 'HEY, GIRL!',
      title,
      buttonText,
      buttonLink: content.hero_button_link || '/produtos',
    }
  }, [content])

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
      <HeroBanner
        bannerImage={heroConfig.bannerImage}
        eyebrow={heroConfig.eyebrow}
        title={heroConfig.title}
        buttonText={heroConfig.buttonText}
        buttonLink={heroConfig.buttonLink}
        isLoading={isLoading}
      />

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
