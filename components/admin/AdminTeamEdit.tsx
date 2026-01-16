import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../services/teamService';
import { UserService } from '../../services/userService';
import { User } from '../../types';

const AdminTeamEdit: React.FC = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dades de l'equip (formulari)
  const [teamData, setTeamData] = useState({ name: '', age: '', tag: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Queries
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => TeamService.getById(teamId!),
    enabled: !!teamId
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers
  });

  const { data: currentTeamPlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ['teamPlayers', teamId],
    queryFn: () => TeamService.getTeamPlayers(teamId!),
    enabled: !!teamId
  });

  // Quan arriben les dades, omplim el formulari
  React.useEffect(() => {
    if (team) {
      setTeamData({
        name: team.name,
        age: team.age,
        tag: team.tag || '',
        imageUrl: team.imageUrl || ''
      });
    }
  }, [team]);

  // Mutation: Guardar Dades Equip
  const updateTeamMutation = useMutation({
    mutationFn: async () => {
       return TeamService.update(teamId!, {
        name: teamData.name,
        age: teamData.age,
        tag: teamData.tag,
        imageUrl: teamData.imageUrl
      }, selectedFile || undefined);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        alert('Dades de l\'equip actualitzades.');
    },
    onError: (err) => alert('Error: ' + err)
  });

  // Mutation: Add Player (Optimistic)
  const addPlayerMutation = useMutation({
    mutationFn: async (user: User) => {
      await TeamService.addPlayerToTeam(teamId!, user.id);
    },
    onMutate: async (newUser) => {
      // 1. Cancel·lar queries sortints per no sobreescriure el nostre update optimista
      await queryClient.cancelQueries({ queryKey: ['teamPlayers', teamId] });

      // 2. Snapshot del valor anterior
      const previousPlayers = queryClient.getQueryData<User[]>(['teamPlayers', teamId]);

      // 3. Actualitzar cache optimísticament
      queryClient.setQueryData<User[]>(['teamPlayers', teamId], (old = []) => {
        if (old.some(p => p.id === newUser.id)) return old; // Ja hi és
        return [...old, newUser];
      });

      // 4. Retornar context per rollback
      return { previousPlayers };
    },
    onError: (err, newUser, context) => {
      // Si falla, revertim
      if (context?.previousPlayers) {
        queryClient.setQueryData(['teamPlayers', teamId], context.previousPlayers);
      }
      alert('Error afegint jugador: ' + err);
    },
    onSettled: () => {
      // Al final, refresquem per assegurar consistència
      queryClient.invalidateQueries({ queryKey: ['teamPlayers', teamId] });
    }
  });

  // Mutation: Remove Player (Optimistic)
  const removePlayerMutation = useMutation({
    mutationFn: async (userId: string) => {
      await TeamService.removePlayerFromTeam(teamId!, userId);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['teamPlayers', teamId] });
      const previousPlayers = queryClient.getQueryData<User[]>(['teamPlayers', teamId]);

      queryClient.setQueryData<User[]>(['teamPlayers', teamId], (old = []) => {
        return old.filter(p => p.id !== userId);
      });

      return { previousPlayers };
    },
    onError: (err, userId, context) => {
      if (context?.previousPlayers) {
        queryClient.setQueryData(['teamPlayers', teamId], context.previousPlayers);
      }
      alert('Error traient jugador: ' + err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teamPlayers', teamId] });
    }
  });

  // Handlers per moure jugadors
  const addToTeam = (user: User) => {
    addPlayerMutation.mutate(user);
  };

  const removeFromTeam = (userId: string) => {
    removePlayerMutation.mutate(userId);
  };

  if (teamLoading || usersLoading || playersLoading) return <div className="p-8 text-center">Carregant...</div>;

  // Filtrar disponibles: Tots menys els que ja estan a l\'equip
  const availableUsers = allUsers.filter(u => 
    !currentTeamPlayers.some((p: User) => p.id === u.id) &&
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in pb-10">
      {/* HEADER AMB FORMULARI EDITABLE */}
      <div className="flex items-start justify-between mb-8 bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        <div className="flex gap-6 items-center">
             <button onClick={() => navigate('/keyper/teams')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <span className="material-symbols-outlined">arrow_back</span>
             </button>
             
             <div className="relative w-24 h-24 group">
                {selectedFile ? (
                    <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <img src={teamData.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-xl" />
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-xl transition-all">
                    <span className="material-symbols-outlined text-white">edit</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
             </div>

             <div className="space-y-3">
                <input 
                    className="text-3xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none dark:text-white block w-full"
                    value={teamData.name}
                    onChange={e => setTeamData({...teamData, name: e.target.value})}
                    placeholder="Nom de l\'Equip"
                />
                <div className="flex gap-3">
                    <input 
                        className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-3 py-1 text-sm w-40"
                        value={teamData.age}
                        onChange={e => setTeamData({...teamData, age: e.target.value})}
                        placeholder="Edats"
                    />
                    <input 
                        className="bg-primary/10 text-primary font-bold rounded px-3 py-1 text-sm w-24 border border-transparent hover:border-primary focus:border-primary outline-none"
                        value={teamData.tag}
                        onChange={e => setTeamData({...teamData, tag: e.target.value})}
                        placeholder="Tag"
                    />
                </div>
             </div>
        </div>
        <button 
            onClick={() => updateTeamMutation.mutate()}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-primary-dark transition-colors"
        >
            Guardar Canvis
        </button>
      </div>

      {/* GESTIÓ DE PLANTILLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* PLANTILLA ACTUAL */}
         <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-green-50 dark:bg-green-900/10 flex justify-between items-center rounded-t-xl">
                <h3 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">shield_person</span> Plantilla Actual ({currentTeamPlayers.length})
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {currentTeamPlayers.length === 0 && <p className="text-gray-400 text-center py-10">Aquest equip encara no té jugadors.</p>}
                {currentTeamPlayers.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-lg hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                            <img src={user.avatar_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                            <div>
                                <p className="font-bold text-sm dark:text-white">{user.full_name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeFromTeam(user.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Treure de l\'equip"
                        >
                            <span className="material-symbols-outlined">remove_circle</span>
                        </button>
                    </div>
                ))}
            </div>
         </div>

         {/* JUGADORS DISPONIBLES */}
         <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-t-xl space-y-3">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="material-symbols-outlined">person_add</span> Afegir Jugadors
                </h3>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar per nom o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none dark:bg-black/20 dark:text-white"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {availableUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-lg hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-sm dark:text-white">{user.full_name || 'Sense nom'}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => addToTeam(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="Afegir a l'equip"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                    </div>
                ))}
                {availableUsers.length === 0 && <p className="text-center text-gray-400 py-10">No s\'han trobat jugadors.</p>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminTeamEdit;
