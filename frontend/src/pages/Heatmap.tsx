import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { congestionApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './Heatmap.css';

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  location: string;
  speed?: number;
  timestamp: string;
}

export default function Heatmap() {
  const [timeRange, setTimeRange] = useState('60');
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const { data, refetch } = useQuery({
    queryKey: ['heatmap', timeRange],
    queryFn: async () => {
      const res = await congestionApi.getHeatmap({ timeRange });
      return res.data.data;
    },
    refetchInterval: 30000
  });

  useEffect(() => {
    if (data) {
      setHeatmapData(data);
    }
  }, [data]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('traffic:update', (snapshot: any) => {
      const newPoint: HeatmapPoint = {
        lat: snapshot.latitude,
        lng: snapshot.longitude,
        intensity: getIntensityFromLevel(snapshot.congestionLevel),
        location: snapshot.location,
        speed: snapshot.trafficSpeed,
        timestamp: snapshot.timestamp
      };
      
      setHeatmapData(prev => [newPoint, ...prev].slice(0, 100));
    });

    return () => {
      socket.off('traffic:update');
    };
  }, []);

  const getIntensityFromLevel = (level: string): number => {
    switch (level) {
      case 'severe': return 1.0;
      case 'heavy': return 0.75;
      case 'moderate': return 0.5;
      case 'light': return 0.25;
      default: return 0.1;
    }
  };

  const markers = heatmapData.map(point => ({
    position: { lat: point.lat, lng: point.lng },
    title: point.location,
    type: 'Traffic',
    severity: point.intensity >= 0.75 ? 'severe' : point.intensity >= 0.5 ? 'heavy' : point.intensity >= 0.25 ? 'moderate' : 'light',
    speed: point.speed
  }));

  // Determine map center from data or default to Indore
  const mapCenter = heatmapData.length > 0
    ? { lat: heatmapData[0].lat, lng: heatmapData[0].lng }
    : { lat: 22.7196, lng: 75.8577 };

  return (
    <div className="heatmap-page">
      <div className="heatmap-header">
        <h1>🔥 Traffic Heatmap Visualization</h1>
        <div className="heatmap-controls">
          <label>
            Visualization:
            <select value={showHeatmap ? 'heatmap' : 'markers'} onChange={(e) => setShowHeatmap(e.target.value === 'heatmap')}>
              <option value="markers">Markers Only</option>
              <option value="heatmap">Heatmap + Markers</option>
            </select>
          </label>
          <label>
            Time Range:
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="15">Last 15 minutes</option>
              <option value="30">Last 30 minutes</option>
              <option value="60">Last hour</option>
              <option value="120">Last 2 hours</option>
              <option value="360">Last 6 hours</option>
            </select>
          </label>
          <button onClick={() => refetch()} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="heatmap-legend">
        <h3>Congestion Levels</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#4caf50' }}></span>
            <span>Light (0–25%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ffc107' }}></span>
            <span>Moderate (25–50%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#ff9800' }}></span>
            <span>Heavy (50–75%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#f44336' }}></span>
            <span>Severe (75–100%)</span>
          </div>
        </div>
      </div>

      <div className="map-container-wrapper">
        <OSMMap
          center={mapCenter}
          zoom={12}
          markers={markers}
          showClustering={false}
          showHeatmap={showHeatmap}
        />
      </div>

      <div className="heatmap-stats">
        <div className="stat-box">
          <h3>Total Points</h3>
          <p className="stat-value">{heatmapData.length}</p>
        </div>
        <div className="stat-box">
          <h3>Severe Areas</h3>
          <p className="stat-value severe">
            {heatmapData.filter(p => p.intensity >= 0.75).length}
          </p>
        </div>
        <div className="stat-box">
          <h3>Heavy Traffic</h3>
          <p className="stat-value heavy">
            {heatmapData.filter(p => p.intensity >= 0.5 && p.intensity < 0.75).length}
          </p>
        </div>
        <div className="stat-box">
          <h3>Avg Speed</h3>
          <p className="stat-value">
            {heatmapData.length > 0
              ? (heatmapData.reduce((sum, p) => sum + (p.speed || 0), 0) / heatmapData.length).toFixed(1)
              : 0} km/h
          </p>
        </div>
      </div>
    </div>
  );
}
