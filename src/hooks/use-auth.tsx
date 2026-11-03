import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

// Mapeia o erro cru do Supabase para uma mensagem amigável e sem ambiguidade.
function toFriendlyError(error: { message?: string; status?: number; code?: string } | null) {
  if (!error) return null
  const msg = error.message || ''
  const lower = msg.toLowerCase()

  if (
    error.status === 400 &&
    (lower.includes('invalid login credentials') || lower.includes('invalid_grant'))
  ) {
    return {
      message: 'E-mail ou senha incorretos. Verifique e tente novamente.',
      code: 'invalid_credentials',
      status: 400,
    }
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return {
      message: 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
      code: 'email_not_confirmed',
      status: 400,
    }
  }
  if (lower.includes('too many requests') || error.status === 429) {
    return {
      message: 'Muitas tentativas seguidas. Aguarde um minuto e tente novamente.',
      code: 'rate_limited',
      status: 429,
    }
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed')
  ) {
    return {
      message: 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.',
      code: 'network_error',
      status: 0,
    }
  }
  return { message: msg || 'Erro inesperado ao fazer login.', status: error.status || 500 }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectOrigin ? `${redirectOrigin}/` : undefined,
        data: metadata,
      },
    })
    return { error: toFriendlyError(error) }
  }

  // Fluxo único e direto: signInWithPassword no cliente Supabase.
  // Sem fallbacks paralelos, sem manipulação de localStorage, sem segunda
  // chamada — o cliente já resolve rede/refresh/parse e devolve o erro real.
  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        console.warn('[Supabase Auth] signInWithPassword falhou:', {
          message: error.message,
          status: error.status,
          code: error.code,
        })
        return { data: null, error: toFriendlyError(error) }
      }

      return { data, error: null }
    } catch (err: any) {
      console.error('[Supabase Auth] Exceção no signIn:', err)
      return {
        data: null,
        error: toFriendlyError({
          message: err?.message || 'Erro inesperado ao fazer login.',
          status: err?.status,
        }),
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectOrigin ? `${redirectOrigin}/` : undefined,
    })
    return { error: toFriendlyError(error) }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: toFriendlyError(error) }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, resetPassword, updatePassword, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
