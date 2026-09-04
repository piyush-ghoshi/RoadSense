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

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface RoutePolyline {
  id: string;
  name?: string;
  coordinates: Array<[number, number]>; // [lat, lng]
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  selected?: boolean;
}

export interface OSMMapMarker {
  position: { lat: number; lng: number };
  title: string;
  type?: string; // 'origin' | 'destination' | 'start' | 'finish' | 'user-location' | 'incident' | 'sensor'
  severity?: string;
  speed?: number;
}

export interface OSMMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: OSMMapMarker[];
  polylines?: RoutePolyline[];
  vehiclePosition?: { lat: number; lng: number; heading?: number } | null;
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  showClustering?: boolean;
  showHeatmap?: boolean;
  onMapLoad?: (map: L.Map) => void;
  onPolylineClick?: (id: string) => void;
  height?: string;
  style?: React.CSSProperties;
}

export default function OSMMap({
  center = { lat: 22.7196, lng: 75.8577 },
  zoom = 12,
  markers = [],
  polylines = [],
  vehiclePosition = null,
  userLocation = null,
  showClustering = true,
  showHeatmap = false,
  onMapLoad,
  onPolylineClick,
  height = '100%',
  style = {},
}: OSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<any>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const vehicleLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([center.lat, center.lng], zoom);

    // Clean OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add click handler to show coordinates
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div style="padding: 6px 10px; font-family: Inter, sans-serif; font-size: 12px; color: #0F172A;">
            <strong>Coordinates:</strong><br/>
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
        `)
        .openOn(map);
    });

    mapInstanceRef.current = map;
    if (onMapLoad) onMapLoad(map);

    // Invalidate size once DOM stabilizes
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view when center or zoom changes significantly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (markers.length === 0) return;

    const markerLayer = showClustering
      ? (L as any).markerClusterGroup({
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
        })
      : L.layerGroup();

    markers.forEach((markerData) => {
      const markerIcon = createCustomMarkerIcon(markerData.type, markerData.severity);

      const marker = L.marker([markerData.position.lat, markerData.position.lng], {
        icon: markerIcon,
        zIndexOffset: markerData.type === 'origin' || markerData.type === 'start' || markerData.type === 'destination' || markerData.type === 'finish' ? 1000 : 100,
      });

      const popupContent = `
        <div style="padding: 10px; min-width: 180px; font-family: Inter, sans-serif;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0F172A;">${markerData.title}</h4>
          ${markerData.type ? `<p style="margin: 3px 0; font-size: 11px; color: #475569;"><strong>Type:</strong> ${markerData.type.toUpperCase()}</p>` : ''}
          ${
            markerData.severity
              ? `<p style="margin: 3px 0; font-size: 11px;">
                  <strong style="color: #475569;">Severity:</strong> 
                  <span style="padding: 2px 7px; border-radius: 4px; background: ${getSeverityColor(markerData.severity)}; color: white; font-weight: 700; font-size: 10px;">
                    ${markerData.severity.toUpperCase()}
                  </span>
                </p>`
              : ''
          }
          ${markerData.speed ? `<p style="margin: 3px 0; font-size: 11px; color: #475569;"><strong>Speed:</strong> ${markerData.speed} km/h</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      markerLayer.addLayer(marker);
    });

    map.addLayer(markerLayer);
    markersLayerRef.current = markerLayer;

    // Add heatmap if enabled
    if (showHeatmap && markers.length > 0) {
      const heatData = markers.map((m) => [
        m.position.lat,
        m.position.lng,
        getIntensityFromSeverity(m.severity),
      ]);

      const heatLayer = (L as any)
        .heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.0: '#22C55E',
            0.3: '#EAB308',
            0.6: '#F97316',
            0.85: '#EF4444',
            1.0: '#DC2626',
          },
        })
        .addTo(map);

      heatLayerRef.current = heatLayer;
    }

    // Auto fit bounds if only markers and no polylines
    if (markers.length > 0 && polylines.length === 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.position.lat, m.position.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, showClustering, showHeatmap]);

  // Update polylines (highlighted routes)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylinesLayerRef.current) {
      map.removeLayer(polylinesLayerRef.current);
      polylinesLayerRef.current = null;
    }

    if (polylines.length === 0) return;

    const layerGroup = L.layerGroup();
    const allCoords: Array<[number, number]> = [];

    // Draw unselected lines first, then selected on top
    const sortedPolylines = [...polylines].sort((a, b) => (a.selected === b.selected ? 0 : a.selected ? 1 : -1));

    sortedPolylines.forEach((poly) => {
      if (!poly.coordinates || poly.coordinates.length < 2) return;
      allCoords.push(...poly.coordinates);

      if (poly.selected) {
        // Outer glow
        const glowLine = L.polyline(poly.coordinates, {
          color: '#3B82F6',
          weight: 10,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        });
        layerGroup.addLayer(glowLine);

        // Core line
        const mainLine = L.polyline(poly.coordinates, {
          color: poly.color || '#2563EB',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });
        if (poly.name) {
          mainLine.bindTooltip(`<strong>${poly.name}</strong>`, { sticky: true });
        }
        layerGroup.addLayer(mainLine);
      } else {
        // Unselected alternate route
        const altLine = L.polyline(poly.coordinates, {
          color: poly.color || '#94A3B8',
          weight: 4,
          opacity: 0.65,
          dashArray: poly.dashArray || '7, 7',
          lineCap: 'round',
        });
        if (poly.name) {
          altLine.bindTooltip(`${poly.name} (Click to select)`, { sticky: true });
        }
        if (onPolylineClick) {
          altLine.on('click', () => onPolylineClick(poly.id));
        }
        layerGroup.addLayer(altLine);
      }
    });

    map.addLayer(layerGroup);
    polylinesLayerRef.current = layerGroup;

    // Fit map bounds to show complete route
    if (allCoords.length > 1) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
    }
  }, [polylines, onPolylineClick]);

  // Update User GPS Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocLayerRef.current) {
      map.removeLayer(userLocLayerRef.current);
      userLocLayerRef.current = null;
    }

    if (!userLocation) return;

    const layerGroup = L.layerGroup();

    // Accuracy circle if provided
    if (userLocation.accuracy && userLocation.accuracy > 15) {
      const accCircle = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.min(userLocation.accuracy, 500),
        color: '#3B82F6',
        fillColor: '#60A5FA',
        fillOpacity: 0.15,
        weight: 1,
      });
      layerGroup.addLayer(accCircle);
    }

    // High accuracy pulsing GPS pin
    const gpsIcon = L.divIcon({
      className: 'rs-user-location-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: rsGpsRadar 1.8s ease-out infinite;"></div>
          <div style="position: absolute; inset: 0; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 10px rgba(37, 99, 235, 0.6);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const gpsMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: gpsIcon,
      zIndexOffset: 1200,
    }).bindPopup('<div style="font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; color: #1E293B;">📍 You Are Here</div>');

    layerGroup.addLayer(gpsMarker);
    map.addLayer(layerGroup);
    userLocLayerRef.current = layerGroup;
  }, [userLocation]);

  // Update Traveling Vehicle Position (Live Navigation Mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (vehicleLayerRef.current) {
      map.removeLayer(vehicleLayerRef.current);
      vehicleLayerRef.current = null;
    }

    if (!vehiclePosition) return;

    const layerGroup = L.layerGroup();
    const heading = vehiclePosition.heading || 0;

    const vehicleIcon = L.divIcon({
      className: 'rs-vehicle-nav-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.25s linear;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(34, 197, 94, 0.35); animation: rsGpsRadar 1.2s ease-out infinite;"></div>
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #0F172A; border: 2.5px solid #22C55E; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.6); display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#22C55E" stroke="#FFFFFF" stroke-width="1.5">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const vehicleMarker = L.marker([vehiclePosition.lat, vehiclePosition.lng], {
      icon: vehicleIcon,
      zIndexOffset: 2000,
    });

    layerGroup.addLayer(vehicleMarker);
    map.addLayer(layerGroup);
    vehicleLayerRef.current = layerGroup;

    // Pan smoothly to vehicle
    map.panTo([vehiclePosition.lat, vehiclePosition.lng], { animate: true, duration: 0.5 });
  }, [vehiclePosition]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: height || '600px',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        ...style,
      }}
    />
  );
}

// Custom Marker Icons for START, FINISH, and Traffic Points
function createCustomMarkerIcon(type?: string, severity?: string): L.Icon | L.DivIcon {
  const normType = type?.toLowerCase();

  // START Marker
  if (normType === 'origin' || normType === 'start') {
    return L.divIcon({
      className: 'rs-start-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #16A34A; color: white; font-family: Inter, sans-serif; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 3px 10px rgba(22, 163, 74, 0.5); letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; border: 1.5px solid white;">
            <span>🚩 START</span>
          </div>
          <div style="width: 24px; height: 32px; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              <path d="M12 0C5.372 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#16A34A"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [64, 52],
      iconAnchor: [32, 50],
      popupAnchor: [0, -48],
    });
  }

  // DESTINATION Marker
  if (normType === 'destination' || normType === 'finish') {
    return L.divIcon({
      className: 'rs-dest-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #DC2626; color: white; font-family: Inter, sans-serif; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 3px 10px rgba(220, 38, 38, 0.5); letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px; border: 1.5px solid white;">
            <span>🏁 FINISH</span>
          </div>
          <div style="width: 24px; height: 32px; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
              <path d="M12 0C5.372 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#DC2626"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [68, 52],
      iconAnchor: [34, 50],
      popupAnchor: [0, -48],
    });
  }

  // Standard Traffic Map Marker
  const color = getSeverityColor(severity);
  const svgIcon = `
    <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0 C6.268 0 0 6.268 0 14 C0 23.5 14 36 14 36 C14 36 28 23.5 28 14 C28 6.268 21.732 0 14 0 Z" 
            fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="14" cy="14" r="5.5" fill="#FFFFFF"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
}

function getSeverityColor(severity?: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'severe':
      return '#EF4444'; // Red
    case 'high':
    case 'heavy':
      return '#F97316'; // Deep Orange
    case 'medium':
    case 'moderate':
      return '#EAB308'; // Amber
    case 'low':
    case 'light':
      return '#22C55E'; // Green
    default:
      return '#3B82F6'; // Blue
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
      return 0.15;
  }
}
