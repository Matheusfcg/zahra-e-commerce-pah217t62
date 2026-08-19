/**
 * Image optimization helper utility for Zahrá E-commerce
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
 * Supports Supabase Storage URLs (format=webp&quality=80&width=...) and curling image CDN.
 */
export function optimizeImage(
  url: string | null | undefined,
  options: OptimizeImageOptions = {},
): string {
  if (!url) return ''

  const { width, height, quality = 80, format = 'webp' } = options

  // Handle Supabase Storage public URLs
  if (url.includes('/storage/v1/object/public/')) {
    // Transform /public/ to /render/image/public/ if render endpoint supported or append parameters
    let transformedUrl = url
    if (url.includes('/storage/v1/object/public/')) {
      transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    }
    const hasQuery = transformedUrl.includes('?')
    const params: string[] = []

    if (width) params.push(`width=${width}`)
    if (height) params.push(`height=${height}`)
    if (quality) params.push(`quality=${quality}`)
    if (format) params.push(`format=${format}`)

    if (params.length === 0) return transformedUrl

    return `${transformedUrl}${hasQuery ? '&' : '?'}${params.join('&')}`
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
