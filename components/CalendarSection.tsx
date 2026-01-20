import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MatchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import { useUserRoles } from '../hooks/useUserRoles';

const DAYS_OF_WEEK = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
const MONTHS = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
];

const CalendarSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: roles = [] } = useUserRoles(user?.id);
  
  // Rols amb permís per crear (SuperAdmin=1, Coach=4)
  const canCreate = roles.some(r => [1, 4].includes(r.id));

  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenir tots els partits
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: MatchService.getAll
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday... we want 0 = Monday, 6 = Sunday
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Filtrar partits del mes actual
  const getEventsForDay = (day: number) => {
    return matches.filter(m => {
      const d = new Date(m.match_date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleCreateMatch = () => {
    navigate('/keyper/matches/new');
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
          Calendari Oficial
        </h2>
        
        <div className="flex gap-2">
            {canCreate && (
                <button 
                    onClick={handleCreateMatch}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nou Partit
                </button>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold capitalize text-gray-800 dark:text-white min-w-[200px]">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex items-center bg-white dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 p-1">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={goToday} className="px-3 text-xs font-bold uppercase hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                Avui
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="p-3 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-gray-200 dark:bg-white/10 gap-px">
          {/* Empty cells for previous month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white dark:bg-surface-dark p-2 opacity-50"></div>
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const events = getEventsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <div key={day} className={`bg-white dark:bg-surface-dark p-2 min-h-[120px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group relative ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                    </span>
                </div>
                
                <div className="space-y-1">
                  {events.map(match => (
                    <div 
                        key={match.id}
                        onClick={() => navigate(`/partits/${match.id}`)}
                        className={`text-xs p-1.5 rounded border border-l-4 cursor-pointer hover:opacity-80 transition-opacity ${
                            match.formation === 'F7' 
                                ? 'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-200'
                                : 'bg-green-50 border-green-200 border-l-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-200'
                        }`}
                    >
                      <div className="font-bold truncate">{match.opponent}</div>
                      <div className="flex items-center gap-1 text-[10px] opacity-75">
                         <span className="material-symbols-outlined text-[10px]">schedule</span>
                         {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] mt-0.5">
                         <span className="text-[9px] px-1 rounded bg-black/10 dark:bg-white/10 font-bold">{match.formation || 'F11'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;