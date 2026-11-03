import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/supabase/client'

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
    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectOrigin ? `${redirectOrigin}/` : undefined,
        data: metadata,
      },
    })
    return { error }
  }
  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim()
    try {
      // Payload cleaning: Remove extraneous metadata that the GoTrue client might append
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('gotrue_meta_security')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        // If error is network/fetch failure, attempt direct fallback authentication
        const isNetworkFailure =
          error.message?.toLowerCase().includes('failed to fetch') ||
          error.message?.toLowerCase().includes('network') ||
          error.status === 0

        if (isNetworkFailure) {
          try {
            const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: cleanEmail,
                password,
              }),
            })

            const tokenData = await tokenRes.json()

            if (tokenRes.ok && tokenData.access_token) {
              const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
              })
              if (!sessionErr && sessionData) {
                return { data: sessionData, error: null }
              }
            } else if (tokenRes.status === 400 || tokenData.error === 'invalid_grant') {
              return {
                data: null,
                error: {
                  message: 'Credenciais inválidas. Verifique seu e-mail e senha.',
                  code: 'invalid_credentials',
                  status: 400,
                },
              }
            }
          } catch {
            // direct fetch fallback also failed
          }
        }

        const isInvalidCredentials =
          error.status === 400 ||
          error.message?.toLowerCase().includes('invalid login credentials') ||
          error.message?.toLowerCase().includes('invalid login') ||
          error.message?.toLowerCase().includes('invalid_grant') ||
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

        const friendlyMessage =
          error.message === 'Failed to fetch'
            ? 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.'
            : error.message

        return { data: null, error: { message: friendlyMessage, status: error.status || 500 } }
      }

      return { data, error: null }
    } catch (err: any) {
      // Direct fallback if GoTrue client threw an unhandled TypeError: Failed to fetch
      try {
        const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        })

        const tokenData = await tokenRes.json()

        if (tokenRes.ok && tokenData.access_token) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
          })
          if (!sessionErr && sessionData) {
            return { data: sessionData, error: null }
          }
        } else if (tokenRes.status === 400 || tokenData.error === 'invalid_grant') {
          return {
            data: null,
            error: {
              message: 'Credenciais inválidas. Verifique seu e-mail e senha.',
              code: 'invalid_credentials',
              status: 400,
            },
          }
        }
      } catch {
        // Direct fetch fallback also failed
      }

      const friendlyMsg =
        err?.message === 'Failed to fetch'
          ? 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.'
          : err?.message || 'Erro inesperado ao fazer login. Verifique sua conexão.'

      return {
        data: null,
        error: {
          message: friendlyMsg,
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
    const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectOrigin ? `${redirectOrigin}/` : undefined,
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
