import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface OSMMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    type?: string;
    severity?: string;
    speed?: number;
  }>;
  showClustering?: boolean;
  showHeatmap?: boolean;
  onMapLoad?: (map: L.Map) => void;
}

export default function OSMMap({
  center = { lat: 40.7589, lng: -73.9851 },
  zoom = 12,
  markers = [],
  showClustering = true,
  showHeatmap = false,
  onMapLoad
}: OSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.MarkerClusterGroup | L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click handler to show coordinates
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div style="padding: 5px;">
            <strong>Coordinates:</strong><br/>
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
        `)
        .openOn(map);
    });

    mapInstanceRef.current = map;
    if (onMapLoad) onMapLoad(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
    }

    // Clear existing heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (markers.length === 0) return;

    // Create marker layer (clustered or regular)
    const markerLayer = showClustering 
      ? L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        })
      : L.layerGroup();

    // Add markers
    markers.forEach(markerData => {
      const markerIcon = createCustomIcon(markerData.severity);
      
      const marker = L.marker(
        [markerData.position.lat, markerData.position.lng],
        { icon: markerIcon }
      );

      const popupContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a2e;">${markerData.title}</h3>
          ${markerData.type ? `<p style="margin: 5px 0;"><strong>Type:</strong> ${markerData.type}</p>` : ''}
          ${markerData.severity ? `
            <p style="margin: 5px 0;">
              <strong>Severity:</strong> 
              <span style="
                padding: 2px 8px; 
                border-radius: 4px; 
                background: ${getSeverityColor(markerData.severity)}; 
                color: white;
                font-weight: bold;
              ">${markerData.severity}</span>
            </p>
          ` : ''}
          ${markerData.speed ? `<p style="margin: 5px 0;"><strong>Speed:</strong> ${markerData.speed} km/h</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      markerLayer.addLayer(marker);
    });

    map.addLayer(markerLayer);
    markersLayerRef.current = markerLayer;

    // Add heatmap if enabled
    if (showHeatmap && markers.length > 0) {
      const heatData = markers.map(m => [
        m.position.lat,
        m.position.lng,
        getIntensityFromSeverity(m.severity)
      ]);

      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#4caf50',
          0.25: '#ffc107',
          0.5: '#ff9800',
          0.75: '#ff5722',
          1.0: '#f44336'
        }
      }).addTo(map);

      heatLayerRef.current = heatLayer;
    }

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.position.lat, m.position.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, showClustering, showHeatmap]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd'
      }}
    />
  );
}

// Helper functions
function createCustomIcon(severity?: string): L.Icon {
  const color = getSeverityColor(severity);
  
  const svgIcon = `
    <svg width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0 C7 0 0 7 0 15 C0 25 15 40 15 40 C15 40 30 25 30 15 C30 7 23 0 15 0 Z" 
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });
}

function getSeverityColor(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'severe':
      return '#f44336'; // Red
    case 'high':
    case 'heavy':
      return '#ff5722'; // Deep Orange
    case 'medium':
    case 'moderate':
      return '#ff9800'; // Orange
    case 'low':
    case 'light':
      return '#4caf50'; // Green
    default:
      return '#2196f3'; // Blue
  }
}

function getIntensityFromSeverity(severity?: string): number {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'severe':
      return 1.0;
    case 'high':
    case 'heavy':
      return 0.75;
    case 'medium':
    case 'moderate':
      return 0.5;
    case 'low':
    case 'light':
      return 0.25;
    default:
      return 0.1;
  }
}
