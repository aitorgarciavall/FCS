import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../../services/userService';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AdminUsers: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
  });

  // 2. Mutations
  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser, // Utilitzem el backend segur
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err) => alert(`Error esborrant usuari: ${err}`)
  });

  // Handlers
  const handleEdit = (user: User) => {
    navigate(`/keyper/users/edit/${user.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('ATENCIÓ: Estàs a punt d\'esborrar un usuari i els seus rols. Aquesta acció no es pot desfer. Estàs segur?')) {
      deleteUserMutation.mutate(id);
    }
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
                              {user.avatar_url ? (
                                <img 
                                  src={user.avatar_url} 
                                  alt={user.full_name || user.email}
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-white/10"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                              )}
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
    </div>
  );
};

export default AdminUsers;
