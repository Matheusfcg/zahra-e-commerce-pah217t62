import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cep, items } = await req.json()
    if (!cep) throw new Error('CEP is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing DB credentials')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const clientId = Deno.env.get('MELHOR_ENVIO_CLIENT_ID') || '26564'
    const clientSecret =
      Deno.env.get('MELHOR_ENVIO_SECRET') || 'zMP0qTLRTmxJ4TqauO4U4tVbWWEq73I0MvNWtYxM'
    const apiUrl = Deno.env.get('MELHOR_ENVIO_URL') || 'https://melhorenvio.com.br'

    // Fetch tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('shipping_tokens')
      .select('*')
      .limit(1)
      .single()
    if (tokensError || !tokens)
      throw new Error(
        'Melhor Envio não configurado. Por favor, autorize no painel de administração.',
      )

    let accessToken = tokens.access_token

    // Check expiration (refresh if expires in less than 5 minutes)
    if (new Date(tokens.expires_at).getTime() < Date.now() + 5 * 60 * 1000) {
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

    // Call Quote API
    const products = items.map((i: any) => ({
      id: i.id || 'product',
      width: 15,
      height: 15,
      length: 15,
      weight: 0.5,
      insurance_value: i.price || 0,
      quantity: i.quantity || 1,
    }))

    const quoteReq = await fetch(`${apiUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: { postal_code: '01153000' }, // Default Store Origin CEP (Sao Paulo)
        to: { postal_code: cep.replace(/\D/g, '') },
        products,
      }),
    })

    const quoteData = await quoteReq.json()
    if (!quoteReq.ok) {
      console.error('Quote Error:', quoteData)
      throw new Error(quoteData.message || 'Falha ao calcular frete')
    }

    // Filter valid quotes
    const quotes = Array.isArray(quoteData) ? quoteData.filter((q: any) => !q.error && q.price) : []

    return new Response(JSON.stringify({ quotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
