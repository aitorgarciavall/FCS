import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variables d'entorn
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // El frontend corre al 5173 normalment, usarem el 3001 pel backend

// Middleware
app.use(cors()); // Permet que el frontend parli amb el backend
app.use(express.json()); // Per poder llegir JSONs en els POST

// Configuració de Supabase amb permisos d'ADMINISTRADOR
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Falten les credencials de Supabase (URL o SERVICE_ROLE_KEY) al fitxer .env del servidor.');
  process.exit(1);
}

// Client amb poders d'administrador (compte amb no exposar-lo mai al frontend!)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`
    }
  }
});

// --- Rutes ---

// Test de salut
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FCS Admin Server is running 🚀' });
});

// Crear nou usuari (Admin)
app.post('/api/admin/create-user', async (req, res) => {
  const { email, password, fullName, roles } = req.body;

  try {
    let authData;
    let userId;

    // 1. Intentar crear l'usuari a Supabase Auth
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (error) throw error;
      authData = data;
      userId = authData.user.id;
    } catch (authError) {
      // GESTIÓ D'ERRORS D'USUARI JA EXISTENT (ZOMBIE KILLER 🧟‍♂️)
      if (authError.status === 422 && authError.message?.includes('already been registered')) {
        console.warn(`⚠️ L'email ${email} ja existeix a Auth. Comprovant estat...`);

        // Comprovem si existeix a la taula pública
        const { data: existingPublicUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingPublicUser) {
          throw new Error('Aquest usuari ja existeix i està actiu al sistema.');
        } 
        
        // Si no existeix a public, és un ZOMBIE. L'hem d'esborrar per poder-lo recrear.
        console.warn(`🧟 Detectat usuari ZOMBIE. Intentant recuperar ID per netejar...`);
        
        // Busquem l'ID de l'usuari a Auth (via llistat, ja que no tenim getUserByEmail directe a l'SDK admin v2 simple)
        const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const zombieUser = allUsers.find(u => u.email === email);

        if (zombieUser) {
          console.log(`🔫 Eliminant usuari zombie amb ID: ${zombieUser.id}`);
          await supabaseAdmin.auth.admin.deleteUser(zombieUser.id);
          
          // Reintentem la creació
          console.log('🔄 Reintentant creació d\'usuari...');
          const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.createUser({
            email, password, email_confirm: true, user_metadata: { full_name: fullName }
          });
          
          if (retryError) throw retryError;
          authData = retryData;
          userId = authData.user.id;
        } else {
          throw new Error('Error intern: L\'email consta registrat però no s\'ha pogut netejar. Contacta amb suport.');
        }
      } else {
        // Nou cas: Error 500 "Database error checking email"
        // Això pot passar si la BDD està inconsistent. Intentem veure si l'usuari existeix igualment.
        if (authError.status === 500 && (authError.message?.includes('Database error checking email') || authError.code === 'unexpected_failure')) {
            console.warn(`⚠️ Error intern de BDD (500) al crear usuari. Comprovant si l'usuari ${email} ja existeix...`);
            
            const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existingZombie = allUsers.find(u => u.email === email);

            if (existingZombie) {
                console.log(`🧟 ZOMBIE RE-CONFIRMAT (tot i l'error 500): ID ${existingZombie.id}. Recuperant...`);
                
                // Si cal, actualitzem password
                if (password) {
                    await supabaseAdmin.auth.admin.updateUserById(existingZombie.id, { password: password });
                }

                authData = { user: existingZombie };
                userId = existingZombie.id;
            } else {
                // Si no el trobem i dona error 500, és un error real de BDD
                throw authError;
            }
        } else {
            throw authError;
        }
      }
    }

    console.log('✅ Usuari creat/recuperat a Auth amb ID:', userId);

    // 1.5. Inserir l'usuari a la taula pública 'users' per satisfer la Foreign Key
    // Això és necessari si no tens un Trigger automàtic configurat a la BDD
    console.log('👤 Creant perfil públic a la taula users...');
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        // Altres camps per defecte si cal
        is_active: true
      });

    if (profileError) {
      console.warn('⚠️ Error creant perfil públic (potser ja existeix pel trigger?):', profileError.message);
      // Continuem igualment per si l'error és que ja existeix
    }

    // 2. Assignar els rols a la taula 'user_roles'
    if (roles && Array.isArray(roles) && roles.length > 0) {
      console.log(`Assignant rols [${roles.join(', ')}] a l'usuari ${userId}...`);
      
      const rolesToInsert = roles.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }));

      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert(rolesToInsert);

      if (roleError) {
        console.warn('Usuari creat però ha fallat l\'assignació de rols:', roleError);
        return res.status(201).json({ 
          success: true, 
          message: 'Usuari creat, però hi ha hagut un error assignant els rols.', 
          user: authData.user,
          roleError: roleError
        });
      }
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuari creat i rols assignats correctament', 
      user: authData.user 
    });
  } catch (error) {
    console.error('Error creant usuari:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Actualitzar usuari (Admin)
app.put('/api/admin/update-user/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, fullName, phone_number, is_active, roles, teams } = req.body;

  console.log(`📝 Actualitzant usuari ${id}...`);

  try {
    const updates = {};
    const userMetadata = {};

    // 1. Preparar actualitzacions per Auth (si cal)
    if (email) updates.email = email;
    if (password && password.length >= 6) updates.password = password;
    if (fullName) userMetadata.full_name = fullName;
    
    if (Object.keys(userMetadata).length > 0) {
      updates.user_metadata = userMetadata;
    }

    // Aplicar canvis a Auth
    if (Object.keys(updates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
      if (authError) throw authError;
      console.log('✅ Auth actualitzat.');
    }

    // 2. Actualitzar taula pública 'users'
    const publicUpdates = {};
    if (fullName) publicUpdates.full_name = fullName;
    if (email) publicUpdates.email = email;
    if (phone_number !== undefined) publicUpdates.phone_number = phone_number;
    if (is_active !== undefined) publicUpdates.is_active = is_active;

    if (Object.keys(publicUpdates).length > 0) {
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .update(publicUpdates)
        .eq('id', id);
      
      if (publicError) throw publicError;
      console.log('✅ Perfil públic actualitzat.');
    }

    // 3. Actualitzar Rols (si s'especifica)
    if (roles !== undefined && Array.isArray(roles)) {
      // Primer esborrem tots els rols existents per aquest usuari
      await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
      
      // Si hi ha rols seleccionats, els inserim
      if (roles.length > 0) {
        const rolesToInsert = roles.map(roleId => ({
          user_id: id,
          role_id: roleId
        }));

        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert(rolesToInsert);
        
        if (roleError) throw roleError;
      }
      console.log('✅ Rols actualitzats.');
    }

    // 4. Actualitzar Equips (si s'especifica)
    // Només rellevant si l'usuari és jugador, però ho gestionem genèricament aquí
    if (teams !== undefined && Array.isArray(teams)) {
        console.log(`⚽ Actualitzant equips per a usuari ${id}...`);
        
        // Esborrar assignacions actuals
        await supabaseAdmin.from('team_players').delete().eq('user_id', id);

        // Inserir noves assignacions
        if (teams.length > 0) {
            const teamsToInsert = teams.map(teamId => ({
                user_id: id,
                team_id: teamId
            }));

            const { error: teamError } = await supabaseAdmin
                .from('team_players')
                .insert(teamsToInsert);
            
            if (teamError) throw teamError;
        }
        console.log('✅ Equips actualitzats.');
    }

    res.json({ success: true, message: 'Usuari actualitzat correctament.' });

  } catch (error) {
    console.error('Error actualitzant usuari:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Eliminar usuari (Admin)
app.delete('/api/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Rebuda petició per esborrar usuari: ${id}`);

  try {
    // DIAGNÒSTIC: Comprovar si l'usuari existeix realment a Auth
    const { data: authUser, error: findError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (findError) {
        console.warn('⚠️ Error buscant usuari a Auth abans d\'esborrar:', findError);
        // Si no el trobem, potser ja és un zombie. Continuem amb la neteja pública.
    } else {
        console.log('ℹ️ Usuari trobat a Auth:', authUser.user.email);
    }

    // PAS 1: Neteja manual de dependències a l'esquema públic (EXCEPTE la taula principal users per ara)
    console.log('🧹 Netejant dependències públiques satèl·lit...');

    const tablesToClean = ['user_roles', 'team_players', 'sepa_info'];
    for (const table of tablesToClean) {
        const { error } = await supabaseAdmin.from(table).delete().eq('user_id', id);
        if (error) console.warn(`⚠️ Error netejant taula ${table}: ${error.message}`);
    }

    const { error: pgError } = await supabaseAdmin
        .from('player_guardians')
        .delete()
        .or(`player_id.eq.${id},guardian_id.eq.${id}`);
    if (pgError) console.warn(`⚠️ Error netejant player_guardians: ${pgError.message}`);

    // PAS 2: Esborrar de public.users
    // Forcem l'esborrat manual per assegurar que desapareix de la llista visual,
    // independentment de si el CASCADE d'Auth funciona o no.
    const { error: publicError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);
    
    if (publicError) console.warn('⚠️ Error esborrant de public.users (potser ja esborrat):', publicError.message);

    // PAS 3: Finalment, esborrar de Supabase Auth
    console.log('🔥 Intentant esborrar de Auth...');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
        if (authError.status === 404 || authError.code === 'user_not_found') {
            console.warn('⚠️ Usuari no trobat a Auth. Ja estava esborrat.');
            
            // Si no hi era a Auth, assegurem-nos que no quedi res a public.users ara sí
            console.log('🧹 Netejant residu a public.users...');
            await supabaseAdmin.from('users').delete().eq('id', id);

        } else if (authError.status === 500 && authError.code === 'unexpected_failure') {
            console.error('🧟 DETECTAT USUARI ZOMBIE/CORRUPTE (Error 500). Intentant neteja automàtica via RPC...');
            
            // Intentem cridar la funció d'emergència a la BDD
            const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('force_delete_user', { 
                target_user_id: id 
            });

            if (rpcError) {
                console.error('❌ Error fatal: Ni tan sols el RPC ha pogut esborrar-lo:', rpcError);
                throw new Error(`Error crític impossible de resoldre automàticament: ${rpcError.message}`);
            }

            if (rpcData && !rpcData.success) {
                 throw new Error(`La neteja automàtica ha fallat: ${rpcData.error}`);
            }

            console.log('✅ Neteja automàtica (Zombie Killer) completada amb èxit via RPC.');
            // Si hem arribat aquí, l'usuari està esborrat, continuem per enviar el success al client.

        } else {
            console.error('❌ Error crític esborrant de Auth:', authError);
            throw authError;
        }
    } else {
        console.log('✅ Usuari esborrat de Auth.');
    }

    res.json({ success: true, message: 'Usuari eliminat correctament.' });

  } catch (error) {
    console.error('Error eliminant usuari:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`
🤖 Servidor Backend corrent a: http://localhost:${port}`);
});
