// Supabase Edge Function: create-user
// Desplegar amb: supabase functions deploy create-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the request body
    const { email, password, full_name, phone_number, is_active, role_id } = await req.json()

    if (!email || !password) {
        return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    // 1. Create user in Auth
    const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name
      }
    })

    if (authError) {
      throw authError
    }

    const userId = userData.user.id

    // 2. Update/Insert profile in public.users
    // Nota: Si tens un trigger automàtic a la DB, això pot ser redundant o causar conflicte.
    // Assumint que no hi ha trigger o volem assegurar les dades extra:
    const { error: profileError } = await supabaseClient
      .from('users')
      .upsert({
        id: userId,
        email: email,
        full_name: full_name,
        phone_number: phone_number,
        is_active: is_active ?? true
      })

    if (profileError) {
        // Opcional: Esborrar l'usuari d'auth si falla el perfil per mantenir consistència
        // await supabaseClient.auth.admin.deleteUser(userId)
        throw profileError
    }

    // 3. Assign Initial Role if provided
    if (role_id && role_id > 0) {
        const { error: roleError } = await supabaseClient
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: role_id
            })
        
        if (roleError) throw roleError
    }

    return new Response(
      JSON.stringify({ user: userData.user, message: 'User created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
