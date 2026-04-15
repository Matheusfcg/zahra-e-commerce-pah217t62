import { useState, useRef, useEffect } from 'react'
import { User as UserIcon, LogOut, ShoppingBag, Heart, Settings, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  full_name: string | null
  document_number: string | null
  phone: string | null
  avatar_url: string | null
}

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signIn, signUp, signOut } = useAuth()
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [view, setView] = useState<'menu' | 'settings'>('menu')
  const [loading, setLoading] = useState(false)

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
  const [editAvatar, setEditAvatar] = useState('')

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
      setEditAvatar(data.avatar_url || '')
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setTimeout(() => setView('menu'), 300)
    }, 400)
  }

  const toggleMenu = () => setIsOpen(!isOpen)

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
      avatar_url: editAvatar,
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

  return (
    <div className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={toggleMenu}
        className="hover:text-gold transition-colors flex items-center justify-center p-2 -m-2"
      >
        {user ? (
          <Avatar className="h-6 w-6 border border-current">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-[10px] bg-secondary/80 text-foreground">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-[340px] bg-background text-foreground shadow-2xl border border-border rounded-3xl p-5 z-50 animate-fade-in-up origin-top-right">
          <div className="absolute -top-2 right-4 w-4 h-4 bg-background border-t border-l border-border transform rotate-45"></div>

          <div className="relative z-10">
            {!user ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Senha</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form
                    onSubmit={handleRegister}
                    className="space-y-3 max-h-[50vh] overflow-y-auto px-1 pb-1"
                  >
                    <div className="space-y-1">
                      <Label>Nome Completo</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Senha</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>CPF / Documento</Label>
                      <Input
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Celular</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                      {loading ? 'Cadastrando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : view === 'menu' ? (
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-3 border-2 border-gold/30 shadow-sm">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl bg-secondary">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg text-center truncate w-full px-2">
                  {profile?.full_name || 'Usuário Zahrá'}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 truncate w-full text-center px-2">
                  {user.email}
                </p>

                <div className="w-full space-y-1.5 border-t pt-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium"
                    onClick={() => {}}
                  >
                    <ShoppingBag className="mr-3 h-4 w-4" /> Minhas Compras
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium"
                    onClick={() => {}}
                  >
                    <Heart className="mr-3 h-4 w-4" /> Itens Salvos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium"
                    onClick={() => setView('settings')}
                  >
                    <Settings className="mr-3 h-4 w-4" /> Configurações
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Sair da Conta
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center mb-4 pb-2 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2 -ml-2"
                    onClick={() => setView('menu')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">Configurações</h3>
                </div>
                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-3 max-h-[50vh] overflow-y-auto px-1 pb-1"
                >
                  <div className="space-y-1">
                    <Label>URL da Foto de Perfil</Label>
                    <Input
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Nome Completo</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>CPF / Documento</Label>
                    <Input value={editDoc} onChange={(e) => setEditDoc(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Celular</Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
