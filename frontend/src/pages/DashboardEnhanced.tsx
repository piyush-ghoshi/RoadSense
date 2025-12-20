import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi, reportsApi, alertsApi, trafficApi, congestionApi } from '../lib/api';
import './DashboardEnhanced.css';

export default function DashboardEnhanced() {
  const { data: summary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await analyticsApi.getReportsSummary();
      return res.data.data;
    }
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ limit: 5 });
      return res.data.data;
    }
  });

  const { data: activeAlerts } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const res = await alertsApi.getAll();
      return res.data.data;
    }
  });

  const { data: liveTraffic } = useQuery({
    queryKey: ['live-traffic-preview'],
    queryFn: async () => {
      const res = await trafficApi.getLive();
      return res.data.data?.slice(0, 3) || [];
    },
    refetchInterval: 30000
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['heatmap-preview'],
    queryFn: async () => {
      const res = await congestionApi.getHeatmap({ timeRange: '60' });
      return res.data.data?.slice(0, 3) || [];
    },
    refetchInterval: 30000
  });

  return (
    <div className="dashboard-enhanced">
      <div className="dashboard-header">
        <h1>🚦 RoadSense Dashboard</h1>
        <p className="dashboard-subtitle">Real-time Traffic Monitoring & Management</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Reports</h3>
            <p className="stat-value">{summary?.total || 0}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{summary?.pending || 0}</p>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p className="stat-value">{summary?.resolved || 0}</p>
          </div>
        </div>
        <div className="stat-card alerts">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>Active Alerts</h3>
            <p className="stat-value">{activeAlerts?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column - Reports and Alerts */}
        <div className="dashboard-left">
          {/* Recent Reports */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>📋 Recent Reports</h2>
              <Link to="/reports" className="view-all-link">View All →</Link>
            </div>
            <div className="reports-list">
              {!recentReports || recentReports.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No reports yet</p>
                </div>
              ) : (
                recentReports.map((report: any) => (
                  <div key={report.id} className="report-item">
                    <div className="report-icon">{getReportIcon(report.type)}</div>
                    <div className="report-content">
                      <div className="report-header">
                        <span className="report-type">{report.type}</span>
                        <span className={`report-severity ${report.severity}`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="report-location">{report.location}</p>
                      <span className="report-time">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>🚨 Active Alerts</h2>
              <Link to="/authority" className="view-all-link">Manage →</Link>
            </div>
            <div className="alerts-list">
              {!activeAlerts || activeAlerts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <p>No active alerts</p>
                </div>
              ) : (
                activeAlerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-header">
                      <span className="alert-title">{alert.title}</span>
                      <span className="alert-badge">{alert.severity}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    {alert.location && (
                      <span className="alert-location">📍 {alert.location}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map Previews */}
        <div className="dashboard-right">
          {/* Live Map Preview */}
          <div className="map-preview-card">
            <div className="preview-header">
              <h3>🗺️ Live Traffic Map</h3>
              <Link to="/map" className="preview-link">Open Full Map →</Link>
            </div>
            <div className="preview-content">
              <div className="map-placeholder">
                <div className="map-overlay">
                  <span className="live-indicator">
                    <span className="pulse-dot"></span>
                    LIVE
                  </span>
                </div>
                <div className="traffic-points">
                  {liveTraffic && liveTraffic.length > 0 ? (
                    liveTraffic.map((traffic: any, index: number) => (
                      <div key={index} className="traffic-point">
                        <div className={`point-marker ${traffic.congestionLevel}`}>
                          <span className="point-icon">🚗</span>
                        </div>
                        <div className="point-info">
                          <strong>{traffic.location}</strong>
                          <span className={`congestion-badge ${traffic.congestionLevel}`}>
                            {traffic.congestionLevel}
                          </span>
                          {traffic.trafficSpeed && (
                            <span className="speed-info">
                              {traffic.trafficSpeed} km/h
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <span>📍</span>
                      <p>No live traffic data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Preview */}
          <div className="map-preview-card">
            <div className="preview-header">
              <h3>🔥 Traffic Heatmap</h3>
              <Link to="/heatmap" className="preview-link">Open Heatmap →</Link>
            </div>
            <div className="preview-content">
              <div className="heatmap-placeholder">
                <div className="heatmap-legend">
                  <span className="legend-item">
                    <span className="legend-color light"></span>
                    Light
                  </span>
                  <span className="legend-item">
                    <span className="legend-color moderate"></span>
                    Moderate
                  </span>
                  <span className="legend-item">
                    <span className="legend-color heavy"></span>
                    Heavy
                  </span>
                  <span className="legend-item">
                    <span className="legend-color severe"></span>
                    Severe
                  </span>
                </div>
                <div className="heatmap-points">
                  {heatmapData && heatmapData.length > 0 ? (
                    heatmapData.map((point: any, index: number) => (
                      <div key={index} className="heatmap-point">
                        <div className={`heat-indicator ${getIntensityClass(point.intensity)}`}>
                          <span className="heat-value">
                            {Math.round(point.intensity * 100)}%
                          </span>
                        </div>
                        <div className="heat-info">
                          <strong>{point.location}</strong>
                          {point.speed && (
                            <span className="speed-text">
                              Avg: {point.speed} km/h
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <span>🔥</span>
                      <p>No heatmap data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h3>⚡ Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/reports" className="action-btn">
                <span className="action-icon">📝</span>
                <span>New Report</span>
              </Link>
              <Link to="/routes" className="action-btn">
                <span className="action-icon">🚗</span>
                <span>Find Route</span>
              </Link>
              <Link to="/analytics" className="action-btn">
                <span className="action-icon">📊</span>
                <span>Analytics</span>
              </Link>
              <Link to="/authority" className="action-btn">
                <span className="action-icon">👮</span>
                <span>Authority</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getReportIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case 'accident': return '💥';
    case 'roadblock': return '🚧';
    case 'congestion': return '🚗';
    case 'hazard': return '⚠️';
    case 'emergency': return '🚨';
    default: return '📍';
  }
}

function getIntensityClass(intensity: number): string {
  if (intensity >= 0.75) return 'severe';
  if (intensity >= 0.5) return 'heavy';
  if (intensity >= 0.25) return 'moderate';
  return 'light';
}
