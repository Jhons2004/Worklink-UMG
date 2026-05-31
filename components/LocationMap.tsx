'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para el icono por defecto de Leaflet en Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

function LocationMarker({ position, setPosition, onLocationSelect, readOnly }: any) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function LocationMap({ initialLat, initialLng, onLocationSelect, readOnly = false }: LocationMapProps) {
  const [position, setPosition] = useState<L.LatLngExpression | null>([initialLat, initialLng]);

  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  return (
    <div className="w-full h-full min-h-[250px] relative rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0">
      <MapContainer 
        center={[initialLat, initialLng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!readOnly}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position} 
          setPosition={setPosition} 
          onLocationSelect={onLocationSelect} 
          readOnly={readOnly}
        />
      </MapContainer>
    </div>
  );
}
