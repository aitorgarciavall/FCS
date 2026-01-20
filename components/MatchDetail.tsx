import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MatchService } from '../services/matchService';
import LineupViewer from './LineupViewer';

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => MatchService.getById(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Partit no trobat</h2>
        <button 
          onClick={() => navigate('/calendar')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Tornar al calendari
        </button>
      </div>
    );
  }

  const matchDate = new Date(match.match_date);
  const isPast = matchDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Tornar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10">
              {/* Header / Scoreboard */}
              <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-white">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-sm font-bold uppercase tracking-widest opacity-80">
                    {match.formation} • {matchDate.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center justify-between w-full max-w-2xl gap-4">
                    <div className="flex-1 text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center backdrop-blur-sm">
                         <span className="material-symbols-outlined text-4xl">shield</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase italic">CF Santpedor</h3>
                      <p className="text-xs opacity-70">{match.teams?.name}</p>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      {isPast ? (
                        <div className="flex items-center gap-4">
                          <span className="text-5xl md:text-7xl font-black italic">{match.result_home ?? '?'}</span>
                          <span className="text-2xl opacity-50 font-bold">-</span>
                          <span className="text-5xl md:text-7xl font-black italic">{match.result_away ?? '?'}</span>
                        </div>
                      ) : (
                        <div className="text-2xl md:text-4xl font-black italic opacity-50 uppercase tracking-tighter">
                          {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <div className="mt-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                        {isPast ? 'Finalitzat' : 'Pròxim Partit'}
                      </div>
                    </div>

                    <div className="flex-1 text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center backdrop-blur-sm">
                         <span className="material-symbols-outlined text-4xl">shield</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase italic">{match.opponent}</h3>
                      <p className="text-xs opacity-70">Visitant</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Details Tabs/Sections */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold flex items-center gap-2 border-b pb-2 dark:border-white/10 dark:text-white">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      Ubicació i Detalls
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estadi / Camp</p>
                        <p className="font-bold dark:text-white">{match.location || 'No especificada'}</p>
                      </div>
                      {match.latitude && match.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${match.latitude},${match.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-video bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border dark:border-white/10 hover:opacity-80 transition-opacity group relative"
                        >
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <div className="text-center">
                               <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">map</span>
                               <p className="text-xs mt-1">Veure a Google Maps</p>
                             </div>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-bold flex items-center gap-2 border-b pb-2 dark:border-white/10 dark:text-white">
                      <span className="material-symbols-outlined text-primary">description</span>
                      Crònica del Partit
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                       {match.report ? (
                         <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                           {match.report}
                         </div>
                       ) : (
                         <p className="text-gray-500 italic">No hi ha crònica disponible per aquest partit encara.</p>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Golejadors */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-white/10">
               <h4 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                  <span className="material-symbols-outlined text-primary">sports_soccer</span>
                  Golejadors
               </h4>
               
               {match.scorers && match.scorers.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-3">
                     <p className="text-xs font-bold uppercase tracking-widest text-primary">CF Santpedor</p>
                     {match.scorers.filter(s => s.team === 'home').map((s, idx) => (
                       <div key={idx} className="flex items-center gap-2 dark:text-white">
                         <span className="material-symbols-outlined text-sm opacity-50">sports_soccer</span>
                         <span className="font-bold">{s.name}</span>
                         <span className="text-xs opacity-50">{s.minute}'</span>
                       </div>
                     ))}
                   </div>
                   <div className="space-y-3">
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{match.opponent}</p>
                     {match.scorers.filter(s => s.team === 'away').map((s, idx) => (
                       <div key={idx} className="flex items-center gap-2 dark:text-white">
                         <span className="material-symbols-outlined text-sm opacity-50">sports_soccer</span>
                         <span className="font-bold">{s.name}</span>
                         <span className="text-xs opacity-50">{s.minute}'</span>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                    Informació de golejadors pendent de registrar
                 </div>
               )}
            </div>
          </div>

          {/* Sidebar - Lineup */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-white/10 sticky top-24">
               <h4 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                  <span className="material-symbols-outlined text-primary">tactic</span>
                  Alineació Inicial
               </h4>
               <LineupViewer 
                 formation={match.formation} 
                 lineupData={match.lineup} 
               />
               <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-xs text-gray-500 dark:text-gray-400">
                 <p className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">info</span>
                   L'alineació es confirma 1 hora abans del partit.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
