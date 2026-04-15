import { useState, useRef, useEffect } from 'react'
import { User as UserIcon, LogOut, ShoppingBag, Heart, Settings, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface UserProfile {
  id: string
  full_name: string | null
  document_number: string | null
  phone: string | null
}

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const { user, signIn, signUp, signOut } = useAuth()
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [view, setView] = useState<'menu' | 'settings'>('menu')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  // Auth Forms
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [phone, setPhone] = useState('')

  // Settings Form
  const [editName, setEditName] = useState('')
  const [editDoc, setEditDoc] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    if (user) fetchProfile()
    else {
      setProfile(null)
      setView('menu')
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setEditName(data.full_name || '')
      setEditDoc(data.document_number || '')
      setEditPhone(data.phone || '')
    }
  }

  const handleMouseEnter = () => {
    if (isMobile) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setTimeout(() => setView('menu'), 300)
    }, 400)
  }

  const toggleMenu = () => {
    if (isMobile) {
      setIsOpen(true)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast({ title: 'Erro no login', description: error.message, variant: 'destructive' })
    else toast({ title: 'Login realizado com sucesso!' })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, {
      full_name: name,
      document_number: document,
      phone,
    })
    setLoading(false)
    if (error)
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' })
    else toast({ title: 'Cadastro realizado!', description: 'Verifique seu email para confirmar.' })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const updates = {
      full_name: editName,
      document_number: editDoc,
      phone: editPhone,
    }
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

    setLoading(false)
    if (error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Perfil atualizado!' })
      fetchProfile()
      setView('menu')
    }
  }

  const renderContent = () => (
    <div className="relative z-10 flex flex-col h-full">
      {!user ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-base">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" className="text-base">
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="flex-1 mt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 mt-6 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="flex-1 mt-0">
            <form
              onSubmit={handleRegister}
              className="space-y-4 max-h-[75vh] md:max-h-[50vh] overflow-y-auto px-1 pb-4"
            >
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF / Documento</Label>
                <Input
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 mt-4 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      ) : view === 'menu' ? (
        <div className="flex flex-col items-center pt-2">
          <Avatar className="h-24 w-24 mb-4 border-2 border-gold/30 shadow-sm">
            <AvatarFallback className="text-3xl bg-secondary">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-xl text-center truncate w-full px-2">
            {profile?.full_name || 'Usuário Zahrá'}
          </h3>
          <p className="text-base text-muted-foreground mb-8 truncate w-full text-center px-2">
            {user.email}
          </p>

          <div className="w-full space-y-2 border-t pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start font-medium h-14 md:h-12 text-base"
              onClick={() => {}}
            >
              <ShoppingBag className="mr-4 h-5 w-5" /> Minhas Compras
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium h-14 md:h-12 text-base"
              onClick={() => {}}
            >
              <Heart className="mr-4 h-5 w-5" /> Itens Salvos
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium h-14 md:h-12 text-base"
              onClick={() => setView('settings')}
            >
              <Settings className="mr-4 h-5 w-5" /> Configurações
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium text-destructive hover:text-destructive hover:bg-destructive/10 h-14 md:h-12 text-base mt-2"
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
            >
              <LogOut className="mr-4 h-5 w-5" /> Sair da Conta
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-6 pb-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 mr-2 -ml-2"
              onClick={() => setView('menu')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h3 className="font-semibold text-lg">Configurações</h3>
          </div>
          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4 flex-1 overflow-y-auto px-1 pb-1"
          >
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>CPF / Documento</Label>
              <Input
                value={editDoc}
                onChange={(e) => setEditDoc(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Celular</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 mt-8 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )

  const triggerButton = (
    <button
      onClick={toggleMenu}
      className="hover:text-gold transition-colors flex items-center justify-center p-2 -m-2"
    >
      {user ? (
        <Avatar className="h-6 w-6 border border-current">
          <AvatarFallback className="text-[10px] bg-secondary/80 text-foreground">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <UserIcon className="h-5 w-5" />
      )}
    </button>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {triggerButton}
        <SheetContent side="right" className="w-full sm:w-[400px] p-6 pt-12 border-l">
          <SheetHeader className="hidden">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          {renderContent()}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {triggerButton}

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-[380px] bg-background text-foreground shadow-2xl border border-border rounded-3xl p-7 z-50 animate-fade-in-up origin-top-right">
          <div className="absolute -top-2 right-4 w-4 h-4 bg-background border-t border-l border-border transform rotate-45"></div>
          {renderContent()}
        </div>
      )}
    </div>
  )
}
