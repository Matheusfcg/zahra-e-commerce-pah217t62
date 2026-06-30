import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cep, items } = await req.json()

    if (!cep) {
      return new Response(JSON.stringify({ error: 'CEP é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do banco de dados ausente')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const clientId = Deno.env.get('MELHOR_ENVIO_CLIENT_ID') || '26564'
    const clientSecret =
      Deno.env.get('MELHOR_ENVIO_CLIENT_SECRET') ||
      Deno.env.get('MELHOR_ENVIO_SECRET') ||
      'zMP0qTLRTmxJ4TqauO4U4tVbWWEq73I0MvNWtYxM'
    const apiUrl = Deno.env.get('MELHOR_ENVIO_URL') || 'https://melhorenvio.com.br'

    const { data: tokens, error: tokensError } = await supabase
      .from('shipping_tokens')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokensError) {
      console.error('Token query error:', tokensError)
      throw new Error('Erro ao consultar tokens de frete')
    }

    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      throw new Error(
        'Melhor Envio não configurado. Por favor, autorize no painel de administração.',
      )
    }

    let accessToken = tokens.access_token

    const expiresAt = new Date(tokens.expires_at).getTime()
    if (isNaN(expiresAt) || expiresAt < Date.now() + 5 * 60 * 1000) {
      const refreshReq = await fetch(`${apiUrl}/oauth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      })

      const refreshData = await refreshReq.json()
      if (!refreshReq.ok) {
        console.error('Refresh Error:', refreshData)
        throw new Error('Falha ao atualizar token. Por favor, reconecte no painel.')
      }

      accessToken = refreshData.access_token
      await supabase
        .from('shipping_tokens')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokens.id)
    }

    const products = items.map((i: any) => ({
      id: i.id || 'product',
      width: Number(i.width_cm) || 15,
      height: Number(i.height_cm) || 15,
      length: Number(i.length_cm) || 15,
      weight: i.weight_g ? Number(i.weight_g) / 1000 : 0.5,
      insurance_value: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
    }))

    const quoteReq = await fetch(`${apiUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: { postal_code: '01153000' },
        to: { postal_code: cep.replace(/\D/g, '') },
        products,
      }),
    })

    const quoteData = await quoteReq.json()
    if (!quoteReq.ok) {
      console.error('Quote Error:', quoteData)
      throw new Error(quoteData.message || 'Falha ao calcular frete')
    }

    const quotes = Array.isArray(quoteData) ? quoteData.filter((q: any) => !q.error && q.price) : []

    return new Response(JSON.stringify({ quotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('melhor-envio-quote error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Erro interno do servidor' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
