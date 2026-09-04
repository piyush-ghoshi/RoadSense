import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText, MapPin, Navigation2, TrendingUp,
  AlertTriangle, CheckCircle, Clock, Activity, RefreshCw,
  ArrowRight, Plus
} from 'lucide-react';
import { analyticsApi, reportsApi, alertsApi, trafficApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './Dashboard.css';

interface CityCoordinates { [key: string]: { lat: number; lng: number }; }

const CITY_COORDINATES: CityCoordinates = {
  'indore':    { lat: 22.7196, lng: 75.8577 },
  'mumbai':    { lat: 19.0760, lng: 72.8777 },
  'delhi':     { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'pune':      { lat: 18.5204, lng: 73.8567 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai':   { lat: 13.0827, lng: 80.2707 },
  'kolkata':   { lat: 22.5726, lng: 88.3639 },
  'new york':  { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago':   { lat: 41.8781, lng: -87.6298 },
  'houston':   { lat: 29.7604, lng: -95.3698 },
  'seattle':   { lat: 47.6062, lng: -122.3321 },
  'london':    { lat: 51.5074, lng: -0.1278 },
  'tokyo':     { lat: 35.6762, lng: 139.6503 },
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="live-clock">
      <span className="clock-time">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="clock-date">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>
  );
}

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState('indore');
  const [searchInput, setSearchInput] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState(CITY_COORDINATES['indore']);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await analyticsApi.getReportsSummary();
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ limit: 6 });
      return res.data.data;
    },
    refetchInterval: 15000
  });

  const { data: activeAlerts } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const res = await alertsApi.getAll();
      return res.data.data;
    },
    refetchInterval: 15000
  });

  const { data: liveTraffic } = useQuery({
    queryKey: ['live-traffic'],
    queryFn: async () => {
      const res = await trafficApi.getLive();
      return res.data.data;
    },
    refetchInterval: 30000
  });

  useEffect(() => {
    if (liveTraffic?.length > 0) {
      setMapMarkers(liveTraffic.map((d: any) => ({
        lat: d.latitude, lng: d.longitude,
        title: d.location,
        popup: `${d.location}<br/>Speed: ${d.trafficSpeed} km/h<br/>Level: ${d.congestionLevel}`
      })));
    }
  }, [liveTraffic]);

  useEffect(() => {
    try {
      const socket = getSocket();
      socket.on('traffic:update', (snapshot: any) => {
        setMapMarkers(prev => [{
          lat: snapshot.latitude, lng: snapshot.longitude,
          title: snapshot.location,
          popup: `${snapshot.location}<br/>Speed: ${snapshot.trafficSpeed} km/h`
        }, ...prev].slice(0, 50));
      });
      return () => { socket.off('traffic:update'); };
    } catch {}
  }, []);

  const handleCitySearch = (input: string) => {
    setSearchInput(input);
    if (input.trim().length > 0) {
      setFilteredCities(Object.keys(CITY_COORDINATES).filter(c => c.includes(input.toLowerCase())));
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setMapCenter(CITY_COORDINATES[city]);
    setSearchInput('');
    setFilteredCities([]);
  };

  const getSeverityClass = (s: string) => ({ low: 'pill-success', medium: 'pill-warning', high: 'pill-warning', critical: 'pill-danger' }[s] || 'pill-muted');
  const getTypeIcon = (type: string) => {
    const map: Record<string, any> = { accident: AlertTriangle, roadblock: Activity, diversion: Navigation2, congestion: Activity, other: MapPin };
    return map[type] || MapPin;
  };

  const resolutionRate = summary?.total ? Math.round((summary.resolved / summary.total) * 100) : 0;

  const kpiCards = [
    {
      label: 'Total Reports',
      value: summary?.total ?? 0,
      icon: FileText,
      iconBg: 'rgba(59,130,246,0.15)',
      iconColor: '#3B82F6',
      trend: null,
    },
    {
      label: 'Pending Review',
      value: summary?.pending ?? 0,
      icon: Clock,
      iconBg: 'rgba(245,158,11,0.15)',
      iconColor: '#F59E0B',
      trend: null,
    },
    {
      label: 'Resolved',
      value: summary?.resolved ?? 0,
      icon: CheckCircle,
      iconBg: 'rgba(16,185,129,0.15)',
      iconColor: '#10B981',
      trend: `${resolutionRate}% rate`,
    },
    {
      label: 'Active Alerts',
      value: activeAlerts?.length ?? 0,
      icon: AlertTriangle,
      iconBg: 'rgba(239,68,68,0.15)',
      iconColor: '#EF4444',
      trend: null,
    },
  ];

  return (
    <div className="dashboard animate-fade-in-up">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">RoadSense Control Center</h1>
          <p className="page-subtitle">Real-time traffic monitoring and incident management</p>
        </div>
        <div className="dashboard-header-right">
          <LiveClock />
          <button className="btn-ghost" onClick={() => refetchSummary()} style={{ gap: 6 }}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="kpi-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="kpi-top">
                <div className="kpi-card-icon" style={{ background: card.iconBg }}>
                  <Icon size={20} color={card.iconColor} />
                </div>
                {card.trend && (
                  <span className="kpi-rate pill pill-success">{card.trend}</span>
                )}
              </div>
              <div className="kpi-card-value">{card.value}</div>
              <div className="kpi-card-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/reports" className="quick-action-btn btn-primary">
          <Plus size={16}/> Report Incident
        </Link>
        <Link to="/map" className="quick-action-btn btn-ghost">
          <MapPin size={16}/> View Live Map
        </Link>
        <Link to="/routes" className="quick-action-btn btn-ghost">
          <Navigation2 size={16}/> Plan Routes
        </Link>
        <Link to="/analytics" className="quick-action-btn btn-ghost">
          <TrendingUp size={16}/> Analytics
        </Link>
      </div>

      {/* Map + City Search */}
      <div className="card dashboard-map-section">
        <div className="map-section-header">
          <div>
            <div className="section-title"><Activity size={18}/> Live Traffic Map</div>
            <p className="page-subtitle" style={{ marginTop: 4 }}>
              {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} — {mapMarkers.length} active feed points
            </p>
          </div>
          <div className="city-search-wrapper">
            <div className="city-search-input-wrap">
              <MapPin size={14} className="city-search-icon" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchInput}
                onChange={e => handleCitySearch(e.target.value)}
                className="city-search-input"
              />
            </div>
            {filteredCities.length > 0 && (
              <div className="city-dropdown">
                {filteredCities.map(city => (
                  <div key={city} className="city-dropdown-item" onClick={() => handleCitySelect(city)}>
                    <MapPin size={12}/> {city.charAt(0).toUpperCase() + city.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="map-embed-wrapper">
          <OSMMap center={mapCenter} zoom={12} markers={mapMarkers} showClustering={true} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom-grid">
        {/* Recent Reports */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><FileText size={16}/> Recent Reports</div>
            <Link to="/reports" className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              View all <ArrowRight size={12}/>
            </Link>
          </div>
          <div className="reports-feed">
            {!recentReports || recentReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={22}/></div>
                <p>No reports yet</p>
              </div>
            ) : recentReports.map((report: any) => {
              const Icon = getTypeIcon(report.type);
              return (
                <div key={report.id} className={`report-feed-item severity-stripe-${report.severity}`}>
                  <div className="report-feed-icon">
                    <Icon size={14}/>
                  </div>
                  <div className="report-feed-body">
                    <div className="report-feed-location">{report.location}</div>
                    <div className="report-feed-meta">
                      <span className={`pill ${getSeverityClass(report.severity)}`}>{report.severity}</span>
                      <span className="report-feed-type">{report.type}</span>
                    </div>
                  </div>
                  <div className="report-feed-time">
                    {new Date(report.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><AlertTriangle size={16}/> Active Alerts</div>
            <span className="pill pill-danger">{activeAlerts?.length || 0} active</span>
          </div>
          <div className="alerts-feed">
            {!activeAlerts || activeAlerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><CheckCircle size={22}/></div>
                <h3>All Clear</h3>
                <p>No active alerts at this time</p>
              </div>
            ) : activeAlerts.map((alert: any) => (
              <div key={alert.id} className={`alert-feed-item alert-severity-${alert.severity}`}>
                <div className="alert-feed-header">
                  <span className={`pill ${alert.severity === 'critical' ? 'pill-danger' : alert.severity === 'warning' ? 'pill-warning' : 'pill-info'}`}>
                    {alert.severity}
                  </span>
                  <span className="alert-feed-type">{alert.type}</span>
                </div>
                <div className="alert-feed-title">{alert.title}</div>
                <div className="alert-feed-msg">{alert.message}</div>
                <div className="alert-feed-time">{new Date(alert.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
