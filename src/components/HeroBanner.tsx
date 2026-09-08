import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ProgressiveImage } from '@/components/ui/ProgressiveImage'
import { optimizeImage, getOptimizedSrcSet } from '@/lib/image'
import heroBannerAsset from '@/assets/image-1a8b2.png'

export interface HeroBannerProps {
  bannerImage?: string
  eyebrow?: string
  title?: string
  buttonText?: string
  buttonLink?: string
  isLoading?: boolean
}

export function HeroBanner({
  bannerImage,
  eyebrow = 'HEY, GIRL!',
  title = 'BEM-VINDA À MEYVE.',
  buttonText = 'COMPRE AGORA',
  buttonLink = '/produtos',
  isLoading = false,
}: HeroBannerProps) {
  // Use the new reference asset image-1a8b2.png (two models: left in white, right in brown, neutral background)
  const activeBannerImage = bannerImage || heroBannerAsset
  const hasCustomText =
    (eyebrow && eyebrow !== 'HEY, GIRL!') || (title && title !== 'BEM-VINDA À MEYVE.')

  // Inject preload link for LCP Hero
  useEffect(() => {
    if (!activeBannerImage) return

    const lcpUrl = optimizeImage(activeBannerImage, {
      width: 1600,
      quality: 85,
      format: 'webp',
    })
    const lcpSrcSet = getOptimizedSrcSet(activeBannerImage, [640, 1024, 1600], {
      quality: 85,
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
      document.head.appendChild(link)
    }
    link.href = lcpUrl
    if (lcpSrcSet) {
      link.setAttribute('imagesrcset', lcpSrcSet)
      link.setAttribute('imagesizes', '100vw')
    }
  }, [activeBannerImage])

  if (isLoading) {
    return (
      <div className="relative w-full h-[60vh] min-h-[460px] max-h-[700px] bg-[#E5E3E0] animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-40 h-8 bg-[#dedad6] rounded" />
          <div className="w-72 h-10 bg-[#dedad6] rounded" />
          <div className="w-40 h-10 bg-[#dedad6] rounded mt-2" />
        </div>
      </div>
    )
  }

  const optimizedBanner = optimizeImage(activeBannerImage, {
    width: 1800,
    quality: 85,
    format: 'webp',
  })
  const bannerSrcSet = getOptimizedSrcSet(activeBannerImage, [640, 1024, 1440, 1920], {
    quality: 85,
    format: 'webp',
  })

  return (
    <section
      aria-label="Destaque Meyve"
      className="relative w-full bg-[#E6E2DE] overflow-hidden group select-none transition-colors duration-500"
    >
      {/*
        Responsive Hero Container:
        On desktop & tablets: uses aspect-ratio / viewport height matching standard banners (min 420px, max 680px).
        On mobile: fluid height with models nicely framed on the sides and center callout.
      */}
      <div className="relative w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:h-[70vh] lg:max-h-[680px] flex items-center justify-center overflow-hidden">
        {/* Banner Graphic Background / Models (Image 2) */}
        <div className="absolute inset-0 w-full h-full">
          <ProgressiveImage
            src={optimizedBanner}
            srcSet={bannerSrcSet || undefined}
            alt="Meyve - Nova Coleção"
            priority
            loading="eager"
            decoding="sync"
            width={1800}
            height={900}
            blurColor="bg-[#dedad6]"
            containerClassName="w-full h-full"
            className="w-full h-full object-cover object-[center_top] sm:object-cover sm:object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
          />
        </div>

        {/* Ambient subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/[0.02] via-transparent to-black/[0.04]"
          aria-hidden="true"
        />

        {/*
          Overlay:
          1. Accessible, semantic hidden headings for screen readers.
          2. Transparent interactive overlay with the styled "COMPRE AGORA" CTA button
             perfectly matching the visual position on the reference image.
          3. If the user overrides eyebrow or title via CMS with custom values different from the default,
             we render a refined typography overlay over the banner.
        */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 flex flex-col items-center justify-center text-center pointer-events-none">
          {/* Check if user customized the title/eyebrow in CMS */}
          {hasCustomText ? (
            <div className="flex flex-col items-center py-4 px-3 sm:py-6 sm:px-8 max-w-xl transition-all duration-500 bg-[#E6E2DE]/90 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none rounded animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="space-y-1 sm:space-y-2 mb-5 sm:mb-6 md:mb-7">
                <h2 className="text-[#2D0B0B] font-sans font-bold text-2xl sm:text-3xl md:text-5xl lg:text-[54px] tracking-tight leading-none uppercase drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                  {eyebrow}
                </h2>
                <h1 className="text-[#2D0B0B] font-sans font-bold text-xl sm:text-2xl md:text-4xl lg:text-[42px] tracking-tight leading-tight uppercase drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
                  {title}
                </h1>
              </div>

              <Link
                to={buttonLink}
                className="pointer-events-auto inline-flex items-center justify-center bg-[#2D0B0B] text-white hover:bg-[#4A1B1B] active:scale-[0.98] font-sans font-medium text-xs sm:text-sm tracking-[0.22em] uppercase py-3.5 px-8 sm:py-4 sm:px-10 border border-[#2D0B0B] shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 rounded-none cursor-pointer group"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                  {buttonText}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 animate-in fade-in duration-700">
              {/* Visually hidden semantic text for SEO & accessibility */}
              <h2 className="sr-only">HEY, GIRL!</h2>
              <h1 className="sr-only">BEM-VINDA À MEYVE.</h1>

              {/* Responsive spacer placing the button exactly in the center slot below text */}
              <div
                className="h-28 sm:h-36 md:h-44 lg:h-48 pointer-events-none"
                aria-hidden="true"
              />

              {/* Interactive CTA button positioned precisely over the banner button slot */}
              <Link
                to={buttonLink}
                aria-label="Compre agora na Meyve"
                className="pointer-events-auto inline-flex items-center justify-center bg-[#2D0B0B] text-[#FAF9F6] hover:bg-[#431414] active:scale-[0.97] font-sans font-medium text-xs sm:text-sm md:text-base tracking-[0.22em] uppercase py-3 px-7 sm:py-3.5 sm:px-9 md:py-4 md:px-10 border border-[#2D0B0B] shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 rounded-none cursor-pointer group"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                  {buttonText}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
