import { supabase } from './supabaseClient';
import { User, Role } from '../types';

export const UserService = {
  // Obtenir tots els usuaris amb els seus rols
  getAllUsers: async (): Promise<User[]> => {
    // Primer obtenim els usuaris
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Després obtenim els rols per a cada usuari
    // Podríem fer un join si user_roles tingués relació directa definida a Supabase amb users,
    // però per assegurar, farem una consulta separada o un join manual si cal.
    // Provarem amb la sintaxi de relació si existeix la FK.
    
    const usersWithRoles = await Promise.all(users.map(async (user) => {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            id,
            code,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Error fetching roles for user', user.id, roleError);
        return { ...user, roles: [] };
      }

      // Mapejar la resposta per obtenir una array de Role neta
      const roles = roleData.map((r: any) => r.roles).filter((r: any) => r);
      return { ...user, roles };
    }));

    return usersWithRoles;
  },

  // Obtenir tots els rols disponibles
  getAllRoles: async (): Promise<Role[]> => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Actualitzar dades bàsiques de l'usuari (public.users)
  updateUser: async (id: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  // Assignar un rol a un usuari
  assignRole: async (userId: string, roleId: number) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });

    if (error) throw error;
  },

  // Treure un rol d'un usuari
  removeRole: async (userId: string, roleId: number) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  },

  // Crear usuari complet (Auth + Perfil) via Edge Function
  createUserFull: async (userData: any) => {
    console.log('Cridant Edge Function create-user amb:', userData);
    
    // 1. Intentem cridar a la Edge Function
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    });

    if (error) {
      console.error('Error invocant create-user:', error);
      // Si la funció no existeix o falla, donem un missatge clar
      throw new Error(`No s'ha pogut crear l'usuari. Assegura't que la Edge Function 'create-user' està desplegada. Detall: ${error.message}`);
    }

    if (!data || data.error) {
       throw new Error(data?.error || 'Error desconegut al crear usuari');
    }

    return data;
  },

  // Esborrar usuari (de public.users i els seus rols)
  deleteUser: async (id: string) => {
    // Primer esborrem rols (tot i que el cascade ho hauria de fer)
    await supabase.from('user_roles').delete().eq('user_id', id);
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
