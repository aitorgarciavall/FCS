import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../services/teamService';
import { UserService } from '../../services/userService';
import { User } from '../../types';

// Tipus per a les posicions
interface Position {
  id: number;
  top: string; // %
  left: string; // %
  label: string;
}

// Configuracions de camp
const FORMATION_F11: Position[] = [
  { id: 1, top: '90%', left: '50%', label: 'GK' },
  { id: 2, top: '75%', left: '20%', label: 'LD' },
  { id: 3, top: '75%', left: '40%', label: 'DFC' },
  { id: 4, top: '75%', left: '60%', label: 'DFC' },
  { id: 5, top: '75%', left: '80%', label: 'LE' },
  { id: 6, top: '50%', left: '30%', label: 'MC' },
  { id: 7, top: '50%', left: '70%', label: 'MC' },
  { id: 8, top: '35%', left: '20%', label: 'ED' },
  { id: 9, top: '35%', left: '80%', label: 'EE' },
  { id: 10, top: '25%', left: '50%', label: 'MCO' },
  { id: 11, top: '10%', left: '50%', label: 'DC' },
];

const FORMATION_F7: Position[] = [
  { id: 1, top: '90%', left: '50%', label: 'GK' },
  { id: 2, top: '70%', left: '25%', label: 'DEF' },
  { id: 3, top: '70%', left: '50%', label: 'DEF' },
  { id: 4, top: '70%', left: '75%', label: 'DEF' },
  { id: 5, top: '40%', left: '35%', label: 'MC' },
  { id: 6, top: '40%', left: '65%', label: 'MC' },
  { id: 7, top: '15%', left: '50%', label: 'DC' },
];

