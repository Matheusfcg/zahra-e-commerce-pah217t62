import { useState, useEffect, useRef, forwardRef, type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  aspectRatio?: string // e.g. "3/4", "1/1", "16/9"
  containerClassName?: string
  priority?: boolean
  showBlurPlaceholder?: boolean
  blurColor?: string
}

/**
 * ProgressiveImage provides:
 * 1. Immediate blur-up / shimmer skeleton placeholder to eliminate blank space perception.
 * 2. Proper loading="lazy" (or eager for LCP) & decoding="async".
 * 3. fetchPriority="high" when priority=true.
 * 4. Aspect-ratio and layout-shift prevention.
 * 5. Smooth fade-in transition when the high-resolution image finishes loading.
 */
export const ProgressiveImage = forwardRef<HTMLImageElement, ProgressiveImageProps>(
  (
    {
      src,
      alt,
      className,
      containerClassName,
      aspectRatio,
      priority = false,
      showBlurPlaceholder = true,
      blurColor = 'bg-[#f4f1ee]',
      loading,
      decoding = 'async',
      fetchPriority,
      width,
      height,
      sizes,
      srcSet,
      onLoad,
      onError,
      style,
      ...rest
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [currentSrc, setCurrentSrc] = useState(src)
    const [currentSrcSet, setCurrentSrcSet] = useState(srcSet)
    const imgRef = useRef<HTMLImageElement | null>(null)

    // Synchronize currentSrc / currentSrcSet whenever props change
    useEffect(() => {
      setCurrentSrc(src)
      setCurrentSrcSet(srcSet)
      setIsLoaded(false)
      setHasError(false)
    }, [src, srcSet])

    // Check if the image was already cached by the browser and loaded synchronously
    useEffect(() => {
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setIsLoaded(true)
      }
    }, [currentSrc])

    return (
      <div
        className={cn('relative overflow-hidden', blurColor, containerClassName)}
        style={{
          ...(aspectRatio ? { aspectRatio } : {}),
          ...(width && !aspectRatio && !containerClassName?.includes('w-')
            ? { width: typeof width === 'number' ? `${width}px` : width }
            : {}),
          ...(height && !aspectRatio && !containerClassName?.includes('h-')
            ? { height: typeof height === 'number' ? `${height}px` : height }
            : {}),
        }}
      >
        {/* Shimmer/Pulse blur placeholder underneath - matching dimensions */}
        {showBlurPlaceholder && !isLoaded && !hasError && (
          <div
            className={cn(
              'absolute inset-0 w-full h-full z-0 animate-pulse pointer-events-none',
              blurColor || 'bg-[#ebe7e2]',
            )}
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {/* The actual image */}
        <img
          ref={(node) => {
            imgRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ;(ref as any).current = node
            }
          }}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading || 'lazy'}
          decoding={decoding}
          fetchPriority={priority ? 'high' : fetchPriority || 'auto'}
          sizes={sizes}
          srcSet={currentSrcSet}
          onLoad={(e) => {
            setIsLoaded(true)
            onLoad?.(e)
          }}
          onError={(e) => {
            // Graceful fallback: If a transformed Supabase URL fails (e.g. 403 FeatureNotEnabled on render endpoint),
            // automatically fall back to the un-transformed object/public URL so images never break!
            if (currentSrc && currentSrc.includes('/storage/v1/render/image/public/')) {
              const fallbackUrl = currentSrc
                .split('?')[0]
                .replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
              if (fallbackUrl !== currentSrc) {
                setCurrentSrc(fallbackUrl)
                setCurrentSrcSet(undefined)
                return
              }
            }
            setHasError(true)
            onError?.(e)
          }}
          style={style}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500 ease-out',
            !isLoaded && 'opacity-0',
            isLoaded && 'opacity-100',
            className,
          )}
          {...rest}
        />
      </div>
    )
  },
)

ProgressiveImage.displayName = 'ProgressiveImage'
