import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Locate, RefreshCw } from 'lucide-react';
import { trafficApi, reportsApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './TrafficMap.css';

const CONGESTION_COLORS: Record<string, string> = {
  light: 'var(--traffic-green)',
  moderate: 'var(--traffic-yellow)',
  heavy: 'var(--traffic-orange)',
  severe: 'var(--traffic-red)',
};

const CONGESTION_BG: Record<string, string> = {
  light: 'rgba(34,197,94,0.12)',
  moderate: 'rgba(234,179,8,0.12)',
  heavy: 'rgba(249,115,22,0.12)',
  severe: 'rgba(239,68,68,0.12)',
};

export default function TrafficMap() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap' | 'both'>('both');
  const [mapCenter, setMapCenter] = useState({ lat: 22.7196, lng: 75.8577 });
  const [userLocating, setUserLocating] = useState(false);

  const { data: liveData, refetch } = useQuery({
    queryKey: ['live-traffic'],
    queryFn: async () => { const res = await trafficApi.getLive(); return res.data.data; },
    refetchInterval: 30000
  });

  const { data: incidents } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: async () => { const res = await reportsApi.getAll({ status: 'verified', limit: 20 }); return res.data.data; }
  });

  useEffect(() => { if (liveData) setSnapshots(liveData); }, [liveData]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('traffic:update', (snapshot: any) => {
      setSnapshots(prev => [snapshot, ...prev].slice(0, 50));
    });
    return () => { socket.off('traffic:update'); };
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setUserLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setMapCenter({ lat: coords.latitude, lng: coords.longitude }); setUserLocating(false); },
      () => setUserLocating(false),
      { timeout: 8000 }
    );
  };

  const filteredSnapshots = filterLevel === 'all'
    ? snapshots
    : snapshots.filter(s => s.congestionLevel === filterLevel);

  const markers = [
    ...filteredSnapshots.map(s => ({
      position: { lat: s.latitude, lng: s.longitude },
      title: s.location, type: 'Traffic', severity: s.congestionLevel, speed: s.trafficSpeed
    })),
    ...(incidents || [])
      .filter((i: any) => i.latitude && i.longitude)
      .map((i: any) => ({
        position: { lat: i.latitude, lng: i.longitude },
        title: i.location, type: i.type, severity: i.severity
      }))
  ];

  const center = snapshots.length > 0
    ? { lat: snapshots[0].latitude, lng: snapshots[0].longitude }
    : mapCenter;

  const stats = {
    total: snapshots.length,
    light:    snapshots.filter(s => s.congestionLevel === 'light').length,
    moderate: snapshots.filter(s => s.congestionLevel === 'moderate').length,
    heavy:    snapshots.filter(s => s.congestionLevel === 'heavy').length,
    severe:   snapshots.filter(s => s.congestionLevel === 'severe').length,
  };

  return (
    <div className="trafficmap-page animate-fade-in-up">
      {/* Header */}
      <div className="trafficmap-header">
        <div>
          <h1 className="page-title">Live Traffic Map</h1>
          <p className="page-subtitle">{snapshots.length} active feed points · Updates every 30s</p>
        </div>
        <div className="trafficmap-header-actions">
          <button className="btn-ghost" onClick={handleLocateMe} disabled={userLocating}>
            <Locate size={14}/> {userLocating ? 'Locating...' : 'Locate Me'}
          </button>
          <button className="btn-ghost" onClick={() => refetch()}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="trafficmap-stats-bar">
        {[
          { label: 'Total Feeds', value: stats.total, color: 'var(--rs-blue)', bg: 'rgba(59,130,246,0.12)' },
          { label: 'Light',    value: stats.light,    color: 'var(--traffic-green)',  bg: 'rgba(34,197,94,0.12)' },
          { label: 'Moderate', value: stats.moderate, color: 'var(--traffic-yellow)', bg: 'rgba(234,179,8,0.12)' },
          { label: 'Heavy',    value: stats.heavy,    color: 'var(--traffic-orange)', bg: 'rgba(249,115,22,0.12)' },
          { label: 'Severe',   value: stats.severe,   color: 'var(--traffic-red)',    bg: 'rgba(239,68,68,0.12)' },
        ].map((s, i) => (
          <div key={i} className="trafficmap-stat-chip" style={{ background: s.bg, borderColor: s.color + '40' }}>
            <span className="trafficmap-stat-dot" style={{ background: s.color }}/>
            <span className="trafficmap-stat-label">{s.label}</span>
            <span className="trafficmap-stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="trafficmap-layout">
        {/* Controls Sidebar */}
        <div className="trafficmap-sidebar card">
          <div className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>
            <Filter size={16}/> Controls
          </div>

          <div className="control-group">
            <label className="control-label">Layer Mode</label>
            <div className="mode-pills">
              {(['markers', 'heatmap', 'both'] as const).map(mode => (
                <button key={mode} className={`filter-pill ${mapMode === mode ? 'active' : ''}`} onClick={() => setMapMode(mode)}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Congestion Filter</label>
            <div className="congestion-filters">
              {['all', 'light', 'moderate', 'heavy', 'severe'].map(level => (
                <button
                  key={level}
                  className={`congestion-filter-btn ${filterLevel === level ? 'active' : ''}`}
                  onClick={() => setFilterLevel(level)}
                  style={filterLevel === level && level !== 'all' ? {
                    background: CONGESTION_BG[level],
                    borderColor: CONGESTION_COLORS[level] + '60',
                    color: CONGESTION_COLORS[level]
                  } : {}}
                >
                  {level !== 'all' && <span className="cf-dot" style={{ background: CONGESTION_COLORS[level] }}/>}
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Legend */}
          <div className="control-group">
            <label className="control-label">Speed Reference</label>
            <div className="speed-legend">
              <div className="speed-gradient"/>
              <div className="speed-legend-labels">
                <span>0 km/h</span>
                <span>60+ km/h</span>
              </div>
            </div>
          </div>

          {/* Snapshot list */}
          <div className="snapshot-feed">
            <label className="control-label">Live Feed ({filteredSnapshots.length})</label>
            <div className="snapshot-list">
              {filteredSnapshots.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--sp-4)' }}><p>No data</p></div>
              )}
              {filteredSnapshots.slice(0, 8).map(s => (
                <div key={s.id} className="snapshot-item">
                  <div className="snapshot-dot" style={{ background: CONGESTION_COLORS[s.congestionLevel] }}/>
                  <div className="snapshot-body">
                    <div className="snapshot-location">{s.location}</div>
                    <div className="snapshot-meta">
                      <span style={{ color: CONGESTION_COLORS[s.congestionLevel] }}>{s.congestionLevel}</span>
                      {s.trafficSpeed && <span> · {s.trafficSpeed} km/h</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="trafficmap-map-wrap card">
          <OSMMap
            center={center}
            zoom={12}
            markers={markers}
            showClustering={mapMode !== 'heatmap'}
            showHeatmap={mapMode === 'heatmap' || mapMode === 'both'}
          />
        </div>
      </div>
    </div>
  );
}
