
import { useAuth as useAuthContext } from '../context/AuthContext';
import { useUserRoles } from './useUserRoles';

// Wrapper que combina el Context (Usuari) amb React Query (Rols)
// per mantenir la compatibilitat amb la resta de components.
export const useAuth = () => {
  const { user, loading: authLoading } = useAuthContext();
  
  // Si no hi ha usuari, no cal buscar rols
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles(user?.id);

  const isAdmin = () => {
    return roles.includes('SUPER_ADMIN') || 
           roles.includes('ADMIN') || 
           roles.includes('Administrador Global');
  };

  const hasRole = (role: string) => {
    return roles.includes(role) || isAdmin();
  };

  return {
    user,
    loading: authLoading || (!!user && rolesLoading), // Loading combinat
    roles,
    rolesLoaded: !rolesLoading,
    isAdmin,
    hasRole
  };
};
