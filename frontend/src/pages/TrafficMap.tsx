import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trafficApi, reportsApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import OSMMap from '../components/OSMMap';
import './TrafficMap.css';

export default function TrafficMap() {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  const { data: liveData } = useQuery({
    queryKey: ['live-traffic'],
    queryFn: async () => {
      const res = await trafficApi.getLive();
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const { data: incidents } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ status: 'verified', limit: 20 });
      return res.data.data;
    }
  });

  useEffect(() => {
    if (liveData) {
      setSnapshots(liveData);
    }
  }, [liveData]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('traffic:update', (snapshot: any) => {
      setSnapshots(prev => [snapshot, ...prev].slice(0, 50));
    });

    return () => {
      socket.off('traffic:update');
    };
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'light': return '#4caf50';
      case 'moderate': return '#ff9800';
      case 'heavy': return '#ff5722';
      case 'severe': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // Prepare markers for OSM Map
  const markers = [
    // Traffic snapshots
    ...snapshots.map(snapshot => ({
      position: { lat: snapshot.latitude, lng: snapshot.longitude },
      title: snapshot.location,
      type: 'Traffic Snapshot',
      severity: snapshot.congestionLevel,
      speed: snapshot.trafficSpeed
    })),
    // Incident reports
    ...(incidents || [])
      .filter((incident: any) => incident.latitude && incident.longitude)
      .map((incident: any) => ({
        position: { lat: incident.latitude, lng: incident.longitude },
        title: incident.location,
        type: incident.type,
        severity: incident.severity
      }))
  ];

  return (
    <div className="traffic-map">
      <h1>🗺️ Live Traffic Map (OpenStreetMap)</h1>
      
      <div className="map-info-banner" style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #2196f3'
      }}>
        <strong>✨ Features:</strong> Marker Clustering • Heatmap Visualization • Real-time Updates • Click markers for details
      </div>
      
      <div className="map-container-wrapper">
        <OSMMap
          center={{ lat: 40.7589, lng: -73.9851 }}
          zoom={12}
          markers={markers}
          showClustering={true}
          showHeatmap={false}
        />
      </div>

      <div className="traffic-data">
        <h2>Recent Traffic Data ({snapshots.length})</h2>
        <div className="snapshots-grid">
          {snapshots.length === 0 && <p>No traffic data available</p>}
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="snapshot-card">
              <div 
                className="congestion-indicator" 
                style={{ backgroundColor: getCongestionColor(snapshot.congestionLevel) }}
              />
              <div className="snapshot-info">
                <h3>{snapshot.location}</h3>
                <p className="congestion-level">
                  Congestion: <strong>{snapshot.congestionLevel}</strong>
                </p>
                {snapshot.trafficSpeed && (
                  <p className="traffic-speed">Speed: {snapshot.trafficSpeed} km/h</p>
                )}
                <p className="timestamp">
                  {new Date(snapshot.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
