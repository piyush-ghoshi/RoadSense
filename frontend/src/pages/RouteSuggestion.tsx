import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { routesApi } from '../lib/api';
import OSMMap from '../components/OSMMap';
import './RouteSuggestion.css';

interface Route {
  id: string;
  name: string;
  type: string;
  distance: number;
  duration: number;
  congestionLevel: string;
  incidents: number;
  description: string;
  waypoints: Array<{ lat: number; lng: number }>;
}

interface CityCoordinates {
  [key: string]: { lat: number; lng: number };
}

const CITIES: CityCoordinates = {
  'Indore, MP': { lat: 22.7196, lng: 75.8577 },
  'Vijay Nagar, Indore': { lat: 22.7533, lng: 75.8937 },
  'Rajwada, Indore': { lat: 22.7196, lng: 75.8577 },
  'Palasia, Indore': { lat: 22.7249, lng: 75.8855 },
  'Annapurna, Indore': { lat: 22.7010, lng: 75.8579 },
  'Mumbai Central': { lat: 18.9688, lng: 72.8199 },
  'Andheri, Mumbai': { lat: 19.1136, lng: 72.8686 },
  'Bandra, Mumbai': { lat: 19.0596, lng: 72.8295 },
  'Connaught Place, Delhi': { lat: 28.6315, lng: 77.2167 },
  'India Gate, Delhi': { lat: 28.6129, lng: 77.2295 },
  'Karol Bagh, Delhi': { lat: 28.6519, lng: 77.1909 },
  'MG Road, Bangalore': { lat: 12.9758, lng: 77.6095 },
  'Silk Board, Bangalore': { lat: 12.9170, lng: 77.6226 },
  'Marathahalli, Bangalore': { lat: 12.9591, lng: 77.6974 },
  'New York, USA': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, USA': { lat: 34.0522, lng: -118.2437 },
};

