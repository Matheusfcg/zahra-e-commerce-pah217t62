import { useState, useEffect, useRef } from 'react'
import { User as UserIcon, LogOut, ShoppingBag, Heart, Settings, KeyRound } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface UserProfile {
  id: string
  full_name: string | null
  document_number: string | null
  phone: string | null
  avatar_url?: string | null
}

interface ProfileMenuProps {
  renderTrigger?: (user: any, profile: UserProfile | null) => React.ReactNode
}

export function ProfileMenu({ renderTrigger }: ProfileMenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const { user, signIn, signUp, signOut, resetPassword, updatePassword } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Auth Forms
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [phone, setPhone] = useState('')

  // Settings Form
  const [editName, setEditName] = useState('')
  const [editDoc, setEditDoc] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editPassword, setEditPassword] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
      setAuthModalOpen(false)
    } else {
      setProfile(null)
    }
  }, [user])

  useEffect(() => {
    if (!authModalOpen) {
      const t = setTimeout(() => {
        setIsForgotPassword(false)
        setLoginError(null)
      }, 300)
      return () => clearTimeout(t)
    } else {
      setLoginError(null)
    }
  }, [authModalOpen])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)

    try {
      const cleanEmail = email.trim()
      const cleanPassword = password.trim()

      const { error } = await signIn(cleanEmail, cleanPassword)

      if (error) {
        const isInvalidCredentials =
          error?.status === 400 ||
          error?.code === 'invalid_credentials' ||
          error?.message?.toLowerCase().includes('invalid login credentials') ||
          error?.message?.toLowerCase().includes('invalid login')

        const errorMessage = isInvalidCredentials
          ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
          : error?.message || 'Ocorreu um erro ao fazer login.'

        setLoginError(errorMessage)
        toast({
          title: 'Erro no login',
          description: errorMessage,
          variant: 'destructive',
        })
        return // Abort subsequent state updates per AC guard clause
      }

      toast({ title: 'Login realizado com sucesso!' })
      setAuthModalOpen(false)
    } catch (err) {
      setLoginError('Ocorreu um erro inesperado ao fazer login.')
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado ao fazer login.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()

    if (cleanPassword.length < 6) {
      toast({
        title: 'Atenção',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    const { error } = await signUp(cleanEmail, cleanPassword, {
      full_name: name.trim(),
      document_number: document.trim(),
      phone: phone.trim(),
    })
    setLoading(false)
    if (error)
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Cadastro realizado!', description: 'Sua conta foi criada com sucesso.' })
      setAuthTab('login')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: 'Atenção', description: 'Digite seu email primeiro.', variant: 'destructive' })
      return
    }
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Email enviado',
        description: 'Enviamos um link de recuperação para seu email.',
      })
      setIsForgotPassword(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    if (editPassword) {
      const { error: pwdError } = await updatePassword(editPassword)
      if (pwdError) {
        toast({
          title: 'Erro ao atualizar senha',
          description: pwdError.message,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }
    }

    const updates = { full_name: editName, document_number: editDoc, phone: editPhone }
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

    setLoading(false)
    if (error)
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Perfil atualizado!' })
      fetchProfile()
      setSettingsOpen(false)
      setEditPassword('')
    }
  }

  const renderUnauthMenu = () => (
    <div className="flex flex-col items-center p-2 text-center h-full">
      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4 mt-4 md:mt-0">
        <UserIcon className="h-8 w-8 text-foreground/70" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Bem-vindo à Zahrá</h3>
      <p className="text-sm text-muted-foreground mb-6 px-4">
        Faça login ou crie sua conta para acompanhar seus pedidos e salvar seus itens favoritos.
      </p>
      <div className="w-full space-y-3 mt-auto mb-4 md:mb-0 md:mt-0">
        <Button
          className="w-full h-12 rounded-xl text-base font-medium"
          onClick={() => {
            setIsOpen(false)
            setTimeout(() => {
              setAuthTab('login')
              setIsForgotPassword(false)
              setAuthModalOpen(true)
            }, 350)
          }}
        >
          Entrar
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl text-base font-medium border-border"
          onClick={() => {
            setIsOpen(false)
            setTimeout(() => {
              setAuthTab('register')
              setIsForgotPassword(false)
              setAuthModalOpen(true)
            }, 350)
          }}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  )

  const renderAuthMenu = () => (
    <div className="flex flex-col items-center pt-2">
      <Avatar className="h-20 w-20 mb-4 border-2 border-primary/10 shadow-sm">
        {profile?.avatar_url && (
          <AvatarImage
            src={profile.avatar_url}
            alt={profile.full_name || 'Usuário'}
            className="w-full h-full object-cover"
          />
        )}
        <AvatarFallback className="text-2xl bg-secondary text-foreground">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <h3 className="font-semibold text-lg text-center truncate w-full px-2">
        {profile?.full_name || 'Usuário Zahrá'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 truncate w-full text-center px-2">
        {user?.email}
      </p>

      <div className="w-full space-y-1 border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start font-medium h-12 text-base rounded-xl hover:bg-secondary/50"
          onClick={() => setIsOpen(false)}
        >
          <ShoppingBag className="mr-3 h-5 w-5 text-muted-foreground" /> Minhas Compras
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-medium h-12 text-base rounded-xl hover:bg-secondary/50"
          onClick={() => setIsOpen(false)}
        >
          <Heart className="mr-3 h-5 w-5 text-muted-foreground" /> Itens Salvos
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-medium h-12 text-base rounded-xl hover:bg-secondary/50"
          onClick={() => {
            setIsOpen(false)
            setTimeout(() => {
              setAvatarPreviewUrl(null)
              setSettingsOpen(true)
            }, 350)
          }}
        >
          <Settings className="mr-3 h-5 w-5 text-muted-foreground" /> Configurações
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start font-medium text-destructive hover:text-destructive hover:bg-destructive/10 h-12 text-base mt-2 rounded-xl"
          onClick={() => {
            signOut()
            setIsOpen(false)
          }}
        >
          <LogOut className="mr-3 h-5 w-5" /> Sair da Conta
        </Button>
      </div>
    </div>
  )

  const triggerButton = renderTrigger ? (
    renderTrigger(user, profile)
  ) : (
    <button className="hover:text-gold transition-colors flex items-center justify-center p-2 -m-2 outline-none">
      {user ? (
        <Avatar className="h-6 w-6 border border-current">
          {profile?.avatar_url && (
            <AvatarImage
              src={profile.avatar_url}
              alt={profile.full_name || 'Usuário'}
              className="w-full h-full object-cover"
            />
          )}
          <AvatarFallback className="text-[10px] bg-secondary/80 text-foreground">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <UserIcon className="h-5 w-5" />
      )}
    </button>
  )

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="right"
          className="w-[85vw] sm:w-[400px] p-6 pt-16 border-l rounded-l-3xl"
        >
          <SheetHeader className="hidden">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          {user ? renderAuthMenu() : renderUnauthMenu()}
        </SheetContent>
      </Sheet>

      {/* AUTH DIALOG */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[440px] p-0 overflow-hidden rounded-[2rem] border-border/50 max-h-[90dvh] md:max-h-[85vh] flex flex-col">
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 pb-12 sm:pb-8">
            {isForgotPassword ? (
              <div className="space-y-6 animate-fade-in">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-semibold text-center">
                    Recuperar Senha
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Digite seu email abaixo e enviaremos um link para redefinir sua senha.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium pl-1">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                      placeholder="seu@email.com"
                      required
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </div>
                  <div className="pt-2 space-y-3">
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-12 rounded-xl text-base"
                      onClick={() => setIsForgotPassword(false)}
                      disabled={loading}
                    >
                      Voltar para o login
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-semibold text-center">
                    {authTab === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {authTab === 'login'
                      ? 'Insira seus dados para continuar.'
                      : 'Preencha os campos abaixo para se cadastrar.'}
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={authTab}
                  onValueChange={(v) => {
                    setAuthTab(v as 'login' | 'register')
                    setLoginError(null)
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-2xl bg-secondary/50 p-1">
                    <TabsTrigger
                      value="login"
                      className="rounded-xl h-full text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-xl h-full text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-0 outline-none">
                    <form onSubmit={handleLogin} className="space-y-5">
                      {loginError && (
                        <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl animate-fade-in">
                          {loginError}
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="seu@email.com"
                          required
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pl-1 pr-1">
                          <Label className="text-sm font-medium">Senha</Label>
                          <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-all"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 mt-2 rounded-xl text-base font-semibold"
                        disabled={loading}
                      >
                        {loading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="mt-0 outline-none">
                    <form onSubmit={handleRegister} className="space-y-4 pb-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">Nome Completo</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="João da Silva"
                          required
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="seu@email.com"
                          required
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">Senha</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="No mínimo 6 caracteres"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">CPF / Documento</Label>
                        <Input
                          value={document}
                          onChange={(e) => setDocument(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="000.000.000-00"
                          required
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium pl-1">Celular</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                          placeholder="(00) 00000-0000"
                          required
                          inputMode="tel"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 mt-6 rounded-xl text-base font-semibold"
                        disabled={loading}
                      >
                        {loading ? 'Cadastrando...' : 'Criar Conta'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* SETTINGS DIALOG */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px] p-0 overflow-hidden rounded-[2rem] border-border/50 max-h-[90dvh] md:max-h-[85vh] flex flex-col">
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 pb-12 sm:pb-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-semibold">Configurações</DialogTitle>
              <DialogDescription>
                Atualize seus dados pessoais ou altere sua senha.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fileInput = fileInputRef.current
                const file = fileInput?.files?.[0]

                if (file) {
                  setUploadingAvatar(true)
                  try {
                    const { supabase } = await import('@/lib/supabase/client')
                    const {
                      data: { user },
                    } = await supabase.auth.getUser()
                    if (user) {
                      const ext = file.name.split('.').pop() || 'jpg'
                      const fileName = `${user.id}-${Date.now()}.${ext}`

                      const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(`${user.id}/${fileName}`, file, { upsert: true })

                      if (!uploadError) {
                        const {
                          data: { publicUrl },
                        } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/${fileName}`)

                        await supabase
                          .from('user_profiles')
                          .update({ avatar_url: publicUrl })
                          .eq('id', user.id)

                        const { toast } = await import('sonner')
                        toast.success('Foto de perfil atualizada!')
                      }
                    }
                  } catch (err) {
                    console.error('Error uploading avatar:', err)
                  } finally {
                    setUploadingAvatar(false)
                  }
                }

                // Proceed with standard update profile
                handleUpdateProfile(e as any)
              }}
              className="space-y-5"
            >
              <div className="flex flex-col items-center justify-center mb-2">
                <label htmlFor="avatar-upload-input" className="cursor-pointer group relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary/50 border-4 border-background shadow-sm flex items-center justify-center relative">
                    {avatarPreviewUrl || profile?.avatar_url ? (
                      <img
                        src={avatarPreviewUrl || profile?.avatar_url || ''}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                </label>
                <input
                  ref={fileInputRef}
                  id="avatar-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setAvatarPreviewUrl(url)
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="pl-1">Nome Completo</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="pl-1">CPF / Documento</Label>
                <Input
                  value={editDoc}
                  onChange={(e) => setEditDoc(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="pl-1">Celular</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                  required
                />
              </div>

              <div className="pt-4 border-t mt-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Segurança
                </h4>
                <div className="space-y-2">
                  <Label className="pl-1 text-muted-foreground">Nova Senha (opcional)</Label>
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/20 border-secondary/50"
                    placeholder="Deixe em branco para não alterar"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 rounded-xl text-base font-semibold"
                disabled={loading || uploadingAvatar}
              >
                {uploadingAvatar
                  ? 'Salvando Foto...'
                  : loading
                    ? 'Salvando...'
                    : 'Salvar Alterações'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
