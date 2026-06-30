import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing in environment')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user using the token sent from frontend
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify admin status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      throw new Error('Forbidden')
    }

    const { code, redirect_uri } = await req.json()
    if (!code) throw new Error('Code is required')

    const clientId = Deno.env.get('MELHOR_ENVIO_CLIENT_ID') || '26564'
    const clientSecret =
      Deno.env.get('MELHOR_ENVIO_SECRET') || 'zMP0qTLRTmxJ4TqauO4U4tVbWWEq73I0MvNWtYxM'
    const apiUrl = Deno.env.get('MELHOR_ENVIO_URL') || 'https://melhorenvio.com.br'

    if (!clientId || !clientSecret) {
      throw new Error('Melhor Envio credentials not configured in edge function secrets')
    }

    const response = await fetch(`${apiUrl}/oauth/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect_uri,
        code: code,
      }).toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Melhor Envio API error:', data)
      throw new Error(
        data.message || data.error_description || 'Failed to exchange token with Melhor Envio',
      )
    }

    // Save tokens in shipping_tokens table
    const { data: existing } = await supabase.from('shipping_tokens').select('id').limit(1).single()

    let dbError
    if (existing) {
      const { error } = await supabase
        .from('shipping_tokens')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      dbError = error
    } else {
      const { error } = await supabase.from('shipping_tokens').insert({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      dbError = error
    }

    if (dbError) {
      throw dbError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
