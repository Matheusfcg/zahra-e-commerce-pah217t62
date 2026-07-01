import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

type CallbackStatus = 'waiting' | 'processing' | 'success' | 'error'

const REDIRECT_DELAY_MS = 3000
const CODE_STORAGE_KEY = 'processed_melhor_envio_codes'

function getProcessedCodes(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(CODE_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function markCodeAsProcessed(code: string) {
  const codes = getProcessedCodes()
  if (!codes.includes(code)) {
    codes.push(code)
    sessionStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(codes))
  }
}

export default function ShippingCallback() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('waiting')
  const [errorMessage, setErrorMessage] = useState('')
  const exchangeAttempted = useRef(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDescription = searchParams.get('error_description')

  const scheduleRedirect = (delay: number = REDIRECT_DELAY_MS) => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    redirectTimerRef.current = setTimeout(() => navigate('/admin/upload'), delay)
  }

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (oauthError) {
      const reason = oauthErrorDescription || oauthError
      setStatus('error')
      setErrorMessage(reason)
      toast.error(`Falha na integração: ${reason}`)
      scheduleRedirect()
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMessage('Código de autorização não encontrado na URL.')
      toast.error('Falha na integração: Código de autorização não encontrado.')
      scheduleRedirect()
      return
    }

    const processedCodes = getProcessedCodes()
    if (processedCodes.includes(code)) {
      setStatus('error')
      setErrorMessage('Este código de autorização já foi utilizado.')
      toast.error('Falha na integração: Código de autorização já utilizado.')
      scheduleRedirect()
      return
    }

    if (loading) return

    if (!session) {
      setStatus('error')
      setErrorMessage('Sessão de autenticação não encontrada. Faça login novamente.')
      toast.error('Falha na integração: Sessão de autenticação não encontrada.')
      scheduleRedirect()
      return
    }

    if (exchangeAttempted.current) return
    exchangeAttempted.current = true

    setStatus('processing')

    const redirectUri = `${window.location.origin}/shipping-callback`

    supabase.functions
      .invoke('melhor-envio-token-exchange', {
        body: { code, redirect_uri: redirectUri },
      })
      .then(({ data, error: invokeError }) => {
        if (invokeError) {
          throw new Error(invokeError.message || 'Erro ao contatar o servidor')
        }

        if (data?.error) {
          throw new Error(data.error)
        }

        markCodeAsProcessed(code)
        setStatus('success')
        toast.success('Integração com Melhor Envio realizada com sucesso!')
        scheduleRedirect(2000)
      })
      .catch((err: any) => {
        const reason = err?.message || 'Erro desconhecido'
        setStatus('error')
        setErrorMessage(reason)
        toast.error(`Falha na integração: ${reason}`)
        exchangeAttempted.current = false
        scheduleRedirect(4000)
      })
  }, [code, oauthError, oauthErrorDescription, session, loading, navigate])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-md">
        {(status === 'waiting' || status === 'processing') && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-[#2D0B0B] mx-auto" />
            <h2 className="text-xl font-semibold text-[#2D0B0B]">Conectando com Melhor Envio...</h2>
            <p className="text-muted-foreground text-sm">
              Aguarde enquanto processamos sua autorização. Você será redirecionado em instantes.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-700">
              Integração realizada com sucesso!
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecionando para o painel administrativo...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-700">Falha na integração</h2>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
            <p className="text-muted-foreground text-xs">
              Redirecionando para o painel administrativo...
            </p>
          </>
        )}
      </div>
    </div>
  )
}
