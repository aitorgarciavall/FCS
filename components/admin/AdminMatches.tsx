import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MatchService } from '../../services/matchService';

const AdminMatches: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: MatchService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: MatchService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
    onError: (err) => alert('Error esborrant partit')
  });

  const handleDelete = (id: string) => {
    if (confirm('Segur que vols esborrar aquest partit?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Carregant partits...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Gestió de Partits</h2>
          <p className="text-gray-500">Planifica partits i defineix alineacions</p>
        </div>
        <button 
          onClick={() => navigate('/keyper/matches/new')}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span> Nou Partit
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
        {matches.length === 0 ? (
           <div className="p-12 text-center text-gray-500">No hi ha partits programats.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Equip Local</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Resultat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rival</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lloc</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4 dark:text-white font-mono text-sm">
                    {new Date(match.match_date).toLocaleDateString()} {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{match.teams?.name || 'Desconegut'}</td>
                  <td className="px-6 py-4">
                    {match.result_home !== undefined && match.result_away !== undefined ? (
                      <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded font-black dark:text-white">
                        {match.result_home} - {match.result_away}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Pendent</span>
                    )}
                  </td>
                  <td className="px-6 py-4 dark:text-white">{match.opponent}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{match.location}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/keyper/matches/edit/${match.id}`)} className="text-blue-500 hover:text-blue-700 mr-3">
                      <span className="material-symbols-outlined">edit_note</span>
                    </button>
                    <button onClick={() => handleDelete(match.id)} className="text-red-500 hover:text-red-700">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMatches;
