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
      return new Response(JSON.stringify({ error: 'Configuração do banco de dados ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const productIds = items.map((i: any) => i.id).filter(Boolean)
    let productDetailsMap: Record<string, any> = {}

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, weight_g, height_cm, width_cm, length_cm, price')
        .in('id', productIds)

      if (productsError) {
        console.error('Product query error:', productsError)
      } else if (products) {
        productDetailsMap = products.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }
    }

    let fromCep = '01153000'
    const { data: siteContent, error: siteContentError } = await supabase
      .from('site_content')
      .select('content_value')
      .eq('section_key', 'melhor_envio_settings')
      .maybeSingle()

    if (siteContentError) {
      console.error('Site content query error:', siteContentError)
    }

    if (siteContent?.content_value) {
      try {
        const settings = JSON.parse(siteContent.content_value)
        if (settings.from_cep) {
          fromCep = String(settings.from_cep).replace(/\D/g, '')
        }
      } catch {
        // ignore parse errors
      }
    }

    const clientId = Deno.env.get('MELHOR_ENVIO_CLIENT_ID') || '26564'
    const clientSecret =
      Deno.env.get('MELHOR_ENVIO_CLIENT_SECRET') ||
      Deno.env.get('MELHOR_ENVIO_SECRET') ||
      'zMP0qTLRTmxJ4TqauO4U4tVbWWEq73I0MvNWtYxM'
    const apiUrl = Deno.env.get('MELHOR_ENVIO_URL') || 'https://melhorenvio.com.br'

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          error:
            'Melhor Envio não configurado. Por favor, configure as credenciais no painel de administração.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: tokens, error: tokensError } = await supabase
      .from('shipping_tokens')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tokensError) {
      console.error('Token query error:', tokensError)
      return new Response(
        JSON.stringify({
          error: 'Erro ao consultar tokens de frete. Verifique a configuração do Melhor Envio.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      return new Response(
        JSON.stringify({
          error: 'Melhor Envio não configurado. Por favor, autorize no painel de administração.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let accessToken = tokens.access_token
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at).getTime() : 0
    const needsRefresh = isNaN(expiresAt) || expiresAt < Date.now() + 5 * 60 * 1000

    if (needsRefresh) {
      try {
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
          if (expiresAt > Date.now()) {
            console.warn('Refresh failed but token still valid, using existing token')
            accessToken = tokens.access_token
          } else {
            return new Response(
              JSON.stringify({
                error:
                  'Sessão do Melhor Envio expirada. Por favor, reconecte no painel de administração.',
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              },
            )
          }
        } else {
          accessToken = refreshData.access_token
          const { error: updateError } = await supabase
            .from('shipping_tokens')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', tokens.id)

          if (updateError) {
            console.error('Token update error:', updateError)
          }
        }
      } catch (refreshErr: any) {
        if (expiresAt > Date.now() && accessToken) {
          console.warn('Token refresh network error, using existing valid token:', refreshErr)
        } else {
          console.error('Token refresh failed:', refreshErr)
          return new Response(
            JSON.stringify({
              error:
                'Não foi possível atualizar a sessão do Melhor Envio. Tente novamente em instantes.',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
      }
    }

    const products = items.map((i: any) => {
      const dbProduct = productDetailsMap[i.id]
      const weightG = dbProduct?.weight_g ?? i.weight_g
      return {
        id: i.id || 'product',
        width: Number(dbProduct?.width_cm ?? i.width_cm) || 15,
        height: Number(dbProduct?.height_cm ?? i.height_cm) || 15,
        length: Number(dbProduct?.length_cm ?? i.length_cm) || 15,
        weight: weightG ? Number(weightG) / 1000 : 0.5,
        insurance_value: Number(dbProduct?.price ?? i.price) || 0,
        quantity: Number(i.quantity) || 1,
      }
    })

    const quoteReq = await fetch(`${apiUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: { postal_code: fromCep },
        to: { postal_code: cep.replace(/\D/g, '') },
        products,
      }),
    })

    const quoteData = await quoteReq.json()

    if (!quoteReq.ok) {
      console.error('Quote API Error:', {
        status: quoteReq.status,
        data: quoteData,
      })
      const errMsg =
        quoteData?.message ||
        quoteData?.error ||
        quoteData?.errors?.[0]?.message ||
        'Falha ao calcular frete'
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const quotes = Array.isArray(quoteData) ? quoteData.filter((q: any) => !q.error && q.price) : []

    return new Response(JSON.stringify({ quotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('melhor-envio-quote error:', err)
    return new Response(
      JSON.stringify({
        error: err.message || 'Erro interno do servidor. Tente novamente em instantes.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
