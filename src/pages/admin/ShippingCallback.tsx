import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export default function ShippingCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = searchParams.get('code')
    if (!code) {
      setStatus('error')
      toast({ title: 'Código de autorização não encontrado.', variant: 'destructive' })
      return
    }

    const exchangeToken = async () => {
      try {
        const redirectUri = `${window.location.origin}/shipping-callback`
        const { error } = await supabase.functions.invoke('melhor-envio-token-exchange', {
          body: { code, redirect_uri: redirectUri },
        })

        if (error) throw error

        setStatus('success')
        toast({ title: 'Integração com Melhor Envio concluída!' })
        setTimeout(() => navigate('/admin/upload'), 3000)
      } catch (err) {
        console.error(err)
        setStatus('error')
        toast({ title: 'Erro ao integrar com Melhor Envio', variant: 'destructive' })
      }
    }

    exchangeToken()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border rounded-lg p-8 shadow-sm bg-card text-center space-y-6">
        {status === 'processing' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-medium">Conectando ao Melhor Envio</h2>
            <p className="text-muted-foreground">
              Por favor aguarde enquanto processamos sua autorização...
            </p>
          </>
        )}

        {status === 'success' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-green-600">Integração Concluída!</h2>
            <p className="text-muted-foreground">
              Sua conta do Melhor Envio foi conectada com sucesso. Você será redirecionado em
              instantes.
            </p>
            <Button variant="outline" onClick={() => navigate('/admin/upload')} className="mt-4">
              Voltar ao Painel
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-medium text-red-600">Falha na Integração</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro ao processar a autorização. O código pode ter expirado ou ser
              inválido.
            </p>
            <Button onClick={() => navigate('/admin/upload')} className="mt-4">
              Voltar ao Painel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
