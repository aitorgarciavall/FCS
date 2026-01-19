import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { MatchService, Match } from '../../services/matchService';
import { User } from '../../types';
import MatchDetailModal from './MatchDetailModal';

const AdminCalendar: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userTeams, setUserTeams] = useState<{ id: string, name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Obtenir detalls de l'usuari per saber els seus equips
        const userDetails = await UserService.getUserById(user.id);
        
        if (userDetails && userDetails.teams && userDetails.teams.length > 0) {
          setUserTeams(userDetails.teams);
          const teamIds = userDetails.teams.map(t => t.id);
          
          // 2. Obtenir partits d'aquests equips
          const teamMatches = await MatchService.getByTeamIds(teamIds);
          setMatches(teamMatches);
        } else {
          setMatches([]);
        }
      } catch (err: any) {
        console.error('Error carregant calendari:', err);
        setError('Error carregant els partits. Torna-ho a provar.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Formateig de dates
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ca-ES', options);
  };

  const getStatusColor = (match: Match) => {
    const matchDate = new Date(match.match_date);
    const now = new Date();
    
    // Si ha passat fa més de 2 hores (aprox durada partit)
    if (matchDate.getTime() + (2 * 60 * 60 * 1000) < now.getTime()) {
      return 'bg-gray-100 text-gray-500 border-gray-200'; // Finalitzat
    }
    // Si és avui
    if (matchDate.toDateString() === now.toDateString()) {
      return 'bg-green-50 text-green-700 border-green-200'; // Avui
    }
    // Futur
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#111813] dark:text-white">El meu Calendari</h1>
          <p className="text-gray-500 text-sm mt-1">
            Propers partits i esdeveniments dels teus equips
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {userTeams.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 text-center">
          <span className="material-symbols-outlined text-gray-400 text-5xl mb-4">event_busy</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No tens equips assignats</h3>
          <p className="text-gray-500 mt-2">Contacta amb un administrador per assignar-te a un equip i veure el seu calendari.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-gray-500 self-center mr-2">Filtrant per:</span>
            {userTeams.map(team => (
              <span key={team.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {team.name}
              </span>
            ))}
          </div>

          {matches.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 text-center">
              <p className="text-gray-500">No hi ha partits programats per als teus equips actualment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <div 
                  key={match.id} 
                  onClick={() => setSelectedMatch(match)}
                  className={`p-6 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.01] ${getStatusColor(match)} dark:bg-surface-dark dark:border-white/10`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {match.teams?.name || 'El teu equip'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {formatDate(match.match_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-lg font-bold text-gray-900 dark:text-white">
                        <span>{match.teams?.name || 'Local'}</span>
                        <span className="text-gray-400 font-normal text-sm">VS</span>
                        <span>{match.opponent}</span>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {match.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                      <div className="text-center px-4">
                         <span className="block text-xs text-gray-400 uppercase">Format</span>
                         <span className="font-bold text-gray-700 dark:text-gray-300">{match.formation}</span>
                      </div>
                      <div className="ml-2">
                         <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedMatch && (
        <MatchDetailModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
};

export default AdminCalendar;
