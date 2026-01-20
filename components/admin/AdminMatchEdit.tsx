import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MatchService, Match } from '../../services/matchService';
import { TeamService } from '../../services/teamService';
import { User } from '../../types';
import LocationPicker from './LocationPicker';

// Tipus per a les posicions
interface Position {
  id: number;
  top: string;
  left: string;
  label: string;
}

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

// Helper per formatar data local per l'input datetime-local
const toLocalISOString = (dateString: string) => {
  const date = new Date(dateString);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AdminMatchEdit: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !matchId;

  // Dades bàsiques del partit
  const [matchData, setMatchData] = useState<Partial<Match>>({
    opponent: '',
    location: '',
    match_date: '', // Inicialitzem buit, s'omplirà al useEffect o per defecte
    formation: 'F11',
    team_id: '',
    latitude: undefined,
    longitude: undefined,
    result_home: undefined,
    result_away: undefined,
    report: '',
    scorers: []
  });

  // Estat del camp (PositionID -> User)
  const [lineup, setLineup] = useState<{ [key: string]: User }>({});
  
  // Queries
  const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: TeamService.getAll });
  
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => MatchService.getById(matchId!),
    enabled: !isNew
  });

  // Carregar jugadors de l'equip seleccionat (Plantilla)
  const { data: teamRoster = [] } = useQuery({
    queryKey: ['teamPlayers', matchData.team_id],
    queryFn: () => TeamService.getTeamPlayers(matchData.team_id!),
    enabled: !!matchData.team_id
  });

  // Inicialitzar dades si editem o per defecte
  useEffect(() => {
    if (match) {
      setMatchData({
        team_id: match.team_id,
        opponent: match.opponent,
        location: match.location,
        match_date: toLocalISOString(match.match_date),
        formation: match.formation,
        latitude: match.latitude,
        longitude: match.longitude,
        result_home: match.result_home,
        result_away: match.result_away,
        report: match.report || '',
        scorers: match.scorers || []
      });
      if (match.lineup) {
        if (match.lineup.positions) {
            setLineup(match.lineup.positions);
            if (match.lineup.formation) {
                 setMatchData(prev => ({ ...prev, formation: match.lineup.formation }));
            }
        } else {
            setLineup(match.lineup);
        }
      }
    } else if (isNew && !matchData.match_date) {
        // Si és nou, posem la data actual formatada correctament
        const now = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');
        const currentLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        setMatchData(prev => ({ ...prev, match_date: currentLocal }));
    }
  }, [match, isNew]);



  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        team_id: matchData.team_id!,
        opponent: matchData.opponent!,
        location: matchData.location!,
        match_date: new Date(matchData.match_date!).toISOString(),
        formation: matchData.formation!,
        latitude: matchData.latitude,
        longitude: matchData.longitude,
        result_home: matchData.result_home,
        result_away: matchData.result_away,
        report: matchData.report,
        scorers: matchData.scorers,
        lineup: {
            formation: matchData.formation!,
            positions: lineup
        }
      };

      if (isNew) {
        await MatchService.create(payload);
      } else {
        await MatchService.update(matchId!, payload);
      }
    },
    onSuccess: () => {
      // Invalidem les queries per assegurar que es recarreguen les dades fresques
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      
      navigate('/keyper/matches');
      alert('Partit guardat correctament!');
    },
    onError: (err) => alert('Error guardant partit: ' + err)
  });

  const addScorer = (team: 'home' | 'away') => {
    const name = prompt('Nom del golejador:');
    const minute = parseInt(prompt('Minut del gol:') || '0');
    if (name) {
      setMatchData(prev => ({
        ...prev,
        scorers: [...(prev.scorers || []), { name, minute, team }]
      }));
    }
  };

  const removeScorer = (index: number) => {
    setMatchData(prev => ({
      ...prev,
      scorers: prev.scorers?.filter((_, i) => i !== index)
    }));
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, user: User, source: 'roster' | 'field', posId?: number) => {
    e.dataTransfer.setData('user', JSON.stringify(user));
    e.dataTransfer.setData('source', source);
    if (posId) e.dataTransfer.setData('sourcePositionId', posId.toString());
  };

  const handleDropOnField = (e: React.DragEvent, targetPosId: number) => {
    e.preventDefault();
    const userStr = e.dataTransfer.getData('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const source = e.dataTransfer.getData('source');
    const sourcePositionId = e.dataTransfer.getData('sourcePositionId');

    setLineup(prev => {
      const next = { ...prev };
      // Si movem dins del camp, esborrar origen
      if (source === 'field' && sourcePositionId) {
        delete next[sourcePositionId];
      }
      next[targetPosId] = user;
      return next;
    });
  };

  const handleRemoveFromField = (posId: number) => {
    setLineup(prev => {
      const next = { ...prev };
      delete next[posId];
      return next;
    });
  };

  if (matchLoading && !isNew) return <div>Carregant...</div>;

  const positions = matchData.formation === 'F11' ? FORMATION_F11 : FORMATION_F7;
  
  // Jugadors disponibles = Plantilla - Els que ja estan al camp
  const availablePlayers = teamRoster.filter(p => !Object.values(lineup).some(l => l.id === p.id));

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header Form */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/10 p-4 sticky top-0 z-20 shadow-sm mr-[350px]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">{isNew ? 'Nou Partit' : 'Editar Partit'}</h2>
            <div className="flex gap-2">
                <button onClick={() => navigate('/keyper/matches')} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 dark:text-white dark:border-white/10">Cancel·lar</button>
                <button 
                  onClick={() => saveMutation.mutate()} 
                  disabled={!matchData.team_id || !matchData.opponent}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-bold"
                >
                  Guardar Partit
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equip Local</label>
                <select 
                    value={matchData.team_id}
                    onChange={(e) => {
                        const newTeamId = e.target.value;
                        const selectedTeam = teams.find(t => t.id === newTeamId);
                        let newFormation = matchData.formation;
                        
                        if (selectedTeam?.tag?.toLowerCase().includes('7')) {
                            newFormation = 'F7';
                        } else if (selectedTeam) {
                             newFormation = 'F11';
                        }
                        
                        setMatchData({...matchData, team_id: newTeamId, formation: newFormation});
                    }}
                    className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                    disabled={!isNew} // Un cop creat no canviem l'equip per no trencar el lineup
                >
                    <option value="">Selecciona Equip...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rival</label>
                <input 
                    type="text" 
                    value={matchData.opponent}
                    onChange={(e) => setMatchData({...matchData, opponent: e.target.value})}
                    className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                    placeholder="Ex: CF Manresa"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data i Hora</label>
                <input 
                    type="datetime-local" 
                    value={matchData.match_date}
                    onChange={(e) => setMatchData({...matchData, match_date: e.target.value})}
                    className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Formació</label>
                <div className="flex bg-gray-100 dark:bg-white/10 rounded p-1">
                    <button onClick={() => setMatchData({...matchData, formation: 'F7'})} className={`flex-1 py-1 rounded text-xs font-bold ${matchData.formation === 'F7' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>F7</button>
                    <button onClick={() => setMatchData({...matchData, formation: 'F11'})} className={`flex-1 py-1 rounded text-xs font-bold ${matchData.formation === 'F11' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>F11</button>
                </div>
            </div>

            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border dark:border-white/10">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Resultat Final</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] text-center mb-1 font-bold text-primary italic">Santpedor</p>
                            <input 
                                type="number" 
                                value={matchData.result_home ?? ''} 
                                onChange={(e) => setMatchData({...matchData, result_home: e.target.value ? parseInt(e.target.value) : undefined})}
                                className="w-full text-center text-2xl font-black p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                placeholder="?"
                            />
                        </div>
                        <div className="text-2xl font-bold opacity-30">-</div>
                        <div className="flex-1">
                            <p className="text-[10px] text-center mb-1 font-bold text-gray-400 italic">Rival</p>
                            <input 
                                type="number" 
                                value={matchData.result_away ?? ''} 
                                onChange={(e) => setMatchData({...matchData, result_away: e.target.value ? parseInt(e.target.value) : undefined})}
                                className="w-full text-center text-2xl font-black p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                placeholder="?"
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Golejadors</label>
                        <div className="flex gap-2">
                            <button onClick={() => addScorer('home')} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold hover:bg-primary/20">+ Santpedor</button>
                            <button onClick={() => addScorer('away')} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold hover:bg-gray-300">+ Rival</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-white dark:bg-black/20 rounded border dark:border-white/10">
                        {matchData.scorers?.map((s, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${s.team === 'home' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                                <span>{s.name} ({s.minute}')</span>
                                <button onClick={() => removeScorer(idx)} className="material-symbols-outlined text-xs hover:scale-125 transition-transform">close</button>
                            </div>
                        ))}
                        {(!matchData.scorers || matchData.scorers.length === 0) && <p className="text-gray-400 italic text-xs self-center">No hi ha golejadors registrats</p>}
                    </div>
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Crònica del Partit</label>
                    <textarea 
                        value={matchData.report}
                        onChange={(e) => setMatchData({...matchData, report: e.target.value})}
                        className="w-full p-3 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white min-h-[150px] text-sm"
                        placeholder="Escriu aquí el resum del partit, incidències..."
                    ></textarea>
                </div>
            </div>
            
            <div className="md:col-span-4 mt-4">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ubicació al Mapa</label>
               <LocationPicker 
                  initialLat={matchData.latitude}
                  initialLng={matchData.longitude}
                  initialLocationName={matchData.location}
                  onLocationSelect={(lat, lng) => setMatchData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                  onLocationNameChange={(name) => setMatchData(prev => ({ ...prev, location: name }))}
               />
            </div>
        </div>
      </div>

      <div className="flex gap-4 p-4 items-start">
         {/* CAMP DE FUTBOL */}
         <div className="flex-1 bg-green-600 rounded-xl relative shadow-inner border-4 border-white/20 overflow-hidden select-none min-h-[1100px] mr-[350px]">
            {/* Marques del camp */}
            <div className="absolute inset-4 border-2 border-white/40 rounded opacity-60 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/2 w-64 h-32 border-2 border-white/40 border-b-0 -translate-x-1/2 pointer-events-none bg-white/5"></div>
            <div className="absolute top-0 left-1/2 w-64 h-32 border-2 border-white/40 border-t-0 -translate-x-1/2 pointer-events-none bg-white/5"></div>

            {positions.map(pos => {
                const user = lineup[pos.id];
                return (
                    <div 
                        key={pos.id}
                        style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                        className="absolute w-24 h-24 flex flex-col items-center justify-center"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnField(e, pos.id)}
                    >
                        {user ? (
                            <div 
                                draggable 
                                onDragStart={(e) => handleDragStart(e, user, 'field', pos.id)}
                                className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center z-10"
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">{user.full_name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="mt-1 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm max-w-[120px] truncate">
                                    {user.full_name}
                                </div>
                                <button onClick={() => handleRemoveFromField(pos.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-black/10 text-white/50 font-bold text-xs">
                                {pos.label}
                            </div>
                        )}
                    </div>
                );
            })}
         </div>

         {/* SIDEBAR PLANTILLA */}
         <div className="w-80 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col fixed right-4 top-[80px] h-[calc(100vh-100px)] overflow-hidden z-50">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-t-xl shrink-0">
                <h3 className="font-bold dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span> Plantilla Disponible
                </h3>
                {!matchData.team_id && <p className="text-xs text-red-500 mt-1">Selecciona un equip primer.</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {availablePlayers.map(user => (
                    <div 
                        key={user.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, user, 'roster')}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                             {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">{user.full_name?.charAt(0)}</div>
                             )}
                        </div>
                        <div className="truncate">
                            <p className="font-bold text-sm dark:text-white truncate">{user.full_name}</p>
                        </div>
                    </div>
                ))}
                {matchData.team_id && availablePlayers.length === 0 && (
                    <div className="text-center p-4 text-gray-400 text-xs">Tots els jugadors convocats.</div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminMatchEdit;
