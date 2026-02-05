import React, { useEffect, useState, useMemo } from 'react';
import { scheduleService } from '../services/scheduleService';
import { TrainingSession } from '../types';

interface ProcessedSession extends TrainingSession {
  style: React.CSSProperties;
}

const ScheduleSection: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuració de l'horari visual
  const START_HOUR = 16.5; // 16:30 per donar aire abans de les 17:00
  const END_HOUR = 22.5;   // 22:30 per donar aire després de les 22:00
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await scheduleService.getSchedule();
      setSessions(data);
    } catch (error) {
      console.error('Error carregant horaris:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { id: 1, name: 'Dilluns' },
    { id: 2, name: 'Dimarts' },
    { id: 3, name: 'Dimecres' },
    { id: 4, name: 'Dijous' },
    { id: 5, name: 'Divendres' },
  ];
  // Opcional: cap de setmana si n'hi ha
  const weekend = [
    { id: 6, name: 'Dissabte' },
    { id: 7, name: 'Diumenge' },
  ];

  const hasWeekend = sessions.some(s => s.day_of_week > 5);
  const displayDays = hasWeekend ? [...days, ...weekend] : days;

  // Utilitat per convertir hora "HH:MM:SS" a decimal (Ex: "17:30" -> 17.5)
  const timeToDecimal = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  // Funció per assignar colors consistents basats en el nom de l'equip
  const getTeamColor = (teamName: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
      'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    ];
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // ALGORITME DE POSICIONAMENT I SOLAPAMENT
  const processDaySessions = (dayId: number) => {
    const daySessions = sessions
      .filter(s => s.day_of_week === dayId)
      .map(s => ({
        ...s,
        startDec: timeToDecimal(s.start_time),
        endDec: timeToDecimal(s.end_time),
      }))
      .sort((a, b) => a.startDec - b.startDec || b.endDec - a.endDec);

    if (daySessions.length === 0) return { events: [], totalTracks: 1 };

    // Agrupem sessions que es solapen en "tracks" (sub-files dins del dia)
    const tracks: typeof daySessions[] = [];

    daySessions.forEach(session => {
      let placed = false;
      for (let i = 0; i < tracks.length; i++) {
        const lastInTrack = tracks[i][tracks[i].length - 1];
        if (lastInTrack.endDec <= session.startDec) {
          tracks[i].push(session);
          (session as any).trackIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        tracks.push([session]);
        (session as any).trackIndex = tracks.length - 1;
      }
    });

    const totalTracks = tracks.length;

    const events = daySessions.map(session => {
      const left = ((session.startDec - START_HOUR) / TOTAL_HOURS) * 100;
      const width = ((session.endDec - session.startDec) / TOTAL_HOURS) * 100;
      
      const trackHeight = 100 / totalTracks;
      const top = (session as any).trackIndex * trackHeight;

      return {
        ...session,
        style: {
          left: `${Math.max(0, left)}%`,
          width: `${Math.max(0.5, width)}%`, // Mínim visual
          top: `${top}%`,
          height: `${trackHeight}%`,
          position: 'absolute' as const,
        }
      };
    });

    return { events, totalTracks };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Generar marques d'hora per l'eix X
  const timeMarkers = [];
  for (let i = Math.ceil(START_HOUR); i < END_HOUR; i++) {
    timeMarkers.push(i);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-[#111813] dark:text-white mb-4 uppercase tracking-tight">
          Horaris d'Entrenament
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Consulta la planificació setmanal dels camps.
        </p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col">
        {/* Header Hores (Eix X) */}
        <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 z-20 sticky top-0">
          <div className="w-24 md:w-32 flex-shrink-0 border-r border-gray-200 dark:border-white/10 p-4 font-bold text-slate-400 text-center text-[10px] flex items-center justify-center uppercase tracking-widest">
            Dia / Hora
          </div>
          <div className="flex-1 relative h-12">
            {timeMarkers.map(hour => (
              <div 
                key={hour} 
                className="absolute text-xs font-semibold text-slate-400"
                style={{ left: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%`, transform: 'translateX(-50%)', top: '50%', marginTop: '-6px' }}
              >
                {hour}:00
              </div>
            ))}
          </div>
        </div>

        {/* Cos de l'Horari: Files per Dia */}
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          {displayDays.map(day => {
            const { events, totalTracks } = processDaySessions(day.id);
            const rowHeight = Math.max(1, totalTracks) * 60; // 60px d'alçada base per track
            
            return (
              <div key={day.id} className="flex group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors" style={{ minHeight: '60px' }}>
                {/* Etiqueta del Dia */}
                <div className="w-24 md:w-32 flex-shrink-0 border-r border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-white/5 flex items-center justify-center p-2 text-center sticky left-0 z-10">
                  <span className="font-black text-[#111813] dark:text-white uppercase text-xs md:text-sm">{day.name}</span>
                </div>

                {/* Contingut del Dia */}
                <div className="flex-1 relative" style={{ height: `${rowHeight}px` }}>
                  
                  {/* Línies de fons verticals (Hores) */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {timeMarkers.map(hour => (
                      <div 
                        key={`line-${hour}`}
                        className="absolute h-full border-l border-dashed border-gray-200 dark:border-white/5"
                        style={{ left: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Sessions */}
                  <div className="absolute inset-0 z-10 p-1">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className={`absolute rounded-md border p-1 md:p-2 shadow-sm flex flex-col justify-center overflow-hidden transition-all hover:z-20 hover:scale-[1.01] cursor-default ${getTeamColor(event.team_name)}`}
                        style={{
                          ...event.style,
                          left: `calc(${event.style.left} + 2px)`,
                          width: `calc(${event.style.width} - 4px)`,
                          height: `calc(${event.style.height} - 4px)`,
                          top: `calc(${event.style.top} + 2px)`,
                        }}
                        title={`${event.team_name} (${event.start_time.slice(0,5)} - ${event.end_time.slice(0,5)})`}
                      >
                        <div className="text-[10px] md:text-xs font-bold leading-tight truncate">
                          {event.team_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] md:text-[10px] opacity-80 font-mono">
                            {event.start_time.slice(0,5)}-{event.end_time.slice(0,5)}
                          </span>
                          {event.field_name && (
                            <span className="text-[8px] md:text-[9px] opacity-70 truncate border-l border-current pl-1.5 hidden sm:block">
                               {event.field_name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></span>
          <span>Entrenaments regulars</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-sm">schedule</span>
           <span>Horari visible: 17:00 - 22:30</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;

