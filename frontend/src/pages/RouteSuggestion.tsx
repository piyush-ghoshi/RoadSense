import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { routesApi } from '../lib/api';
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
}

export default function RouteSuggestion() {
  const [origin, setOrigin] = useState({ lat: 40.7589, lng: -73.9851 });
  const [destination, setDestination] = useState({ lat: 40.7614, lng: -73.9776 });
  const [avoidCongestion, setAvoidCongestion] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trafficConditions, setTrafficConditions] = useState<any>(null);

  const suggestMutation = useMutation({
    mutationFn: (data: any) => routesApi.suggest(data),
    onSuccess: (response) => {
      setRoutes(response.data.data.routes);
      setTrafficConditions(response.data.data.trafficConditions);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    suggestMutation.mutate({
      origin,
      destination,
      avoidCongestion
    });
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'light': return '#4caf50';
      case 'moderate': return '#ffc107';
      case 'heavy': return '#ff9800';
      case 'severe': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="route-suggestion-page">
      <h1>🚗 Alternate Route Suggestions</h1>

      <div className="route-form-container">
        <h2>Plan Your Route</h2>
        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-row">
            <div className="form-group">
              <label>Origin Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={origin.lat}
                onChange={(e) => setOrigin({ ...origin, lat: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Origin Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={origin.lng}
                onChange={(e) => setOrigin({ ...origin, lng: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Destination Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={destination.lat}
                onChange={(e) => setDestination({ ...destination, lat: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Destination Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={destination.lng}
                onChange={(e) => setDestination({ ...destination, lng: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={avoidCongestion}
                onChange={(e) => setAvoidCongestion(e.target.checked)}
              />
              Avoid congested areas
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={suggestMutation.isPending}>
            {suggestMutation.isPending ? 'Finding Routes...' : '🔍 Find Routes'}
          </button>
        </form>
      </div>

      {trafficConditions && (
        <div className="traffic-conditions">
          <h2>Current Traffic Conditions</h2>
          <div className="conditions-grid">
            <div className="condition-card">
              <span className="condition-label">Traffic Snapshots</span>
              <span className="condition-value">{trafficConditions.totalSnapshots}</span>
            </div>
            <div className="condition-card">
              <span className="condition-label">Active Incidents</span>
              <span className="condition-value alert">{trafficConditions.activeIncidents}</span>
            </div>
            <div className="condition-card">
              <span className="condition-label">Congestion Areas</span>
              <span className="condition-value warning">{trafficConditions.congestionAreas}</span>
            </div>
          </div>
        </div>
      )}

      {routes.length > 0 && (
        <div className="routes-container">
          <h2>Suggested Routes ({routes.length})</h2>
          <div className="routes-grid">
            {routes.map((route, index) => (
              <div key={route.id} className={`route-card ${index === 0 ? 'recommended' : ''}`}>
                {index === 0 && <div className="recommended-badge">⭐ Recommended</div>}
                <div className="route-header">
                  <h3>{route.name}</h3>
                  <span className="route-type">{route.type}</span>
                </div>
                
                <div className="route-metrics">
                  <div className="metric">
                    <span className="metric-icon">📏</span>
                    <div>
                      <div className="metric-label">Distance</div>
                      <div className="metric-value">{route.distance.toFixed(1)} km</div>
                    </div>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-icon">⏱️</span>
                    <div>
                      <div className="metric-label">Duration</div>
                      <div className="metric-value">{Math.round(route.duration)} min</div>
                    </div>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-icon">🚦</span>
                    <div>
                      <div className="metric-label">Congestion</div>
                      <div 
                        className="metric-value"
                        style={{ color: getCongestionColor(route.congestionLevel) }}
                      >
                        {route.congestionLevel}
                      </div>
                    </div>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-icon">⚠️</span>
                    <div>
                      <div className="metric-label">Incidents</div>
                      <div className="metric-value">{route.incidents}</div>
                    </div>
                  </div>
                </div>

                <p className="route-description">{route.description}</p>
                
                <button className="btn-select-route">
                  Select This Route
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {routes.length === 0 && !suggestMutation.isPending && (
        <div className="empty-state">
          <p>Enter origin and destination to get route suggestions</p>
        </div>
      )}
    </div>
  );
}
