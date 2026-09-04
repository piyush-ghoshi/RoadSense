import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation2, ArrowRight, Clock, Ruler, AlertTriangle,
  Star, CheckCircle, Search, Crosshair, Play, Square,
  CornerUpRight, CornerUpLeft, ArrowUp, CheckCheck,
  Sparkles, Layers
} from 'lucide-react';
import {
  getSmartRoutes,
  fetchCurrentPosition,
  type DetailedRoute,
  type RouteStep,
  type Coordinates,
} from '../lib/routingService';
import OSMMap, { type RoutePolyline, type OSMMapMarker } from '../components/OSMMap';
import './RouteSuggestion.css';

const CITIES: Record<string, Coordinates> = {
  'Indore, MP': { lat: 22.7196, lng: 75.8577 },
  'Vijay Nagar, Indore': { lat: 22.7533, lng: 75.8937 },
  'Rajwada, Indore': { lat: 22.7196, lng: 75.8577 },
  'Palasia, Indore': { lat: 22.7249, lng: 75.8855 },
  'Annapurna, Indore': { lat: 22.7010, lng: 75.8579 },
  'Bhanwarkuan, Indore': { lat: 22.7014, lng: 75.8746 },
  'Mumbai Central': { lat: 18.9688, lng: 72.8199 },
  'Andheri, Mumbai': { lat: 19.1136, lng: 72.8686 },
  'Bandra, Mumbai': { lat: 19.0596, lng: 72.8295 },
  'Connaught Place, Delhi': { lat: 28.6315, lng: 77.2167 },
  'India Gate, Delhi': { lat: 28.6129, lng: 77.2295 },
  'Karol Bagh, Delhi': { lat: 28.6519, lng: 77.1909 },
  'MG Road, Bangalore': { lat: 12.9758, lng: 77.6095 },
  'Silk Board, Bangalore': { lat: 12.9170, lng: 77.6226 },
  'Marathahalli, Bangalore': { lat: 12.9591, lng: 77.6974 },
};

const QUICK_PRESETS = [
  { label: 'Rajwada → Vijay Nagar', origin: 'Rajwada, Indore', dest: 'Vijay Nagar, Indore' },
  { label: 'Palasia → Annapurna', origin: 'Palasia, Indore', dest: 'Annapurna, Indore' },
  { label: 'CP → India Gate', origin: 'Connaught Place, Delhi', dest: 'India Gate, Delhi' },
  { label: 'MG Road → Silk Board', origin: 'MG Road, Bangalore', dest: 'Silk Board, Bangalore' },
  { label: 'Bandra → Mumbai Central', origin: 'Bandra, Mumbai', dest: 'Mumbai Central' },
];

const CONGESTION_PILL: Record<string, string> = {
  light: 'pill-success',
  moderate: 'pill-warning',
  heavy: 'pill-warning',
  severe: 'pill-danger',
};

