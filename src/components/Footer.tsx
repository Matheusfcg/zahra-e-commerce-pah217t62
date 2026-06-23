import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Instagram, Facebook, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#FAFAF8] text-foreground border-t border-muted/50 pt-16 pb-8 font-sans">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* 1. Newsletter Section */}
        <div className="text-center mb-16 max-w-2xl w-full px-4">
          <h3 className="text-2xl md:text-3xl font-serif text-[#3A2222] mb-4 tracking-[0.05em]">
            Assine a nossa Newsletter e fique por dentro
          </h3>
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Receba os nossos lançamentos e novidades exclusivas em primeira mão.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-0 shadow-sm border border-muted/30"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="bg-white border-0 focus-visible:ring-0 rounded-none h-14 px-6 text-sm flex-1"
            />
            <Button
              type="submit"
              className="rounded-none h-14 px-10 uppercase text-xs tracking-[0.15em] font-semibold bg-[#3A2222] text-white hover:bg-[#2A1818] transition-colors"
            >
              Assinar
            </Button>
          </form>
        </div>

        {/* 2. Content Sections */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 py-12 border-t border-muted/50 text-center md:text-left">
          {/* Payment Methods */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-5 text-[#3A2222]">
              Formas de Pagamento
            </h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center opacity-80">
              <span className="px-3 py-1.5 border border-muted-foreground/30 text-xs font-medium rounded-sm bg-white">
                PIX
              </span>
              <span className="px-3 py-1.5 border border-muted-foreground/30 text-xs font-medium rounded-sm bg-white">
                VISA
              </span>
              <span className="px-3 py-1.5 border border-muted-foreground/30 text-xs font-medium rounded-sm bg-white">
                MASTERCARD
              </span>
              <span className="px-3 py-1.5 border border-muted-foreground/30 text-xs font-medium rounded-sm bg-white">
                AMEX
              </span>
              <span className="px-3 py-1.5 border border-muted-foreground/30 text-xs font-medium rounded-sm bg-white">
                ELO
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-center">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-5 text-[#3A2222]">
              Fale Conosco
            </h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a
                href="mailto:saczharabrasil@gmail.com"
                className="flex items-center justify-center gap-2 hover:text-[#3A2222] transition-colors"
              >
                <Mail className="h-4 w-4" /> saczharabrasil@gmail.com
              </a>
              <Link
                to="/troca-e-devolucao"
                className="block hover:text-[#3A2222] transition-colors text-center"
              >
                Políticas de Troca e Devolução
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] mb-5 text-[#3A2222]">
              Redes Sociais
            </h4>
            <div className="flex items-center gap-5">
              <a
                href="https://www.instagram.com/zahra__brasil?igsh=bzR5NjV6eHo3d21l"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-full border border-muted-foreground/20 text-muted-foreground hover:text-[#3A2222] hover:border-[#3A2222] transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-full border border-muted-foreground/20 text-muted-foreground hover:text-[#3A2222] hover:border-[#3A2222] transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full text-center mt-4 pt-8 border-t border-muted/50 text-[11px] tracking-wide text-muted-foreground/80">
          <p>© 2026 Zahra Brasil. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
