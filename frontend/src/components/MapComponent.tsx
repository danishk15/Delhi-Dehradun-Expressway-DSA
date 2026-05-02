'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CITIES } from '@/data';

let icon: L.Icon;

export default function MapComponent({ edges }: { edges: [number, number][][] }) {
  if (typeof window !== 'undefined' && !icon) {
    icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  }
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
        {Object.values(CITIES).map((city: any, idx) => (
          <Marker key={idx} position={[city.lat, city.lng]} icon={icon}>
            <Popup>
              <span className="font-bold text-gray-800">{city.name}</span>
            </Popup>
          </Marker>
        ))}
        {edges && edges.map((edgeCoords, idx) => (
          <Polyline key={`edge-${idx}`} positions={edgeCoords} color="#3B82F6" weight={4} opacity={0.8} />
        ))}
      </MapContainer>
    </div>
  );
}
