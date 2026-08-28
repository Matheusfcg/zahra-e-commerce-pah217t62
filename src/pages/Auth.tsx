import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone, Calendar } from 'lucide-react'

type AuthMode = 'login' | 'register' | 'reset'

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`
    }
    setPhone(value)
  }

  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, redirectTo])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email.trim()) {
      errs.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'E-mail inválido'
    }
    if (mode !== 'reset') {
      if (!password) {
        errs.password = 'Senha é obrigatória'
      } else if (password.length < 6) {
        errs.password = 'Senha deve ter no mínimo 6 caracteres'
      }
    }
    if (mode === 'register') {
      if (!fullName.trim()) {
        errs.fullName = 'Nome é obrigatório'
      }
      if (!phone.trim()) {
        errs.phone = 'Telefone é obrigatório'
      } else if (phone.replace(/\D/g, '').length < 10) {
        errs.phone = 'Telefone inválido'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          toast({ title: error.message || 'Erro ao entrar', variant: 'destructive' })
        } else {
          toast({ title: 'Bem-vindo de volta!' })
          navigate(redirectTo, { replace: true })
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email.trim(), password, {
          full_name: fullName,
          phone,
          birth_date: birthDate || null,
        })
        if (error) {
          toast({ title: error.message || 'Erro ao cadastrar', variant: 'destructive' })
        } else {
          // Trigger welcome email directly in background as well (alongside database trigger)
          supabase.functions
            .invoke('process-order-notifications', {
              body: {
                event_type: 'welcome_email',
                customer_email: email.trim(),
                customer_name: fullName.trim() || 'Cliente',
              },
            })
            .catch((err) => console.warn('Welcome notification trigger note:', err))

          toast({ title: 'Conta criada com sucesso! Faça login para continuar.' })
          setMode('login')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email.trim())
        if (error) {
          toast({ title: error.message || 'Erro ao enviar e-mail', variant: 'destructive' })
        } else {
          toast({ title: 'E-mail de recuperação enviado!' })
          setMode('login')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'pl-10 h-12 rounded-none'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] pt-20 pb-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl tracking-[0.15em] text-[#2D0B0B] uppercase">
              MEYVES
            </span>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-8">
          <h1 className="font-serif text-2xl text-[#2D0B0B] mb-6 text-center">
            {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputCls}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={inputCls}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={inputCls}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-muted-foreground hover:text-[#2D0B0B] hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-none bg-[#2D0B0B] hover:bg-[#1a0606] text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                'Entrar'
              ) : mode === 'register' ? (
                'Criar Conta'
              ) : (
                'Enviar E-mail'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {mode === 'login' && (
              <button
                onClick={() => setMode('register')}
                className="text-sm text-[#2D0B0B] hover:underline"
              >
                Não tem conta? Cadastre-se
              </button>
            )}
            {mode === 'register' && (
              <button
                onClick={() => setMode('login')}
                className="text-sm text-[#2D0B0B] hover:underline"
              >
                Já tem conta? Entrar
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => setMode('login')}
                className="text-sm text-[#2D0B0B] hover:underline"
              >
                Voltar para login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao continuar, você concorda com os{' '}
          <Link to="/troca-e-devolucao" className="hover:underline">
            Termos de Uso
          </Link>
        </p>
      </div>
    </div>
  )
}
