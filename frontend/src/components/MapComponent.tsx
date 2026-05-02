'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent() {
  // Hardcoded for standalone Vercel deployment
  const [cities] = useState<any[]>([
    { id: 1, name: 'Delhi Hub', lat: 28.7041, lng: 77.1025 },
    { id: 2, name: 'Baghpat Checkpoint', lat: 28.9428, lng: 77.2274 },
    { id: 3, name: 'Shamli', lat: 29.4478, lng: 77.3061 },
    { id: 4, name: 'Saharanpur Grid', lat: 29.9640, lng: 77.5460 },
    { id: 5, name: 'Dehradun Terminus', lat: 30.3165, lng: 78.0322 }
  ]);

  // Format coordinates for Leaflet Polyline: [lat, lng]
  const routeCoordinates: [number, number][] = cities.map(c => [c.lat, c.lng]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[29.2, 77.3]} // Centered between Delhi and Dehradun
        zoom={8} 
        style={{ height: '100%', width: '100%', background: '#0A0F1F' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {cities.map((city, idx) => (
          <Marker key={idx} position={[city.lat, city.lng]} icon={icon}>
            <Popup>
              <span className="font-bold text-gray-800">{city.name}</span>
            </Popup>
          </Marker>
        ))}
        {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="#3B82F6" weight={4} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
