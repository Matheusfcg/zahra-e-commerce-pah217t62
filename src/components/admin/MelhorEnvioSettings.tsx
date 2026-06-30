import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function MelhorEnvioSettings() {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [checking, setChecking] = useState(true)
  const [clientId, setClientId] = useState('26564')
  const [fromCep, setFromCep] = useState('01153000')
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
    loadSettings()
  }, [])

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_tokens')
        .select('id, expires_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setConnected(true)
        setTokenExpiry(data.expires_at)
      } else {
        setConnected(false)
      }
    } catch {
      setConnected(false)
    } finally {
      setChecking(false)
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('section_key', 'melhor_envio_settings')
        .maybeSingle()

      if (data?.content_value) {
        const settings = JSON.parse(data.content_value)
        if (settings.client_id) setClientId(settings.client_id)
        if (settings.from_cep) setFromCep(settings.from_cep)
      }
    } catch {
      /* intentionally ignored */
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('section_key', 'melhor_envio_settings')
        .maybeSingle()

      const existingSettings = existing?.content_value ? JSON.parse(existing.content_value) : {}

      const contentValue = JSON.stringify({
        ...existingSettings,
        client_id: clientId,
        from_cep: fromCep,
      })

      await supabase.from('site_content').upsert(
        {
          section_key: 'melhor_envio_settings',
          content_value: contentValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_key' },
      )

      toast({ title: 'Configurações salvas com sucesso' })
    } catch {
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    const redirectUri = `${window.location.origin}/shipping-callback`
    const authUrl = `https://melhorenvio.com.br/oauth/authorize?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=shipping-calculate`
    window.location.href = authUrl
  }

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const isExpired = date < now
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}${isExpired ? ' (expirado)' : ''}`
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle>Integração Melhor Envio</CardTitle>
        <CardDescription>
          Configure a integração com Melhor Envio para calcular fretes automaticamente no checkout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          {checking ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : connected ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-700">Conectado</span>
                {tokenExpiry && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Válido até: {formatExpiry(tokenExpiry)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkConnection}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Verificar
              </Button>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-700">
                Não conectado. Clique em "Conectar" para autorizar.
              </span>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Client ID do Melhor Envio</Label>
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Ex: 26564"
          />
          <p className="text-xs text-muted-foreground">
            O Client ID é fornecido pelo Melhor Envio ao criar seu aplicativo OAuth.
          </p>
        </div>

        <div className="space-y-2">
          <Label>CEP de Origem (Loja)</Label>
          <Input
            value={fromCep}
            onChange={(e) => setFromCep(e.target.value.replace(/\D/g, ''))}
            placeholder="00000000"
            maxLength={8}
          />
          <p className="text-xs text-muted-foreground">
            CEP de origem usado para calcular o frete dos produtos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={saveSettings} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          <Button className="flex-1" onClick={handleConnect}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {connected ? 'Reconectar Melhor Envio' : 'Conectar Melhor Envio'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            <strong>URL de redirecionamento:</strong> {window.location.origin}/shipping-callback
          </p>
          <p>
            Configure esta URL no painel do Melhor Envio para que o callback funcione corretamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
