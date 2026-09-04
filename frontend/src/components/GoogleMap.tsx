import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

declare const window: any;

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    type?: string;
    severity?: string;
  }>;
  showTraffic?: boolean;
  onMapLoad?: (map: any) => void;
}

export default function GoogleMap({
  center = { lat: 40.7589, lng: -73.9851 },
  zoom = 12,
  markers = [],
  showTraffic = true,
  onMapLoad
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    (loader as any)
      .load()
      .then((gMaps: any) => {
        if (!mapRef.current) return;

        const googleObj = gMaps || window.google;
        const mapInstance = new googleObj.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#242f3e' }]
            }
          ]
        });

        if (showTraffic) {
          const trafficLayer = new googleObj.maps.TrafficLayer();
          trafficLayer.setMap(mapInstance);
        }

        setMap(mapInstance);
        if (onMapLoad) onMapLoad(mapInstance);
      })
      .catch((err: any) => {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      });
  }, []);

  useEffect(() => {
    if (!map || !window.google) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><h4>${markerData.title}</h4></div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(markerData.position);
    });

    if (markers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, markers]);

  if (error) {
    return (
      <div style={{ padding: '20px', background: 'var(--surface-2)', borderRadius: '8px', color: 'var(--text-muted)' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden' }}
    />
  );
}
