import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, reportsApi, alertsApi, trafficApi, congestionApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './Dashboard.css';

interface CityCoordinates {
  [key: string]: { lat: number; lng: number };
}

const CITY_COORDINATES: CityCoordinates = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0742 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
};

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState('indore');
  const [searchInput, setSearchInput] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState(CITY_COORDINATES['indore']);
  const [showMap, setShowMap] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await analyticsApi.getReportsSummary();
      console.log('Summary data:', res.data);
      return res.data.data;
    }
  });

  const { data: recentReports, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ limit: 5 });
      console.log('Recent reports:', res.data);
      return res.data.data;
    }
  });

  const { data: activeAlerts, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const res = await alertsApi.getAll();
      console.log('Active alerts:', res.data);
      return res.data.data;
    }
  });

  const { data: liveTraffic } = useQuery({
    queryKey: ['live-traffic'],
    queryFn: async () => {
      const res = await trafficApi.getLive();
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const { data: heatmapApiData } = useQuery({
    queryKey: ['heatmap-data'],
    queryFn: async () => {
      const res = await congestionApi.getHeatmap({ timeRange: '60' });
      return res.data.data;
    },
    refetchInterval: 30000
  });

  useEffect(() => {
    if (liveTraffic && liveTraffic.length > 0) {
      const markers = liveTraffic.map((data: any) => ({
        lat: data.latitude,
        lng: data.longitude,
        title: data.location,
        popup: `${data.location}<br/>Speed: ${data.trafficSpeed} km/h<br/>Level: ${data.congestionLevel}`
      }));
      setMapMarkers(markers);
    }
  }, [liveTraffic]);

  useEffect(() => {
    if (heatmapApiData) {
      setHeatmapData(heatmapApiData);
    }
  }, [heatmapApiData]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('traffic:update', (snapshot: any) => {
      setMapMarkers(prev => [...prev, {
        lat: snapshot.latitude,
        lng: snapshot.longitude,
        title: snapshot.location,
        popup: `${snapshot.location}<br/>Speed: ${snapshot.trafficSpeed} km/h`
      }].slice(0, 50));
    });
    
    return () => {
      socket.off('traffic:update');
    };
  }, []);

  const handleCitySearch = (input: string) => {
    setSearchInput(input);
    if (input.trim().length > 0) {
      const filtered = Object.keys(CITY_COORDINATES).filter(city =>
        city.includes(input.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setMapCenter(CITY_COORDINATES[city.toLowerCase()]);
    setSearchInput('');
    setFilteredCities([]);
    setShowMap(true);
  };

  console.log('Dashboard state:', { summary, recentReports, activeAlerts });

  if (summaryLoading || reportsLoading || alertsLoading) {
    return <div className="dashboard"><h1>Loading...</h1></div>;
  }

  if (summaryError || reportsError || alertsError) {
    return (
      <div className="dashboard">
        <h1>Error Loading Dashboard</h1>
        <p>Please check the console for details.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>🚦 Smart Traffic Dashboard</h1>

      {/* City Search Section */}
      <div className="city-search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search cities (e.g., New York, Mumbai, Indore)..."
            value={searchInput}
            onChange={(e) => handleCitySearch(e.target.value)}
            className="city-search-input"
          />
          {filteredCities.length > 0 && (
            <div className="city-suggestions">
              {filteredCities.map((city) => (
                <div
                  key={city}
                  className="city-suggestion-item"
                  onClick={() => handleCitySelect(city)}
                >
                  📍 {city.charAt(0).toUpperCase() + city.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="btn-toggle-map"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? '🗺️ Hide Map' : '🗺️ Show Live Map'}
        </button>
        <button
          className="btn-toggle-heatmap"
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? '🔥 Hide Heatmap' : '🔥 Show Heatmap'}
        </button>
      </div>

      {/* Live Map Section */}
      {showMap && (
        <div className="map-section">
          <h2>📍 Live Traffic Map - {selectedCity.toUpperCase()}</h2>
          <OSMMap
            center={mapCenter}
            zoom={12}
            markers={mapMarkers}
            showClustering={true}
          />
        </div>
      )}

      {/* Heatmap Section */}
      {showHeatmap && (
        <div className="map-section">
          <h2>🔥 Congestion Heatmap</h2>
          <OSMMap
            center={mapCenter}
            zoom={12}
            markers={heatmapData.map((point: any) => ({
              lat: point.lat,
              lng: point.lng,
              title: point.location,
              popup: `${point.location}<br/>Intensity: ${point.intensity}/10`
            }))}
            showHeatmap={true}
          />
        </div>
      )}

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📊 Total Reports</h3>
          <p className="stat-value">{summary?.total || 0}</p>
        </div>
        <div className="stat-card">
          <h3>⏳ Pending</h3>
          <p className="stat-value pending">{summary?.pending || 0}</p>
        </div>
        <div className="stat-card">
          <h3>✅ Resolved</h3>
          <p className="stat-value resolved">{summary?.resolved || 0}</p>
        </div>
        <div className="stat-card">
          <h3>⚠️ Active Alerts</h3>
          <p className="stat-value alerts">{activeAlerts?.length || 0}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>📋 Recent Reports</h2>
          <div className="reports-list">
            {!recentReports || recentReports.length === 0 ? (
              <p>No reports yet</p>
            ) : (
              recentReports.map((report: any) => (
              <div key={report.id} className="report-item">
                <div className="report-header">
                  <span className={`badge badge-${report.type}`}>{report.type}</span>
                  <span className={`severity severity-${report.severity}`}>{report.severity}</span>
                </div>
                <p className="report-location">📍 {report.location}</p>
                <p className="report-time">🕐 {new Date(report.createdAt).toLocaleString()}</p>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>🚨 Active Alerts</h2>
          <div className="alerts-list">
            {!activeAlerts || activeAlerts.length === 0 ? (
              <p>No active alerts</p>
            ) : (
              activeAlerts.map((alert: any) => (
              <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
                <h4>⚠️ {alert.title}</h4>
                <p>{alert.message}</p>
                <small>🕐 {new Date(alert.createdAt).toLocaleString()}</small>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
