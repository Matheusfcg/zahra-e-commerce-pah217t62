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
        {/* Left Section (Menu) */}
        <div className="flex-1 flex items-center justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="text-current hover:bg-transparent -ml-2"
          >
            <Menu className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
        </div>

        {/* Center Section (Logo) */}
        <div className="flex-1 flex justify-center">
          <Link to="/" className="inline-block">
            <img
              src={logoZahra}
              alt="Zahrá Brazil"
              className="h-[29px] md:h-[37px] rounded-xl object-contain hover:scale-105 transition-all duration-300"
              style={{ imageRendering: 'high-quality' }}
            />
          </Link>
        </div>

        {/* Right Section (Search+Bag) */}
        <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
          <button className="hover:text-gold transition-colors">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={openDrawer}
            className="relative hover:text-gold transition-colors md:mr-0"
          >
            <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[400px] p-0 flex flex-col bg-[#FAF8F5] border-r-0 text-[#3d271d]"
        >
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>

          <div className="flex flex-col h-full overflow-y-auto">
            {/* Auth Section */}
            <div className="bg-[#EFEAE2] px-6 py-10 relative">
              <ProfileMenu
                renderTrigger={(user, profile) => (
                  <button className="flex items-center gap-5 w-full text-left outline-none mt-2">
                    <div className="w-14 h-14 rounded-full bg-[#C2A878] flex items-center justify-center flex-shrink-0 text-[#4A3320]">
                      <User className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col">
                      {user ? (
                        <>
                          <span className="font-serif text-xl sm:text-2xl text-[#3d271d]">
                            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}
                          </span>
                          <span className="text-sm text-[#3d271d]/70 font-medium">Minha Conta</span>
                        </>
                      ) : (
                        <span className="font-serif text-xl sm:text-2xl text-[#3B2314]">
                          Entre ou Cadastre-se
                        </span>
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
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#3d271d] font-normal">
                    Novidade
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground font-medium">
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
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#3d271d] font-normal">
                    Tudo
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground font-medium">
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
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#3d271d] font-normal">
                    Acessórios
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-muted-foreground font-medium">
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
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#D94F4F] font-normal">
                    Promoção
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-[#D94F4F]/80 font-medium">
                      <Link to="#" onClick={() => setMobileMenuOpen(false)}>
                        Até 50% OFF
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="atendimento" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#3d271d] font-normal">
                    Atendimento
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-4 space-y-5 text-sm text-muted-foreground font-medium mt-2">
                      <a
                        href="tel:08000258990"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        0800 025 8990
                      </a>
                      <a
                        href="mailto:falecom@zahra.com.br"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        falecom@zahra.com.br
                      </a>
                      <a
                        href="https://wa.me/5547991067738"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
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
