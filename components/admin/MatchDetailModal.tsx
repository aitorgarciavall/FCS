import React, { useState } from 'react';
import { Match } from '../../services/matchService';
import LineupViewer from '../LineupViewer';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lineup' | 'location'>('lineup');

  // Formateig de data
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  };
  const dateString = new Date(match.match_date).toLocaleDateString('ca-ES', dateOptions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-primary p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="text-center">
            <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-2">{match.teams?.name} vs {match.opponent}</p>
            <h2 className="text-3xl font-black mb-1">{match.location}</h2>
            <p className="text-white/80 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              {dateString}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/10">
          <button 
            onClick={() => setActiveTab('lineup')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'lineup' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Alineació
          </button>
          <button 
            onClick={() => setActiveTab('location')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'location' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Ubicació
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#1a1a1a]">
          {activeTab === 'lineup' && (
            <div className="flex justify-center">
              {match.lineup ? (
                <div className="w-full max-w-md">
                   <LineupViewer formation={match.formation} lineupData={match.lineup} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2">tactic</span>
                  <p>No hi ha alineació disponible per aquest partit.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
               {match.latitude && match.longitude ? (
                 <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 relative z-0">
                    <MapContainer 
                        center={[match.latitude, match.longitude]} 
                        zoom={15} 
                        scrollWheelZoom={false} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[match.latitude, match.longitude]} />
                    </MapContainer>
                 </div>
               ) : (
                 <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 text-center">
                    No hi ha coordenades GPS per aquest partit.
                 </div>
               )}

               <div className="flex justify-center gap-4">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-700 dark:text-white"
                  >
                    <img src="https://www.google.com/images/branding/product/ico/maps15_bnuw3a_32dp.ico" alt="Google Maps" className="w-5 h-5" />
                    Obrir a Google Maps
                  </a>
                  {match.latitude && match.longitude && (
                     <a 
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${match.latitude},${match.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                     >
                        <span className="material-symbols-outlined">streetview</span>
                        Veure Street View
                     </a>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;
