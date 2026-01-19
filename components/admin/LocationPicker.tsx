import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix per a les icones de Leaflet que a vegades fallen en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialLocationName?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  onLocationNameChange?: (name: string) => void;
}

const LocationMarker: React.FC<{ 
  position: { lat: number, lng: number } | null, 
  setPosition: (pos: { lat: number, lng: number }) => void,
  onSelect: (lat: number, lng: number) => void 
}> = ({ position, setPosition, onSelect }) => {
  
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Si la posició canvia externament (ex: cerca), centrem el mapa
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

// Component per centrar el mapa inicialment si hi ha coordenades
const MapRecenter: React.FC<{ lat: number, lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, initialLocationName, onLocationSelect, onLocationNameChange }) => {
  // Coordenades per defecte (Santpedor)
  const defaultCenter = { lat: 41.7833, lng: 1.8389 };
  
  const [position, setPosition] = useState<{ lat: number, lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const [searchQuery, setSearchQuery] = useState(initialLocationName || '');
  const [isSearching, setIsSearching] = useState(false);

  // Sincronitzar estat local si les props canvien
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    if (initialLocationName !== undefined) {
      setSearchQuery(initialLocationName);
    }
  }, [initialLocationName]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        
        const newPos = { lat: newLat, lng: newLng };
        setPosition(newPos);
        onLocationSelect(newLat, newLng);
        
        // Opcional: Actualitzar el nom amb el nom oficial trobat, o mantenir el que l'usuari ha escrit.
        // En aquest cas, mantenim el text de cerca, però avisem al pare si calgués.
        // Si volguéssim substituir el text per l'oficial: 
        // if (onLocationNameChange) onLocationNameChange(result.display_name);
        // setSearchQuery(result.display_name);
      } else {
        alert('No s\'ha trobat la ubicació.');
      }
    } catch (error) {
      console.error('Error cercant ubicació:', error);
      alert('Error al cercar la ubicació.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchQuery(newVal);
    if (onLocationNameChange) {
      onLocationNameChange(newVal);
    }
  };

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 z-0 relative group">
      {/* Barra de cerca */}
      <div className="absolute top-2 left-12 right-2 z-[1000] flex gap-2">
        <div className="flex-1 bg-white rounded-md shadow-md flex items-center overflow-hidden border border-gray-200">
            <input 
                type="text" 
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca una ubicació (ex: Camp de Futbol Santpedor)"
                className="w-full px-3 py-2 outline-none text-sm"
            />
            <button 
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="p-2 hover:bg-gray-100 text-gray-600 border-l"
            >
                {isSearching ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                    <span className="material-symbols-outlined text-sm">search</span>
                )}
            </button>
        </div>
      </div>

      <MapContainer 
        center={position || defaultCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationSelect} />
        {(initialLat && initialLng) && <MapRecenter lat={initialLat} lng={initialLng} />}
      </MapContainer>
      
      <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs shadow-md z-[1000]">
        {position ? (
          <p>📍 Seleccionat: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
        ) : (
          <p>👆 Fes clic al mapa o cerca per marcar la ubicació</p>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
