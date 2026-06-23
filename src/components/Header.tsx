import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Menu, User, Phone, Mail, Instagram, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileMenu } from '@/components/ProfileMenu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import logoZahra from '../assets/logozahra-e51d5.png'

const appCategories = [
  'Conjuntos',
  'Macaquinhos',
  'Blusas e Bodies',
  'Saias',
  'Calças',
  'Malhas',
  'Básicos',
]

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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background text-foreground shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24 relative gap-4">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 lg:gap-6 lg:flex-1 justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-current hover:bg-transparent -ml-2 shrink-0"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Link to="/" className="inline-block shrink-0">
              <img
                src={logoZahra}
                alt="Zahrá Brazil"
                className="h-[35px] md:h-[45px] object-contain hover:scale-105 transition-all duration-300"
                style={{ imageRendering: 'high-quality' }}
              />
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden lg:flex justify-center lg:flex-[2]">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1 xl:space-x-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent hover:bg-transparent',
                      )}
                    >
                      Inicio
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/troca-e-devolucao"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent hover:bg-transparent',
                      )}
                    >
                      Troca e devolução
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent">
                    Compre agora
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[240px] gap-1 p-4 bg-white shadow-md border rounded-md">
                      {appCategories.map((cat) => (
                        <li key={cat}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/produtos?category=${encodeURIComponent(cat)}`}
                              className="block select-none rounded-md px-4 py-3 text-[13px] leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted font-medium uppercase tracking-wider"
                            >
                              {cat}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="mailto:saczharabrasil@gmail.com"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'bg-transparent hover:bg-transparent',
                      )}
                    >
                      Fale conosco
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/admin/upload"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'text-[#3c6e47] font-bold bg-transparent hover:bg-transparent',
                        )}
                      >
                        ADMIN
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-5 lg:flex-1">
            <div className="hidden md:block relative w-full max-w-[150px] xl:max-w-[180px]">
              <Input
                placeholder="Buscar"
                className="pl-4 pr-10 rounded-none h-9 border border-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground bg-transparent text-xs"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <button className="md:hidden hover:opacity-70 transition-opacity">
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden lg:block">
              <ProfileMenu
                renderTrigger={() => (
                  <button className="flex items-center gap-2 px-1 py-2 hover:opacity-70 transition-opacity">
                    <User className="h-5 w-5 md:h-[20px] md:w-[20px]" />
                  </button>
                )}
              />
            </div>

            <Link to="/favoritos" className="hover:opacity-70 transition-opacity hidden md:block">
              <Heart className="h-5 w-5 md:h-[20px] md:w-[20px]" />
            </Link>

            <button
              onClick={openDrawer}
              className="relative hover:opacity-70 transition-opacity flex items-center"
            >
              <ShoppingBag className="h-5 w-5 md:h-[20px] md:w-[20px]" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
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
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-sm font-medium hover:bg-muted transition-colors uppercase tracking-wider"
              >
                Início
              </Link>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="compre-agora" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline text-sm font-medium uppercase tracking-wider">
                    Compre agora
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col bg-muted/30 py-2">
                      {appCategories.map((cat) => (
                        <Link
                          key={cat}
                          to={`/produtos?category=${encodeURIComponent(cat)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-8 py-3 text-[13px] hover:bg-muted transition-colors uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Link
                to="/troca-e-devolucao"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-sm font-medium hover:bg-muted transition-colors uppercase tracking-wider"
              >
                Troca e devolução
              </Link>

              <a
                href="mailto:saczharabrasil@gmail.com"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-sm font-medium hover:bg-muted transition-colors uppercase tracking-wider"
              >
                Fale conosco
              </a>

              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="atendimento" className="border-b-0 border-t">
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
                        <Phone className="h-4 w-4" /> (11) 93416-0219
                      </a>
                      <a
                        href="mailto:saczharabrasil@gmail.com"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" /> saczharabrasil@gmail.com
                      </a>
                      <a
                        href="https://www.instagram.com/zahra__brasil?igsh=bzR5NjV6eHo3d21l"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:text-foreground"
                      >
                        <Instagram className="h-4 w-4" /> @zahra__brasil
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
                    className="block px-6 py-4 text-sm font-bold text-[#3c6e47] uppercase tracking-wider hover:bg-muted transition-colors"
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
