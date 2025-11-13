import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

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
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMap({
  center = { lat: 40.7589, lng: -73.9851 },
  zoom = 12,
  markers = [],
  showTraffic = true,
  onMapLoad
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string>('');
  const markersRef = useRef<google.maps.Marker[]>([]);

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

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add traffic layer if enabled
        if (showTraffic) {
          const trafficLayer = new google.maps.TrafficLayer();
          trafficLayer.setMap(mapInstance);
        }

        setMap(mapInstance);
        if (onMapLoad) onMapLoad(mapInstance);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key and internet connection.');
      });
  }, [center.lat, center.lng, zoom, showTraffic, onMapLoad]);

  // Update markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: getMarkerIcon(markerData.type, markerData.severity)
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0;">${markerData.title}</h3>
            ${markerData.type ? `<p style="margin: 5px 0;"><strong>Type:</strong> ${markerData.type}</p>` : ''}
            ${markerData.severity ? `<p style="margin: 5px 0;"><strong>Severity:</strong> ${markerData.severity}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  const getMarkerIcon = (type?: string, severity?: string) => {
    let color = '#4285F4'; // Default blue

    if (severity) {
      switch (severity) {
        case 'critical':
        case 'severe':
          color = '#EA4335'; // Red
          break;
        case 'high':
        case 'heavy':
          color = '#FF9800'; // Orange
          break;
        case 'medium':
        case 'moderate':
          color = '#FBBC04'; // Yellow
          break;
        case 'low':
        case 'light':
          color = '#34A853'; // Green
          break;
      }
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  if (error) {
    return (
      <div style={{
        padding: '40px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Google Maps Not Configured</h3>
        <p style={{ color: '#856404' }}>{error}</p>
        <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
          <h4>To enable Google Maps:</h4>
          <ol>
            <li>Get an API key from <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
            <li>Enable Maps JavaScript API, Directions API, and Places API</li>
            <li>Add to <code>frontend/.env</code>: <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
            <li>Restart the frontend server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
