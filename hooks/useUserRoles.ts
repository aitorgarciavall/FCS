
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';

export const useUserRoles = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userRoles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('[useUserRoles] Fetching roles for:', userId);
      
      // Consulta robusta amb JOIN
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            id,
            code
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('[useUserRoles] Error:', error);
        throw error;
      }

      // Aplanar l'estructura i filtrar nuls
      const roles = data
        .map((item: any) => ({
          id: item.roles?.id,
          code: item.roles?.code
        }))
        .filter((role: any) => role.code);

      return roles as { id: number, code: string }[];
    },
    // Només s'executa si tenim userId
    enabled: !!userId,
    // Els rols no canvien sovint, guardem-los en memòria una bona estona (30 min)
    staleTime: 1000 * 60 * 30,
    // No reintentar indefinidament si falla
    retry: 1,
  });
};
