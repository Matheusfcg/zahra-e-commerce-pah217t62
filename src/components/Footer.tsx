import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import logoZahra from '../assets/logozahra-e51d5.png'

export function Footer() {
  return (
    <footer className="bg-background text-primary border-t py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
          <h4 className="font-medium uppercase tracking-wider text-sm mb-6">Atendimento</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Contato
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Frete e Entregas
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Trocas e Devoluções
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Guia de Tamanhos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium uppercase tracking-wider text-sm mb-6">Institucional</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Nossa História
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Sustentabilidade
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Termos de Serviço
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gold transition-colors">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium uppercase tracking-wider text-sm mb-6">Newsletter</h4>
          <p className="text-sm opacity-80 mb-4">
            Inscreva-se para receber novidades e acesso antecipado a coleções exclusivas.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Seu e-mail"
              className="bg-transparent border-primary/20 focus-visible:ring-primary rounded-none"
            />
            <Button type="submit" className="rounded-none px-6">
              Assinar
            </Button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-primary/10 text-center text-xs opacity-60">
        <p>&copy; {new Date().getFullYear()} Zahrá Brazil. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
