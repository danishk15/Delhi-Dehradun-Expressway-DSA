'use client';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(77.1025);
  const [lat, setLat] = useState(28.7041);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', async () => {
      try {
        // Fetch cities
        const citiesRes = await fetch('http://localhost:3001/cities');
        const cities = await citiesRes.json();
        
        cities.forEach((city: any) => {
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([city.lng, city.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${city.name}</h3>`))
            .addTo(map.current!);
        });

        // Add a dummy road source
        map.current!.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': cities.map((c: any) => [c.lng, c.lat])
                }
            }
        });

        map.current!.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#8B5CF6',
                'line-width': 4
            }
        });
      } catch(e) {
         console.error('Error loading map data:', e);
      }
    });
  });

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
