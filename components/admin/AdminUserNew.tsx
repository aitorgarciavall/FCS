import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { UserService } from '../../services/userService';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AdminUserNew: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    is_active: true,
    role_id: 0 // Rol inicial (opcional)
  });

  // Obtenir rols per al selector
  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createUser({
      email: data.email,
      password: data.password,
      fullName: data.full_name,
      role: data.role_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/keyper/users');
    },
    onError: (err: any) => {
      alert(`Error creant usuari: ${err.message || err}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Email i contrasenya són obligatoris.");
      return;
    }
    createMutation.mutate(formData);
  };

  if (!hasRole('SUPER_ADMIN') && !hasRole('COORDINATOR')) {
    return <div className="p-8 text-red-500">Accés denegat.</div>;
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/keyper/users')} className="text-gray-500 hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold dark:text-white">Crear Nou Usuari</h2>
      </div>

      <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg border border-gray-200 dark:border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correu Electrònic *</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contrasenya *</label>
              <input 
                type="password" 
                required
                minLength={6}
                placeholder="Mínim 6 caràcters"
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol Inicial</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={formData.role_id}
                onChange={e => setFormData({...formData, role_id: Number(e.target.value)})}
              >
                <option value={0}>-- Cap rol --</option>
                {allRoles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex items-center gap-2">
               <input 
                type="checkbox" 
                id="isActive"
                checked={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuari Actiu</label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
              <p><strong>Nota:</strong> Aquesta acció crearà un usuari d'accés (Auth) i el seu perfil utilitzant el nostre servidor segur.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/keyper/users')} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg">Cancel·lar</button>
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2"
              >
                {createMutation.isPending ? 'Creant...' : 'Crear Usuari'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserNew;
