import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const FONT_CACHE_KEY = 'theme_font_cache'
const DEFAULT_FONT = 'Inter'

const GOOGLE_FONTS_MAP: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'Playfair Display':
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  Montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
  Poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  Lora: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
  'Cormorant Garamond':
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap',
  'DM Sans':
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
  Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
}

export const AVAILABLE_FONTS = Object.keys(GOOGLE_FONTS_MAP)

function ensurePreconnect() {
  if (document.getElementById('gfonts-preconnect-1')) return
  const pc1 = document.createElement('link')
  pc1.id = 'gfonts-preconnect-1'
  pc1.rel = 'preconnect'
  pc1.href = 'https://fonts.googleapis.com'
  document.head.appendChild(pc1)

  const pc2 = document.createElement('link')
  pc2.id = 'gfonts-preconnect-2'
  pc2.rel = 'preconnect'
  pc2.href = 'https://fonts.gstatic.com'
  pc2.crossOrigin = 'anonymous'
  document.head.appendChild(pc2)
}

export function loadGoogleFont(fontName: string) {
  const url = GOOGLE_FONTS_MAP[fontName]
  if (!url) return

  ensurePreconnect()

  const linkId = 'google-font-dynamic'
  let link = document.getElementById(linkId) as HTMLLinkElement | null

  if (link) {
    if (link.getAttribute('data-font') === fontName) return
    link.href = url
  } else {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  }
  link.setAttribute('data-font', fontName)
}

export function applyThemeFont(fontName: string) {
  loadGoogleFont(fontName)
  document.documentElement.style.setProperty('--font-primary', `"${fontName}"`)
  document.documentElement.style.setProperty('--font-heading', `"${fontName}"`)
  sessionStorage.setItem(FONT_CACHE_KEY, fontName)
}

export function useThemeFont() {
  const [font, setFont] = useState<string>(DEFAULT_FONT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem(FONT_CACHE_KEY)
    if (cached) {
      applyThemeFont(cached)
      setFont(cached)
    } else {
      applyThemeFont(DEFAULT_FONT)
    }

    // Fetch in background without blocking render
    ;(supabase as any)
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'main_font')
      .single()
      .then(({ data, error }: any) => {
        if (!error && data?.setting_value && data.setting_value !== cached) {
          setFont(data.setting_value)
          applyThemeFont(data.setting_value)
        }
      })
      .catch(() => {})
  }, [])

  return { font, loading }
}