export default function RouteSuggestion() {
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [avoidCongestion, setAvoidCongestion] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [trafficConditions, setTrafficConditions] = useState<any>(null);

  const filterCities = (input: string) =>
    Object.keys(CITIES).filter(city =>
      city.toLowerCase().includes(input.toLowerCase())
    );

  const handleOriginInput = (val: string) => {
    setOriginInput(val);
    setOrigin(null);
    setOriginSuggestions(val.length > 0 ? filterCities(val) : []);
  };

  const handleDestInput = (val: string) => {
    setDestInput(val);
    setDestination(null);
    setDestSuggestions(val.length > 0 ? filterCities(val) : []);
  };

  const selectOrigin = (city: string) => {
    setOriginInput(city);
    setOrigin(CITIES[city]);
    setOriginSuggestions([]);
  };

  const selectDest = (city: string) => {
    setDestInput(city);
    setDestination(CITIES[city]);
    setDestSuggestions([]);
  };

  const suggestMutation = useMutation({
    mutationFn: (data: any) => routesApi.suggest(data),
    onSuccess: (response) => {
      setRoutes(response.data.data.routes);
      setTrafficConditions(response.data.data.trafficConditions);
      setSelectedRoute(response.data.data.routes[0] || null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    suggestMutation.mutate({ origin, destination, avoidCongestion });
  };

  const getCongestionColor = (level: string) => {
    const map: Record<string, string> = {
      light: '#4caf50', moderate: '#ffc107', heavy: '#ff9800', severe: '#f44336'
    };
    return map[level] || '#9e9e9e';
  };

  const getCongestionIcon = (level: string) => {
    const map: Record<string, string> = {
      light: '🟢', moderate: '🟡', heavy: '🟠', severe: '🔴'
    };
    return map[level] || '⚪';
  };

  // Map markers: origin, destination, and any waypoints of selected route
  const mapMarkers = [
    ...(origin ? [{
      position: origin,
      title: `Origin: ${originInput}`,
      type: 'origin',
      severity: 'low'
    }] : []),
    ...(destination ? [{
      position: destination,
      title: `Destination: ${destInput}`,
      type: 'destination',
      severity: 'critical'
    }] : []),
  ];

  const mapCenter = origin || destination || { lat: 22.7196, lng: 75.8577 };

  const canSearch = origin && destination;

  return (
    <div className="route-suggestion-page">
      <h1>🛣️ Alternate Route Suggestions</h1>

      <div className="route-layout">
        <div className="route-left-panel">
          <div className="route-form-container">
            <h2>📍 Plan Your Journey</h2>
            <form onSubmit={handleSubmit} className="route-form">

              {/* Origin */}
              <div className="form-group autocomplete-group">
                <label>📍 Origin</label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    value={originInput}
                    onChange={e => handleOriginInput(e.target.value)}
                    placeholder="Search origin city..."
                    autoComplete="off"
                  />
                  {originSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {originSuggestions.map(city => (
                        <div
                          key={city}
                          className="autocomplete-item"
                          onMouseDown={() => selectOrigin(city)}
                        >
                          📍 {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {origin && <span className="selected-badge">✅ {originInput}</span>}
              </div>

              {/* Destination */}
              <div className="form-group autocomplete-group">
                <label>🏁 Destination</label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    value={destInput}
                    onChange={e => handleDestInput(e.target.value)}
                    placeholder="Search destination city..."
                    autoComplete="off"
                  />
                  {destSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {destSuggestions.map(city => (
                        <div
                          key={city}
                          className="autocomplete-item"
                          onMouseDown={() => selectDest(city)}
                        >
                          🏁 {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {destination && <span className="selected-badge">✅ {destInput}</span>}
              </div>

              {/* Quick city presets */}
              <div className="quick-presets">
                <p className="presets-label">Quick Presets — Indore:</p>
                <div className="preset-buttons">
                  <button type="button" className="preset-btn" onClick={() => { selectOrigin('Rajwada, Indore'); selectDest('Vijay Nagar, Indore'); }}>
                    Rajwada → Vijay Nagar
                  </button>
                  <button type="button" className="preset-btn" onClick={() => { selectOrigin('Palasia, Indore'); selectDest('Annapurna, Indore'); }}>
                    Palasia → Annapurna
                  </button>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={avoidCongestion}
                    onChange={e => setAvoidCongestion(e.target.checked)}
                  />
                  <span>🚦 Avoid congested areas</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={suggestMutation.isPending || !canSearch}
              >
                {suggestMutation.isPending ? '⏳ Finding Routes...' : '🔍 Find Routes'}
              </button>

              {!canSearch && (
                <p className="form-hint">Select both origin and destination to search</p>
              )}
            </form>
          </div>

          {trafficConditions && (
            <div className="traffic-conditions">
              <h3>📊 Current Traffic Conditions</h3>
              <div className="conditions-grid">
                <div className="condition-card">
                  <span className="condition-icon">📸</span>
                  <span className="condition-label">Snapshots</span>
                  <span className="condition-value">{trafficConditions.totalSnapshots}</span>
                </div>
                <div className="condition-card alert">
                  <span className="condition-icon">🚨</span>
                  <span className="condition-label">Incidents</span>
                  <span className="condition-value">{trafficConditions.activeIncidents}</span>
                </div>
                <div className="condition-card warning">
                  <span className="condition-icon">🚧</span>
                  <span className="condition-label">Congested</span>
                  <span className="condition-value">{trafficConditions.congestionAreas}</span>
                </div>
              </div>
            </div>
          )}

          {routes.length > 0 && (
            <div className="routes-container">
              <h3>🗺️ Suggested Routes ({routes.length})</h3>
              <div className="routes-list">
                {routes.map((route, index) => (
                  <div
                    key={route.id}
                    className={`route-card ${index === 0 ? 'recommended' : ''} ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    {index === 0 && <div className="recommended-badge">⭐ Recommended</div>}
                    <div className="route-header">
                      <h4>{route.name}</h4>
                      <span className="route-type-badge">{route.type}</span>
                    </div>

                    <div className="route-metrics">
                      <div className="metric">
                        <span>📏</span>
                        <div>
                          <div className="metric-label">Distance</div>
                          <div className="metric-value">{route.distance.toFixed(1)} km</div>
                        </div>
                      </div>
                      <div className="metric">
                        <span>⏱️</span>
                        <div>
                          <div className="metric-label">Duration</div>
                          <div className="metric-value">{Math.round(route.duration)} min</div>
                        </div>
                      </div>
                      <div className="metric">
                        <span>{getCongestionIcon(route.congestionLevel)}</span>
                        <div>
                          <div className="metric-label">Traffic</div>
                          <div
                            className="metric-value"
                            style={{ color: getCongestionColor(route.congestionLevel) }}
                          >
                            {route.congestionLevel}
                          </div>
                        </div>
                      </div>
                      <div className="metric">
                        <span>⚠️</span>
                        <div>
                          <div className="metric-label">Incidents</div>
                          <div className="metric-value">{route.incidents}</div>
                        </div>
                      </div>
                    </div>

                    <p className="route-description">{route.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Panel */}
        <div className="route-map-panel">
          <h3>🗺️ Route Map</h3>
          {!origin && !destination && (
            <div className="map-placeholder">
              <p>🔍 Select origin and destination to see route on map</p>
            </div>
          )}
          {(origin || destination) && (
            <OSMMap
              center={mapCenter}
              zoom={origin && destination ? 11 : 13}
              markers={mapMarkers}
              showClustering={false}
              showHeatmap={false}
            />
          )}
        </div>
      </div>

      {routes.length === 0 && !suggestMutation.isPending && (
        <div className="empty-state">
          <p>🛣️ Enter origin and destination above to get intelligent route suggestions based on live traffic data</p>
        </div>
      )}
    </div>
  );
}
