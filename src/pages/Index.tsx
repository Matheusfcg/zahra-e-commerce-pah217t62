import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import hero1 from '@/assets/1produto-070e2.png'
import hero2 from '@/assets/1produto-67ee8.png'
import hero3 from '@/assets/image-048b7.png'
import hero4 from '@/assets/image-43b69.png'

const defaultCategoryNavItems = [
  {
    label: 'Blusas/Bodys',
    value: 'Blusas/Bodys',
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
    value: 'Partes de baixo',
    image: 'https://img.usecurling.com/p/400/400?q=black%20mini%20skirt%20clothing&color=white',
  },
  {
    label: 'Macaquinho',
    value: 'Macaquinho',
    image:
      'https://img.usecurling.com/p/400/400?q=light%20green%20cape%20top%20clothing&color=white',
  },
  {
    label: 'Jeans',
    value: 'Jeans',
    image: 'https://img.usecurling.com/p/400/400?q=denim%20jumpsuit%20clothing&color=white',
  },
]

const heroBannerImages = [hero1, hero2, hero3, hero4]

export default function Index() {
  const [content, setContent] = useState<Record<string, string>>({})

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
  }, [])

  const dynamicHeroBannerImages = [
    content.hero_banner_1 || heroBannerImages[0],
    content.hero_banner_2 || heroBannerImages[1],
    content.hero_banner_3 || heroBannerImages[2],
    content.hero_banner_4 || heroBannerImages[3],
  ]

  const dynamicCategoryNavItems = defaultCategoryNavItems.map((item, index) => ({
    ...item,
    label: content[`category_${index + 1}_label`] || item.label,
    value: content[`category_${index + 1}_value`] || item.value,
    image: content[`category_${index + 1}_image`] || item.image,
  }))

  return (
    <div className="w-full pt-[80px] md:pt-[96px] pb-0 bg-white">
      {/* Section 1: Hero Banner */}
      <section className="relative w-full h-[75vh] md:h-[85vh] bg-white overflow-hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full gap-1 md:gap-2 no-scrollbar">
          {dynamicHeroBannerImages.map((imageUrl, index) => (
            <Link
              to="/produtos"
              key={index}
              className="w-[85vw] sm:w-1/2 md:w-1/4 shrink-0 h-full relative group overflow-hidden block snap-center md:snap-align-none"
            >
              <img
                src={imageUrl}
                alt={`Hero Image ${index + 1}`}
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105 bg-[#e4dfdb]"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Categories Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-8 md:gap-14 pb-4 justify-start lg:justify-center items-end">
            {dynamicCategoryNavItems.map((item) => (
              <Link
                key={item.value}
                to={`/produtos?category=${encodeURIComponent(item.value)}`}
                className="group flex flex-col items-center snap-center shrink-0 w-[140px] md:w-[170px]"
              >
                <div className="w-[140px] h-[140px] md:w-[170px] md:h-[170px] rounded-full overflow-hidden bg-[#f9f9f9] mb-5 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-[95%] h-[95%] object-contain mix-blend-multiply"
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
