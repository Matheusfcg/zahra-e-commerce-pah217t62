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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata,
      },
    })
    return { error }
  }
  const signIn = async (email: string, password: string) => {
    try {
      // Payload cleaning: Remove extraneous metadata that the GoTrue client might append
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('gotrue_meta_security')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        const isInvalidCredentials =
          error.status === 400 ||
          error.message?.toLowerCase().includes('invalid login credentials') ||
          error.message?.toLowerCase().includes('invalid login') ||
          error.name === 'AuthApiError'

        if (isInvalidCredentials) {
          return {
            data: null,
            error: {
              message: 'Credenciais inválidas. Verifique seu e-mail e senha.',
              code: 'invalid_credentials',
              status: 400,
            },
          }
        }
        return { data: null, error: { message: error.message, status: error.status || 500 } }
      }

      return { data, error: null }
    } catch (err: any) {
      return {
        data: null,
        error: {
          message: err?.message || 'Erro inesperado ao fazer login. Verifique sua conexão.',
          code: 'unknown_error',
          status: 500,
        },
      }
    }
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, resetPassword, updatePassword, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
