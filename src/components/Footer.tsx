import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import logoZahra from '../assets/logozahra-e51d5.png'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function Footer() {
  const [siteContent, setSiteContent] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase
      .from('site_content')
      .select('*')
      .then(({ data }) => {
        if (data) {
          const contentMap = data.reduce(
            (acc, curr) => ({ ...acc, [curr.section_key]: curr.content_value }),
            {} as Record<string, string>,
          )
          setSiteContent(contentMap)
        }
      })
  }, [])

  const getText = (key: string, fallback: string) => siteContent[key] || fallback

  return (
    <footer className="bg-[#FAFAF8] text-foreground border-t border-muted/50 py-20 font-sans">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        <div className="space-y-4">
          <Link to="/" className="inline-block mb-4">
            <img
              src={logoZahra}
              alt="Zahrá Brazil"
              className="h-[40px] w-[40px] object-cover rounded-full"
            />
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs whitespace-pre-wrap">
            {getText(
              'footer_about',
              'A essência do estilo minimalista. Peças autorais desenhadas no Brasil com materiais premium e compromisso com a excelência.',
            )}
          </p>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-wider text-[10px] mb-6 text-[#3A2222]">
            Atendimento
          </h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li>
              <a
                href="mailto:saczharabrasil@gmail.com"
                className="hover:text-foreground transition-colors"
              >
                Contato
              </a>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Frete e Entregas
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Trocas e Devoluções
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Guia de Tamanhos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-wider text-[10px] mb-6 text-[#3A2222]">
            Institucional
          </h4>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Nossa História
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Sustentabilidade
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Termos de Serviço
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-wider text-[10px] mb-6 text-[#3A2222]">
            Newsletter
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Inscreva-se para receber novidades e acesso antecipado a coleções exclusivas.
          </p>
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Seu e-mail"
              className="bg-transparent border-muted-foreground/30 focus-visible:ring-foreground rounded-none h-10 text-xs"
            />
            <Button
              type="submit"
              className="rounded-none h-10 px-6 uppercase text-[10px] tracking-wider font-semibold bg-[#3A2222] text-white hover:bg-[#2A1818] transition-colors"
            >
              Assinar
            </Button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-20 pt-8 border-t border-muted/50 flex flex-col md:flex-row items-center justify-between text-[10px] text-muted-foreground gap-4">
        <p>{getText('footer_copyright', '© 2024 Zahra Brasil. Todos os direitos reservados.')}</p>
        <p>{getText('footer_whatsapp', 'WhatsApp: (11) 93416-0219')}</p>
      </div>
    </footer>
  )
}
