import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TeamService } from '../services/teamService';
import { TeamCategory, User } from '../types';

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<TeamCategory | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Executem les dues peticions en paral·lel per eficiència
        const [teamData, playersData] = await Promise.all([
          TeamService.getById(id),
          TeamService.getTeamPlayers(id)
        ]);
        
        setTeam(teamData);
        setPlayers(playersData || []);
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Carregant plantilla...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4 text-center">
        <h2 className="text-2xl font-bold dark:text-white mb-2">Equip no trobat</h2>
        <p className="text-gray-500 mb-6">No hem pogut trobar l'equip que busques.</p>
        <Link to="/equips" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Tornar a Equips
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-20 pb-20">
      {/* Team Header / Hero */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={team.imageUrl || "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80"} 
          alt={team.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto">
          <Link to="/equips" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
            Tornar a Equips
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-2 inline-block">
                {team.tag || team.age}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{team.name}</h1>
              <p className="text-white/80 text-lg">Temporada 2025-2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            Plantilla
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {players.length} Jugadors
          </span>
        </div>

        {players.length === 0 ? (
          <div className="bg-white dark:bg-surface-dark rounded-xl p-10 text-center border border-gray-100 dark:border-white/5 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">person_off</span>
            <p className="text-gray-500 dark:text-gray-400">Encara no hi ha jugadors assignats a aquest equip.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {players.map((player) => (
              <div key={player.id} className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-white/5 group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {player.avatar_url ? (
                    <img 
                      src={player.avatar_url} 
                      alt={player.full_name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <span className="material-symbols-outlined text-6xl">person</span>
                    </div>
                  )}
                  {/* Overlay gradient for text readability if needed, currently clean */}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate" title={player.full_name}>
                    {player.full_name || "Jugador sense nom"}
                  </h3>
                  {/* Placeholder for position/number since we don't have it in DB yet */}
                  <p className="text-xs text-gray-500 uppercase mt-1">Jugador</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
