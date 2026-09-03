/**
 * Image optimization helper utility for Meyves E-commerce
 * Handles Supabase Storage dynamic transformations & Curling CDN resizing / WebP conversion
 */

export interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'origin'
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Optimizes image URLs by appending transform parameters or resizing hints.
 * Supports:
 * 1. Supabase Storage URLs: converts `/storage/v1/object/public/` to `/storage/v1/render/image/public/`
 *    with query params ?width=&quality=&height=&resize=
 * 2. Curling CDN URLs: rewrites dimensions in pathname /p/{w}/{h}
 */
export function optimizeImage(
  url: string | null | undefined,
  options: OptimizeImageOptions = {},
): string {
  if (!url) return ''

  const { width, height, quality = 80, resize, format } = options

  // Handle Supabase Storage public URLs
  if (url.includes('/storage/v1/object/public/')) {
    try {
      const renderBase = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/',
      )
      const parsed = new URL(renderBase)
      if (width) parsed.searchParams.set('width', width.toString())
      if (height) parsed.searchParams.set('height', height.toString())
      if (quality) parsed.searchParams.set('quality', quality.toString())
      if (resize) parsed.searchParams.set('resize', resize)
      if (format) parsed.searchParams.set('format', format)
      return parsed.toString()
    } catch {
      return url
    }
  }

  // If already a render URL, update query parameters
  if (url.includes('/storage/v1/render/image/public/')) {
    try {
      const parsed = new URL(url)
      if (width) parsed.searchParams.set('width', width.toString())
      if (height) parsed.searchParams.set('height', height.toString())
      if (quality) parsed.searchParams.set('quality', quality.toString())
      if (resize) parsed.searchParams.set('resize', resize)
      if (format) parsed.searchParams.set('format', format)
      return parsed.toString()
    } catch {
      return url
    }
  }

  // Handle Curling CDN URLs (e.g., https://img.usecurling.com/p/800/1000?q=...)
  if (url.includes('img.usecurling.com/p/')) {
    try {
      const parsed = new URL(url)
      const pathParts = parsed.pathname.split('/') // ['','p','800','1000']
      if (pathParts.length >= 4) {
        if (width) pathParts[2] = width.toString()
        if (height) pathParts[3] = height.toString()
        else if (width) pathParts[3] = Math.round(width * 1.25).toString()
        parsed.pathname = pathParts.join('/')
      }
      return parsed.toString()
    } catch {
      return url
    }
  }

  return url
}

/**
 * Generates an HTML srcset string for responsive images across device pixel ratios and viewports.
 * Returns empty string if the URL is not optimizable (e.g. data URI or unrecognized external URL).
 */
export function getOptimizedSrcSet(
  url: string | null | undefined,
  widths: number[] = [320, 480, 640, 800, 1024, 1200],
  options: Omit<OptimizeImageOptions, 'width'> = {},
): string {
  if (!url) return ''
  const isOptimizable =
    url.includes('/storage/v1/object/public/') ||
    url.includes('/storage/v1/render/image/public/') ||
    url.includes('img.usecurling.com/p/')

  if (!isOptimizable) return ''

  return widths.map((w) => `${optimizeImage(url, { ...options, width: w })} ${w}w`).join(', ')
}

/**
 * Returns original un-transformed URL (for graceful fallback if transform is unavailable)
 */
export function getOriginalStorageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.includes('/storage/v1/render/image/public/')) {
    const withoutParams = url.split('?')[0]
    return withoutParams.replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
  }
  return url
}