export default function RouteSuggestion() {
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [avoidCongestion, setAvoidCongestion] = useState(true);

  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routes, setRoutes] = useState<DetailedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DetailedRoute | null>(null);

  // Live Navigation & Travelling Mode State
  const [isTravelling, setIsTravelling] = useState(false);
  const [travelProgressIdx, setTravelProgressIdx] = useState(0);
  const [vehiclePos, setVehiclePos] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [activeStep, setActiveStep] = useState<RouteStep | null>(null);
  const [remainingDist, setRemainingDist] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [travelSpeed, setTravelSpeed] = useState<number>(42);
  const [hasArrived, setHasArrived] = useState(false);

  const travelTimerRef = useRef<any>(null);

  // Filter autocomplete cities
  const filterCities = (input: string) =>
    Object.keys(CITIES).filter((c) => c.toLowerCase().includes(input.toLowerCase()));

  const handleOriginInput = (val: string) => {
    setOriginInput(val);
    setOrigin(null);
    setOriginSuggestions(val.trim() ? filterCities(val) : []);
  };

  const handleDestInput = (val: string) => {
    setDestInput(val);
    setDestination(null);
    setDestSuggestions(val.trim() ? filterCities(val) : []);
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

  // Swap origin and destination
  const handleSwap = () => {
    const tempInput = originInput;
    const tempCoord = origin;
    setOriginInput(destInput);
    setOrigin(destination);
    setDestInput(tempInput);
    setDestination(tempCoord);
  };

  // Use Exact Current Location via HTML5 Geolocation API
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await fetchCurrentPosition();
      setUserLocation(pos);
      setOrigin({ lat: pos.lat, lng: pos.lng });
      setOriginInput(`My Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
      setOriginSuggestions([]);
    } catch {
      // Fallback: Default to Indore center with user location marker
      const fallback = { lat: 22.7196, lng: 75.8577, accuracy: 25 };
      setUserLocation(fallback);
      setOrigin({ lat: fallback.lat, lng: fallback.lng });
      setOriginInput('Current Location (Indore)');
    } finally {
      setIsLocating(false);
    }
  };

  const selectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    selectOrigin(preset.origin);
    selectDest(preset.dest);
  };

  // Search Routes
  const handleFindRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin || !destination) return;

    // Stop any active navigation
    stopTravelling();

    setIsLoadingRoutes(true);
    try {
      const smartRoutes = await getSmartRoutes(origin, destination, avoidCongestion);
      setRoutes(smartRoutes);
      setSelectedRoute(smartRoutes[0] || null);
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Turn-by-Turn Navigation simulation
  const startTravelling = (routeToTravel?: DetailedRoute) => {
    const route = routeToTravel || selectedRoute;
    if (!route || route.coordinates.length < 2) return;

    setSelectedRoute(route);
    setIsTravelling(true);
    setHasArrived(false);
    setTravelProgressIdx(0);

    const coords = route.coordinates;
    const totalPoints = coords.length;
    setRemainingDist(route.distance);
    setRemainingTime(route.duration);
    setActiveStep(route.steps[0] || null);

    if (coords.length > 0) {
      setVehiclePos({
        lat: coords[0][0],
        lng: coords[0][1],
        heading: 0,
      });
    }

    if (travelTimerRef.current) clearInterval(travelTimerRef.current);

    let idx = 0;
    travelTimerRef.current = setInterval(() => {
      idx += 1;
      if (idx >= totalPoints) {
        clearInterval(travelTimerRef.current);
        setTravelProgressIdx(totalPoints - 1);
        setRemainingDist(0);
        setRemainingTime(0);
        setHasArrived(true);
        const lastPt = coords[totalPoints - 1];
        setVehiclePos({ lat: lastPt[0], lng: lastPt[1], heading: 0 });
        return;
      }

      setTravelProgressIdx(idx);
      const curr = coords[idx];
      const prev = coords[idx - 1];

      // Calculate bearing angle in degrees
      const _dLat = (curr[0] - prev[0]) * (Math.PI / 180);
      void _dLat;
      const dLng = (curr[1] - prev[1]) * (Math.PI / 180);
      const y = Math.sin(dLng) * Math.cos(curr[0] * (Math.PI / 180));
      const x =
        Math.cos(prev[0] * (Math.PI / 180)) * Math.sin(curr[0] * (Math.PI / 180)) -
        Math.sin(prev[0] * (Math.PI / 180)) *
          Math.cos(curr[0] * (Math.PI / 180)) *
          Math.cos(dLng);
      let bearing = (Math.atan2(y, x) * 180) / Math.PI;
      bearing = (bearing + 360) % 360;

      setVehiclePos({
        lat: curr[0],
        lng: curr[1],
        heading: Math.round(bearing),
      });

      // Update remaining distance & duration
      const fraction = idx / (totalPoints - 1);
      const remD = Math.max(0, (1 - fraction) * route.distance);
      const remT = Math.max(1, Math.round((1 - fraction) * route.duration));
      setRemainingDist(parseFloat(remD.toFixed(1)));
      setRemainingTime(remT);

      // Random realistic fluctuation in speed (36 - 54 km/h)
      setTravelSpeed(Math.floor(38 + Math.random() * 16));

      // Update active turn maneuver step
      if (route.steps.length > 0) {
        const stepIdx = Math.min(
          Math.floor(fraction * route.steps.length),
          route.steps.length - 1
        );
        setActiveStep(route.steps[stepIdx]);
      }
    }, 380);
  };

  const stopTravelling = () => {
    if (travelTimerRef.current) {
      clearInterval(travelTimerRef.current);
      travelTimerRef.current = null;
    }
    setIsTravelling(false);
    setVehiclePos(null);
    setHasArrived(false);
  };

  useEffect(() => {
    return () => {
      if (travelTimerRef.current) clearInterval(travelTimerRef.current);
    };
  }, []);

  // Map Markers: START sign, FINISH sign, and optional user location
  const mapMarkers: OSMMapMarker[] = [
    ...(origin
      ? [
          {
            position: origin,
            title: `Origin: ${originInput || 'Start Point'}`,
            type: 'start',
            severity: 'low',
          },
        ]
      : []),
    ...(destination
      ? [
          {
            position: destination,
            title: `Destination: ${destInput || 'Finish Point'}`,
            type: 'finish',
            severity: 'critical',
          },
        ]
      : []),
    ...(userLocation && !origin
      ? [
          {
            position: { lat: userLocation.lat, lng: userLocation.lng },
            title: 'Your Exact GPS Location',
            type: 'user-location',
            severity: 'low',
          },
        ]
      : []),
  ];

  // Map Polylines: Highlight selected route with vibrant blue, show alternatives dashed
  const mapPolylines: RoutePolyline[] = routes.map((r) => ({
    id: r.id,
    name: `${r.name} (${r.duration} min)`,
    coordinates: r.coordinates,
    color: r.id === selectedRoute?.id ? '#2563EB' : '#94A3B8',
    selected: r.id === selectedRoute?.id,
    weight: r.id === selectedRoute?.id ? 6 : 4,
    opacity: r.id === selectedRoute?.id ? 0.95 : 0.65,
    dashArray: r.id === selectedRoute?.id ? undefined : '7, 7',
  }));

  const mapCenter = vehiclePos
    ? { lat: vehiclePos.lat, lng: vehiclePos.lng }
    : origin || destination || userLocation || { lat: 22.7196, lng: 75.8577 };

  const canSearch = origin && destination;

  // Turn step maneuver icon helper
  const renderManeuverIcon = (type?: string, modifier?: string) => {
    if (type === 'arrive') return <CheckCheck size={22} color="#22C55E" />;
    if (modifier?.includes('left')) return <CornerUpLeft size={22} color="#3B82F6" />;
    if (modifier?.includes('right')) return <CornerUpRight size={22} color="#3B82F6" />;
    return <ArrowUp size={22} color="#3B82F6" />;
  };

  return (
    <div className="routes-page animate-fade-in-up">
      {/* ── Page Header ── */}
      <div className="routes-header-row">
        <div>
          <h1 className="page-title">Route Planner</h1>
          <p className="page-subtitle">
            Real-world road navigation with traffic analysis and turn-by-turn simulation
          </p>
        </div>
        {userLocation && (
          <div className="gps-badge">
            <span className="gps-indicator-dot" />
            <span>GPS Active ({userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)})</span>
          </div>
        )}
      </div>

      {/* ── Horizontal Search Control Console (Flex Mode) ── */}
      <div className="card route-search-card">
        <form onSubmit={handleFindRoutes} className="route-horizontal-form">
          {/* Origin Input with Current Location */}
          <div className="route-field-group">
            <label className="field-header">
              <span className="route-point-indicator origin-point" />
              <span>Origin</span>
            </label>
            <div className="route-input-container">
              <Search size={15} className="input-search-icon" />
              <input
                type="text"
                value={originInput}
                onChange={(e) => handleOriginInput(e.target.value)}
                placeholder="Enter starting point or use GPS..."
                autoComplete="off"
                className="horizontal-route-input"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="my-location-btn"
                title="Detect My Exact Location via GPS"
              >
                <Crosshair size={14} className={isLocating ? 'spin-icon' : ''} />
                <span>{isLocating ? 'Locating...' : 'My Location'}</span>
              </button>

              {originSuggestions.length > 0 && (
                <div className="route-suggest-dropdown">
                  {originSuggestions.map((city) => (
                    <div
                      key={city}
                      className="suggest-item"
                      onMouseDown={() => selectOrigin(city)}
                    >
                      <MapPin size={13} color="var(--success)" />
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            className="route-swap-button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
          >
            <ArrowRight size={16} />
          </button>

          {/* Destination Input */}
          <div className="route-field-group">
            <label className="field-header">
              <span className="route-point-indicator dest-point" />
              <span>Destination</span>
            </label>
            <div className="route-input-container">
              <Search size={15} className="input-search-icon" />
              <input
                type="text"
                value={destInput}
                onChange={(e) => handleDestInput(e.target.value)}
                placeholder="Search destination city / landmark..."
                autoComplete="off"
                className="horizontal-route-input"
              />
              {destSuggestions.length > 0 && (
                <div className="route-suggest-dropdown">
                  {destSuggestions.map((city) => (
                    <div
                      key={city}
                      className="suggest-item"
                      onMouseDown={() => selectDest(city)}
                    >
                      <MapPin size={13} color="var(--danger)" />
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Avoid Congestion Toggle */}
          <div className="route-toggle-wrap">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={avoidCongestion}
                onChange={(e) => setAvoidCongestion(e.target.checked)}
              />
              <span className="checkbox-text">Avoid Heavy Traffic</span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!canSearch || isLoadingRoutes}
            className="btn-primary find-routes-btn"
          >
            {isLoadingRoutes ? (
              <>
                <span className="spinner" />
                <span>Routing...</span>
              </>
            ) : (
              <>
                <Navigation2 size={16} />
                <span>Find Best Routes</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Preset Chips (Horizontal Row) */}
        <div className="presets-row">
          <span className="presets-caption">Quick Presets:</span>
          <div className="presets-chip-container">
            {QUICK_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="route-preset-pill"
                onClick={() => selectPreset(p)}
              >
                <Sparkles size={11} color="var(--rs-blue-light)" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Suggested Routes Cards (Flex Row / Horizontal Layout) ── */}
      {routes.length > 0 && (
        <div className="suggested-routes-section">
          <div className="routes-bar-header">
            <div className="routes-bar-title">
              <Layers size={16} color="var(--rs-blue)" />
              <span>Available Routes ({routes.length})</span>
            </div>
            <span className="routes-bar-hint">
              Select a route to highlight on the map, or click <strong>Start Travelling</strong> to begin live navigation
            </span>
          </div>

          <div className="routes-cards-horizontal-grid">
            {routes.map((route, idx) => {
              const isSelected = selectedRoute?.id === route.id;
              return (
                <div
                  key={route.id}
                  className={`horizontal-route-card card ${isSelected ? 'route-card-active' : ''}`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="route-badge-row">
                    {idx === 0 && (
                      <span className="pill pill-success recommended-tag">
                        <Star size={10} /> Recommended
                      </span>
                    )}
                    <span className="pill pill-muted route-type-badge">{route.type.toUpperCase()}</span>
                    <span className={`pill ${CONGESTION_PILL[route.congestionLevel]}`}>
                      {route.congestionLevel}
                    </span>
                  </div>

                  <div className="route-main-name">{route.name}</div>
                  <div className="route-summary-text">{route.summary}</div>

                  {/* Metrics Bar */}
                  <div className="route-metric-strip">
                    <div className="metric-pill">
                      <Clock size={13} color="var(--rs-blue)" />
                      <strong className="metric-highlight">{route.duration} min</strong>
                    </div>
                    <div className="metric-pill">
                      <Ruler size={13} color="var(--text-secondary)" />
                      <span>{route.distance} km</span>
                    </div>
                    {route.incidents > 0 ? (
                      <div className="metric-pill incident-warning">
                        <AlertTriangle size={12} />
                        <span>{route.incidents} delay</span>
                      </div>
                    ) : (
                      <div className="metric-pill incident-clear">
                        <CheckCircle size={12} />
                        <span>Clear</span>
                      </div>
                    )}
                  </div>

                  <p className="route-desc-small">{route.description}</p>

                  {/* Start Travelling Action Button */}
                  <button
                    type="button"
                    className={`start-journey-btn ${isSelected && isTravelling ? 'btn-navigating' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSelected && isTravelling) {
                        stopTravelling();
                      } else {
                        startTravelling(route);
                      }
                    }}
                  >
                    {isSelected && isTravelling ? (
                      <>
                        <Square size={13} fill="currentColor" />
                        <span>Stop Journey</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        <span>Start Travelling</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Interactive Map Section (Full Width with HUD) ── */}
      <div className="card route-map-wrapper">
        <div className="map-header-toolbar">
          <div className="map-title-group">
            <MapPin size={16} color="var(--rs-blue)" />
            <span className="map-title-text">Route Visualization & Live Navigation</span>
          </div>

          <div className="map-legend-group">
            <div className="legend-item">
              <span className="legend-dot start-legend" />
              <span>Start</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot finish-legend" />
              <span>Finish</span>
            </div>
            <div className="legend-item">
              <span className="legend-line active-legend" />
              <span>Active Route</span>
            </div>
            <div className="legend-item">
              <span className="legend-line alt-legend" />
              <span>Alternative</span>
            </div>
          </div>
        </div>

        {/* Live Navigation HUD Overlay */}
        {isTravelling && (
          <div className="navigation-hud-overlay animate-fade-in">
            {/* Top Turn Instruction Card */}
            <div className="nav-turn-card">
              <div className="nav-turn-icon-wrap">
                {renderManeuverIcon(activeStep?.type, activeStep?.modifier)}
              </div>
              <div className="nav-turn-details">
                <div className="nav-turn-instruction">
                  {hasArrived ? 'You have arrived at your destination!' : activeStep?.instruction || 'Continue along route'}
                </div>
                <div className="nav-turn-sub">
                  {hasArrived ? 'Trip Completed' : `${remainingDist} km remaining • Next turn soon`}
                </div>
              </div>
              <button
                className="exit-nav-btn"
                onClick={stopTravelling}
                title="Exit Navigation Mode"
              >
                <Square size={14} fill="currentColor" /> Exit
              </button>
            </div>

            {/* Bottom Travelling Status Bar */}
            <div className="nav-status-bar">
              <div className="nav-stat-col">
                <span className="nav-stat-val">{travelSpeed}</span>
                <span className="nav-stat-unit">km/h</span>
              </div>
              <div className="nav-stat-divider" />
              <div className="nav-stat-col">
                <span className="nav-stat-val">{remainingTime}</span>
                <span className="nav-stat-unit">min ETA</span>
              </div>
              <div className="nav-stat-divider" />
              <div className="nav-stat-col">
                <span className="nav-stat-val">{remainingDist}</span>
                <span className="nav-stat-unit">km left</span>
              </div>
              <div className="nav-progress-track">
                <div
                  className="nav-progress-bar-fill"
                  style={{
                    width: selectedRoute
                      ? `${Math.min(100, Math.round((travelProgressIdx / (selectedRoute.coordinates.length - 1 || 1)) * 100))}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no points chosen */}
        {!origin && !destination && (
          <div className="route-empty-overlay">
            <div className="empty-icon-bubble">
              <Navigation2 size={26} color="var(--rs-blue)" />
            </div>
            <h3>Ready to Plan Your Route</h3>
            <p>
              Select an origin and destination above or click <strong>"My Location"</strong> to detect your exact GPS position.
            </p>
          </div>
        )}

        {/* The Leaflet Map */}
        <div className="map-render-container">
          <OSMMap
            center={mapCenter}
            zoom={origin && destination ? 13 : 12}
            markers={mapMarkers}
            polylines={mapPolylines}
            vehiclePosition={vehiclePos}
            userLocation={userLocation}
            showClustering={false}
            showHeatmap={false}
            onPolylineClick={(routeId) => {
              const r = routes.find((x) => x.id === routeId);
              if (r) setSelectedRoute(r);
            }}
            height="580px"
          />
        </div>
      </div>
    </div>
  );
}
