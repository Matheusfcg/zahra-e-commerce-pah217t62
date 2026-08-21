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
    const imgRef = useRef<HTMLImageElement | null>(null)

    // Check if the image was already cached by the browser and loaded synchronously
    useEffect(() => {
      setIsLoaded(false)
      setHasError(false)

      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setIsLoaded(true)
      }
    }, [src])

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          blurColor,
          aspectRatio && `aspect-[${aspectRatio}]`,
          containerClassName,
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {/* Shimmer/Pulse blur placeholder underneath */}
        {showBlurPlaceholder && !isLoaded && !hasError && (
          <div className="absolute inset-0 z-0 bg-[#ebe7e2] animate-pulse pointer-events-none" />
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
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading || 'lazy'}
          decoding={decoding}
          fetchPriority={priority ? 'high' : fetchPriority || 'auto'}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={(e) => {
            setIsLoaded(true)
            onLoad?.(e)
          }}
          onError={(e) => {
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