const AdminTeamEdit: React.FC = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Queries (Declared FIRST)
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

  // Estats locals
  const [formationType, setFormationType] = useState<'F7' | 'F11'>('F11');
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldState, setFieldState] = useState<{ [key: number]: User }>({});
  
  // Estats locals dades equip
  const [teamData, setTeamData] = useState({ name: '', age: '', tag: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Efecte per carregar dades quan arriben de la query
  useEffect(() => {
    if (team) {
      setTeamData({
        name: team.name,
        age: team.age,
        tag: team.tag || '',
        imageUrl: team.imageUrl || ''
      });
      if (team.tag?.toLowerCase().includes('7')) {
        setFormationType('F7');
      } else {
        setFormationType('F11');
      }
    }
  }, [team]);

  // Efecte per omplir el camp quan es carreguen els jugadors actuals de l'equip
  useEffect(() => {
    if (currentTeamPlayers.length > 0) {
      const newFieldState: { [key: number]: User } = {};
      const maxSlots = formationType === 'F11' ? 11 : 7;
      
      currentTeamPlayers.slice(0, maxSlots).forEach((player: User, index: number) => {
        newFieldState[index + 1] = player;
      });
      setFieldState(newFieldState);
    }
  }, [currentTeamPlayers, formationType]);

  // Mutation per guardar TOT
  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Guardar dades bàsiques
      await TeamService.update(teamId!, {
        name: teamData.name,
        age: teamData.age,
        tag: teamData.tag,
        imageUrl: teamData.imageUrl
      }, selectedFile || undefined);

      // 2. Guardar jugadors
      const playerIds = Object.values(fieldState).map(u => u.id);
      await TeamService.updateTeamPlayers(teamId!, playerIds);
    },
    onSuccess: () => {
        alert('Equip guardat correctament!');
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
        queryClient.invalidateQueries({ queryKey: ['teamPlayers'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => alert('Error guardant: ' + err)
  });

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, user: User, source: 'list' | 'field', positionId?: number) => {
    e.dataTransfer.setData('user', JSON.stringify(user));
    e.dataTransfer.setData('source', source);
    if (positionId) e.dataTransfer.setData('sourcePositionId', positionId.toString());
  };

  const handleDropOnField = (e: React.DragEvent, targetPositionId: number) => {
    e.preventDefault();
    const userStr = e.dataTransfer.getData('user');
    if (!userStr) return;
    const user = JSON.parse(userStr) as User;
    const source = e.dataTransfer.getData('source');
    const sourcePositionId = e.dataTransfer.getData('sourcePositionId');

    setFieldState(prev => {
      const newState = { ...prev };
      if (source === 'field' && sourcePositionId) {
        delete newState[parseInt(sourcePositionId)];
      }
      newState[targetPositionId] = user;
      return newState;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFromField = (positionId: number) => {
    setFieldState(prev => {
      const newState = { ...prev };
      delete newState[positionId];
      return newState;
    });
  };

  const availableUsers = allUsers.filter(u => 
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSlotStyle = (pos: Position) => ({
    top: pos.top,
    left: pos.left,
    transform: 'translate(-50%, -50%)',
  });

  if (teamLoading || usersLoading || playersLoading) return <div className="p-10 text-center">Carregant editor...</div>;

  const positions = formationType === 'F11' ? FORMATION_F11 : FORMATION_F7;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in overflow-hidden">
      {/* Capçalera i Dades Bàsiques */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/10 p-4 shadow-sm z-20">
        <div className="flex justify-between items-start gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/keyper/teams')} className="text-gray-500 hover:text-primary p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                
                {/* Imatge petita i inputs bàsics */}
                <div className="flex gap-4 items-center">
                    <div className="relative group w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {selectedFile ? (
                            <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" />
                        ) : (
                            <img src={teamData.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <span className="material-symbols-outlined text-white text-sm">edit</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <input 
                            type="text" 
                            value={teamData.name} 
                            onChange={e => setTeamData({...teamData, name: e.target.value})}
                            className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none px-1 dark:text-white"
                            placeholder="Nom de l'equip"
                        />
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={teamData.age} 
                                onChange={e => setTeamData({...teamData, age: e.target.value})}
                                className="text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none px-1 w-32"
                                placeholder="Categoria/Edat"
                            />
                            <input 
                                type="text" 
                                value={teamData.tag} 
                                onChange={e => setTeamData({...teamData, tag: e.target.value})}
                                className="text-sm font-bold text-primary bg-primary/5 rounded px-2 border-b border-transparent hover:border-primary focus:border-primary outline-none w-24"
                                placeholder="Tag (Ex: F11)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 items-center">
                <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                    <button 
                        onClick={() => setFormationType('F7')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${formationType === 'F7' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        F7
                    </button>
                    <button 
                        onClick={() => setFormationType('F11')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${formationType === 'F11' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        F11
                    </button>
                </div>
                <button 
                    onClick={() => saveMutation.mutate()}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
                >
                    <span className="material-symbols-outlined text-lg">save</span> Guardar
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden p-4 h-full">
        
        {/* COLUMNA ESQUERRA: CAMP DE FUTBOL */}
        <div className="flex-1 bg-green-600 rounded-xl relative shadow-inner border-4 border-white/20 overflow-hidden select-none">
            {/* Dibuix bàsic del camp (línies) */}
            <div className="absolute inset-4 border-2 border-white/40 rounded opacity-60 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            {/* Àrees */}
            <div className="absolute bottom-0 left-1/2 w-64 h-32 border-2 border-white/40 border-b-0 -translate-x-1/2 pointer-events-none bg-white/5"></div>
            <div className="absolute top-0 left-1/2 w-64 h-32 border-2 border-white/40 border-t-0 -translate-x-1/2 pointer-events-none bg-white/5"></div>

            {/* POSICIONS (DROP ZONES) */}
            {positions.map((pos) => {
                const assignedUser = fieldState[pos.id];
                return (
                    <div 
                        key={pos.id}
                        style={getSlotStyle(pos)}
                        className={`absolute w-24 h-24 flex flex-col items-center justify-center transition-all ${assignedUser ? 'z-10' : 'z-0'}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnField(e, pos.id)}
                    >
                        {assignedUser ? (
                            <div 
                                className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center"
                                draggable
                                onDragStart={(e) => handleDragStart(e, assignedUser, 'field', pos.id)}
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                    {assignedUser.avatar_url ? (
                                        <img src={assignedUser.avatar_url} alt={assignedUser.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                                            {assignedUser.full_name?.charAt(0) || assignedUser.email.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm whitespace-nowrap max-w-[120px] truncate">
                                    {assignedUser.full_name || assignedUser.email}
                                </div>
                                <button 
                                    onClick={() => removeFromField(pos.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-black/10 text-white/50 font-bold text-xs hover:bg-white/10 transition-colors">
                                {pos.label}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* COLUMNA DRETA: LLISTAT JUGADORS */}
        <div className="w-80 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-t-xl">
                <h3 className="font-bold mb-2 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span> Jugadors
                </h3>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar jugador..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {availableUsers.map(user => {
                    const isAssigned = Object.values(fieldState).some(u => u.id === user.id);
                    return (
                        <div 
                            key={user.id}
                            draggable={!isAssigned}
                            onDragStart={(e) => handleDragStart(e, user, 'list')}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isAssigned 
                                ? 'opacity-50 grayscale border-gray-100 dark:border-white/5 bg-gray-50' 
                                : 'cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm hover:shadow-md'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/10">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate dark:text-white">{user.full_name || 'Sense nom'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            {isAssigned && (
                                <span className="material-symbols-outlined text-green-500 text-lg ml-auto">check_circle</span>
                            )}
                        </div>
                    );
                })}
                {availableUsers.length === 0 && (
                    <div className="text-center p-4 text-gray-400 text-sm">
                        No s'han trobat jugadors.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTeamEdit;