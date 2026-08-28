/**
 * Image optimization helper utility for Meyves E-commerce
 * Handles Supabase Storage dynamic transformations & Curling CDN resizing / WebP conversion
 */

export interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'origin'
}

/**
 * Optimizes image URLs by appending transform parameters or resizing hints.
 * Supports curling image CDN resizing / WebP conversion.
 *
 * NOTE: Supabase Storage URLs are returned UNCHANGED. The Supabase Image
 * Transformation API (`/storage/v1/render/image/public/...`) is not enabled
 * on this project's tenant — rewriting public URLs to the render endpoint
 * returns HTTP 403 `FeatureNotEnabled` and breaks every hosted image.
 */
export function optimizeImage(
  url: string | null | undefined,
  options: OptimizeImageOptions = {},
): string {
  if (!url) return ''

  const { width, height } = options

  // Supabase Storage public URLs: return as-is. Do NOT rewrite to the render endpoint.
  if (url.includes('/storage/v1/object/public/')) {
    return url
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
