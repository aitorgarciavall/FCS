import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { UserService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

const AdminUserEdit: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    is_active: true,
    role_id: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // 1. Obtenir Rols
  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  // 2. Obtenir Usuari Actual
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const user = await UserService.getUserById(userId);
        if (user) {
          setFormData({
            email: user.email,
            password: '', // No mostrem la contrasenya actual
            full_name: user.full_name || '',
            phone_number: user.phone_number || '',
            is_active: user.is_active || false,
            role_id: user.roles && user.roles.length > 0 ? user.roles[0].id : 0
          });
        }
      } catch (error) {
        console.error("Error carregant usuari:", error);
        alert("No s'ha pogut carregar l'usuari.");
        navigate('/keyper/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  // 3. Mutació d'Actualització
  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateUser(userId!, {
      email: data.email,
      password: data.password || undefined, // Només enviar si està ple
      fullName: data.full_name,
      phone_number: data.phone_number,
      is_active: data.is_active,
      role: data.role_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Opcional: invalidar query d'un sol usuari si existís
      alert('Usuari actualitzat correctament.');
      navigate('/keyper/users');
    },
    onError: (err: any) => {
      alert(`Error actualitzant usuari: ${err.message || err}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert("L'email és obligatori.");
      return;
    }
    updateMutation.mutate(formData);
  };

  if (!hasRole('SUPER_ADMIN') && !hasRole('COORDINATOR')) {
    return <div className="p-8 text-red-500">Accés denegat.</div>;
  }

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div></div>;
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/keyper/users')} className="text-gray-500 hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold dark:text-white">Editar Usuari</h2>
      </div>

      <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border border-gray-200 dark:border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
            
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 mb-4 flex items-start gap-2">
            <span className="material-symbols-outlined text-lg">info</span>
            <p>Estàs editant l'ID: <span className="font-mono text-xs">{userId}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correu Electrònic</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white bg-gray-50"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Contrasenya (Opcional)</label>
              <input 
                type="password" 
                minLength={6}
                placeholder="Deixar en blanc per mantenir l'actual"
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white placeholder-gray-400"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              <p className="text-xs text-gray-500 mt-1">Si escrius aquí, la contrasenya de l'usuari es canviarà.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telèfon</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.phone_number} 
                onChange={e => setFormData({...formData, phone_number: e.target.value})} 
              />
            </div>

             <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol Principal</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.role_id}
                onChange={e => setFormData({...formData, role_id: Number(e.target.value)})}
              >
                <option value={0}>-- Sense Rol --</option>
                {allRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Assignar un rol aquí substituirà els rols actuals de l'usuari.</p>
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-2">
               <input 
                type="checkbox" 
                id="isActive"
                checked={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">Usuari Actiu (Permetre accés)</label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/keyper/users')} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 transition-colors">Cancel·lar</button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              {updateMutation.isPending ? (
                <>
                    <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Guardant...
                </>
              ) : 'Guardar Canvis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserEdit;