import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-current hover:bg-transparent -ml-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          <button className="hover:text-gold transition-colors hidden sm:block">
            <User className="h-5 w-5" />
          </button>
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
                className="h-6 md:h-8 object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-background text-foreground shadow-lg md:hidden animate-fade-in-down border-t">
          <nav className="flex flex-col p-4 gap-4 text-center uppercase tracking-wider text-sm">
            <Link
              to="/product/zahra-signature-tote"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-gold"
            >
              Feminino
            </Link>
            <Link to="#" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-gold">
              Masculino
            </Link>
            <Link to="#" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-gold">
              Acessórios
            </Link>
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
              <Search className="h-5 w-5" />
              <User className="h-5 w-5" />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
