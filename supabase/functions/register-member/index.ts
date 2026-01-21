import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Important: Use Service Role Key for Admin actions
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { player, guardian, sepa } = await req.json();

    console.log("Iniciant registre per:", guardian.email);

    // 1. Crear o Obtenir Usuari TUTOR
    // Mirem si ja existeix
    let guardianId = null;
    let guardianUserMetadata = null;

    const { data: guardianAuth, error: guardianError } = await supabaseClient.auth.admin.createUser({
      email: guardian.email,
      password: 'tempPassword123!', 
      email_confirm: true,
      user_metadata: {
        full_name: `${guardian.name} ${guardian.surname}`,
        dni: guardian.dni,
        phone: guardian.phone
      }
    });

    if (guardianError) {
        if (guardianError.message.includes('already registered')) {
             console.log(`⚠️ L'usuari ${guardian.email} ja existeix a Auth. Comprovant si és un ZOMBIE...`);
             
             // 1. Busquem l'usuari a Auth per obtenir el seu ID
             // Nota: listUsers no filtra per email, portem una pàgina (millorar per producció massiva)
             const { data: { users: allUsers } } = await supabaseClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
             const existingUser = allUsers.find(u => u.email === guardian.email);

             if (existingUser) {
                 // 2. Comprovem si existeix a la taula pública 'users'
                 const { data: publicProfile } = await supabaseClient
                    .from('users')
                    .select('id')
                    .eq('id', existingUser.id)
                    .maybeSingle();

                 if (!publicProfile) {
                     console.log(`🧟 ZOMBIE CONFIRMAT: ID ${existingUser.id}. Recuperant compte...`);
                     guardianId = existingUser.id;
                     guardianUserMetadata = existingUser.user_metadata;
                     
                     // Actualitzem les dades a Auth per si han canviat
                     await supabaseClient.auth.admin.updateUserById(guardianId, {
                        user_metadata: {
                            full_name: `${guardian.name} ${guardian.surname}`,
                            dni: guardian.dni,
                            phone: guardian.phone
                        }
                     });
                     
                     // Creem manualment l'entrada a public.users que falta
                     await supabaseClient.from('users').insert({
                         id: guardianId,
                         email: guardian.email,
                         full_name: `${guardian.name} ${guardian.surname}`,
                         is_active: true
                     });

                 } else {
                     console.log('⛔ Usuari ja registrat i actiu.');
                     return new Response(JSON.stringify({ error: 'Aquest email de tutor ja està registrat.' }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 400,
                     });
                 }
             } else {
                 throw guardianError;
             }
        } else {
            throw guardianError;
        }
    } else {
        guardianId = guardianAuth.user.id;
        guardianUserMetadata = guardianAuth.user.user_metadata;
    }

    // 2. Crear Usuari JUGADOR
    // Si és el mateix tutor que jugador
    let playerId = null;
    if (guardian.isSameAsPlayer) {
        playerId = guardianId;
        // Actualitzem metadata del tutor per incloure dades de jugador també
        await supabaseClient.auth.admin.updateUserById(guardianId, {
            user_metadata: {
                ...guardianUserMetadata,
                birth_date: player.birthDate,
                address: player.address,
                city: player.city,
                postal_code: player.postalCode
            }
        });
    } else {
        // Si el jugador té email, l'usem. Si no, generem un àlies.
        const playerEmail = player.email || `${guardian.email.split('@')[0]}+${player.name.toLowerCase().replace(/\s/g, '')}@santpedorfc.placeholder`;
        
        const { data: playerAuth, error: playerError } = await supabaseClient.auth.admin.createUser({
            email: playerEmail,
            password: 'tempPassword123!',
            email_confirm: true,
            user_metadata: {
                full_name: `${player.name} ${player.surname}`,
                dni: player.dni,
                birth_date: player.birthDate,
                address: player.address,
                city: player.city,
                postal_code: player.postalCode
            }
        });
        
        if (playerError) throw playerError;
        playerId = playerAuth.user.id;
    }

    // 3. Assignar Rols
    // Tutor -> Rol 7 (Guardian)
    await supabaseClient.from('user_roles').insert({ user_id: guardianId, role_id: 7 });
    
    // Jugador -> Rol 6 (Player)
    if (playerId !== guardianId) {
        await supabaseClient.from('user_roles').insert({ user_id: playerId, role_id: 6 });
    } else {
        // Si és el mateix, li afegim també el rol de jugador
        await supabaseClient.from('user_roles').insert({ user_id: guardianId, role_id: 6 });
    }

    // 4. Actualitzar Taula 'users' (Public Profile)
    // El trigger de Supabase normalment crea la fila a public.users en crear auth.user,
    // però aquí actualitzem els camps extra que hem afegit a la DB.
    
    // Dades extres Jugador
    await supabaseClient.from('users').update({
        dni: player.dni,
        birth_date: player.birthDate,
        address: player.address,
        city: player.city,
        postal_code: player.postalCode,
        shirt_size: player.shirtSize,
        allergies: player.allergies
    }).eq('id', playerId);

    // Dades extres Tutor (si és diferent)
    if (!guardian.isSameAsPlayer) {
        await supabaseClient.from('users').update({
            dni: guardian.dni,
            phone_number: guardian.phone
        }).eq('id', guardianId);
    }

    // 5. Guardar SEPA (Vinculat al Tutor/Pagador)
    const { error: sepaError } = await supabaseClient.from('sepa_info').insert({
        user_id: guardianId,
        iban: sepa.iban,
        account_holder: sepa.holderName,
        swift_bic: sepa.swift
    });
    if (sepaError) throw sepaError;

    // 6. Vincular Tutor i Jugador
    if (!guardian.isSameAsPlayer) {
        const { error: relError } = await supabaseClient.from('player_guardians').insert({
            player_id: playerId,
            guardian_id: guardianId,
            relationship_type: guardian.relationship,
            is_primary: true
        });
        if (relError) throw relError;
    }

    return new Response(
      JSON.stringify({ 
          success: true, 
          message: 'Inscripció realitzada correctament',
          guardianId,
          playerId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
