import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Flame, Activity } from 'lucide-react';
import { congestionApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './Heatmap.css';

interface HeatmapPoint { lat: number; lng: number; intensity: number; location: string; speed?: number; timestamp: string; }

const getIntensity = (level: string) => ({ severe: 1.0, heavy: 0.75, moderate: 0.5, light: 0.25 }[level] ?? 0.1);

const TIME_RANGES = [
  { value: '15',  label: '15m' },
  { value: '30',  label: '30m' },
  { value: '60',  label: '1h' },
  { value: '120', label: '2h' },
  { value: '360', label: '6h' },
];

export default function Heatmap() {
  const [timeRange, setTimeRange] = useState('60');
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['heatmap', timeRange],
    queryFn: async () => { const res = await congestionApi.getHeatmap({ timeRange }); return res.data.data; },
    refetchInterval: 30000
  });

  useEffect(() => { if (data) { setHeatmapData(data); setLastUpdated(new Date()); } }, [data]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('traffic:update', (snapshot: any) => {
      setHeatmapData(prev => [{
        lat: snapshot.latitude, lng: snapshot.longitude,
        intensity: getIntensity(snapshot.congestionLevel),
        location: snapshot.location, speed: snapshot.trafficSpeed, timestamp: snapshot.timestamp
      }, ...prev].slice(0, 100));
      setLastUpdated(new Date());
    });
    return () => { socket.off('traffic:update'); };
  }, []);

  const markers = heatmapData.map(p => ({
    position: { lat: p.lat, lng: p.lng },
    title: p.location, type: 'Traffic',
    severity: p.intensity >= 0.75 ? 'severe' : p.intensity >= 0.5 ? 'heavy' : p.intensity >= 0.25 ? 'moderate' : 'light',
    speed: p.speed
  }));

  const mapCenter = heatmapData.length > 0 ? { lat: heatmapData[0].lat, lng: heatmapData[0].lng } : { lat: 22.7196, lng: 75.8577 };

  const stats = {
    total:    heatmapData.length,
    severe:   heatmapData.filter(p => p.intensity >= 0.75).length,
    heavy:    heatmapData.filter(p => p.intensity >= 0.5 && p.intensity < 0.75).length,
    moderate: heatmapData.filter(p => p.intensity >= 0.25 && p.intensity < 0.5).length,
    avgSpeed: heatmapData.length > 0
      ? (heatmapData.reduce((s, p) => s + (p.speed || 0), 0) / heatmapData.length).toFixed(1)
      : '0',
  };

  return (
    <div className="heatmap-page animate-fade-in-up">
      {/* Header */}
      <div className="heatmap-header">
        <div>
          <h1 className="page-title">Traffic Heatmap</h1>
          <p className="page-subtitle">Congestion visualization · Last updated {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="heatmap-controls">
          {/* Time range segmented control */}
          <div className="time-range-group">
            {TIME_RANGES.map(t => (
              <button key={t.value} className={`time-range-btn ${timeRange === t.value ? 'active' : ''}`} onClick={() => setTimeRange(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Viz toggle */}
          <div className="viz-toggle-group">
            <button className={`viz-toggle-btn ${showHeatmap ? 'active' : ''}`} onClick={() => setShowHeatmap(true)}>
              <Flame size={13}/> Heatmap
            </button>
            <button className={`viz-toggle-btn ${!showHeatmap ? 'active' : ''}`} onClick={() => setShowHeatmap(false)}>
              <Activity size={13}/> Markers
            </button>
          </div>
          <button className="btn-ghost" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin-anim' : ''}/> {isFetching ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="heatmap-stats">
        {[
          { label: 'Total Points', value: stats.total,    color: 'var(--rs-blue)', bg: 'rgba(59,130,246,0.12)' },
          { label: 'Severe',       value: stats.severe,   color: 'var(--traffic-red)',    bg: 'rgba(239,68,68,0.12)' },
          { label: 'Heavy',        value: stats.heavy,    color: 'var(--traffic-orange)', bg: 'rgba(249,115,22,0.12)' },
          { label: 'Avg Speed',    value: `${stats.avgSpeed} km/h`, color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' },
        ].map((s, i) => (
          <div key={i} className="heatmap-stat-card kpi-card">
            <div className="kpi-card-value" style={{ fontSize: 'var(--text-2xl)', color: s.color }}>{s.value}</div>
            <div className="kpi-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="card heatmap-map-card">
        {/* Gradient Legend */}
        <div className="heatmap-legend-bar">
          <span className="legend-label">Low</span>
          <div className="legend-gradient"/>
          <span className="legend-label">High</span>
          <div className="legend-levels">
            {['Light', 'Moderate', 'Heavy', 'Severe'].map((l, i) => (
              <span key={i} className="legend-level-dot" style={{ color: ['#22C55E','#EAB308','#F97316','#EF4444'][i] }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="heatmap-map-embed">
          <OSMMap center={mapCenter} zoom={12} markers={markers} showClustering={false} showHeatmap={showHeatmap} />
        </div>
      </div>
    </div>
  );
}
