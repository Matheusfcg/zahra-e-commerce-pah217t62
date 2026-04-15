import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Menu, X, User, Phone, Mail, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileMenu } from '@/components/ProfileMenu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import logoZahra from '../assets/logozahra-e51d5.png'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const location = useLocation()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerBg =
    isHome && !isScrolled ? 'bg-transparent text-white' : 'bg-background text-foreground shadow-sm'

  return (
    <header
      className={cn('fixed top-0 left-0 right-0 z-40 transition-colors duration-300', headerBg)}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-current hover:bg-transparent -ml-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Nav - Left */}
        <nav className="hidden md:flex flex-1 gap-8 text-sm uppercase tracking-wider font-medium items-center">
          <Link to="/product/zahra-signature-tote" className="hover:text-gold transition-colors">
            Feminino
          </Link>
          <Link to="#" className="hover:text-gold transition-colors">
            Masculino
          </Link>
          <Link to="#" className="hover:text-gold transition-colors">
            Acessórios
          </Link>
        </nav>

        {/* Icons & Logo - Right */}
        <div className="flex flex-1 justify-end items-center gap-4 md:gap-6">
          <button className="hover:text-gold transition-colors hidden sm:block">
            <Search className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <ProfileMenu />
          </div>
          <button
            onClick={openDrawer}
            className="relative hover:text-gold transition-colors mr-2 md:mr-4"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Logo - Top Right */}
          <div className="flex-shrink-0 flex items-center justify-center border-l border-current/20 pl-4 md:pl-6">
            <Link to="/" className="inline-block">
              <img
                src={logoZahra}
                alt="Zahrá Brazil"
                className="h-[29px] md:h-[37px] rounded-xl object-contain hover:scale-105 transition-all duration-300"
                style={{ imageRendering: 'high-quality' }}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[400px] p-0 flex flex-col bg-background border-r"
        >
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>

          <div className="flex flex-col h-full overflow-y-auto">
            {/* Auth Section */}
            <div className="border-b border-border">
              <ProfileMenu
                renderTrigger={(user, profile) => (
                  <button className="flex items-center gap-4 w-full p-6 text-left hover:bg-secondary/20 transition-colors outline-none">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-foreground/70" />
                    </div>
                    <div className="flex flex-col">
                      {user ? (
                        <>
                          <span className="font-semibold text-lg">
                            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}
                          </span>
                          <span className="text-sm text-muted-foreground">Minha Conta</span>
                        </>
                      ) : (
                        <span className="font-semibold text-lg">Entre ou Cadastre-se</span>
                      )}
                    </div>
                  </button>
                )}
              />
            </div>

            {/* Navigation Accordion */}
            <div className="flex-1 overflow-y-auto py-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="novidade" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-base font-medium">
                    Novidade
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground">
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Roupas
                      </Link>
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Sapatos
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tudo" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-base font-medium">
                    Tudo
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground">
                      <Link
                        to="/product/zahra-signature-tote"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Feminino
                      </Link>
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Masculino
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="acessorios" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-base font-medium">
                    Acessórios
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground">
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Bolsas
                      </Link>
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Cintos
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sale" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-base font-medium text-red-600">
                    Sale
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground">
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Até 50% OFF
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="atendimento" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-base font-medium">
                    Atendimento
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-4 space-y-5 text-sm text-muted-foreground mt-2">
                      <a href="tel:08000258990" className="flex items-center gap-3">
                        <Phone className="h-4 w-4" />
                        0800 025 8990
                      </a>
                      <a href="mailto:falecom@zahra.com.br" className="flex items-center gap-3">
                        <Mail className="h-4 w-4" />
                        falecom@zahra.com.br
                      </a>
                      <a href="https://wa.me/5547991067738" className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4" />
                        47 99106 7738
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
