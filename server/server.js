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
  const { email, password, fullName, role } = req.body;

  try {
    // 1. Crear l'usuari a Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmem automàticament l'email
      user_metadata: { full_name: fullName }
    });

    if (authError) throw authError;

    console.log('✅ Usuari creat a Auth amb ID:', authData.user.id);
    const userId = authData.user.id;

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

    // 2. Assignar el rol a la taula 'user_roles'
    if (role && role > 0) {
           console.log(`Assignant rol ${role} a l'usuari ${userId}...`);
           
           const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: userId,
              role_id: role
            });
    
           if (roleError) {
             console.warn('Usuari creat però ha fallat l\'assignació de rol:', roleError);
             // No llancem error fatal perquè l'usuari ja existeix, però ho notifiquem
             return res.status(201).json({ 
               success: true, 
               message: 'Usuari creat, però hi ha hagut un error assignant el rol.', 
               user: authData.user,
               roleError: roleError
             });
           }
        }
    
        res.status(201).json({ 
          success: true, 
          message: 'Usuari creat i rol assignat correctament', 
          user: authData.user 
        });
  } catch (error) {
    console.error('Error creant usuari:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Eliminar usuari (Admin)
app.delete('/api/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;

    res.json({ success: true, message: 'Usuari eliminat correctament' });
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
