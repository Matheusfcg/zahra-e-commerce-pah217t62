import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Menu,
  User,
  Phone,
  Mail,
  Instagram,
  Heart,
  ChevronDown,
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
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import logoZahra from '../assets/logozahra-e51d5.png'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const location = useLocation()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

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
    setMobileMenuOpen(false)
  }, [location.pathname, location.search, location.hash])

  const navLinks = [
    { name: 'NEW IN', path: '/produtos' },
    { name: 'COLLECTIONS', path: '/#colecao' },
    { name: 'CONFECÇÃO SOFFI', path: '/produtos' },
    { name: 'PARTES DE CIMA', path: '/produtos?category=Parte%20de%20Cima' },
    { name: 'PARTES DE BAIXO', path: '/produtos?category=Parte%20de%20Baixo' },
    { name: 'PEÇA ÚNICA', path: '/produtos?category=Peça%20Única' },
    { name: 'CASACOS', path: '/produtos?category=Casacos' },
    { name: 'CONJUNTOS', path: '/produtos?category=Conjuntos' },
    { name: 'ACESSÓRIOS', path: '/produtos?category=Acessórios' },
    { name: 'SALE', path: '/#promocao', className: 'text-[#D94F4F]' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background text-foreground shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Search (Desktop) / Menu (Mobile) */}
          <div className="flex-1 md:w-1/3 flex items-center justify-start gap-2">
            <div className="hidden md:block relative w-full max-w-[280px]">
              <Input
                placeholder="Buscar"
                className="pl-4 pr-10 rounded-none h-10 border-foreground/20 focus-visible:ring-1 focus-visible:ring-foreground bg-transparent"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-current hover:bg-transparent -ml-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <button className="md:hidden hover:opacity-70 transition-opacity ml-2">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 md:w-1/3 flex justify-center">
            <Link to="/" className="inline-block">
              <img
                src={logoZahra}
                alt="Zahrá Brazil"
                className="h-[28px] md:h-[38px] object-contain hover:scale-105 transition-all duration-300"
                style={{ imageRendering: 'high-quality' }}
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 md:w-1/3 flex justify-end items-center gap-4 md:gap-6">
            <div className="hidden lg:block">
              <ProfileMenu
                renderTrigger={(user, profile) => (
                  <button className="flex items-center gap-2 border border-foreground/20 px-4 py-2 rounded-none hover:bg-muted transition-colors">
                    <User className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-wider font-medium whitespace-nowrap">
                      {user ? profile?.full_name?.split(' ')[0] || 'Minha conta' : 'Minha conta'}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                )}
              />
            </div>

            <Link to="/favoritos" className="hover:opacity-70 transition-opacity hidden md:block">
              <Heart className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </Link>

            <button
              onClick={openDrawer}
              className="relative hover:opacity-70 transition-opacity flex items-center"
            >
              <ShoppingBag className="h-5 w-5 md:h-[22px] md:w-[22px]" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom row: Links (Desktop) */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-[10px] lg:text-[11px] uppercase tracking-wider font-medium hover:opacity-70 transition-opacity whitespace-nowrap',
                link.className,
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[400px] p-0 flex flex-col bg-background border-r-0"
        >
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>

          <div className="flex flex-col h-full overflow-y-auto">
            {/* Auth Section */}
            <div className="bg-muted/30 px-6 py-8 relative border-b border-foreground/10">
              <ProfileMenu
                renderTrigger={(user, profile) => (
                  <button className="flex items-center gap-4 w-full text-left outline-none">
                    <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 text-background">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-xl">
                        {user
                          ? `Olá, ${profile?.full_name?.split(' ')[0] || 'Usuário'}`
                          : 'Entrar / Cadastrar'}
                      </span>
                    </div>
                  </button>
                )}
              />
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-6 py-4 text-sm font-medium hover:bg-muted transition-colors uppercase tracking-wider',
                    link.className,
                  )}
                >
                  {link.name}
                </Link>
              ))}

              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="atendimento" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-sm font-medium uppercase tracking-wider">
                    Atendimento
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col px-6 pb-4 space-y-5 text-sm text-muted-foreground mt-2">
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
                <div className="mt-2 border-t border-foreground/10 pt-2">
                  <Link
                    to="/admin/upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
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
