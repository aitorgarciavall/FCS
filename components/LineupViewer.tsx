import React from 'react';

interface LineupViewerProps {
  formation: 'F7' | 'F11';
  lineupData: any;
}

const LineupViewer: React.FC<LineupViewerProps> = ({ formation, lineupData }) => {
  if (!lineupData || !lineupData.positions) return <div>No hi ha alineació disponible</div>;

  const positions = lineupData.positions;
  const isF7 = formation === 'F7';

  // Definim les posicions relatives (top%, left%) per a cada formació estandard
  // Això és una simplificació, idealment vindria de la configuració de la formació guardada
  // Però com que guardem { "gk": "Nom", "lb": "Nom" }, necessitem saber on pintar "gk", "lb", etc.
  
  // Mapeig de claus de posició a coordenades visuals aproximades
  const getCoordinates = (posKey: string, format: string) => {
    const coords: Record<string, { top: string, left: string }> = {
      // Porter
      'gk': { top: '88%', left: '50%' },
      
      // Defenses F11 (4 defenses)
      'lb': { top: '70%', left: '20%' },
      'lcb': { top: '75%', left: '38%' },
      'rcb': { top: '75%', left: '62%' },
      'rb': { top: '70%', left: '80%' },
      
      // Defenses F7 (3 defenses o 2)
      'ld': { top: '75%', left: '25%' }, // Left Defender
      'cd': { top: '80%', left: '50%' }, // Center Defender
      'rd': { top: '75%', left: '75%' }, // Right Defender
      
      // Migcampistes F11
      'lm': { top: '45%', left: '20%' },
      'lcm': { top: '55%', left: '40%' },
      'rcm': { top: '55%', left: '60%' },
      'rm': { top: '45%', left: '80%' },
      'cam': { top: '40%', left: '50%' },
      'cdm': { top: '65%', left: '50%' },

      // Migcampistes F7
      'lm7': { top: '50%', left: '20%' },
      'cm7': { top: '55%', left: '50%' },
      'rm7': { top: '50%', left: '80%' },

      // Davanters F11
      'lw': { top: '20%', left: '20%' },
      'st': { top: '15%', left: '50%' },
      'rw': { top: '20%', left: '80%' },
      
      // Davanters F7
      'st7': { top: '20%', left: '50%' },
      'ls7': { top: '25%', left: '30%' },
      'rs7': { top: '25%', left: '70%' },
    };

    // Si la posició ve del guardat dinàmic (ex: pos_0, pos_1), necessitem la metadata
    // Per aquest exemple, assumirem que el `lineupData` pot contenir coordenades personalitzades
    // o utilitzarem un fallback simple si no coincideix.
    
    return coords[posKey] || { top: '50%', left: '50%' };
  };

  // Si el lineupData té estructura personalitzada de coords (del drag & drop editor)
  // lineupData: { formation: '1-4-3-3', players: [{ name: 'Pol', x: 50, y: 80 }, ...] }
  // Aquesta seria la implementació ideal. Si estem usant l'estructura simple key-value:
  
  const renderPlayer = (key: string, name: string) => {
    // Intentem inferir coordenades o utilitzar les guardades
    // A AdminMatchEdit guardàvem un objecte `lineup`. 
    // Si aquest objecte és simple { gk: "Aitor" }, usem hardcoded coords.
    // Si és complex (amb coords), usem les coords.
    
    // NOTA: Com que no hem vist l'editor de lineup, assumirem un map simple per ara
    // i ho millorarem si l'editor és més complex.
    
    const coords = getCoordinates(key, formation);

    return (
      <div 
        key={key}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
        style={{ top: coords.top, left: coords.left }}
      >
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
           <span className="font-bold text-primary text-xs md:text-sm">{name.substring(0, 2).toUpperCase()}</span>
        </div>
        <div className="mt-1 bg-black/70 text-white text-[10px] md:text-xs px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap">
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full aspect-[2/3] md:aspect-[3/4] max-w-[400px] mx-auto bg-green-600 rounded-xl shadow-inner border-4 border-white/20 relative overflow-hidden">
        {/* Gespa Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #000 20px, #000 40px)' }}>
        </div>
        
        {/* Línies del camp */}
        <div className="absolute top-0 bottom-0 left-4 right-4 border-x-2 border-white/40"></div>
        <div className="absolute top-4 bottom-4 left-0 right-0 border-y-2 border-white/40"></div>
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/40 rounded-full"></div>
        
        {/* Àrees */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-t-0 border-white/40"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-b-0 border-white/40"></div>

        {/* Jugadors */}
        {Object.entries(lineupData.positions || {}).map(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
                return renderPlayer(key, value);
            }
            return null;
        })}
    </div>
  );
};

export default LineupViewer;
