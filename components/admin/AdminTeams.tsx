import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TeamCategory } from '../../types';
import { TeamService } from '../../services/teamService';
import { useAuth } from '../../hooks/useAuth';

const AdminTeams: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Partial<TeamCategory>>({});

  // 1. Obtenir Equips (Caché)
  const { data: teams = [], isLoading, isError, error } = useQuery({
    queryKey: ['teams'],
    queryFn: TeamService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minuts
  });

  // 2. Mutació Guardar
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Nota: Aquesta mutació només es fa servir per CREAR equips ara (via modal)
      // Per editar, es fa a la pàgina dedicada.
      if (currentTeam.id) {
         // Lògica legacy o per si reutilitzem el modal, però ara redirigim.
         return TeamService.update(currentTeam.id, {
          name: currentTeam.name,
          age: currentTeam.age,
          tag: currentTeam.tag,
          imageUrl: currentTeam.imageUrl,
        }, selectedFile || undefined);
      } else {
        return TeamService.create({
          name: currentTeam.name || 'Nou Equip',
          age: currentTeam.age || '',
          tag: currentTeam.tag || '',
          imageUrl: currentTeam.imageUrl || '',
        }, selectedFile || undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditing(false);
      setCurrentTeam({});
      setSelectedFile(null);
    },
    onError: () => alert("Error al guardar l\'equip.")
  });

  // 3. Mutació Esborrar
  const deleteMutation = useMutation({
    mutationFn: TeamService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: () => alert("Error esborrant l\'equip.")
  });

  const canEdit = () => hasRole('SUPER_ADMIN') || hasRole('COORDINATOR');

  const handleEdit = (team: TeamCategory) => {
    if (!canEdit()) return alert("No tens permisos.");
    // Naveguem a la pàgina d'edició completa
    navigate(`/keyper/teams/edit/${team.id}`);
  };

  const handleDelete = (id: string) => {
    if (!canEdit()) return alert("No tens permisos.");
    if (confirm('Estàs segur d\'esborrar aquest equip?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit()) return alert("No tens permisos.");
    saveMutation.mutate();
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Error carregant els equips: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Gestió d'Equips</h1>
          <p className="text-gray-500">Administra les categories i equips del club</p>
        </div>
        <button 
          onClick={() => {
            setCurrentTeam({});
            setIsEditing(true);
            setSelectedFile(null);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span> Nou Equip
        </button>
      </div>

      {!isEditing ? (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase font-bold">
                <th className="px-6 py-4">Imatge</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Edats / Categoria</th>
                <th className="px-6 py-4">Etiqueta</th>
                <th className="px-6 py-4 text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <img src={team.imageUrl} alt={team.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="px-6 py-4 font-bold dark:text-white">{team.name}</td>
                  <td className="px-6 py-4 text-gray-500">{team.age}</td>
                  <td className="px-6 py-4">
                    {team.tag && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">
                        {team.tag}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleEdit(team)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(team.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">
                {currentTeam.id ? 'Editar Equip' : 'Crear Nou Equip'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Nom de l\'Equip</label>
                <input 
                  type="text" 
                  value={currentTeam.name || ''} 
                  onChange={e => setCurrentTeam({...currentTeam, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Cadet A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Rangu d\'Edats / Descripció</label>
                <input 
                  type="text" 
                  value={currentTeam.age || ''} 
                  onChange={e => setCurrentTeam({...currentTeam, age: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: 14 - 15 Anys"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Etiqueta (Opcional)</label>
                <input 
                  type="text" 
                  value={currentTeam.tag || ''} 
                  onChange={e => setCurrentTeam({...currentTeam, tag: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Futbol 11"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Imatge</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {currentTeam.imageUrl && !selectedFile && (
                  <p className="mt-2 text-xs text-gray-500 truncate">Actual: {currentTeam.imageUrl}</p>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel·lar
                </button>
                <button 
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Guardant...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;