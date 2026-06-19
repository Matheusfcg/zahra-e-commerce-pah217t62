import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import logoZahra from '../assets/logozahra-e51d5.png'

export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t py-20 font-sans">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        <div className="space-y-4">
          <Link to="/" className="inline-block mb-4">
            <img
              src={logoZahra}
              alt="Zahrá Brazil"
              className="h-[53px] w-[53px] object-cover rounded-full"
            />
          </Link>
          <p className="text-sm opacity-80 leading-relaxed max-w-xs">
            A essência do estilo minimalista. Peças autorais desenhadas no Brasil com materiais
            premium e compromisso com a excelência.
          </p>
        </div>

        <div>
          <h4 className="font-semibold uppercase tracking-wider text-xs mb-6">Atendimento</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
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
          <h4 className="font-semibold uppercase tracking-wider text-xs mb-6">Institucional</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
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
          <h4 className="font-semibold uppercase tracking-wider text-xs mb-6">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-6">
            Inscreva-se para receber novidades e acesso antecipado a coleções exclusivas.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Seu e-mail"
              className="bg-transparent border-border focus-visible:ring-foreground rounded-none h-11"
            />
            <Button
              type="submit"
              className="rounded-none h-11 px-8 uppercase text-xs tracking-wider font-semibold"
            >
              Assinar
            </Button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>&copy; {new Date().getFullYear()} Zahrá Brazil. Todos os direitos reservados.</p>
        <p>WhatsApp: (11) 93416-0219</p>
      </div>
    </footer>
  )
}
