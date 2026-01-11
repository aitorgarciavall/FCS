import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../../services/userService';
import { adminService } from '../../services/adminService';
import { User, Role } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AdminUsers: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

      // 2. Mutations

      const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
          UserService.updateUser(id, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setIsEditing(false);
          setSelectedUser(null);
        },
        onError: (err) => alert(`Error actualitzant usuari: ${err}`)
      });

    const assignRoleMutation = useMutation({
      mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
        UserService.assignRole(userId, roleId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    });

    const removeRoleMutation = useMutation({
      mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
        UserService.removeRole(userId, roleId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    });

    const deleteUserMutation = useMutation({
      mutationFn: adminService.deleteUser, // Utilitzem el backend segur
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
      onError: (err) => alert(`Error esborrant usuari: ${err}`)
    });

  

    // Handlers

      const handleEdit = (user: User) => {

        setSelectedUser(user);

        setIsEditing(true);

      };

    

      const handleRoleChange = (userId: string, roleId: number, currentRoles: Role[] | undefined) => {

      if (!userId) return alert("Primer has de guardar l'usuari abans d'assignar rols.");

      

      const hasRole = currentRoles?.some(r => r.id === roleId);

      if (hasRole) {

        if (confirm('Segur que vols treure aquest rol?')) {

          removeRoleMutation.mutate({ userId, roleId });

        }

      } else {

        assignRoleMutation.mutate({ userId, roleId });

      }

    };

  

    const handleDelete = (id: string) => {

      if (confirm('ATENCIÓ: Estàs a punt d\'esborrar un usuari i els seus rols. Aquesta acció no es pot desfer. Estàs segur?')) {

        deleteUserMutation.mutate(id);

      }

    };

  

      const handleSaveUser = (e: React.FormEvent) => {

  

        e.preventDefault();

  

        if (!selectedUser || !selectedUser.id) return;

  

    

  

        updateMutation.mutate({

  

            id: selectedUser.id,

  

            data: {

  

                full_name: selectedUser.full_name,

  

                phone_number: selectedUser.phone_number,

  

                is_active: selectedUser.is_active

  

            }

  

        });

  

      };

  

    if (!hasRole('SUPER_ADMIN') && !hasRole('COORDINATOR')) {

      return <div className="p-8 text-red-500">Accés denegat.</div>;

    }

  

    return (

      <div className="animate-fade-in">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold dark:text-white">Gestió d'Usuaris</h2>

                <button 

                  onClick={() => navigate('/keyper/users/new')}

                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"

                >

                  <span className="material-symbols-outlined">person_add</span> Nou Usuari

                </button>

              </div>

  

        {isEditing && selectedUser ? (

          <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 max-w-2xl mb-8">

            <h3 className="text-lg font-bold mb-4 dark:text-white">

              {selectedUser.id ? `Editar Usuari: ${selectedUser.email}` : 'Nou Usuari'}

            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">

               <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correu Electrònic</label>

                <input 

                  type="email" 

                  required

                  disabled={!!selectedUser.id} // No deixar editar email si ja existeix

                  className={`w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white ${selectedUser.id ? 'bg-gray-100 dark:bg-white/5 cursor-not-allowed' : ''}`}

                  value={selectedUser.email || ''} 

                  onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} 

                />

                {!selectedUser.id && <p className="text-xs text-yellow-600 mt-1">Nota: Això crea el perfil. L'usuari s'haurà de registrar amb aquest email.</p>}

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>

                <input 

                  type="text" 

                  className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"

                  value={selectedUser.full_name || ''} 

                  onChange={e => setSelectedUser({...selectedUser, full_name: e.target.value})} 

                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telèfon</label>

                <input 

                  type="text" 

                  className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"

                  value={selectedUser.phone_number || ''} 

                  onChange={e => setSelectedUser({...selectedUser, phone_number: e.target.value})} 

                />

              </div>

              <div className="flex items-center gap-2">

                 <input 

                  type="checkbox" 

                  id="isActive"

                  checked={selectedUser.is_active || false} 

                  onChange={e => setSelectedUser({...selectedUser, is_active: e.target.checked})} 

                  className="w-4 h-4"

                />

                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuari Actiu</label>

              </div>

              

              {selectedUser.id && (

                  <div className="pt-4 border-t border-gray-100 dark:border-white/10">

                      <h4 className="font-bold mb-2 dark:text-white">Gestió de Rols</h4>

                      <div className="flex flex-wrap gap-2">

                          {allRoles.map(role => {

                              const hasThisRole = selectedUser.roles?.some(r => r.id === role.id);

                              return (

                                  <button

                                      key={role.id}

                                      type="button"

                                      onClick={() => handleRoleChange(selectedUser.id, role.id, selectedUser.roles)}

                                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${

                                          hasThisRole 

                                          ? 'bg-primary text-white border-primary' 

                                          : 'bg-transparent text-gray-500 border-gray-300 dark:text-gray-400 dark:border-white/20 hover:border-primary hover:text-primary'

                                      }`}

                                  >

                                      {role.name}

                                      {hasThisRole && <span className="ml-1 text-[10px] opacity-70">✕</span>}

                                  </button>

                              );

                          })}

                      </div>

                  </div>

              )}

  

              <div className="flex justify-end gap-3 pt-4">

                <button type="button" onClick={() => { setIsEditing(false); setSelectedUser(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg">Cancel·lar</button>

                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-lg">

                  {selectedUser.id ? 'Guardar Canvis' : 'Crear Usuari'}

                </button>

              </div>

            </form>

          </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          {usersLoading ? (
            <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                Carregant usuaris...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No hi ha usuaris registrats.</div>
          ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                    <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuari</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rols</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estat</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Accions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium dark:text-white">{user.full_name || 'Sense nom'}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map(r => (
                                        <span key={r.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {r.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Cap rol</span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {user.is_active ? 'Actiu' : 'Inactiu'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(user)} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Editar">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                {hasRole('SUPER_ADMIN') && (
                                    <button onClick={() => handleDelete(user.id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Esborrar">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;