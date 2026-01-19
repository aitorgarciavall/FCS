import React from 'react';

interface LineupViewerProps {
  formation: 'F7' | 'F11' | string;
  lineupData: any;
}

// Definicions de formacions (Copiades de AdminMatchEdit per consistència)
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

const LineupViewer: React.FC<LineupViewerProps> = ({ formation, lineupData }) => {
  if (!lineupData || !lineupData.positions) return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl text-gray-500">
          <span className="material-symbols-outlined text-4xl mb-2">tactic</span>
          <p>Alineació no disponible</p>
      </div>
  );

  const formationConfig = (formation === 'F7' || formation?.includes('7')) ? FORMATION_F7 : FORMATION_F11;

  const getPlayerName = (user: any): string => {
      if (!user) return '';
      if (typeof user === 'string') return user;
      return user.full_name || user.name || 'Jugador';
  };

  const getPlayerAvatar = (user: any): string | null => {
      if (!user || typeof user === 'string') return null;
      return user.avatar_url || null;
  };

  return (
    <div className="w-full aspect-[2/3] md:aspect-[3/4] max-w-[400px] mx-auto bg-green-600 rounded-xl shadow-inner border-4 border-white/20 relative overflow-hidden select-none">
        {/* Gespa Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #000 20px, #000 40px)' }}>
        </div>
        
        {/* Línies del camp */}
        <div className="absolute top-0 bottom-0 left-4 right-4 border-x-2 border-white/40 opacity-70"></div>
        <div className="absolute top-4 bottom-4 left-0 right-0 border-y-2 border-white/40 opacity-70"></div>
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/40 opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/40 rounded-full opacity-70"></div>
        
        {/* Àrees */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-white/40 opacity-70"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-20 border-2 border-b-0 border-white/40 opacity-70"></div>
        
        {/* Punt penal i centre */}
        <div className="absolute top-[15%] left-1/2 w-1 h-1 bg-white/60 rounded-full transform -translate-x-1/2"></div>
        <div className="absolute bottom-[15%] left-1/2 w-1 h-1 bg-white/60 rounded-full transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>


        {/* Jugadors */}
        {formationConfig.map(pos => {
            const user = lineupData.positions[pos.id];
            
            if (!user) {
                // Si no hi ha jugador en aquesta posició, no mostrem res (o podríem mostrar la posició buida fantasma)
                return null;
            }

            const name = getPlayerName(user);
            const avatar = getPlayerAvatar(user);

            return (
                <div 
                    key={pos.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-default"
                    style={{ top: pos.top, left: pos.left }}
                >
                    <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 border-2 border-white shadow-lg rounded-full flex items-center justify-center overflow-hidden z-10">
                            {avatar ? (
                                <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-gray-500 text-xs md:text-sm">{name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        {/* Dorsal (si en tinguéssim) podríem posar-lo aquí */}
                    </div>
                    
                    <div className="mt-1 bg-black/70 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap font-bold shadow-sm max-w-[100px] truncate">
                        {name}
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default LineupViewer;
