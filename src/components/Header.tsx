import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  User,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
} from 'lucide-react'
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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import logoZahra from '../assets/logozahra-e51d5.png'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const location = useLocation()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setIsAdmin(!!(data as any)?.is_admin))
    } else {
      setIsAdmin(false)
    }
  }, [user])

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
                      <a href="/#colecao" onClick={() => setMobileMenuOpen(false)}>
                        Nossa Coleção
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sale" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline font-serif text-xl text-[#D94F4F] font-normal">
                    Promoção
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-2 space-y-4 text-[#D94F4F]/80 font-medium">
                      <a href="/#promocao" onClick={() => setMobileMenuOpen(false)}>
                        Ofertas Especiais
                      </a>
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
                        href="https://wa.me/5511934160219"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        (11) 93416-0219
                      </a>
                      <a
                        href="mailto:saczharabrasil@gmail.com"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        saczharabrasil@gmail.com
                      </a>
                      <a
                        href="https://www.instagram.com/zahra__brasil?igsh=bzR5NjV6eHo3d21l"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Instagram className="h-4 w-4" />
                        @zahra__brasil
                      </a>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {isAdmin && (
                <div className="mt-2 border-t border-[#EFEAE2] pt-2">
                  <Link
                    to="/admin/upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 font-serif text-xl text-[#3d271d] font-normal hover:no-underline"
                  >
                    Administrador
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
