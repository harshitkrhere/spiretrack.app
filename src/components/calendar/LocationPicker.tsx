import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from 'react-leaflet';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (location: string) => void;
}

const LocationMarker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
    isOpen,
    onClose,
    onSelectLocation
}) => {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Search for a location
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            // Reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            if (data && data.display_name) {
                // Clean up address: take first 3 parts for brevity
                const address = data.display_name.split(',').slice(0, 3).join(',');
                onSelectLocation(address);
                onClose();
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            onSelectLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                        <Dialog.Title className="text-lg font-bold text-slate-900">
                            Select Location
                        </Dialog.Title>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                            <XMarkIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search for a place..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm shadow-sm"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
                        </form>
                        
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute left-6 right-6 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-[1000]">
                                {searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            handleSelect(parseFloat(result.lat), parseFloat(result.lon));
                                            setSearchResults([]);
                                            setSearchQuery('');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 truncate"
                                    >
                                        {result.display_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="flex-1 relative bg-slate-100">
                        <MapContainer 
                            center={[51.505, -0.09]} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            {/* CartoDB Voyager Tiles - Clean, Modern, Free */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <ZoomControl position="bottomright" />
                            <LocationMarker onSelect={handleSelect} />
                        </MapContainer>
                        
                        {/* Overlay Instruction */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-medium text-slate-600 pointer-events-none z-[400]">
                            Click anywhere on the map to select
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
